import cv2
import logging
import numpy as np
import time
import threading

logger = logging.getLogger(__name__)

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
            "accuracy": 85,  # 기본 정확도
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

    def update_exercise_settings(self, frontend_data):
        """프론트엔드에서 전달받은 데이터로 운동 설정 업데이트"""
        try:
            # 프론트엔드 데이터에서 필요한 정보 추출
            exercise_type = frontend_data.get('exercise_type')
            custom_kpts = frontend_data.get('kpts')
            custom_up_angle = frontend_data.get('up_angle')
            custom_down_angle = frontend_data.get('down_angle')

            # 파라미터 유효성 검사
            validation_errors = self.validate_exercise_params(custom_kpts, custom_up_angle, custom_down_angle)
            if validation_errors:
                return {
                    "success": False,
                    "message": "; ".join(validation_errors),
                    "config": self.exercise_config.copy()
                }

            # 운동 설정 업데이트
            updated_config = self.configure_exercise(
                exercise_type=exercise_type,
                kpts=custom_kpts,
                up_angle=custom_up_angle,
                down_angle=custom_down_angle
            )

            # AI Gym 재구성 (새로운 설정 적용)
            if ULTRALYTICS_AVAILABLE:
                self.setup_ai_gym(force_rebuild=True)

            # 세션 리셋 (새로운 설정으로 운동 시작)
            self.reset_session()

            return {
                "success": True,
                "message": "운동 설정이 성공적으로 업데이트되었습니다.",
                "config": updated_config
            }

        except Exception as e:
            logger.error("운동 설정 업데이트 오류", exc_info=True)
            return {
                "success": False,
                "message": f"운동 설정 업데이트 실패: {str(e)}",
                "config": self.exercise_config.copy()
            }

    def validate_exercise_params(self, kpts=None, up_angle=None, down_angle=None):
        """운동 파라미터 유효성 검사"""
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

    def is_ready(self):
        """AI 모델이 준비되었는지 확인"""
        return ULTRALYTICS_AVAILABLE or True  # 시뮬레이션 모드도 준비 완료로 처리

    def reset_session(self):
        """새로운 운동 세션을 위한 리셋"""
        with self.lock:
            self.current_data = {
                "count": 0,
                "accuracy": 85,
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

    def cleanup_session(self):
        """세션 정리"""
        if self.cap:
            self.cap.release()
            self.cap = None

    def calculate_accuracy(self, results):
        """운동 정확도 계산 - 단일 사용자 실시간 각도 기반"""
        if results is None or not results.workout_angle:
            return 85.0  # 데이터가 없으면 기본값 반환

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

            # 각도 차이를 정확도로 변환 (0~30도 차이를 70~100% 정확도로 매핑)
            max_angle_error = 30.0
            if angle_diff <= max_angle_error:
                accuracy = 100 - (angle_diff / max_angle_error) * 30  # 70~100%
            else:
                accuracy = 70.0  # 최소 70%

            return max(70, min(100, accuracy))

        except (IndexError, TypeError, AttributeError):
            logger.error("정확도 계산 오류", exc_info=True)
            return 85.0 # 오류 발생 시 기본값

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
        logger.info("카메라 초기화 시도...")

        # 다양한 백엔드와 인덱스로 시도
        backends_to_try = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]
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
        """더미 비디오 스트림 생성 (카메라 없을 때)"""
        logger.warning("더미 비디오 스트림 시작 (카메라 없음)")
        frame_count = 0

        while True:
            frame_count += 1

            # 640x480 검은색 더미 프레임 생성
            dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)

            # 운동 세션이 활성화된 경우
            if exercise_session.is_active:
                # 시뮬레이션 모드 - 5초마다 카운트 증가
                if frame_count % 150 == 0:  # 5초마다 (30fps 기준)
                    with self.lock:
                        self.count_simulation += 1
                        self.current_data["count"] = self.count_simulation
                        self.current_data["accuracy"] = self.calculate_accuracy(None)
                        self.current_data["is_detecting"] = True

                # 운동 정보를 프레임에 표시
                cv2.putText(dummy_frame, f"Count: {self.current_data['count']}",
                           (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
                cv2.putText(dummy_frame, f"Accuracy: {self.current_data['accuracy']}%",
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

            # 프레임을 JPEG로 인코딩
            ret, buffer = cv2.imencode('.jpg', dummy_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' +
                       bytearray(frame_bytes) + b'\r\n')

            time.sleep(0.03)  # 30 FPS 제한

    def _camera_stream_with_ai(self, exercise_session):
        """실제 카메라를 사용한 AI 스트리밍"""
        logger.info("실제 카메라 AI 스트리밍 시작")
        frame_count = 0
        retry_count = 0
        max_retries = 3

        while True:
            success, frame = self.cap.read()
            if not success:
                retry_count += 1
                logger.warning("프레임 읽기 실패 (시도 %s/%s)", retry_count, max_retries)

                if retry_count >= max_retries:
                    logger.warning("카메라 접근 실패. 더미 스트림으로 전환합니다.")
                    if self.cap:
                        self.cap.release()
                        self.cap = None
                    return self._generate_dummy_stream(exercise_session)

                time.sleep(0.5)
                continue

            retry_count = 0
            frame_count += 1

            # 운동 세션이 활성화된 경우
            if exercise_session.is_active:
                try:
                    # AI Gym 초기화 시도 (지연 초기화)
                    if self.gym is None and ULTRALYTICS_AVAILABLE:
                        if frame_count % 30 == 0:  # 1초마다 시도
                            logger.info("AI Gym 지연 초기화 시도...")
                            self.setup_ai_gym()

                    # AI 분석 수행
                    if self.gym is not None:
                        try:
                            results = self.gym(frame)

                            # 단일 사용자 운동 카운트 처리
                            if hasattr(results, 'workout_count') and results.workout_count is not None:
                                # 첫 번째 사용자의 카운트만 사용 (max_det=1 설정으로 인해 하나만 검출됨)
                                if len(results.workout_count) > 0:
                                    count = results.workout_count[0]
                                    with self.lock:
                                        self.current_data["count"] = count
                                        self.current_data["accuracy"] = self.calculate_accuracy(results)
                                        self.current_data["is_detecting"] = True

                                    # 카운트가 변경될 때만 로그 출력 (성능 최적화)
                                    if count != getattr(self, '_last_count', -1):
                                        logger.debug("운동 카운트: %s", count)
                                        self._last_count = count

                            # 분석된 프레임 사용 (키포인트, 카운트 등이 그려진 상태)
                            if hasattr(results, 'plot_im'):
                                frame = results.plot_im

                        except Exception:
                            logger.error("AI 분석 오류", exc_info=True)
                    else:
                        # AI Gym이 없으면 시뮬레이션 모드
                        if frame_count % 150 == 0:  # 5초마다
                            with self.lock:
                                self.count_simulation += 1
                                self.current_data["count"] = self.count_simulation
                                self.current_data["accuracy"] = self.calculate_accuracy(None)
                                self.current_data["is_detecting"] = True


                except Exception:
                    logger.error("프레임 처리 오류", exc_info=True)

            # 프레임을 JPEG로 인코딩
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' +
                       bytearray(frame_bytes) + b'\r\n')

            time.sleep(0.015)  # 30 FPS 제한

    def __del__(self):
        """소멸자 - 리소스 정리"""
        if self.cap:
            self.cap.release()
