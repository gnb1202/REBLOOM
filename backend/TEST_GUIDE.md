# 백엔드-프론트엔드 연동 테스트 가이드

## 🚀 테스트 환경 설정

### 1. 백엔드 서버 실행

```bash
cd backend
pip install -r requirements.txt
python main.py
```

서버가 성공적으로 실행되면 다음과 같은 메시지가 출력됩니다:
```
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. 백엔드 테스트 (브라우저)

#### 2.1 기본 스트리밍 테스트
- 브라우저에서 `http://localhost:8000/video` 접속
- 웹캠 영상이 스트리밍되는지 확인

#### 2.2 AI 스트리밍 테스트  
- 브라우저에서 `http://localhost:8000/video/ai` 접속
- 웹캠 영상과 "Exercise Session Inactive" 메시지 확인

#### 2.3 API 문서 확인
- 브라우저에서 `http://localhost:8000/docs` 접속
- FastAPI 자동 생성 API 문서 확인

#### 2.4 운동 세션 API 테스트
1. API 문서에서 `/exercise/start` POST 요청 실행
2. `/video/ai`에서 "AI Analysis Active" 메시지와 운동 카운터 확인
3. `/exercise/data` GET으로 실시간 데이터 확인
4. `/exercise/stop` POST로 세션 종료

### 3. 프론트엔드 테스트

#### 3.1 테스트 페이지 접속
- 앱에서 `ExerciseTestPage` 컴포넌트로 이동
- 또는 라우터를 통해 `/Exercise/ExerciseTestPage` 접속

#### 3.2 연동 테스트 순서
1. **서버 상태 확인**: "연결됨" 표시 확인
2. **운동 시작**: "운동 시작" 버튼 클릭
3. **AI 스트림**: 실시간 웹캠 영상과 운동 분석 데이터 확인
4. **운동 수행**: 카메라 앞에서 팔 올리기 운동 수행
5. **데이터 확인**: 실시간으로 카운트, 정확도, 시간 업데이트 확인
6. **운동 종료**: "운동 종료" 버튼 클릭하여 결과 확인

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. "서버 연결 안됨" 표시
**원인**: 백엔드 서버가 실행되지 않았거나 포트가 다름
**해결**: 
- 백엔드 서버 실행 확인
- `http://localhost:8000/health` 브라우저 접속 테스트
- 방화벽 설정 확인

#### 2. 웹캠 영상이 보이지 않음
**원인**: 카메라 권한 또는 다른 앱에서 카메라 사용 중
**해결**: 
- 카메라 권한 확인
- 다른 카메라 앱 종료
- 브라우저 카메라 권한 허용

#### 3. AI 분석이 작동하지 않음
**원인**: YOLO 모델 로딩 실패 또는 ultralytics 설치 문제
**해결**: 
- `pip install ultralytics` 재설치
- 인터넷 연결 확인 (YOLO 모델 다운로드)
- Python 버전 확인 (3.8+)

#### 4. 운동 카운트가 증가하지 않음
**원인**: 자세 인식 실패 또는 각도 설정 문제
**해결**: 
- 카메라와 적절한 거리 유지
- 조명 개선
- 팔 동작을 명확하게 수행

### 디버깅 팁

#### 백엔드 로그 확인
```bash
# 상세 로그로 실행
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
```

#### API 직접 테스트
```bash
# 서버 상태 확인
curl http://localhost:8000/health

# 운동 시작
curl -X POST http://localhost:8000/exercise/start

# 운동 데이터 확인
curl http://localhost:8000/exercise/data

# 운동 종료
curl -X POST http://localhost:8000/exercise/stop
```

## 📱 다음 단계: 본 기능 적용

테스트가 성공하면 다음과 같이 본 기능에 적용할 수 있습니다:

### 1. 기존 ExerciseVideoPage 수정
- 백엔드 API 연동 코드 추가
- 실시간 데이터 표시 UI 구현

### 2. 운동 타입 확장
- 다양한 운동 타입 지원
- 운동별 맞춤 AI 모델 적용

### 3. 데이터 연계
- 운동 결과를 코인/보상 시스템과 연결
- ExerciseSummaryPage와 데이터 전달

### 4. 성능 최적화
- 스트리밍 품질 조정
- 배터리 최적화

## ✅ 테스트 체크리스트

- [ ] 백엔드 서버 정상 실행
- [ ] `/video` 스트리밍 작동
- [ ] `/video/ai` AI 스트리밍 작동  
- [ ] 운동 세션 API 정상 작동
- [ ] 프론트엔드 서버 연결 확인
- [ ] 실시간 데이터 수신 확인
- [ ] 운동 카운팅 정확도 확인
- [ ] 세션 시작/종료 정상 작동
- [ ] 에러 처리 동작 확인

모든 체크리스트를 완료하면 본 기능 적용 준비 완료! 🎉