import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const BACKEND_URL = 'http://127.0.0.1:8890';

interface ExerciseData {
  is_active: boolean;
  count: number;
  accuracy: number;
  elapsed_time: number;
  exercise_type: string;
}

interface ExerciseConfig {
  kpts: number[];
  up_angle: number;
  down_angle: number;
  exercise_type: string;
}

export default function ExerciseTestPage() {
  const router = useRouter();
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 운동 타입 관련 상태
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('shoulder_flexion');
  const [currentConfig, setCurrentConfig] = useState<ExerciseConfig | null>(null);

  // 사용 가능한 운동 타입 불러오기
  const fetchAvailableExercises = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/config`);
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data.available_exercises);
        setCurrentConfig(data.current_config);
        // 첫 번째 운동을 기본으로 선택
        if (data.available_exercises.length > 0) {
          setSelectedExercise(data.available_exercises[0]);
        }
      }
    } catch (error) {
      console.log('운동 타입 불러오기 실패:', error);
    }
  };

  // 운동 타입 변경
  const changeExerciseType = async (exerciseType: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/configure?exercise_type=${exerciseType}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentConfig(data.config);
        setSelectedExercise(exerciseType);
        Alert.alert('설정 변경', `운동 타입이 ${exerciseType}로 변경되었습니다.`);
      }
    } catch (error) {
      console.log('운동 타입 변경 실패:', error);
    }
  };

  // 서버 연결 상태 확인
  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        // 연결 성공 시 운동 타입도 불러오기
        await fetchAvailableExercises();
        return true;
      }
    } catch (error) {
      console.log('서버 연결 실패:', error);
    }
    setIsConnected(false);
    return false;
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
        const result = await response.json();
        setIsExerciseActive(true);
        Alert.alert('성공', `${selectedExercise} 운동이 시작되었습니다!`);
        
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
          `총 ${result.summary.count}회\\n정확도: ${result.summary.accuracy}%\\n시간: ${result.summary.duration}초`
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
    };
  }, []);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>운동 AI 테스트</Text>
      </View>

      {/* 서버 상태 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>서버 상태:</Text>
        <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]}>
          <Text style={styles.statusText}>
            {isConnected ? '연결됨' : '연결 안됨'}
          </Text>
        </View>
      </View>

      {/* 운동 타입 선택 */}
      <View style={styles.exerciseSelector}>
        <Text style={styles.selectorTitle}>운동 타입 선택</Text>
        <View style={styles.exerciseGrid}>
          {availableExercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise}
              style={[
                styles.exerciseButton,
                selectedExercise === exercise && styles.selectedExerciseButton
              ]}
              onPress={() => changeExerciseType(exercise)}
              disabled={isExerciseActive}
            >
              <Text style={[
                styles.exerciseButtonText,
                selectedExercise === exercise && styles.selectedExerciseButtonText
              ]}>
                {exercise.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 현재 설정 표시 */}
        {currentConfig && (
          <View style={styles.configDisplay}>
            <Text style={styles.configTitle}>현재 설정:</Text>
            <Text style={styles.configText}>키포인트: {currentConfig.kpts.join(', ')}</Text>
            <Text style={styles.configText}>Up Angle: {currentConfig.up_angle}°</Text>
            <Text style={styles.configText}>Down Angle: {currentConfig.down_angle}°</Text>
          </View>
        )}
      </View>

      {/* AI 비디오 스트림 표시 영역 */}
      <View style={styles.videoContainer}>
        {isConnected ? (
          <Image
            source={{ uri: `${BACKEND_URL}/video/ai` }}
            style={styles.videoStream}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.placeholderText}>서버 연결 대기 중...</Text>
          </View>
        )}
      </View>

      {/* 운동 데이터 표시 */}
      <View style={styles.dataContainer}>
        {isExerciseActive && exerciseData ? (
          <>
            <Text style={styles.dataTitle}>실시간 운동 데이터</Text>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>횟수:</Text>
              <Text style={styles.dataValue}>{exerciseData.count}회</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>정확도:</Text>
              <Text style={styles.dataValue}>{exerciseData.accuracy}%</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>시간:</Text>
              <Text style={styles.dataValue}>{formatTime(exerciseData.elapsed_time)}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.noDataText}>
            {isExerciseActive ? '데이터 로딩 중...' : '운동을 시작하세요'}
          </Text>
        )}
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controlContainer}>
        {!isExerciseActive ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={startExercise}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>운동 시작</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopExercise}
          >
            <Text style={styles.buttonText}>운동 종료</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 안내 메시지 */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 테스트 방법:{'\n'}
          1. 백엔드 서버가 실행 중인지 확인{'\n'}
          2. 원하는 운동 타입 선택 (10가지 운동 중){'\n'}
          3. 운동 시작 버튼 클릭{'\n'}
          4. 카메라 앞에서 선택한 운동 수행{'\n'}
          5. 실시간 데이터 및 AI 분석 확인{'\n'}
          6. 다른 운동 타입으로 변경하여 테스트
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  videoContainer: {
    height: 300,
    backgroundColor: '#000',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  videoStream: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#666',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  controlContainer: {
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  exerciseSelector: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  exerciseButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedExerciseButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  exerciseButtonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedExerciseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  configDisplay: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  configTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  configText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});