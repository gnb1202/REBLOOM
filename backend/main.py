from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import threading
import time

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

# 운동 세션 시작
@app.post("/exercise/start")
async def start_exercise(exercise_type: str = "arm_raise"):
    exercise_session.is_active = True
    exercise_session.count = 0
    exercise_session.accuracy = 0
    exercise_session.start_time = time.time()
    exercise_session.exercise_type = exercise_type
    
    # AI 모델 초기화
    exercise_ai.reset_session()
    
    return {"status": "started", "exercise_type": exercise_type}

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
    
    # AI 정리
    exercise_ai.cleanup_session()
    
    return {"status": "stopped", "summary": final_data}

# 헬스체크
@app.get("/health")
async def health_check():
    return {"status": "healthy", "ai_ready": exercise_ai.is_ready()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)