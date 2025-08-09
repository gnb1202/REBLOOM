
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercise } from '../../context/ExerciseContext';

export default function ExplainPage() {
  const router = useRouter();
  const { exerciseQueue, getTotalDuration } = useExercise();

  const totalDuration = getTotalDuration();

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Exercise Routine</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 운동 루틴 */}
      <View style={styles.section}>
        <Text style={styles.subTitle}>Today's Exercise Routine</Text>
        <View style={styles.subInfoBox}>
          <Text style={styles.subInfo}>
            {`${exerciseQueue.length} exercises | Expected duration: ${totalDuration} min`}
          </Text>
        </View>
        <View style={styles.routineBox}>
          {exerciseQueue.map((exercise, index) => (
            <Text key={exercise.id} style={styles.routineItem}>
              {`${index + 1}. ${exercise.title}`}
            </Text>
          ))}
        </View>
      </View>

      {/* 주의사항 */}
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Exercise Precautions</Text>
        <Text style={styles.noticeContent}>Please follow the instructions and video for each exercise carefully.</Text>
      </View>

      {/* 시작 버튼 */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          // 첫 번째 운동의 소개 페이지로 이동
          router.push('/Exercise/ExerciseIntroPage');
        }}
        disabled={exerciseQueue.length === 0}
      >
         <Text style={styles.startText}>Start!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 ,justifyContent: 'space-between',},
  backArrow: { fontSize: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  section: { alignItems: 'center', marginTop: 20 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subInfoBox: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  subInfo: { fontSize: 14, color: '#555' },
  routineBox: {
    width: '95%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  routineItem: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    color: '#333',
  },
  notice: { marginTop: 40, alignItems: 'center', paddingHorizontal: 20, },
  noticeTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  noticeContent: { fontSize: 14, color: '#666', textAlign: 'center' },
  startButton: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 40,
    elevation: 2,
  },
  startText: { fontWeight: 'bold', fontSize: 18, color: '#fff' },
});
