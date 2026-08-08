# ICCAS 2025 Backend Server

FastAPI 기반 재활 운동 자세 인식 백엔드. ultralytics 의 `solutions.AIGym` 으로
포즈를 추정해 운동 횟수를 세고, 관절 각도로 정확도를 산출하며, MJPEG 로
스트리밍한다.

> 리팩터링 이력과 설계 판단 근거는 [`REFACTOR_NOTES.md`](./REFACTOR_NOTES.md) 참고.

## 기능

- 실시간 MJPEG 비디오 스트리밍
- ultralytics `AIGym` 기반 자세 인식 및 운동 카운팅
- 관절 각도 기반 정확도 산출
- 세션별 상태 격리
- 카메라/ultralytics 가 없어도 서버가 뜨는 3단 폴백

**모델에 대한 주의.** `AIGym` 을 `model=` 인자 없이 생성하므로, 실제로 쓰이는
가중치는 ultralytics 가 고르는 기본값이다. 저장소에 `yolo11n-pose.pt` 가 있지만
**코드 어디에서도 참조하지 않는다.** 모델을 확정하려면
`solutions.AIGym(model="yolo11n-pose.pt", ...)` 처럼 명시해야 한다.

## 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

`requirements.txt` 는 `ultralytics` 를 **필수**로 잡고 있고, 이게 torch 를 함께
끌어와 수 GB를 내려받는다. 아래 "동작 모드" 의 시뮬레이션 모드를 보고 싶다면
ultralytics 만 빼고 설치하면 된다.

```bash
pip install fastapi "uvicorn[standard]" opencv-python numpy python-multipart
```

### 2. 서버 실행
```bash
python main.py
```

리로드를 켜려면:

```bash
uvicorn main:app --host 0.0.0.0 --port 8888 --reload
```

**포트는 8888이다.** 바꾸려면 **세 곳**을 같이 고쳐야 한다. 프론트엔드 두 곳은
호스트 표기도 서로 다르다.

| 파일 | 값 |
|---|---|
| `backend/main.py:457` | `port=8888` |
| `app/Exercise/ExerciseDo.tsx:19` | `http://127.0.0.1:8888` |
| `app/Exercise/ExerciseVideoPage.tsx:69` | `http://localhost:8888` |

`ExerciseVideoPage` 의 warmup 실패는 조용히 삼켜지므로(`catch` 에서 로그만 찍음),
여기만 안 고치면 증상 없이 사전 초기화가 사라진다.

> **에뮬레이터/실기기에서 접속이 안 될 때는 포트가 아니라 호스트 문제다.**
> `127.0.0.1` 은 웹과 iOS 시뮬레이터에서만 통한다. Android 에뮬레이터는
> `10.0.2.2`, 실기기는 개발 PC 의 LAN IP 를 써야 한다.

## API 엔드포인트

`/video/ai` 와 `/exercise/*` 는 세션 식별자를 `?session_id=...` 쿼리 또는
`X-Session-Id` 헤더로 받는다. 둘 다 없으면 `"default"` 세션으로 묶인다.
**`/sessions`, `/sessions/{id}`, `/health` 는 세션 식별자를 받지 않는다.**

`X-Session-Id` 는 `request.headers.get()` 으로 직접 읽기 때문에 OpenAPI 스키마에
선언되어 있지 않다. 즉 `/docs` 화면에는 나타나지 않지만 동작은 한다.

### 비디오 스트리밍
| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/video/ai` | AI 분석이 포함된 MJPEG 스트리밍 |

`multipart/x-mixed-replace; boundary=frame` 로 응답한다. 클라이언트가 연결을
끊으면 서버가 이를 감지해 루프를 멈추고 카메라를 해제한다.

### 운동 설정
| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/exercise/configure` | 운동 설정 변경 (**JSON 바디 필수**) |
| `GET` | `/exercise/config` | 현재 설정 + 사용 가능한 운동 목록 |

`/exercise/configure` 는 바디가 **필수**다. 쿼리 파라미터만 보내면 무시되는 게
아니라 `422 {"loc":["body"],"msg":"Field required"}` 로 거절된다.

```jsonc
// 요청 바디 (모든 필드 선택, 단 바디 자체는 있어야 함 - 빈 {} 도 가능)
{
  "exercise_type": "biceps_curl",  // 아래 목록 중 하나
  "kpts": [6, 8, 10],              // 정수 3개, 각 값 0~16
  "up_angle": 35,                  // 0~180
  "down_angle": 130                // 0~180
}
```

범위를 벗어나면 `422` 와 함께 어떤 값이 잘못됐는지 돌려준다.

```json
{"detail":[{"msg":"Value error, kpts의 각 값은 0-16 사이의 정수여야 합니다."}]}
```

**`exercise_type` 은 검증하지 않는다.** 목록에 없는 값을 보내도 `200` 이
떨어지고 각도 설정은 그대로 유지된다. 그런데 `/exercise/start` 는 그 엉뚱한
값을 `exercise_type` 으로 되돌려주므로, 오타를 내면 "적용된 것처럼 보이는데
각도는 이전 운동 그대로"인 상태가 된다. `/exercise/config` 로 실제 각도를
확인하는 편이 안전하다.

사용 가능한 `exercise_type`:

`biceps_curl`, `neck_stretch`, `lateral_raise`, `shoulder_abduction_1`,
`shoulder_abduction_2`, `shoulder_external_rotation_2`,
`shoulder_external_rotation_3`, `shoulder_flexion`

### 운동 세션
| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/exercise/warmup` | 모델·카메라 사전 초기화 (지연 감소용) |
| `POST` | `/exercise/start` | 운동 시작 |
| `GET` | `/exercise/data` | 실시간 운동 데이터 |
| `POST` | `/exercise/stop` | 운동 종료 + 요약 반환 |

`start` 와 `warmup` 은 JSON 바디와 `?exercise_type=` 쿼리를 **모두** 받는다.
바디가 있으면 바디를 우선한다. 앱이 `?exercise_type=` 형태로 부르고 있어서
하위 호환으로 남겨 둔 것이다.

`/exercise/data` 응답:

```json
{
  "is_active": true,
  "count": 3,
  "accuracy": 87.5,
  "is_detecting": true,
  "elapsed_time": 12,
  "exercise_type": "shoulder_flexion"
}
```

**`accuracy` 는 `null` 일 수 있다.** 사람이 검출되지 않았다는 뜻이며 "정확도 0%"
와는 다른 상태다. 이때 `is_detecting` 도 `false` 다. 두 값은 매 프레임 갱신되므로
사람이 화면 밖으로 나가면 다시 `null` 로 돌아온다. 반면 `count` 는 누적 횟수라
유지된다.

`/exercise/data` 는 활성 세션이 없으면 `400` 을 반환한다.

> **앱은 아직 이 계약을 구현하지 않았다.** `ExerciseDo.tsx` 의 `ExerciseData`
> 인터페이스는 `accuracy: number` 로 선언되어 있고 `is_detecting` 필드가 없다.
> `{exerciseData.accuracy}%` 를 그대로 렌더링하므로 `null` 이면 화면에 `%` 만
> 남는다. 프론트엔드 후속 작업이 필요하다.

### 세션 관리
| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/sessions` | 새 세션 생성, `session_id` 반환 |
| `GET` | `/sessions` | 활성 세션 목록 |
| `DELETE` | `/sessions/{session_id}` | 세션 삭제 및 리소스 해제 |

마지막 요청으로부터 10분이 지난 세션은 정리된다. 다만 **백그라운드 타이머는
없다.** 다른 요청이 들어와 `get_or_create` 나 `GET /sessions` 를 거칠 때 정리된다.
서버가 완전히 유휴 상태면 버려진 세션과 그 세션이 쥔 카메라는 계속 남는다.
별도 스레드를 만들지 않으려고 의도적으로 택한 방식이다.

스트리밍 중인 세션은 프레임마다 갱신되므로 정리 대상이 되지 않는다.

### 시스템
| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/health` | 서버 상태 |
| `GET` | `/docs` | FastAPI 자동 생성 API 문서 |

```json
{"status":"healthy","ai_ready":true,"ultralytics_available":false,"active_sessions":0}
```

`ai_ready` 는 항상 `true` 다(기존 응답 형태 유지). 실제 추론 가능 여부는
`ultralytics_available` 을 봐야 한다.

## 동작 모드 (3단 폴백)

의도된 설계다. 데모 환경이 매번 달라서 어느 단계에서든 서버는 뜨고 앱은 붙는다.

1. **정상** — 카메라 + ultralytics 둘 다 있음. 실제 포즈 추정으로 카운트/정확도 산출.
2. **더미 스트림** — 카메라 초기화 실패. 검은 화면에 상태 텍스트를 그려 스트리밍.
3. **시뮬레이션** — ultralytics 없음. 카운트만 일정 간격으로 올린다.

**카운트가 어디서 나오는지.** 정상 모드의 `count` 는 이 백엔드가 각도로
계산하는 게 아니라 `AIGym` 이 내부적으로 `up_angle`/`down_angle` 임계값을 보고
센 값을 그대로 읽어온 것이다. 이 저장소에서 각도로 직접 계산하는 것은
`accuracy` 뿐이다. 폴백 모드(2·3)의 카운트는 자세와 무관한 프레임 카운터다.

**폴백 모드의 카운트에는 함정이 있다.** 증가 로직이 프레임 루프 안에 있어서
`/video/ai` 를 실제로 소비하는 클라이언트가 있을 때만 올라간다. curl 로
`start` → `data` 만 호출하면 카운트는 계속 0이다. 간격은 150프레임마다이며,
더미 스트림(`sleep(0.03)`)에서 실측하면 약 4.7초다.

카메라 백엔드는 OS 에 맞는 것만 시도한다 (Windows: DSHOW/MSMF, Linux: V4L2,
macOS: AVFOUNDATION, 공통 폴백: CAP_ANY).

## 로그

레벨은 `LOG_LEVEL` 환경변수로 조절한다.

```bash
LOG_LEVEL=DEBUG python main.py
```

uvicorn 의 `--log-level` 은 `uvicorn.*` 로거만 바꾸므로 이 앱의 `logger.debug`
(카메라 백엔드 시도 내역, 운동 카운트 변화 등)는 나오지 않는다. `LOG_LEVEL` 을 써야 한다.

## 요구사항

- Python 3.8+ (개발/검증은 3.12에서 진행)
- 웹캠 — 없으면 더미 스트림으로 폴백한다.
- ultralytics — `requirements.txt` 상으로는 필수. 빼고 설치하면 시뮬레이션 모드로 동작한다.
- CUDA — 선택 (GPU 가속)

## 알려진 사항

- **동시 사용자.** 세션별로 상태는 격리되지만 카메라는 서버에 물린 물리 장치
  하나다. 두 번째 세션은 장치 점유 실패로 더미 스트림으로 떨어진다. 즉 세션
  분리가 고친 것은 카운트 혼선이지 동시 촬영이 아니다.
- **기본 설정 불일치.** `ExerciseAI` 의 초기 `exercise_config` 는
  `exercise_type` 이 `"shoulder_flexion"` 인데 각도는 `up=130 / down=90` 으로,
  프리셋의 `shoulder_flexion`(`up=30 / down=170`)과 다르다. 첫 `configure`
  호출 전까지만 해당된다. 각도는 실측으로 정한 값이라 이번 정리에서 손대지
  않았다.
- **원격 사용 불가.** 서버가 자기 웹캠을 잡아 내보내는 구조라 원격 사용자는
  자기 모습을 볼 수 없다. 발표자 노트북 앞 시연이 전제였다.
- **`app/Entry_page/Loginpage.tsx:82`** 가 존재하지 않는 `/Exercise/ExerciseTestPage`
  로 이동한다. 죽은 라우트다.
- **`backend/test.py`** 는 테스트 코드가 아니라 독립 카메라 데모 스크립트다.
  ultralytics 를 모듈 최상단에서 import 하고 카메라가 없으면 즉시 종료한다.
  이 저장소에 자동화된 테스트는 없다.
- **`yolo11n-pose.pt`** 가 저장소 루트와 `backend/` 에 중복으로 커밋되어 있으나
  (각 6.2MB) 코드에서 참조하지 않는다.
