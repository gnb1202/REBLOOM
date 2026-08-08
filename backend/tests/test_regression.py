"""백엔드 회귀 테스트.

리팩터링으로 고친 동작들을 잠가 두는 것이 목적이다. 새 의존성을 만들지 않으려고
pytest 없이도 돌아가게 썼다.

    python tests/test_regression.py        # backend/ 에서 실행
    pytest tests/test_regression.py        # pytest 가 있으면 이것도 동작

카메라도 ultralytics 도 없는 환경을 전제로 한다. 실제 카메라가 필요한 경로는
가짜 캡처/추론 객체로 대체한다 - 그렇지 않으면 그 코드 경로에 도달할 수 없다.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

import exercise_ai
import main


# --------------------------------------------------------------------------
# 테스트용 대역 (stub)
# --------------------------------------------------------------------------

class FakeCapture:
    """cv2.VideoCapture 대역. release() 여부를 관찰할 수 있다."""

    def __init__(self):
        self.released = False
        self.reads = 0

    def isOpened(self):
        return not self.released

    def read(self):
        self.reads += 1
        return True, np.zeros((480, 640, 3), dtype=np.uint8)

    def release(self):
        self.released = True

    def set(self, *_):
        return True


class FakeResults:
    """ultralytics AIGym 결과 대역. detected=False 면 아무도 검출되지 않은 프레임."""

    def __init__(self, detected, angle=30, stage="up", count=1):
        if detected:
            self.workout_count = [count]
            self.workout_angle = [angle]
            self.workout_stage = [stage]
        else:
            self.workout_count = []
            self.workout_angle = []
            self.workout_stage = []


class FakeGym:
    """미리 정해진 결과를 순서대로 돌려주는 AIGym 대역."""

    def __init__(self, script):
        self.script = list(script)
        self.i = 0

    def __call__(self, frame):
        result = self.script[min(self.i, len(self.script) - 1)]
        self.i += 1
        return result


class FakeSession:
    is_active = True


# --------------------------------------------------------------------------
# 정확도: 검출 실패는 None, 하한 70 없음
# --------------------------------------------------------------------------

def test_accuracy_is_none_when_nothing_detected():
    ai = exercise_ai.ExerciseAI()
    assert ai.calculate_accuracy(None) is None
    assert ai.calculate_accuracy(FakeResults(detected=False)) is None


def test_accuracy_maps_angle_error_without_a_floor():
    ai = exercise_ai.ExerciseAI()
    ai.configure_exercise(exercise_type="shoulder_flexion")  # up=30, down=170

    assert ai.calculate_accuracy(FakeResults(True, angle=30)) == 100.0   # 목표 일치
    assert ai.calculate_accuracy(FakeResults(True, angle=45)) == 85.0    # 15도 편차
    # 하한 70 이 남아 있었다면 아래 두 개가 모두 70.0 이 된다
    assert ai.calculate_accuracy(FakeResults(True, angle=90)) == 40.0    # 60도 편차
    assert ai.calculate_accuracy(FakeResults(True, angle=180)) == 0.0    # 바닥은 0


def test_initial_state_reports_no_measurement():
    data = exercise_ai.ExerciseAI().get_current_data()
    assert data["accuracy"] is None
    assert data["is_detecting"] is False


# --------------------------------------------------------------------------
# 정확도가 고정(latch)되지 않는다
# --------------------------------------------------------------------------

def test_accuracy_reverts_to_none_when_person_leaves_frame():
    ai = exercise_ai.ExerciseAI()
    ai.configure_exercise(exercise_type="shoulder_flexion")
    ai.cap = FakeCapture()
    ai.gym = FakeGym([
        FakeResults(True, angle=30, count=1),
        FakeResults(True, angle=30, count=1),
        FakeResults(detected=False),
        FakeResults(detected=False),
    ])

    stream = ai._camera_frames(FakeSession())
    next(stream)
    detected = ai.get_current_data()
    assert detected["accuracy"] == 100.0 and detected["is_detecting"] is True

    next(stream)
    next(stream)
    gone = ai.get_current_data()
    stream.close()

    assert gone["accuracy"] is None, "사람이 사라졌는데 정확도가 고정됨"
    assert gone["is_detecting"] is False
    assert gone["count"] == 1, "누적 카운트는 유지되어야 한다"


# --------------------------------------------------------------------------
# 스트림 정리: 연결 종료 시 카메라 해제
# --------------------------------------------------------------------------

def test_closing_the_stream_releases_the_camera():
    ai = exercise_ai.ExerciseAI()
    cap = FakeCapture()
    ai._init_camera = lambda: cap

    stream = ai.get_ai_stream_video(FakeSession())
    for _ in range(3):
        next(stream)
    assert not cap.released, "스트리밍 중인데 이미 해제됨"

    stream.close()  # 클라이언트 연결 종료와 동일한 경로

    assert cap.released, "연결 종료 후에도 카메라가 해제되지 않음"
    assert ai.cap is None


def test_stream_ends_cleanly_when_camera_released_mid_stream():
    """/exercise/stop 은 스트림이 도는 중에 카메라를 해제한다.

    예전에는 다음 프레임에서 self.cap.read() 가 None 을 건드려
    AttributeError 로 스트림이 터졌다.
    """
    ai = exercise_ai.ExerciseAI()
    ai._init_camera = lambda: FakeCapture()
    stream = ai.get_ai_stream_video(FakeSession())
    next(stream)

    ai.cleanup_session()  # /exercise/stop 이 하는 일

    try:
        next(stream)
    except StopIteration:
        pass  # 기대 동작: 조용히 종료
    except Exception as exc:  # noqa: BLE001 - 어떤 예외든 회귀다
        raise AssertionError(f"스트림이 예외로 종료됨: {type(exc).__name__}: {exc}")
    finally:
        stream.close()


# --------------------------------------------------------------------------
# 리소스 정리: __del__ 이 아니라 명시적 close()
# --------------------------------------------------------------------------

def test_close_releases_camera_and_works_as_context_manager():
    assert "__del__" not in exercise_ai.ExerciseAI.__dict__, "__del__ 이 다시 생겼다"

    cap = FakeCapture()
    with exercise_ai.ExerciseAI() as ai:
        ai.cap = cap
    assert cap.released


# --------------------------------------------------------------------------
# 카메라 백엔드: OS 별 분기 + 공통 폴백
# --------------------------------------------------------------------------

def test_camera_backends_are_platform_specific():
    import cv2
    from unittest import mock

    expected = {
        "Windows": [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY],
        "Linux": [cv2.CAP_V4L2, cv2.CAP_ANY],
        "Darwin": [cv2.CAP_AVFOUNDATION, cv2.CAP_ANY],
        "FreeBSD": [cv2.CAP_ANY],
    }
    for system, want in expected.items():
        with mock.patch("platform.system", return_value=system):
            got = exercise_ai._camera_backends_for_platform()
        assert got == want, f"{system}: {got} != {want}"


# --------------------------------------------------------------------------
# 세션 격리
# --------------------------------------------------------------------------

def test_sessions_do_not_share_state():
    registry = main.SessionRegistry()
    a = registry.get_or_create("alpha")
    b = registry.get_or_create("beta")
    try:
        assert a.ai is not b.ai
        assert a.exercise is not b.exercise

        a.exercise.count = 7
        assert b.exercise.count == 0
    finally:
        registry.close_all()


def test_idle_sessions_are_reaped_but_the_caller_is_not():
    import time

    registry = main.SessionRegistry(idle_timeout=0.5)
    try:
        registry.get_or_create("stale")
        keeper = registry.get_or_create("keeper")
        keeper.exercise.count = 42

        time.sleep(0.6)
        again = registry.get_or_create("keeper")

        # 자기 요청이 자기 세션을 회수해 버리면 안 된다 (touch -> reap 순서)
        assert again is keeper, "요청이 자기 세션을 회수했다"
        assert again.exercise.count == 42, "세션 상태가 조용히 리셋됐다"

        ids = sorted(s["session_id"] for s in registry.snapshot())
        assert ids == ["keeper"], f"유휴 회수 결과가 예상과 다름: {ids}"
    finally:
        registry.close_all()


# --------------------------------------------------------------------------
# API 계약
# --------------------------------------------------------------------------

def test_configure_reads_the_json_body():
    with TestClient(main.app) as client:
        body = {"exercise_type": "biceps_curl", "kpts": [5, 7, 9]}
        config = client.post("/exercise/configure", json=body).json()["config"]

        # 바디가 무시되면 프리셋의 [6, 8, 10] 이 그대로 남는다
        assert config["kpts"] == [5, 7, 9]
        assert config["exercise_type"] == "biceps_curl"


def test_invalid_params_are_rejected():
    with TestClient(main.app) as client:
        assert client.post("/exercise/configure", json={"kpts": [1, 2]}).status_code == 422
        assert client.post("/exercise/configure", json={"kpts": [1, 2, 99]}).status_code == 422
        assert client.post("/exercise/configure", json={"up_angle": 400}).status_code == 422
        # 바디 자체가 없으면 조용히 무시되는 게 아니라 거절된다
        assert client.post("/exercise/configure?exercise_type=biceps_curl").status_code == 422


def test_legacy_query_start_still_works():
    """앱은 /exercise/start?exercise_type=... 를 바디 없이 호출한다."""
    with TestClient(main.app) as client:
        started = client.post("/exercise/start?exercise_type=lateral_raise")
        assert started.status_code == 200
        assert started.json()["exercise_type"] == "lateral_raise"
        client.post("/exercise/stop")


def test_data_reports_null_accuracy_when_not_detecting():
    with TestClient(main.app) as client:
        client.post("/exercise/start?exercise_type=shoulder_flexion")
        data = client.get("/exercise/data").json()
        client.post("/exercise/stop")

        assert data["accuracy"] is None
        assert data["is_detecting"] is False


def test_session_id_can_come_from_query_or_header():
    with TestClient(main.app) as client:
        sid = client.post("/sessions").json()["session_id"]

        client.post(f"/exercise/configure?session_id={sid}", json={"exercise_type": "neck_stretch"})
        client.post("/exercise/configure", json={"exercise_type": "biceps_curl"})  # default 세션

        via_query = client.get(f"/exercise/config?session_id={sid}").json()["current_config"]
        via_header = client.get("/exercise/config", headers={"X-Session-Id": sid}).json()["current_config"]
        default = client.get("/exercise/config").json()["current_config"]

        assert via_query == via_header
        assert via_query["exercise_type"] == "neck_stretch"
        assert default["exercise_type"] == "biceps_curl", "세션 간 상태가 섞였다"

        assert client.delete(f"/sessions/{sid}").status_code == 200
        assert client.delete(f"/sessions/{sid}").status_code == 404


def test_removed_video_endpoint_is_gone():
    with TestClient(main.app) as client:
        assert client.get("/video").status_code == 404


def test_shutdown_releases_every_session():
    held = FakeCapture()
    with TestClient(main.app) as client:
        sid = client.post("/sessions").json()["session_id"]
        main.registry.get_or_create(sid).ai.cap = held
        assert not held.released
    assert held.released, "종료 훅이 세션 리소스를 정리하지 않았다"


# --------------------------------------------------------------------------
# pytest 없이 실행
# --------------------------------------------------------------------------

def _main():
    tests = [(name, fn) for name, fn in sorted(globals().items())
             if name.startswith("test_") and callable(fn)]
    failures = []
    for name, fn in tests:
        try:
            fn()
            print(f"  PASS  {name}")
        except Exception as exc:  # noqa: BLE001 - 러너이므로 전부 잡는다
            failures.append((name, exc))
            print(f"  FAIL  {name}: {type(exc).__name__}: {exc}")

    print(f"\n{len(tests) - len(failures)}/{len(tests)} passed")
    return 1 if failures else 0


if __name__ == "__main__":
    import logging
    logging.disable(logging.CRITICAL)  # 테스트 출력만 보이게
    sys.exit(_main())
