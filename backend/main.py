from fastapi import Body, Depends, FastAPI, Query, Request, WebSocket, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator
from starlette.concurrency import run_in_threadpool
from contextlib import asynccontextmanager
from typing import List, Optional
import json
import asyncio
import logging
import threading
import time
import uuid

# 로깅 설정은 로컬 모듈 import 보다 먼저 수행한다.
# exercise_ai 는 import 시점에 ultralytics 사용 가능 여부를 로그로 남기는데,
# 그 시점에 핸들러가 없으면 lastResort 핸들러로 빠져 포맷이 적용되지 않는다.
# uvicorn 이 이미 핸들러를 붙인 경우 basicConfig 는 아무 일도 하지 않는다.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

from exercise_ai import ExerciseAI, ULTRALYTICS_AVAILABLE

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 수명주기에 리소스 정리를 연결한다.

    __del__ 에 기대면 종료 시점에 카메라가 해제된다는 보장이 없다.
    종료 훅에서 모든 세션의 close() 를 명시적으로 호출한다.
    """
    logger.info("서버 시작 (ultralytics 사용 가능: %s)", ULTRALYTICS_AVAILABLE)
    try:
        yield
    finally:
        logger.info("서버 종료 - 모든 세션 리소스를 정리합니다.")
        registry.close_all()


# FastAPI객체 생성
app = FastAPI(lifespan=lifespan)

# CORS 미들웨어 추가
#
# allow_origins=["*"] 와 allow_credentials=True 는 함께 쓸 수 없다.
# 브라우저는 자격증명이 붙은 요청에 대해 Access-Control-Allow-Origin: * 를
# 거부하기 때문에, 이 조합은 "모두 허용"이 아니라 "브라우저에서 전부 실패"가 된다.
# 이 API 는 쿠키나 Authorization 헤더를 쓰지 않으므로 credentials 를 끄고
# 와일드카드 오리진을 유지한다 (앱이 에뮬레이터/실기기 등 여러 오리진에서 접근).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 운동 세션 상태
class ExerciseSession:
    def __init__(self):
        self.is_active = False
        self.count = 0
        self.accuracy = None  # None = 아직 측정되지 않음 (0% 와 구분)
        self.start_time = None
        self.exercise_type = "arm_raise"  # 기본값


DEFAULT_SESSION_ID = "default"
SESSION_IDLE_TIMEOUT_SECONDS = 600  # 10분간 아무 요청이 없으면 정리


class UserSession:
    """한 사용자의 AI 인스턴스와 운동 상태를 함께 들고 있는 단위."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.ai = ExerciseAI()
        self.exercise = ExerciseSession()
        self.last_seen = time.time()

    def touch(self):
        self.last_seen = time.time()

    def close(self):
        self.ai.close()


class SessionRegistry:
    """session_id 로 사용자별 인스턴스를 격리한다.

    예전에는 exercise_ai / exercise_session 이 모듈 전역이라, 두 사람이 동시에
    운동하면 한쪽의 카운트가 다른 쪽 화면에 그대로 찍혔다. 전역 하나를
    session_id 키의 딕셔너리로 바꿔 상태 혼선을 없앤다.

    다만 카메라는 여전히 서버에 물린 물리 장치 하나다. 세션을 나눠도
    두 번째 세션의 cv2.VideoCapture 는 장치 점유 실패로 더미 스트림으로
    떨어진다. 즉 이 레지스트리는 '상태 혼선'을 고치는 것이지 동시 촬영을
    가능하게 만드는 것이 아니다. 진짜 동시 사용은 클라이언트에서 영상을
    올려받는 구조로 바꿔야 하며, 그건 이번 범위 밖이다.
    """

    def __init__(self, idle_timeout: float = SESSION_IDLE_TIMEOUT_SECONDS):
        self._sessions = {}
        self._lock = threading.Lock()
        self._idle_timeout = idle_timeout

    def get_or_create(self, session_id: str) -> UserSession:
        with self._lock:
            session = self._sessions.get(session_id)
            if session is None:
                session = UserSession(session_id)
                self._sessions[session_id] = session
                logger.info("세션 생성: %s (활성 세션 %d개)", session_id, len(self._sessions))
            # 회수보다 touch 를 먼저 한다. 순서가 반대면 마지막 요청 이후
            # 타임아웃 직전에 들어온 요청이 자기 세션을 회수해버리고
            # 빈 상태로 다시 만들어, 카운트가 조용히 0으로 리셋된다.
            session.touch()
        self.reap_idle()
        return session

    def get(self, session_id: str):
        with self._lock:
            session = self._sessions.get(session_id)
            if session is not None:
                session.touch()
            return session

    def remove(self, session_id: str) -> bool:
        with self._lock:
            session = self._sessions.pop(session_id, None)
        if session is None:
            return False
        session.close()
        logger.info("세션 삭제: %s", session_id)
        return True

    def reap_idle(self):
        """유휴 세션을 정리한다.

        스트리밍 중에는 프레임마다 touch() 되므로 회수 대상이 되지 않는다.
        별도 백그라운드 타이머 없이 요청 처리 경로에서 정리하므로,
        정리 자체가 새로운 스레드나 실패 지점을 만들지 않는다.
        """
        cutoff = time.time() - self._idle_timeout
        with self._lock:
            expired = [sid for sid, s in self._sessions.items() if s.last_seen < cutoff]
            victims = [self._sessions.pop(sid) for sid in expired]
        for session in victims:
            logger.info("유휴 세션 정리: %s", session.session_id)
            session.close()

    def snapshot(self):
        now = time.time()
        with self._lock:
            return [
                {
                    "session_id": s.session_id,
                    "is_active": s.exercise.is_active,
                    "idle_seconds": int(now - s.last_seen),
                }
                for s in self._sessions.values()
            ]

    def close_all(self):
        with self._lock:
            victims = list(self._sessions.values())
            self._sessions.clear()
        for session in victims:
            session.close()
        if victims:
            logger.info("전체 세션 정리 완료 (%d개)", len(victims))


registry = SessionRegistry()


def resolve_session_id(
    request: Request,
    session_id: Optional[str] = Query(default=None),
) -> str:
    """세션 식별자 결정: 쿼리 -> X-Session-Id 헤더 -> 기본값.

    기존 앱은 session_id 를 보내지 않으므로 DEFAULT_SESSION_ID 로 묶여
    지금까지와 똑같이 동작한다 (하위 호환).
    """
    return session_id or request.headers.get("X-Session-Id") or DEFAULT_SESSION_ID


def get_session(session_id: str = Depends(resolve_session_id)) -> UserSession:
    return registry.get_or_create(session_id)


# 요청 바디 모델
#
# 기존 코드는 `kpts: list = None` 처럼 엔드포인트 함수 인자로 선언했다.
# FastAPI 는 BaseModel 이 아닌 스칼라/컬렉션 인자를 쿼리 파라미터로 해석하므로,
# 프론트엔드가 JSON 바디로 보낸 값은 그대로 무시되고 항상 기본값이 쓰였다.
# BaseModel 로 선언해야 바디에서 읽는다.
class ExerciseParams(BaseModel):
    exercise_type: Optional[str] = None
    kpts: Optional[List[int]] = None
    up_angle: Optional[float] = None
    down_angle: Optional[float] = None

    @model_validator(mode="after")
    def _validate_angles_and_kpts(self):
        # 검증 규칙은 ExerciseAI 쪽에 두고 여기서는 호출만 한다 (규칙 중복 방지).
        errors = ExerciseAI.validate_exercise_params(
            self.kpts, self.up_angle, self.down_angle
        )
        if errors:
            raise ValueError("; ".join(errors))
        return self


def _merge_legacy_query(payload: Optional[ExerciseParams], exercise_type: Optional[str]) -> ExerciseParams:
    """바디가 없고 쿼리로만 exercise_type 을 보내는 기존 클라이언트를 지원한다.

    앱의 ExerciseDo.tsx 는 `/exercise/start?exercise_type=...` 형태로 호출하므로
    바디를 필수로 만들면 깨진다. 바디가 있으면 바디를 우선한다.
    """
    if payload is None:
        return ExerciseParams(exercise_type=exercise_type)
    if payload.exercise_type is None and exercise_type is not None:
        return payload.model_copy(update={"exercise_type": exercise_type})
    return payload

# AI 운동 분석이 포함된 스트리밍
def ai_video_streaming(session: UserSession):
    return session.ai.get_ai_stream_video(session.exercise)


MJPEG_MEDIA_TYPE = "multipart/x-mixed-replace; boundary=frame"


async def stream_until_disconnect(request: Request, sync_stream, session: Optional[UserSession] = None):
    """동기 프레임 제너레이터를 async 로 감싸 연결 종료 시 확실히 정리한다.

    - 프레임을 만드는 일(cap.read, YOLO 추론, JPEG 인코딩)은 블로킹이므로
      run_in_threadpool 로 넘겨 이벤트 루프를 막지 않는다.
    - 매 프레임마다 request.is_disconnected() 로 클라이언트 연결을 확인한다.
    - async generator 는 취소될 때 aclose() 가 보장되므로, finally 에서
      동기 제너레이터의 close() 를 직접 호출한다. 그래야 GeneratorExit 이
      yield 지점에 전달되어 카메라 해제 finally 가 확정적으로 실행된다.
      (GC 에 맡기면 언제 정리될지 보장되지 않는다.)
    """
    def next_chunk():
        try:
            return next(sync_stream)
        except StopIteration:
            return None

    try:
        while True:
            if await request.is_disconnected():
                logger.info("클라이언트 연결 종료 감지 - 스트림을 중단합니다.")
                break

            chunk = await run_in_threadpool(next_chunk)
            if chunk is None:
                logger.info("프레임 제너레이터가 정상 종료되었습니다.")
                break

            # 스트리밍 중인 세션은 살아있는 것으로 취급해 유휴 회수 대상에서 제외한다.
            if session is not None:
                session.touch()

            yield chunk
    finally:
        sync_stream.close()
        logger.info("스트림 정리 완료")


# AI 운동 분석 비디오 스트리밍
@app.get("/video/ai")
async def ai_video_stream(request: Request, session: UserSession = Depends(get_session)):
    return StreamingResponse(
        stream_until_disconnect(request, ai_video_streaming(session), session),
        media_type=MJPEG_MEDIA_TYPE,
    )


# 세션 관리
@app.post("/sessions")
async def create_session():
    """새 세션을 만들고 식별자를 돌려준다.

    이후 요청에 `?session_id=...` 또는 `X-Session-Id` 헤더로 실어 보내면
    해당 세션의 인스턴스가 쓰인다.
    """
    session_id = uuid.uuid4().hex
    registry.get_or_create(session_id)
    return {"session_id": session_id}


@app.get("/sessions")
async def list_sessions():
    registry.reap_idle()
    return {"sessions": registry.snapshot()}


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if not registry.remove(session_id):
        raise HTTPException(status_code=404, detail="Unknown session")
    return {"status": "deleted", "session_id": session_id}

# 운동 설정 구성
@app.post("/exercise/configure")
async def configure_exercise(params: ExerciseParams, session: UserSession = Depends(get_session)):
    try:
        config = session.ai.configure_exercise(
            exercise_type=params.exercise_type,
            kpts=params.kpts,
            up_angle=params.up_angle,
            down_angle=params.down_angle,
        )
        return {"status": "configured", "config": config}
    except Exception as e:
        logger.error("운동 설정 실패", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Configuration error: {str(e)}")

# 운동 설정 조회
@app.get("/exercise/config")
async def get_exercise_config(session: UserSession = Depends(get_session)):
    config = session.ai.get_exercise_config()
    available_exercises = session.ai.get_available_exercises()
    return {
        "current_config": config,
        "available_exercises": available_exercises
    }

# 운동 세션 시작
@app.post("/exercise/start")
async def start_exercise(
    payload: Optional[ExerciseParams] = Body(default=None),
    exercise_type: Optional[str] = Query(default=None),
    session: UserSession = Depends(get_session),
):
    params = _merge_legacy_query(payload, exercise_type)
    exercise = session.exercise

    # 운동 설정 적용
    if params.exercise_type or params.kpts or params.up_angle or params.down_angle:
        session.ai.configure_exercise(
            exercise_type=params.exercise_type,
            kpts=params.kpts,
            up_angle=params.up_angle,
            down_angle=params.down_angle
        )

    exercise.is_active = True
    exercise.count = 0
    exercise.accuracy = None
    exercise.start_time = time.time()
    exercise.exercise_type = params.exercise_type or session.ai.get_exercise_config()["exercise_type"]

    # AI 모델 초기화
    session.ai.reset_session()

    return {"status": "started", "exercise_type": exercise.exercise_type, "config": session.ai.get_exercise_config()}

# 운동 데이터 조회
@app.get("/exercise/data")
async def get_exercise_data(session: UserSession = Depends(get_session)):
    exercise = session.exercise
    if not exercise.is_active:
        raise HTTPException(status_code=400, detail="No active exercise session")

    # AI에서 최신 데이터 가져오기
    ai_data = session.ai.get_current_data()
    exercise.count = ai_data.get("count", exercise.count)
    # accuracy 는 None 일 수 있고, 그 None 자체가 '인식되지 않음'이라는 정보다.
    # 이전 값으로 덮어쓰면 사람이 사라져도 마지막 점수가 계속 남는다.
    exercise.accuracy = ai_data.get("accuracy")

    elapsed_time = int(time.time() - exercise.start_time) if exercise.start_time else 0

    return {
        "is_active": exercise.is_active,
        "count": exercise.count,
        "accuracy": exercise.accuracy,  # null 이면 '인식되지 않음'
        "is_detecting": ai_data.get("is_detecting", False),
        "elapsed_time": elapsed_time,
        "exercise_type": exercise.exercise_type
    }

# 운동 세션 종료
@app.post("/exercise/stop")
async def stop_exercise(session: UserSession = Depends(get_session)):
    exercise = session.exercise
    if not exercise.is_active:
        raise HTTPException(status_code=400, detail="No active exercise session")

    # 최종 데이터 수집
    final_data = {
        "count": exercise.count,
        "accuracy": exercise.accuracy,
        "duration": int(time.time() - exercise.start_time) if exercise.start_time else 0,
        "exercise_type": exercise.exercise_type
    }

    # 세션 리셋
    exercise.is_active = False
    exercise.count = 0
    exercise.accuracy = None
    exercise.start_time = None

    # AI 완전 리셋 (다음 운동을 위해)
    logger.info("운동 종료 - AI 시스템 완전 리셋 수행 (session=%s)", session.session_id)
    session.ai.reset_session()
    session.ai.cleanup_session()

    return {"status": "stopped", "summary": final_data}

# 운동 준비 (사전 초기화)
@app.post("/exercise/warmup")
async def warmup_exercise(
    payload: Optional[ExerciseParams] = Body(default=None),
    exercise_type: Optional[str] = Query(default=None),
    session: UserSession = Depends(get_session),
):
    """AI 모델과 카메라를 미리 초기화하여 실제 운동 시작 시 지연을 줄입니다."""
    params = _merge_legacy_query(payload, exercise_type)
    try:
        # 운동 타입이 주어졌다면 설정
        if params.exercise_type:
            session.ai.configure_exercise(exercise_type=params.exercise_type)

        # AI Gym 미리 초기화 (백그라운드)
        success = session.ai.setup_ai_gym()

        # 카메라도 미리 초기화 시도
        session.ai.try_camera_init()

        return {
            "status": "warmed_up",
            "ai_ready": success,
            "exercise_type": params.exercise_type or session.ai.get_exercise_config()["exercise_type"]
        }
    except Exception as e:
        # 워밍업 실패해도 운동은 가능하도록 에러를 숨김
        logger.warning("워밍업 실패 (운동 진행에는 영향 없음)", exc_info=True)
        return {"status": "warmup_failed", "ai_ready": False, "detail": str(e)}

# 헬스체크
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_ready": True,  # 시뮬레이션 모드로도 응답은 가능하므로 항상 True (기존 동작 유지)
        "ultralytics_available": ULTRALYTICS_AVAILABLE,  # 실제 추론 가능 여부
        "active_sessions": len(registry.snapshot()),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)