import cv2
from ultralytics import solutions

# 카메라 캡처 객체 생성
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("카메라를 열 수 없습니다.")
    exit()

print("카메라가 시작되었습니다. 'q'를 누르면 종료됩니다.")

# 왼쪽 팔 추적용 AIGym 인스턴스
gym_left = solutions.AIGym(
    line_width=2,
    show=True,
    kpts=[7, 5, 11],  # 왼쪽 키포인트
    up_angle=130,     # 팔을 든 상태 각도
    down_angle=90,    # 팔을 내린 상태 각도
)

try:
    while cap.isOpened():
        success, im0 = cap.read()
        if not success:
            print("프레임을 읽을 수 없습니다.")
            break
        
        # AIGym이 내부적으로 YOLO 검출을 수행하므로 이미지만 전달
        results_left = gym_left(im0)
        
        # 운동 카운트 값 추출
        if hasattr(results_left, 'count') and results_left.count is not None:
            count = results_left.count
            print(f"운동 카운트: {count}")
        
        # 'q' 키를 누르면 종료
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

finally:
    # 자원 해제
    cap.release()
    cv2.destroyAllWindows()
    print("프로그램이 종료되었습니다.")