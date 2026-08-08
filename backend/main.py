from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
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

# openCV에서 이미지 불러오는 함수
def video_streaming():
    return get_stream_video()

# AI 운동 분석이 포함된 스트리밍
def ai_video_streaming():
    return exercise_ai.get_ai_stream_video(exercise_session)

# 기본 비디오 스트리밍 (기존)
@app.get("/video")
def video_stream():
    return StreamingResponse(video_streaming(), media_type="multipart/x-mixed-replace; boundary=frame")

# AI 운동 분석 비디오 스트리밍
@app.get("/video/ai")
def ai_video_stream():
    return StreamingResponse(ai_video_streaming(), media_type="multipart/x-mixed-replace; boundary=frame")

# 운동 설정 구성
@app.post("/exercise/configure")
async def configure_exercise(exercise_type: str = None, kpts: list = None, up_angle: int = None, down_angle: int = None):
    try:
        config = exercise_ai.configure_exercise(
            exercise_type=exercise_type,
            kpts=kpts,
            up_angle=up_angle,
            down_angle=down_angle,
            #show=False
        )
        return {"status": "configured", "config": config}
    except Exception as e:
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
async def start_exercise(exercise_type: str = "arm_raise", kpts: list = None, up_angle: int = None, down_angle: int = None):
    # 운동 설정 적용
    if exercise_type or kpts or up_angle or down_angle:
        exercise_ai.configure_exercise(
            exercise_type=exercise_type,
            kpts=kpts,
            up_angle=up_angle,
            down_angle=down_angle
        )
    
    exercise_session.is_active = True
    exercise_session.count = 0
    exercise_session.accuracy = 0
    exercise_session.start_time = time.time()
    exercise_session.exercise_type = exercise_type or exercise_ai.get_exercise_config()["exercise_type"]
    
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
async def warmup_exercise(exercise_type: str = None):
    """AI 모델과 카메라를 미리 초기화하여 실제 운동 시작 시 지연을 줄입니다."""
    try:
        # 운동 타입이 주어졌다면 설정
        if exercise_type:
            exercise_ai.configure_exercise(exercise_type=exercise_type)
        
        # AI Gym 미리 초기화 (백그라운드)
        success = exercise_ai.setup_ai_gym()
        
        # 카메라도 미리 초기화 시도
        exercise_ai.try_camera_init()
        
        return {
            "status": "warmed_up",
            "ai_ready": success,
            "exercise_type": exercise_type or exercise_ai.get_exercise_config()["exercise_type"]
        }
    except Exception as e:
        # 워밍업 실패해도 운동은 가능하도록 에러를 숨김
        return {"status": "warmup_failed", "ai_ready": False, "detail": str(e)}

# 헬스체크
@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_ready": exercise_ai.is_ready()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)