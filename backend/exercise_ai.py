import cv2
import logging
import numpy as np
import platform
import time
import threading

logger = logging.getLogger(__name__)

# MJPEG 멀티파트 프레임 헤더 (boundary 는 StreamingResponse 의 media_type 과 맞춰야 한다)
MJPEG_FRAME_HEADER = b'--frame\r\nContent-Type: image/jpeg\r\n\r\n'

# 시뮬레이션 모드에서 카운트를 올리는 주기(프레임 단위).
# 더미 스트림 기준 150프레임 x 0.03초 = 약 4.5초, 실측 약 4.7초.
SIMULATION_COUNT_INTERVAL_FRAMES = 150

# AI Gym 지연 초기화를 다시 시도하는 주기(프레임 단위). 30프레임 = 약 1초.
# 매 프레임 시도하면 실패가 계속되는 환경에서 초당 수십 번 모델 로드를 때린다.
AI_GYM_RETRY_INTERVAL_FRAMES = 30


def _camera_backends_for_platform():
    """현재 OS 에서 의미 있는 OpenCV 캡처 백엔드만 골라 반환한다.

    CAP_DSHOW / CAP_MSMF 는 Windows 전용인데 예전 코드는 OS 와 무관하게
    무조건 시도했다. Linux/macOS 에서는 매번 실패하면서 초기화만 느려지고
    로그를 오염시킨다. CAP_ANY 는 OpenCV 가 알아서 고르게 하는 공통 폴백이라
    항상 마지막에 둔다.

    일부 OpenCV 빌드에는 특정 상수가 없을 수 있어 getattr 로 안전하게 접근한다.
    """
    system = platform.system()
    if system == "Windows":
        names = ["CAP_DSHOW", "CAP_MSMF"]
    elif system == "Linux":
        names = ["CAP_V4L2"]
    elif system == "Darwin":
        names = ["CAP_AVFOUNDATION"]
    else:
        names = []

    backends = [getattr(cv2, name) for name in names if hasattr(cv2, name)]
    backends.append(cv2.CAP_ANY)  # 공통 폴백
    logger.debug("OS=%s 에서 시도할 카메라 백엔드: %s", system, backends)
    return backends

# ultralytics는 무겁고 설치되지 않은 환경도 있으므로, import 실패를 치명적 오류로
# 다루지 않고 플래그로 낮춰 시뮬레이션 모드로 계속 동작하게 한다.
try:
    from ultralytics import solutions
    ULTRALYTICS_AVAILABLE = True
    logger.info("Ultralytics 모듈 로드 성공")
except ImportError as e:
    ULTRALYTICS_AVAILABLE = False
    logger.warning("Ultralytics 모듈 로드 실패, 시뮬레이션 모드로 동작합니다: %s", e)

class ExerciseAI:
    def __init__(self):
        self.gym = None
        self.cap = None
        self.current_data = {
            "count": 0,
            "accuracy": None,  # 아직 측정된 값이 없음 (검출 전)
            "is_detecting": False
        }
        self.lock = threading.Lock()
        self.count_simulation = 0  # 시뮬레이션용 카운터
        self._last_count = -1  # 카운트 변경 감지용

        # 운동 설정 파라미터 (기본값)
        self.exercise_config = {
            "kpts": [6, 8, 10],  # 기본: 왼쪽 키포인트 (어깨-팔꿈치-손목)
            "up_angle": 130,     # 기본: 팔을 든 상태 각도
            "down_angle": 90,    # 기본: 팔을 내린 상태 각도
            "exercise_type": "shoulder_flexion"
        }

        # 운동별 사전 정의된 설정 (실제 운동 리스트에 맞춤)
        self.predefined_configs = {
            # ARM EXERCISES
            "biceps_curl": {
                "kpts": [6, 8, 10],  # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 35,      # 팔을 완전히 구부린 상태
                "down_angle": 130    # 팔을 편 상태
            },

            # NECK EXERCISE
            "neck_stretch": {
                "kpts": [0, 5, 6],    # 코-왼쪽어깨-오른쪽어깨 (목 운동)
                "up_angle": 120,      # 목을 옆으로 기울인 상태
                "down_angle": 90      # 목을 똑바로 한 상태
            },

            # SHOULDER EXERCISES
            "lateral_raise": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 90,       # 팔을 옆으로 들어올린 상태 (어깨 높이)
                "down_angle": 170     # 팔을 내린 상태
            },

            "shoulder_abduction_1": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 90,       # 팔을 90도까지 들어올린 상태
                "down_angle": 170     # 팔을 내린 상태
            },

            "shoulder_abduction_2": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 30,       # 팔을 머리 위로 완전히 들어올린 상태
                "down_angle": 170     # 팔을 내린 상태
            },

            "shoulder_external_rotation_2": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 90,       # 손이 이마에 닿는 상태 (팔꿈치 90도)
                "down_angle": 170     # 팔을 내린 상태
            },

            "shoulder_external_rotation_3": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 45,       # 손이 목 뒤에 닿는 상태
                "down_angle": 170     # 팔을 내린 상태
            },

            "shoulder_flexion": {
                "kpts": [6, 8, 10],   # 왼쪽 어깨-팔꿈치-손목
                "up_angle": 30,       # 팔을 앞으로 들어올린 상태
                "down_angle": 170     # 팔을 내린 상태
            },
        }

        # AI Gym 초기화는 지연로딩
        logger.info("ExerciseAI 인스턴스 생성 완료")

    def configure_exercise(self, exercise_type=None, kpts=None, up_angle=None, down_angle=None):
        """운동 설정을 동적으로 구성"""
        # 이전 설정 저장 (같은 설정이면 AI Gym 재사용)
        prev_config = self.exercise_config.copy()

        # 사전 정의된 운동 타입 확인
        if exercise_type and exercise_type in self.predefined_configs:
            config = self.predefined_configs[exercise_type]
            self.exercise_config.update(config)
            self.exercise_config["exercise_type"] = exercise_type
            logger.info("사전 정의된 운동 설정 적용: %s", exercise_type)

        # 개별 파라미터 오버라이드
        if kpts is not None:
            self.exercise_config["kpts"] = kpts
            logger.debug("키포인트 설정: %s", kpts)
        if up_angle is not None:
            self.exercise_config["up_angle"] = up_angle
            logger.debug("상단 각도 설정: %s", up_angle)
        if down_angle is not None:
            self.exercise_config["down_angle"] = down_angle
            logger.debug("하단 각도 설정: %s", down_angle)

        # 설정이 변경되었을 때만 AI Gym 재초기화
        if (prev_config.get("kpts") != self.exercise_config["kpts"] or
            prev_config.get("up_angle") != self.exercise_config["up_angle"] or
            prev_config.get("down_angle") != self.exercise_config["down_angle"]):
            if self.gym:
                self.gym = None
                logger.info("운동 설정 변경으로 AI Gym 인스턴스 제거")
        else:
            logger.debug("동일한 운동 설정 - AI Gym 인스턴스 재사용")

        logger.info("최종 운동 설정: %s", self.exercise_config)
        return self.exercise_config.copy()

    @staticmethod
    def validate_exercise_params(kpts=None, up_angle=None, down_angle=None):
        """운동 파라미터 유효성 검사

        API 경계의 Pydantic 모델(main.ExerciseParams)이 이 함수를 그대로 호출하므로,
        검증 규칙의 단일 출처 역할을 한다. staticmethod 이기 때문에 인스턴스 없이도
        재사용할 수 있다.
        """
        errors = []

        if kpts is not None:
            if not isinstance(kpts, list) or len(kpts) != 3:
                errors.append("kpts는 3개의 정수로 구성된 리스트여야 합니다.")
            elif not all(isinstance(k, int) and 0 <= k <= 16 for k in kpts):
                errors.append("kpts의 각 값은 0-16 사이의 정수여야 합니다.")

        if up_angle is not None:
            if not isinstance(up_angle, (int, float)) or not (0 <= up_angle <= 180):
                errors.append("up_angle은 0-180 사이의 숫자여야 합니다.")

        if down_angle is not None:
            if not isinstance(down_angle, (int, float)) or not (0 <= down_angle <= 180):
                errors.append("down_angle은 0-180 사이의 숫자여야 합니다.")

        return errors

    def get_exercise_config(self):
        """현재 운동 설정 반환"""
        return self.exercise_config.copy()

    def get_available_exercises(self):
        """사용 가능한 운동 타입 목록 반환"""
        return list(self.predefined_configs.keys())

    def setup_ai_gym(self, force_rebuild=False):
        """AI Gym 인스턴스 설정 - 지연 초기화"""
        if not ULTRALYTICS_AVAILABLE:
            logger.warning("Ultralytics가 사용 불가능합니다. 시뮬레이션 모드로 실행됩니다.")
            return False

        try:
            # 기존 인스턴스를 강제로 재구성하거나, 인스턴스가 없는 경우 생성
            if self.gym is None or force_rebuild:
                if self.gym is not None:
                    logger.debug("기존 AI Gym 인스턴스 해제")
                    self.gym = None

                logger.info(
                    "AI Gym 초기화 시작 (단일 사용자 모드): kpts=%s, up_angle=%s, down_angle=%s, max_det=1",
                    self.exercise_config["kpts"],
                    self.exercise_config["up_angle"],
                    self.exercise_config["down_angle"],
                )

                self.gym = solutions.AIGym(
                    line_width=2,
                    show=False,  # 서버에서는 화면 표시 안함
                    kpts=self.exercise_config["kpts"],
                    up_angle=self.exercise_config["up_angle"],
                    down_angle=self.exercise_config["down_angle"],
                    max_det=1,  # 단일 사용자만 추적 (멀티-person 기능 비활성화)
                    fps=60,
                )
                logger.info("AI Gym 초기화 완료 - 운동 타입: %s", self.exercise_config["exercise_type"])
                return True
            return True
        except Exception:
            logger.error("AI Gym 초기화 실패", exc_info=True)
            self.gym = None
            return False

    def try_camera_init(self):
        """카메라를 미리 초기화 시도 (warmup용)"""
        if self.cap and self.cap.isOpened():
            logger.debug("카메라가 이미 초기화되어 있습니다.")
            return True

        logger.info("카메라 사전 초기화 시도...")
        self.cap = self._init_camera()
        if self.cap:
            logger.info("카메라 사전 초기화 성공")
            return True
        else:
            logger.warning("카메라 사전 초기화 실패 - 운동 시작 시 재시도합니다.")
            return False

    def reset_session(self):
        """새로운 운동 세션을 위한 리셋"""
        with self.lock:
            self.current_data = {
                "count": 0,
                "accuracy": None,
                "is_detecting": False
            }
            self.count_simulation = 0  # 시뮬레이션 카운터 리셋
            self._last_count = -1  # 카운트 변경 감지 초기화

            # AI Gym 완전히 재생성하여 확실한 리셋
            if self.gym:
                try:
                    # 기존 AI Gym 정리
                    self.gym = None
                    logger.debug("기존 AI Gym 인스턴스 정리")

                    # 새로운 AI Gym 생성
                    if ULTRALYTICS_AVAILABLE:
                        self.setup_ai_gym(force_rebuild=True)
                        logger.info("AI Gym 완전 재생성으로 카운터 초기화")
                except Exception:
                    logger.error("AI Gym 재생성 실패", exc_info=True)

        logger.info("운동 세션 완전 리셋 완료")

    def get_current_data(self):
        """현재 운동 데이터 반환"""
        with self.lock:
            return self.current_data.copy()

    def _accuracy_label(self):
        """오버레이용 정확도 문자열. 측정값이 없으면 '--' 로 표시한다."""
        accuracy = self.current_data.get("accuracy")
        return "--" if accuracy is None else f"{accuracy:.0f}%"

    def _tick_simulation_count(self):
        """시뮬레이션 카운트를 1 올린다.

        실제 검출이 아니므로 accuracy 는 측정값 없음(None), is_detecting 은 False 다.
        더미 스트림과 '카메라는 있지만 ultralytics 가 없는' 경로 양쪽에서 쓴다.
        """
        with self.lock:
            self.count_simulation += 1
            self.current_data["count"] = self.count_simulation
            self.current_data["accuracy"] = None
            self.current_data["is_detecting"] = False

    @staticmethod
    def _encode_frame(frame, quality=None):
        """프레임을 MJPEG 멀티파트 청크로 인코딩한다. 인코딩 실패 시 None."""
        params = [cv2.IMWRITE_JPEG_QUALITY, quality] if quality is not None else []
        ok, buffer = cv2.imencode('.jpg', frame, params)
        if not ok:
            return None
        return MJPEG_FRAME_HEADER + buffer.tobytes() + b'\r\n'

    def release_camera(self):
        """카메라 핸들을 해제한다. 이미 해제된 경우 아무 일도 하지 않는다."""
        if self.cap:
            self.cap.release()
            self.cap = None
            logger.info("카메라 핸들 해제 완료")

    def calculate_accuracy(self, results):
        """운동 정확도 계산 - 단일 사용자 실시간 각도 기반

        사람이 검출되지 않았으면 None 을 반환한다. 예전에는 85.0 을 반환해서,
        카메라에 아무도 없어도 화면에 "85%" 가 떠 사용자를 오도했다.
        '측정값 없음'과 '측정했더니 85%'는 반드시 구분되어야 한다.
        """
        # numpy 배열이 올 수도 있으므로 truthiness 대신 길이로 검사한다.
        workout_angle = getattr(results, "workout_angle", None) if results is not None else None
        if workout_angle is None or len(workout_angle) == 0:
            return None

        try:
            # 단일 사용자(인덱스 0)의 각도와 단계 정보만 사용
            current_angle = results.workout_angle[0]
            current_stage = results.workout_stage[0]
            target_up_angle = self.exercise_config["up_angle"]
            target_down_angle = self.exercise_config["down_angle"]

            angle_diff = 0
            # 현재 단계에 따라 목표 각도와 비교
            if current_stage == 'up':
                target_angle = target_up_angle
                angle_diff = abs(current_angle - target_angle)
            elif current_stage == 'down':
                target_angle = target_down_angle
                angle_diff = abs(current_angle - target_angle)
            else: # 중간 단계 ('-')
                # 전체 동작 범위 내에 있는지 확인
                if not (min(target_down_angle, target_up_angle) <= current_angle <= max(target_down_angle, target_up_angle)):
                    # 범위를 벗어난 경우, 더 가까운 쪽 경계와의 차이를 계산
                    angle_diff = min(abs(current_angle - target_up_angle), abs(current_angle - target_down_angle))

            # 각도 차이를 정확도로 변환 (1도당 1% 감점, 30도 차이면 70%)
            # 기울기는 그대로 두고 하한 70%만 없앴다. 예전에는 30도를 넘는 편차가
            # 전부 70%로 뭉개져서, 자세가 아무리 틀려도 70% 아래로는 내려가지 않았다.
            max_angle_error = 30.0
            accuracy = 100 - (angle_diff / max_angle_error) * 30

            return max(0.0, min(100.0, accuracy))

        except (IndexError, TypeError, AttributeError):
            logger.error("정확도 계산 오류", exc_info=True)
            return None  # 계산 실패는 '측정값 없음'으로 취급

    def get_ai_stream_video(self, exercise_session):
        """AI 분석이 포함된 비디오 스트리밍 생성기"""
        logger.info("AI 비디오 스트리밍 시작 - Ultralytics 사용 가능: %s", ULTRALYTICS_AVAILABLE)

        # 카메라 초기화 시도 (이미 초기화되어 있으면 재사용)
        if not self.cap or not self.cap.isOpened():
            logger.info("카메라 초기화를 시도합니다...")
            self.cap = self._init_camera()
            if not self.cap:
                logger.warning("카메라 초기화 실패. 더미 스트림으로 대체합니다.")
                return self._generate_dummy_stream(exercise_session)
        else:
            logger.debug("기존 카메라 인스턴스를 재사용합니다.")

        logger.info("카메라 스트리밍을 시작합니다.")
        return self._camera_stream_with_ai(exercise_session)

    def _init_camera(self):
        """카메라 안전 초기화"""
        logger.info("카메라 초기화 시도 (OS=%s)...", platform.system())

        # 현재 OS 에서 유효한 백엔드만 인덱스별로 시도한다.
        # 여기서 전부 실패하면 호출 측이 더미 스트림 -> 시뮬레이션 모드로 넘어간다
        # (의도된 3단 폴백이므로 그대로 유지).
        backends_to_try = _camera_backends_for_platform()
        indices_to_try = [0, 1, -1]

        for backend in backends_to_try:
            for index in indices_to_try:
                try:
                    logger.debug("카메라 시도: 인덱스=%s, 백엔드=%s", index, backend)
                    cap = cv2.VideoCapture(index, backend)

                    if cap.isOpened():
                        # 카메라 설정 최적화
                        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        cap.set(cv2.CAP_PROP_FPS, 30)
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                        # 테스트 프레임 읽기
                        ret, frame = cap.read()
                        if ret and frame is not None:
                            logger.info("카메라 초기화 성공: 인덱스=%s, 백엔드=%s", index, backend)
                            return cap
                        else:
                            cap.release()
                    else:
                        cap.release()

                except Exception:
                    logger.debug(
                        "카메라 초기화 실패 (인덱스=%s, 백엔드=%s)", index, backend, exc_info=True
                    )
                    continue

        logger.warning("모든 카메라 초기화 시도 실패")
        return None

    def _generate_dummy_stream(self, exercise_session):
        """더미 비디오 스트림 생성 (카메라 없을 때)

        무한 루프이므로 반드시 try/finally 안에서 돌린다. 클라이언트가 연결을 끊으면
        소비 측에서 close() 가 호출되어 yield 지점에서 GeneratorExit 이 발생하고,
        finally 로 진입해 루프가 종료된다.
        """
        logger.warning("더미 비디오 스트림 시작 (카메라 없음)")

        try:
            yield from self._dummy_frames(exercise_session)
        except GeneratorExit:
            logger.info("더미 스트림 종료 요청 수신 (클라이언트 연결 종료)")
            raise
        finally:
            logger.info("더미 비디오 스트림 종료")

    def _dummy_frames(self, exercise_session):
        """더미 프레임 생성 루프 (_generate_dummy_stream 내부용)"""
        frame_count = 0

        while True:
            frame_count += 1

            # 640x480 검은색 더미 프레임 생성
            dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)

            # 운동 세션이 활성화된 경우
            if exercise_session.is_active:
                if frame_count % SIMULATION_COUNT_INTERVAL_FRAMES == 0:
                    self._tick_simulation_count()

                # 운동 정보를 프레임에 표시
                cv2.putText(dummy_frame, f"Count: {self.current_data['count']}",
                           (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
                cv2.putText(dummy_frame, f"Accuracy: {self._accuracy_label()}",
                           (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
                cv2.putText(dummy_frame, f"Exercise: {self.exercise_config['exercise_type']}",
                           (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
                cv2.putText(dummy_frame, "Simulation Mode",
                           (10, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 0, 0), 3)
                cv2.putText(dummy_frame, "No Camera Available",
                           (10, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (128, 128, 128), 2)
            else:
                # 비활성 상태
                cv2.putText(dummy_frame, "Exercise Session Inactive",
                           (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (128, 128, 128), 3)
                cv2.putText(dummy_frame, "No Camera Available",
                           (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 128), 2)
                cv2.putText(dummy_frame, "Click 'Start Exercise' to begin",
                           (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (128, 128, 128), 2)

            chunk = self._encode_frame(dummy_frame)
            if chunk is not None:
                yield chunk

            time.sleep(0.03)  # 약 33 FPS. 더미 루프는 카메라가 없으므로 이 값이 실제 상한이다.

    def _camera_stream_with_ai(self, exercise_session):
        """실제 카메라를 사용한 AI 스트리밍

        무한 루프이므로 반드시 try/finally 안에서 돌린다. 클라이언트가 연결을 끊으면
        소비 측에서 close() 가 호출되어 yield 지점에서 GeneratorExit 이 발생하고,
        finally 에서 카메라를 해제한다. 이 정리가 없으면 브라우저 탭을 닫아도
        루프가 계속 돌며 카메라와 워커 스레드를 붙잡고 있게 된다.
        """
        logger.info("실제 카메라 AI 스트리밍 시작")

        try:
            yield from self._camera_frames(exercise_session)
        except GeneratorExit:
            logger.info("카메라 스트림 종료 요청 수신 (클라이언트 연결 종료)")
            raise
        finally:
            self.release_camera()
            logger.info("카메라 AI 스트리밍 종료")

    def _camera_frames(self, exercise_session):
        """카메라 프레임 처리 루프 (_camera_stream_with_ai 내부용)"""
        frame_count = 0
        retry_count = 0
        max_retries = 3

        while True:
            # 지역 변수로 받아 두고 쓴다. /exercise/stop 이나 세션 삭제가
            # 다른 스레드에서 release_camera() -> self.cap = None 을 하기 때문에,
            # self.cap.read() 를 바로 호출하면 그 사이에 None 이 되어
            # AttributeError 로 스트림이 터진다. 앱은 스트림을 띄운 채로
            # 운동 종료를 호출하므로 매 세션 종료마다 밟는 경로다.
            cap = self.cap
            if cap is None:
                logger.info("카메라가 해제되었습니다. 스트림을 정상 종료합니다.")
                return

            success, frame = cap.read()
            if not success:
                retry_count += 1
                logger.warning("프레임 읽기 실패 (시도 %s/%s)", retry_count, max_retries)

                if retry_count >= max_retries:
                    logger.warning("카메라 접근 실패. 더미 스트림으로 전환합니다.")
                    self.release_camera()
                    # 제너레이터 안에서 return 은 값을 돌려주는 게 아니라 StopIteration 이라,
                    # 원래 코드에서는 폴백이 실행되지 않고 스트림이 그냥 끊겼다.
                    # yield from 으로 더미 스트림에 위임해야 의도한 3단 폴백이 성립한다.
                    yield from self._generate_dummy_stream(exercise_session)
                    return

                time.sleep(0.5)
                continue

            retry_count = 0
            frame_count += 1

            # 운동 세션이 활성화된 경우
            if exercise_session.is_active:
                try:
                    # AI Gym 초기화 시도 (지연 초기화)
                    if self.gym is None and ULTRALYTICS_AVAILABLE:
                        if frame_count % AI_GYM_RETRY_INTERVAL_FRAMES == 0:
                            logger.info("AI Gym 지연 초기화 시도...")
                            self.setup_ai_gym()

                    # AI 분석 수행
                    if self.gym is not None:
                        try:
                            results = self.gym(frame)

                            # 정확도와 검출 여부는 '매 프레임' 갱신해야 한다.
                            # 검출된 프레임에서만 갱신하면, 사람이 화면 밖으로
                            # 나가는 순간 마지막 값이 그대로 고정(latch)되어
                            # 아무도 없는데 계속 그 점수가 표시된다.
                            # 검출 실패 시 None 을 내려보내는 의미가 사라진다.
                            accuracy = self.calculate_accuracy(results)

                            # 단일 사용자 운동 카운트 처리
                            # (max_det=1 설정으로 인해 하나만 검출됨)
                            counts = getattr(results, 'workout_count', None)
                            has_count = counts is not None and len(counts) > 0
                            count = counts[0] if has_count else None

                            with self.lock:
                                # 카운트는 누적 횟수라 사람이 잠깐 벗어나도 유지한다.
                                # 되돌리면 지금까지 한 운동이 사라진다.
                                if has_count:
                                    self.current_data["count"] = count
                                self.current_data["accuracy"] = accuracy
                                # 각도를 실제로 뽑아냈을 때만 '검출 중'이다.
                                self.current_data["is_detecting"] = accuracy is not None

                            # 카운트가 변경될 때만 로그 출력 (성능 최적화)
                            if has_count and count != self._last_count:
                                logger.debug("운동 카운트: %s", count)
                                self._last_count = count

                            # 분석된 프레임 사용 (키포인트, 카운트 등이 그려진 상태)
                            if hasattr(results, 'plot_im'):
                                frame = results.plot_im

                        except Exception:
                            # 추론 자체가 실패한 프레임도 '인식되지 않음'이다.
                            # 여기서 상태를 놔두면 마지막 값이 그대로 남는다.
                            logger.error("AI 분석 오류", exc_info=True)
                            with self.lock:
                                self.current_data["accuracy"] = None
                                self.current_data["is_detecting"] = False
                    else:
                        # AI Gym이 없으면 시뮬레이션 모드
                        if frame_count % SIMULATION_COUNT_INTERVAL_FRAMES == 0:
                            self._tick_simulation_count()


                except Exception:
                    logger.error("프레임 처리 오류", exc_info=True)

            chunk = self._encode_frame(frame, quality=80)
            if chunk is not None:
                yield chunk

            # 주석에는 "30 FPS 제한"이라고 적혀 있었지만 0.015초는 약 66 FPS 다.
            # 실제 프레임 속도를 정하는 건 이 sleep 이 아니라 카메라
            # (CAP_PROP_FPS=30) 와 추론 시간이다. 이 sleep 은 카메라가 예상보다
            # 빨리 프레임을 줄 때 바쁜 루프가 되는 것을 막고 워커 스레드를
            # 양보하기 위한 것이므로, 값을 0.03 으로 올리면 30 FPS 카메라 위에
            # 30 FPS 제한을 한 번 더 걸어 오히려 느려진다. 값은 두고 주석을 고친다.
            time.sleep(0.015)  # 약 66 FPS 상한 (실질 상한은 카메라 30 FPS)

    def close(self):
        """카메라와 AI Gym 을 명시적으로 정리한다.

        예전에는 __del__ 에서 카메라를 놓아줬다. __del__ 은 참조가 0이 되는
        시점에만 불리는데, 스트림 제너레이터나 예외 트레이스백이 인스턴스를
        붙잡고 있으면 그 시점이 언제인지 알 수 없다. 실제로는 프로세스가
        끝날 때까지 카메라가 잡혀 있는 경우가 생긴다.
        정리 시점을 호출자가 정하도록 close() 로 바꾸고,
        FastAPI 종료 훅과 세션 삭제 경로에 연결했다.
        """
        self.release_camera()
        self.gym = None
        logger.debug("ExerciseAI 리소스 정리 완료")

    # with 문으로도 쓸 수 있게 해 둔다 (스크립트/테스트에서 유용).
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()
        return False
