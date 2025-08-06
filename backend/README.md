# ICCAS 2025 Backend Server

FastAPI 기반 운동 분석 백엔드 서버

## 기능

- 실시간 비디오 스트리밍
- AI 기반 운동 자세 분석 (YOLO + AIGym)
- 운동 카운팅 및 정확도 측정
- RESTful API 제공

## 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 서버 실행
```bash
python main.py
```
또는
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API 엔드포인트

### 비디오 스트리밍
- `GET /video` - 기본 카메라 스트리밍
- `GET /video/ai` - AI 분석이 포함된 스트리밍

### 운동 세션 관리
- `POST /exercise/start?exercise_type=arm_raise` - 운동 시작
- `GET /exercise/data` - 실시간 운동 데이터 조회
- `POST /exercise/stop` - 운동 종료

### 시스템
- `GET /health` - 서버 상태 확인

## 테스트

브라우저에서 다음 URL로 접속하여 테스트:
- http://localhost:8000/video - 기본 스트리밍
- http://localhost:8000/video/ai - AI 분석 스트리밍
- http://localhost:8000/docs - API 문서

## 요구사항

- Python 3.8+
- 웹캠 연결
- CUDA (GPU 가속을 위한 선택사항)