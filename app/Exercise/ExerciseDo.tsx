import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const BACKEND_URL = 'http://127.0.0.1:8888';
// const BACKEND_URL = 'http://127.0.0.1:8888';
// const BACKEND_URL = 'http://127.0.0.1:8888';
// const BACKEND_URL = 'http://127.0.0.1:8888';

// 사용 가능한 운동 종류 정의 (백엔드 predefined_configs와 일치)
const EXERCISE_TYPES = {
  'shoulder_flexion': '어깨 굴곡',
  'shoulder_abduction_1': '어깨 외전 1',
  'shoulder_abduction_2': '어깨 외전 2',
  'shoulder_external_rotation_1': '어깨 외회전 1',
  'shoulder_external_rotation_2': '어깨 외회전 2',
  'shoulder_external_rotation': '어깨 외회전',
  'shoulder_abduction_3': '어깨 외전 3',
  'side_stretch': '옆구리 스트레칭',
  'elbow_exercise': '팔꿈치 운동',
  'shoulder_joint': '어깨 관절 운동'
};

interface ExerciseData {
  is_active: boolean;
  count: number;
  accuracy: number;
  elapsed_time: number;
  exercise_type: string;
}

export default function ExerciseDo() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const router = useRouter();
  
  // Backend connection states
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 운동 종류 선택 관련 상태
  const [selectedExercise, setSelectedExercise] = useState<string>('shoulder_flexion');
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  // 서버 연결 상태 확인
  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.log('서버 연결 실패:', error);
    }
    setIsConnected(false);
    return false;
  };

  // 운동 설정 업데이트
  const updateExerciseSettings = async (exerciseType: string) => {
    if (!isConnected) {
      Alert.alert('오류', '서버에 연결되지 않았습니다.');
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/exercise/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercise_type: exerciseType
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('운동 설정 업데이트 성공:', result.config);
          return true;
        } else {
          Alert.alert('오류', result.message);
          return false;
        }
      } else {
        Alert.alert('오류', '운동 설정 업데이트 실패');
        return false;
      }
    } catch (error) {
      console.log('운동 설정 업데이트 실패:', error);
      Alert.alert('오류', '서버와 통신할 수 없습니다.');
      return false;
    }
  };

  // 운동 종류 선택
  const selectExercise = async (exerciseKey: string) => {
    setSelectedExercise(exerciseKey);
    setShowExerciseModal(false);
    
    // 백엔드 설정 업데이트
    const success = await updateExerciseSettings(exerciseKey);
    if (success) {
      Alert.alert('성공', `${EXERCISE_TYPES[exerciseKey as keyof typeof EXERCISE_TYPES]} 운동으로 설정되었습니다.`);
    }
  };

  // 운동 데이터 폴링
  const pollExerciseData = async () => {
    if (!isExerciseActive) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/data`);
      if (response.ok) {
        const data = await response.json();
        setExerciseData(data);
      }
    } catch (error) {
      console.log('운동 데이터 조회 실패:', error);
    }
  };

  // 운동 시작
  const startExercise = async () => {
    if (!isConnected) {
      Alert.alert('오류', '서버에 연결되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/exercise/start?exercise_type=${selectedExercise}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsExerciseActive(true);
        Alert.alert('성공', '운동이 시작되었습니다!');
        
        // 데이터 폴링 시작
        intervalRef.current = setInterval(pollExerciseData, 1000);
      } else {
        Alert.alert('오류', '운동 시작 실패');
      }
    } catch (error) {
      Alert.alert('오류', '서버와 통신할 수 없습니다.');
      console.log('운동 시작 실패:', error);
    }
  };

  // 운동 종료
  const stopExercise = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/stop`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsExerciseActive(false);
        setExerciseData(null);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        Alert.alert(
          '운동 완료!', 
          `총 ${result.summary.count}회\n정확도: ${result.summary.accuracy}%\n시간: ${result.summary.duration}초`
        );
      } else {
        Alert.alert('오류', '운동 종료 실패');
      }
    } catch (error) {
      Alert.alert('오류', '서버와 통신할 수 없습니다.');
      console.log('운동 종료 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 서버 연결 확인
  useEffect(() => {
    checkServerConnection();
    const connectionInterval = setInterval(checkServerConnection, 5000);
    
    return () => {
      clearInterval(connectionInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // 컴포넌트 언마운트 시 운동 종료
      if (isExerciseActive) {
        stopExercise();
      }
    };
  }, []);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permission) return <Text>Requesting camera permissions...</Text>;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.allowBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단: 운동 종류 선택, Front/Back 버튼 및 서버 상태 */}
      <View style={styles.topSection}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>
            {isConnected ? '연결됨' : '연결 안됨'}
          </Text>
        </View>
        
        {/* 운동 선택 버튼 */}
        <TouchableOpacity
          onPress={() => setShowExerciseModal(true)}
          style={styles.exerciseSelectBtn}
          disabled={isExerciseActive}
        >
          <Text style={styles.exerciseSelectText}>
            {EXERCISE_TYPES[selectedExercise as keyof typeof EXERCISE_TYPES]}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCameraType(type => (type === 'front' ? 'back' : 'front'))}
          style={styles.toggleBtn}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Front/Back</Text>
        </TouchableOpacity>
      </View>

      {/* AI 비디오 스트림 또는 카메라 */}
      {isConnected && isExerciseActive ? (
        <Image
          source={{ uri: `${BACKEND_URL}/video/ai` }}
          style={styles.camera}
          resizeMode="cover"
        />
      ) : (
        <CameraView style={styles.camera} facing={cameraType} />
      )}

      {/* 운동 데이터 표시 */}
      {isExerciseActive && exerciseData && (
        <View style={styles.dataOverlay}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>횟수</Text>
            <Text style={styles.dataValue}>{exerciseData.count}</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>정확도</Text>
            <Text style={styles.dataValue}>{exerciseData.accuracy}%</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>시간</Text>
            <Text style={styles.dataValue}>{formatTime(exerciseData.elapsed_time)}</Text>
          </View>
        </View>
      )}

      {/* 하단: 컨트롤 버튼들 */}
      <View style={styles.bottomControls}>
        {!isExerciseActive ? (
          <>
            <TouchableOpacity
              style={[styles.controlBtn, styles.startBtn]}
              onPress={startExercise}
              disabled={!isConnected}
            >
              <Text style={styles.btnText}>운동 시작</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => router.push('/Exercise/ExerciseSummaryPage')}
            >
              <Text style={styles.nextBtnText}>Skip →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.controlBtn, styles.stopBtn]}
              onPress={stopExercise}
            >
              <Text style={styles.btnText}>운동 종료</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={async () => {
                await stopExercise();
                router.push('/Exercise/ExerciseSummaryPage');
              }}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      {/* 운동 종류 선택 모달 */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>운동 종류 선택</Text>
            <ScrollView style={styles.exerciseList}>
              {Object.entries(EXERCISE_TYPES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.exerciseItem,
                    selectedExercise === key && styles.exerciseItemSelected
                  ]}
                  onPress={() => selectExercise(key)}
                >
                  <Text style={[
                    styles.exerciseItemText,
                    selectedExercise === key && styles.exerciseItemTextSelected
                  ]}>
                    {value}
                  </Text>
                  {selectedExercise === key && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowExerciseModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000', 
    position: 'relative' 
  },
  camera: { 
    flex: 1, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  topSection: {
    position: 'absolute',
    top: 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toggleBtn: {
    backgroundColor: '#5C7BEEAA',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 2,
  },
  dataOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 16,
    zIndex: 10,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
    opacity: 0.8,
  },
  dataValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 36,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    elevation: 2,
  },
  startBtn: {
    backgroundColor: '#4CAF50',
  },
  stopBtn: {
    backgroundColor: '#f44336',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextBtn: {
    backgroundColor: '#5C7BEE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    elevation: 2,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centered: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  allowBtn: {
    marginTop: 10, 
    padding: 10, 
    backgroundColor: '#5C7BEE', 
    borderRadius: 8,
  },
  // 운동 선택 버튼 스타일
  exerciseSelectBtn: {
    backgroundColor: '#FF9800AA',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 2,
    maxWidth: 140,
  },
  exerciseSelectText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseItemSelected: {
    backgroundColor: '#5C7BEE20',
  },
  exerciseItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  exerciseItemTextSelected: {
    color: '#5C7BEE',
    fontWeight: 'bold',
  },
  checkMark: {
    color: '#5C7BEE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
  },
  modalCloseBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});