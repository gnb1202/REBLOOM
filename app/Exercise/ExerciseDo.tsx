
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
  View,
  ActivityIndicator,
} from 'react-native';
import { useExercise } from '../../context/ExerciseContext';
import { useMusicPlayer } from '../../context/MusicContext';

const BACKEND_URL = 'http://127.0.0.1:8888';

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
  const { 
    getCurrentExercise,
    advanceToNextExercise,
    isQueueFinished,
    clearExerciseQueue,
    currentExerciseIndex,
    exerciseQueue,
    recordExerciseEnd,
    getActualDuration
  } = useExercise();
  const { switchTheme } = useMusicPlayer();

  const currentExercise = getCurrentExercise();
  
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const totalTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isStoppingExercise, setIsStoppingExercise] = useState(false);

  // 서버 연결 및 운동 설정
  useEffect(() => {
    const setupExercise = async () => {
      const serverConnected = await checkServerConnection();
      if (serverConnected && currentExercise) {
        await updateExerciseSettings(currentExercise.id);
      }
    };
    setupExercise();

    const connectionInterval = setInterval(checkServerConnection, 5000);
    
    // 전체 운동 시간 업데이트
    totalTimeIntervalRef.current = setInterval(() => {
      setTotalElapsedTime(getActualDuration());
    }, 1000);
    
    return () => {
      clearInterval(connectionInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (totalTimeIntervalRef.current) {
        clearInterval(totalTimeIntervalRef.current);
      }
      if (isExerciseActive) {
        stopExercise(false); // 페이지를 떠날 때, 다음으로 넘어가지 않음
      }
    };
  }, [currentExercise]);

  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.log('Server connection failed:', error);
    }
    setIsConnected(false);
    return false;
  };

  const updateExerciseSettings = async (exerciseType: string) => {
    if (!isConnected) return false;
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_type: exerciseType }),
      });
      if (response.ok) {
        console.log(`운동 설정 완료: ${exerciseType}`);
        return true;
      }
    } catch (error) {
      console.log('운동 설정 업데이트 실패:', error);
    }
    return false;
  };

  const pollExerciseData = async () => {
    if (!isExerciseActive || isStoppingExercise) return;
    try {
      const response = await fetch(`${BACKEND_URL}/exercise/data`);
      if (response.ok) {
        const data = await response.json();
        setExerciseData(data);
        
        // 강화된 자동 완료 체크
        if (currentExercise && typeof data.count === 'number' && typeof currentExercise.count === 'number') {
          console.log(`📊 [DEBUG] 현재: ${data.count}, 목표: ${currentExercise.count}, 운동: ${currentExercise.title}`);
          
          // 목표 달성 체크 (>= 조건)
          if (data.count >= currentExercise.count) {
            console.log(`🎯 [AUTO-COMPLETE] 운동 자동 완료 트리거!`);
            console.log(`🎯 [AUTO-COMPLETE] 조건: ${data.count} >= ${currentExercise.count}`);
            
            // 중복 실행 방지를 위한 상태 체크
            if (isExerciseActive && !isStoppingExercise) {
              console.log(`🎯 [AUTO-COMPLETE] 운동 종료 실행 중...`);
              setIsStoppingExercise(true);
              await stopExercise(true, true); // 자동 완료시에는 Alert 표시
              return;
            }
          }
        }
        
        // 진행 상황 로그 (모든 카운트 표시)
        if (currentExercise && data.count >= 0) {
          console.log(`🔄 운동 진행: ${data.count}/${currentExercise.count} (${currentExercise.title})`);
        }
      }
    } catch (error) {
      console.log('❌ 운동 데이터 조회 실패:', error);
    }
  };

  const startExercise = async () => {
    if (!isConnected || !currentExercise) {
      Alert.alert('Error', 'Not connected to the server or no exercise information available.');
      return;
    }
    try {
      console.log(`🏃‍♂️ 운동 시작: ${currentExercise.title}, 목표 횟수: ${currentExercise.count}`);
      
      const response = await fetch(`${BACKEND_URL}/exercise/start?exercise_type=${currentExercise.id}`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsExerciseActive(true);
        intervalRef.current = setInterval(pollExerciseData, 1000);
        console.log('✅ 운동 세션 활성화 및 모니터링 시작');
      } else {
        Alert.alert('Error', 'Failure to start exercising');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to communicate with the server.');
      console.log('❌ 운동 시작 실패:', error);
    }
  };

  const stopExercise = async (proceedToNext: boolean = true, showAlert: boolean = true): Promise<void> => {
    console.log(`🛑 [STOP] 운동 종료 시작... (proceedToNext: ${proceedToNext}, showAlert: ${showAlert})`);
    console.log(`🛑 [STOP] 현재 운동: ${currentExercise?.title}, 인덱스: ${currentExerciseIndex}/${exerciseQueue.length}`);
    
    // 즉시 상태 변경으로 중복 실행 방지
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsExerciseActive(false);

    try {
      const response = await fetch(`${BACKEND_URL}/exercise/stop`, { method: 'POST' });
      if (!response.ok) {
        console.log('❌ 백엔드 운동 종료 실패');
        Alert.alert('Error', 'Failure to end exercising');
      } else {
        console.log('✅ 백엔드 운동 종료 성공');
      }
    } catch (error) {
      console.log('❌ 백엔드 통신 실패:', error);
      Alert.alert('Error', 'Unable to communicate with the server.');
    }

    // 종료 플래그 리셋
    setIsStoppingExercise(false);

    if (proceedToNext) {
      console.log('➡️ [STOP] handleNextStep 호출 직전');
      handleNextStep(showAlert);
      console.log('➡️ [STOP] handleNextStep 호출 완료');
    } else {
      console.log('🏃‍♂️ [STOP] 운동만 종료, 페이지 유지');
    }
  };

  const handleNextStep = (showAlert: boolean = true) => {
    console.log('🔄 [handleNextStep] 함수 시작');
    console.log(`🔄 [handleNextStep] 현재 인덱스: ${currentExerciseIndex}, 큐 길이: ${exerciseQueue.length}`);
    console.log(`🔄 [handleNextStep] showAlert: ${showAlert}`);
    
    const nextIndex = currentExerciseIndex + 1;
    console.log(`🔄 [handleNextStep] 다음 인덱스: ${nextIndex}`);

    if (nextIndex >= exerciseQueue.length) {
      console.log('🎉 [handleNextStep] 모든 운동 완료 - Summary 페이지로 이동 예정');
      
      // 모든 운동이 끝났으므로 종료 시간을 기록하고 요약 페이지로 이동합니다.
      recordExerciseEnd();
      const actualDuration = getActualDuration();
      const minutes = Math.floor(actualDuration / 60);
      const seconds = actualDuration % 60;
      
      console.log('🎉 모든 운동 완료!');
      // 운동 완료 시 메인 테마로 전환
      switchTheme('main');
      
      if (showAlert) {
        console.log('🎉 [handleNextStep] Alert 표시');
        Alert.alert('Exercise Complete!', `All exercises completed successfully.\nTotal time : ${minutes}min ${seconds}sec`, [
          {
            text: 'OK',
            onPress: () => {
              console.log('🎉 [handleNextStep] OK 버튼 클릭 - Summary 페이지로 이동');
              router.replace('/Exercise/ExerciseSummaryPage');
            }
          }
        ]);
      } else {
        console.log('🎉 [handleNextStep] Alert 없이 바로 Summary 페이지로 이동');
        router.replace('/Exercise/ExerciseSummaryPage');
      }
    } else {
      console.log(`➡️ [handleNextStep] 다음 운동으로 이동: ${exerciseQueue[nextIndex]?.title || 'Unknown'}`);
      
      // 아직 남은 운동이 있으므로 다음 운동으로 상태를 업데이트하고 소개 페이지로 이동합니다.
      advanceToNextExercise();
      console.log('➡️ [handleNextStep] advanceToNextExercise 호출 완료');
      
      if (showAlert) {
        console.log('➡️ [handleNextStep] Alert 표시');
        Alert.alert('Exercise Complete! 🎯', 'Great job! Moving on to the next exercise.', [
          {
            text: 'Continue',
            onPress: () => {
              console.log('➡️ [handleNextStep] Continue 버튼 클릭 - IntroPage로 이동');
              router.replace('/Exercise/ExerciseIntroPage');
            }
          }
        ]);
      } else {
        console.log('➡️ [handleNextStep] Alert 없이 바로 IntroPage로 이동');
        router.replace('/Exercise/ExerciseIntroPage');
      }
    }
    console.log('🔄 [handleNextStep] 함수 종료');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permission) return <View style={styles.centered}><ActivityIndicator/></View>;
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
  if (!currentExercise) {
     return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={{marginTop: 10}}>Loading exercise...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Not connected'}</Text>
        </View>
        <View style={styles.exerciseTitleContainer}>
            <Text style={styles.exerciseTitleText}>{currentExercise.title}</Text>
            <Text style={styles.progressText}>{`(${currentExerciseIndex + 1}/${exerciseQueue.length})`}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setCameraType(type => (type === 'front' ? 'back' : 'front'))}
          style={styles.toggleBtn}
        >
          <Text style={{ color: '#fff'}}>Toggle Cam</Text>
        </TouchableOpacity>
      </View>

      {isConnected && isExerciseActive ? (
        <Image source={{ uri: `${BACKEND_URL}/video/ai` }} style={styles.camera} resizeMode="cover" />
      ) : (
        <CameraView style={styles.camera} facing={cameraType} />
      )}

      <View style={styles.dataOverlay}>
        {isExerciseActive && exerciseData && (
          <>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Number of times</Text>
              <Text style={styles.dataValue}>{exerciseData.count}/{currentExercise.count}</Text>
            </View>
            <View style={styles.dataItem}><Text style={styles.dataLabel}>Accuracy</Text><Text style={styles.dataValue}>{exerciseData.accuracy}%</Text></View>
            <View style={styles.dataItem}><Text style={styles.dataLabel}>Present exercise</Text><Text style={styles.dataValue}>{formatTime(exerciseData.elapsed_time)}</Text></View>
          </>
        )}
        <View style={styles.dataItem}><Text style={styles.dataLabel}>Total time</Text><Text style={styles.dataValue}>{formatTime(totalElapsedTime)}</Text></View>
      </View>

      <View style={styles.bottomControls}>
        {!isExerciseActive ? (
          <TouchableOpacity style={[styles.controlBtn, styles.startBtn]} onPress={startExercise} disabled={!isConnected}>
            <Text style={styles.btnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={() => stopExercise(true, true)}>
            <Text style={styles.btnText}>End</Text>
          </TouchableOpacity>
        )}
         <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={async () => {
              if (isExerciseActive) {
                // 운동 진행 중이면 먼저 종료
                console.log('🔄 [SKIP] 운동 진행 중 - 먼저 종료 후 다음으로 이동');
                await stopExercise(true, false); // Alert 없이 바로 이동
              } else {
                // 운동이 진행 중이 아니면 바로 다음으로
                console.log('➡️ [SKIP] 바로 다음 운동으로 이동');
                handleNextStep(false); // Alert 없이 바로 이동
              }
            }}
            disabled={isStoppingExercise}
          >
            <Text style={styles.nextBtnText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  allowBtn: { marginTop: 10, padding: 10, backgroundColor: '#5C7BEE', borderRadius: 8 },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  topSection: {
    position: 'absolute', top: 28, left: 20, right: 20, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  connected: { backgroundColor: '#4CAF50' },
  disconnected: { backgroundColor: '#f44336' },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  exerciseTitleContainer: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, },
  exerciseTitleText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  progressText: { color: '#fff', fontSize: 12, },
  toggleBtn: { backgroundColor: '#5C7BEEAA', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 },
  dataOverlay: {
    position: 'absolute', top: 100, left: 20, backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12, padding: 16, zIndex: 10,
  },
  dataItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dataLabel: { color: '#fff', fontSize: 14, marginRight: 8, opacity: 0.8 },
  dataValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomControls: {
    position: 'absolute', bottom: 36, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'center', gap: 12,
  },
  controlBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, elevation: 2 },
  startBtn: { backgroundColor: '#4CAF50' },
  stopBtn: { backgroundColor: '#f44336' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  nextBtn: { backgroundColor: '#5C7BEE', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 30, elevation: 2 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
