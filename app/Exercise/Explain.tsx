import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercise } from '../../context/ExerciseContext';

export default function WorkoutPage() {
  const router = useRouter();
  const { setCurrentExercise } = useExercise();

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Exercise</Text>
      </View>

      {/* 운동 루틴 */}
      <View style={styles.section}>
        <Text style={styles.subTitle}>Today's Exercise Routine</Text>
        <View style={styles.subInfoBox}>
          <Text style={styles.subInfo}>n reps | n sets | Expected duration</Text>
        </View>
        <View style={styles.routineBox}>
          <Text style={styles.routineItem}>1. Deep Breathing Exercise</Text>
          <Text style={styles.routineItem}>2. Wrist Exercise</Text>
          <Text style={styles.routineItem}>3. Shoulder Rotation</Text>
        </View>
      </View>

      {/* 주의사항 */}
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Exercise Precautions</Text>
        <Text style={styles.noticeContent}>Exercise Instructions ('Please follow along with the video...')</Text>
      </View>

      {/* 시작 버튼 */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          // 운동 정보 설정
          setCurrentExercise({
            exerciseId: 'basic_routine_001',
            exerciseName: 'Today\'s Basic Routine',
            duration: 20, // 예상 20분
            difficulty: 3, // 중간 난이도
            targetAreas: ['wrist', 'shoulder', 'neck']
          });
          
          router.push('/Exercise/ExerciseIntroPage');
        }}
      >
         <Text style={styles.startText}>Start!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backArrow: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  section: { alignItems: 'center', marginTop: 20 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subInfoBox: {
    backgroundColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 16,
  },
  subInfo: { fontSize: 12 },
  routineBox: {
    width: '90%',
    backgroundColor: '#ddd',
    padding: 16,
    borderRadius: 10,
  },
  routineItem: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  notice: { marginTop: 40, alignItems: 'center' },
  noticeTitle: { fontWeight: 'bold', marginBottom: 6 },
  noticeContent: { fontSize: 12, color: '#333' },
  startButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 30,
  },
  startText: { fontWeight: 'bold', fontSize: 16 },
});