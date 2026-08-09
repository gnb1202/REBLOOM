# 백엔드-프론트엔드 연동 테스트 가이드

## 🚀 테스트 환경 설정

### 1. 백엔드 서버 실행

```bash
cd backend
pip install -r requirements.txt
python main.py
```

정상 실행 시 출력 순서는 다음과 같다. **`ultralytics` 관련 줄이 가장 먼저
나오고**, `서버 시작` 은 uvicorn 의 startup 로그 사이에 낀다.

```
2025-08-09 02:00:00,000 INFO     exercise_ai: Ultralytics 모듈 로드 성공
2025-08-09 02:00:00,001 INFO     exercise_ai: ExerciseAI 인스턴스 생성 완료
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
2025-08-09 02:00:00,010 INFO     main: 서버 시작 (ultralytics 사용 가능: True)
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8888 (Press CTRL+C to quit)
```

**포트는 8888입니다.** 첫 줄이 `Ultralytics 모듈 로드 실패` 면 시뮬레이션
모드이며 실제 자세 인식은 동작하지 않습니다.

### 2. 백엔드 테스트 (브라우저)

#### 2.1 AI 스트리밍 테스트
브라우저에서 `http://localhost:8888/video/ai` 접속. 보이는 화면이 두 갈래로
갈리는데, **어느 쪽인지로 카메라 유무를 판별할 수 있습니다.**

| 상황 | 보이는 것 |
|---|---|
| 카메라 있음 | 웹캠 영상만. **아무 텍스트도 없음** (오버레이는 운동 중에도 AIGym 이 그리는 것뿐) |
| 카메라 없음 | 검은 화면 + "Exercise Session Inactive" / "No Camera Available" |

즉 `"Exercise Session Inactive"` 가 보인다면 **카메라를 못 잡았다는 뜻**입니다.
정상 동작이 아닙니다.

#### 2.2 API 문서 확인
- 브라우저에서 `http://localhost:8888/docs` 접속

#### 2.3 운동 세션 API 테스트
1. `/exercise/start` POST 실행.
   **Swagger 가 채워 넣는 예시 바디를 그대로 보내면 422가 납니다.**
   (`{"exercise_type":"string","kpts":[0],...}` → `kpts는 3개의 정수로...`)
   바디를 통째로 지우고 실행하거나, `{"exercise_type":"shoulder_flexion"}` 으로
   바꿔서 보내세요.
2. `/exercise/data` GET 으로 실시간 데이터 확인
3. `/exercise/stop` POST 로 세션 종료

> **카운트가 0에서 안 올라가도 정상일 수 있습니다.** 폴백(시뮬레이션) 모드의
> 카운터는 프레임 루프 안에서 돌기 때문에, `/video/ai` 를 실제로 열어 둔
> 클라이언트가 있을 때만 증가합니다. API 만 호출하면 계속 0입니다.
> 브라우저 탭으로 `/video/ai` 를 열어 둔 채로 테스트하세요.

#### 2.4 스트림 정리 확인 (중요)
`/video/ai` 를 연 탭을 닫고 서버 로그를 봅니다. **카메라 유무에 따라 찍히는
줄이 다릅니다.**

카메라가 있을 때 (5줄):
```
INFO     main: 클라이언트 연결 종료 감지 - 스트림을 중단합니다.
INFO     exercise_ai: 카메라 스트림 종료 요청 수신 (클라이언트 연결 종료)
INFO     exercise_ai: 카메라 핸들 해제 완료
INFO     exercise_ai: 카메라 AI 스트리밍 종료
INFO     main: 스트림 정리 완료
```

카메라가 없을 때 (더미 스트림, 4줄):
```
INFO     main: 클라이언트 연결 종료 감지 - 스트림을 중단합니다.
INFO     exercise_ai: 더미 스트림 종료 요청 수신 (클라이언트 연결 종료)
INFO     exercise_ai: 더미 비디오 스트림 종료
INFO     main: 스트림 정리 완료
```

핵심은 마지막 `스트림 정리 완료` 가 찍히는지입니다. 안 찍히면 루프가 아직
돌고 있다는 뜻입니다.

### 3. 프론트엔드 테스트

앱 실행 방법(`npm install` / `npm start` / `npm run android`)은 저장소 루트의
README 를 참고하세요. 이 문서는 앱이 이미 떠 있다고 가정합니다.

#### 3.1 테스트 화면까지 가는 경로
`ExerciseDo` 가 백엔드와 붙는 화면이지만, **거기까지 화면을 네 번 거칩니다.**

```
Homepage → ExerciseListPage → Explain → ExerciseIntroPage → ExerciseVideoPage → ExerciseDo
```

`ExerciseDo` 로 가는 경로는 `ExerciseVideoPage` 하나뿐입니다.

주의할 점 두 가지:
- **백엔드를 부르는 화면은 두 개입니다.** `ExerciseDo`(스트림·세션 API)와
  `ExerciseVideoPage`(`/exercise/warmup`). warmup 실패는 조용히 삼켜지므로
  증상이 안 보입니다.
- 로그인 화면에 `/Exercise/ExerciseTestPage` 로 가는 버튼이 있는데
  (`app/Entry_page/Loginpage.tsx:82`) **그 화면은 존재하지 않습니다.** 죽은
  라우트이니 누르지 마세요.

#### 3.2 연동 테스트 순서
**UI 는 영어입니다.** 아래 라벨 그대로 찾으세요.

1. **서버 상태 확인**: 상단에 `Connected` 표시 확인 (실패 시 `Not connected`)
2. **운동 시작**: `Start` 버튼 클릭
3. **AI 스트림**: 실시간 웹캠 영상과 운동 분석 데이터 확인
4. **운동 수행**: 카메라 앞에서 해당 운동 동작 수행
5. **데이터 확인**: 실시간으로 카운트, 정확도, 시간 업데이트 확인
6. **운동 종료**: 목표 횟수 도달 시 자동 종료, 또는 `End` 버튼 클릭

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. `Not connected` 표시
**가장 흔한 원인은 포트가 아니라 호스트입니다.**
`ExerciseDo.tsx:19` 의 `BACKEND_URL` 은 `http://127.0.0.1:8888` 인데, 이 주소는
웹과 iOS 시뮬레이터에서만 통합니다.

| 실행 환경 | 써야 하는 호스트 |
|---|---|
| 웹 / iOS 시뮬레이터 | `127.0.0.1` |
| Android 에뮬레이터 | `10.0.2.2` |
| 실기기 | 개발 PC 의 LAN IP (예: `192.168.0.10`) |

그 다음 확인할 것:
- 백엔드 서버 실행 여부 (`http://localhost:8888/health` 접속)
- 방화벽 설정

#### 2. 웹캠 영상이 보이지 않음
**원인**: 카메라 권한, 다른 앱의 카메라 점유, 또는 이전 스트림이 아직 카메라를 쥐고 있음
**해결**:
- 카메라 권한 확인 / 다른 카메라 앱 종료
- 이전 스트림이 정리됐는지 로그로 확인 (위 2.4 참고)
- `/video/ai` 에 "No Camera Available" 이 뜨면 카메라를 못 잡은 것

#### 3. AI 분석이 작동하지 않음
**해결**:
- `/health` 의 `ultralytics_available` 이 `false` 인지 먼저 확인
- `pip install ultralytics` 재설치
- 인터넷 연결 확인. `AIGym` 은 `model=` 없이 생성되므로 ultralytics 기본
  가중치를 내려받습니다. 저장소의 `yolo11n-pose.pt` 는 코드가 참조하지 않습니다.

#### 4. 정확도가 `null` 로 나옴
**정상 동작입니다.** 사람이 검출되지 않았다는 뜻으로, "정확도 0%" 와 구분하기
위해 의도적으로 `null` 을 내려보냅니다.
**확인**: 같은 응답의 `is_detecting` 도 `false` 인지 보세요. 카메라 앞에 서면
값이 채워지고, 화면 밖으로 나가면 다시 `null` 로 돌아옵니다. 시뮬레이션
모드에서는 항상 `null` 입니다.

앱 화면에서는 `%` 만 덩그러니 보이는데, 이건 프론트엔드가 아직 `null` 을
처리하지 않아서입니다 (`ExerciseDo.tsx:335`). 백엔드 문제가 아닙니다.

#### 5. 운동 카운트가 증가하지 않음
**해결**:
- 먼저 위 2.3 의 경고 확인 — 폴백 모드에서는 `/video/ai` 를 열어 둬야 올라갑니다
- 카메라와 적절한 거리 유지 / 조명 개선 / 동작을 명확하게 수행
- `/exercise/config` 로 현재 각도 설정이 의도한 운동과 맞는지 확인

#### 6. `configure` 가 먹히지 않음
`exercise_type` 등은 반드시 **JSON 바디**로 보내야 합니다. 쿼리 파라미터만
보내면 조용히 무시되는 게 아니라 **422 로 거절**됩니다.

```
{"detail":[{"type":"missing","loc":["body"],"msg":"Field required"}]}
```

`200` 이 왔는데도 각도가 안 바뀌었다면 `exercise_type` 오타를 의심하세요.
운동 이름은 검증하지 않기 때문에, 목록에 없는 값은 조용히 무시되고 이전
각도가 유지됩니다. `/exercise/config` 로 실제 값을 확인하세요.

### 디버깅 팁

#### 백엔드 상세 로그
```bash
LOG_LEVEL=DEBUG python main.py
```

`uvicorn --log-level debug` 는 uvicorn 자체 로거만 바꾸므로 이 앱의 DEBUG 로그
(카메라 백엔드 시도 내역, 운동 카운트 변화)는 나오지 않습니다. `LOG_LEVEL` 을 쓰세요.

#### API 직접 테스트

> **PowerShell 에서는 `curl` 이 `Invoke-WebRequest` 의 별칭이라 아래 명령이
> 실패합니다.** `curl.exe` 로 바꿔 쓰거나 cmd / Git Bash 에서 실행하세요.

```bash
curl http://localhost:8888/health
```

```bash
curl -X POST http://localhost:8888/exercise/configure -H "Content-Type: application/json" -d "{\"exercise_type\":\"biceps_curl\"}"
```

```bash
curl -X POST "http://localhost:8888/exercise/warmup?exercise_type=biceps_curl"
```

폴백 모드에서는 `{"status":"warmed_up","ai_ready":false}` 가 정상입니다.
`warmed_up` 은 "요청을 처리했다", `ai_ready:false` 는 "실제 추론은 불가"를 뜻합니다.

```bash
curl -X POST "http://localhost:8888/exercise/start?exercise_type=shoulder_flexion"
```

```bash
curl http://localhost:8888/exercise/data
```

```bash
curl -X POST http://localhost:8888/exercise/stop
```

#### 세션 격리 확인
```bash
curl -X POST http://localhost:8888/sessions
```

반환된 `session_id` 를 `?session_id=...` 로 붙이면 그 세션의 인스턴스가 쓰입니다.
아무것도 안 붙이면 `default` 세션입니다. `/sessions` 와 `/health` 는 세션
식별자를 받지 않습니다.

```bash
curl http://localhost:8888/sessions
```

## ✅ 테스트 체크리스트

- [ ] 백엔드 서버 정상 실행 (포트 8888)
- [ ] `/health` 응답에서 `ultralytics_available` 확인
- [ ] `/video/ai` 스트리밍 작동 (텍스트 오버레이 유무로 카메라 유무 판별)
- [ ] 스트림 종료 시 `스트림 정리 완료` 로그 확인
- [ ] `/exercise/configure` 가 JSON 바디로 실제 설정을 바꾸는지 확인
- [ ] 쿼리 파라미터만 보내면 422가 나는지 확인
- [ ] 잘못된 `kpts` / 각도가 422로 거절되는지 확인
- [ ] 운동 세션 API 정상 작동 (start / data / stop)
- [ ] 사람이 없을 때 `accuracy: null`, `is_detecting: false` 확인
- [ ] 사람이 프레임을 벗어나면 다시 `null` 로 돌아오는지 확인
- [ ] 세션 두 개가 서로 간섭하지 않는지 확인
- [ ] 프론트엔드 `Connected` 표시 확인
- [ ] 실시간 데이터 수신 확인
- [ ] 세션 시작/종료 정상 작동

### 자동화된 회귀 테스트

위 수동 체크리스트와 별개로, 리팩터링이 고친 동작은 테스트로 잠겨 있습니다.

```bash
python tests/test_regression.py
```

pytest 가 있으면 `pytest tests/` 도 됩니다. 카메라나 ultralytics 없이 돌아가므로
어느 개발 머신에서든 실행할 수 있습니다.

> `backend/manual_camera_check.py` 는 테스트가 아니라 독립 실행용 카메라 데모
> 스크립트입니다. ultralytics 나 카메라가 없으면 바로 종료됩니다.

모든 체크리스트를 완료하면 본 기능 적용 준비 완료! 🎉
