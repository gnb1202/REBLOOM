from fastapi import Body, FastAPI, Query, Request, WebSocket, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, model_validator
from starlette.concurrency import run_in_threadpool
from typing import List, Optional
import json
import asyncio
import logging
import threading
import time

# 로깅 설정은 로컬 모듈 import 보다 먼저 수행한다.
# exercise_ai 는 import 시점에 ultralytics 사용 가능 여부를 로그로 남기는데,
# 그 시점에 핸들러가 없으면 lastResort 핸들러로 빠져 포맷이 적용되지 않는다.
# uvicorn 이 이미 핸들러를 붙인 경우 basicConfig 는 아무 일도 하지 않는다.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# cv3 모듈 import
from cv3 import get_stream_video
from exercise_ai import ExerciseAI

# FastAPI객체 생성
app = FastAPI()

# CORS 미들웨어 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 운동 AI 인스턴스
exercise_ai = ExerciseAI()
# exercise_ai = ExerciseAI()

# 운동 세션 상태
class ExerciseSession:
    def __init__(self):
        self.is_active = False
        self.count = 0
        self.accuracy = 0
        self.start_time = None
        self.exercise_type = "arm_raise"  # 기본값

exercise_session = ExerciseSession()


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

# openCV에서 이미지 불러오는 함수
def video_streaming():
    return get_stream_video()

# AI 운동 분석이 포함된 스트리밍
def ai_video_streaming():
    return exercise_ai.get_ai_stream_video(exercise_session)


MJPEG_MEDIA_TYPE = "multipart/x-mixed-replace; boundary=frame"


async def stream_until_disconnect(request: Request, sync_stream):
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

            yield chunk
    finally:
        sync_stream.close()
        logger.info("스트림 정리 완료")


# 기본 비디오 스트리밍 (기존)
@app.get("/video")
async def video_stream(request: Request):
    return StreamingResponse(
        stream_until_disconnect(request, video_streaming()),
        media_type=MJPEG_MEDIA_TYPE,
    )

# AI 운동 분석 비디오 스트리밍
@app.get("/video/ai")
async def ai_video_stream(request: Request):
    return StreamingResponse(
        stream_until_disconnect(request, ai_video_streaming()),
        media_type=MJPEG_MEDIA_TYPE,
    )

# 운동 설정 구성
@app.post("/exercise/configure")
async def configure_exercise(params: ExerciseParams):
    try:
        config = exercise_ai.configure_exercise(
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
async def get_exercise_config():
    config = exercise_ai.get_exercise_config()
    available_exercises = exercise_ai.get_available_exercises()
    return {
        "current_config": config,
        "available_exercises": available_exercises
    }

# 운동 세션 시작
@app.post("/exercise/start")
async def start_exercise(
    payload: Optional[ExerciseParams] = Body(default=None),
    exercise_type: Optional[str] = Query(default=None),
):
    params = _merge_legacy_query(payload, exercise_type)

    # 운동 설정 적용
    if params.exercise_type or params.kpts or params.up_angle or params.down_angle:
        exercise_ai.configure_exercise(
            exercise_type=params.exercise_type,
            kpts=params.kpts,
            up_angle=params.up_angle,
            down_angle=params.down_angle
        )

    exercise_session.is_active = True
    exercise_session.count = 0
    exercise_session.accuracy = 0
    exercise_session.start_time = time.time()
    exercise_session.exercise_type = params.exercise_type or exercise_ai.get_exercise_config()["exercise_type"]
    
    # AI 모델 초기화
    exercise_ai.reset_session()
    
    return {"status": "started", "exercise_type": exercise_session.exercise_type, "config": exercise_ai.get_exercise_config()}

# 운동 데이터 조회
@app.get("/exercise/data")
async def get_exercise_data():
    if not exercise_session.is_active:
        raise HTTPException(status_code=400, detail="No active exercise session")
    
    # AI에서 최신 데이터 가져오기
    ai_data = exercise_ai.get_current_data()
    exercise_session.count = ai_data.get("count", exercise_session.count)
    exercise_session.accuracy = ai_data.get("accuracy", exercise_session.accuracy)
    
    elapsed_time = int(time.time() - exercise_session.start_time) if exercise_session.start_time else 0
    
    return {
        "is_active": exercise_session.is_active,
        "count": exercise_session.count,
        "accuracy": exercise_session.accuracy,
        "elapsed_time": elapsed_time,
        "exercise_type": exercise_session.exercise_type
    }

# 운동 세션 종료
@app.post("/exercise/stop")
async def stop_exercise():
    if not exercise_session.is_active:
        raise HTTPException(status_code=400, detail="No active exercise session")
    
    # 최종 데이터 수집
    final_data = {
        "count": exercise_session.count,
        "accuracy": exercise_session.accuracy,
        "duration": int(time.time() - exercise_session.start_time) if exercise_session.start_time else 0,
        "exercise_type": exercise_session.exercise_type
    }
    
    # 세션 리셋
    exercise_session.is_active = False
    exercise_session.count = 0
    exercise_session.accuracy = 0
    exercise_session.start_time = None
    
    # AI 완전 리셋 (다음 운동을 위해)
    logger.info("운동 종료 - AI 시스템 완전 리셋 수행")
    exercise_ai.reset_session()
    exercise_ai.cleanup_session()
    
    return {"status": "stopped", "summary": final_data}

# 운동 준비 (사전 초기화)
@app.post("/exercise/warmup")
async def warmup_exercise(
    payload: Optional[ExerciseParams] = Body(default=None),
    exercise_type: Optional[str] = Query(default=None),
):
    """AI 모델과 카메라를 미리 초기화하여 실제 운동 시작 시 지연을 줄입니다."""
    params = _merge_legacy_query(payload, exercise_type)
    try:
        # 운동 타입이 주어졌다면 설정
        if params.exercise_type:
            exercise_ai.configure_exercise(exercise_type=params.exercise_type)

        # AI Gym 미리 초기화 (백그라운드)
        success = exercise_ai.setup_ai_gym()

        # 카메라도 미리 초기화 시도
        exercise_ai.try_camera_init()

        return {
            "status": "warmed_up",
            "ai_ready": success,
            "exercise_type": params.exercise_type or exercise_ai.get_exercise_config()["exercise_type"]
        }
    except Exception as e:
        # 워밍업 실패해도 운동은 가능하도록 에러를 숨김
        logger.warning("워밍업 실패 (운동 진행에는 영향 없음)", exc_info=True)
        return {"status": "warmup_failed", "ai_ready": False, "detail": str(e)}

# 헬스체크
@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_ready": exercise_ai.is_ready()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)