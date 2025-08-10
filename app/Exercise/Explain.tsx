import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercise } from '../../context/ExerciseContext';

export default function ExplainPage() {
  const router = useRouter();
  const { exerciseQueue, getTotalDuration, recordExerciseStart } = useExercise();

  const totalDuration = getTotalDuration();

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Exercise Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 프로그레스 텍스트 */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>Ready to start your workout?</Text>
        </View>

        {/* 메인 콘텐츠 박스 */}
        <View style={styles.contentBox}>
          <Text style={styles.mainTitle}>💪 Today's Exercise Routine</Text>
          
          {/* 운동 정보 요약 */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🎯</Text>
              <View>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{exerciseQueue.length} exercises</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⏱️</Text>
              <View>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{totalDuration} min</Text>
              </View>
            </View>
          </View>

          {/* 운동 목록 */}
          <View style={styles.exerciseListContainer}>
            <Text style={styles.exerciseListTitle}>Exercise List</Text>
            {exerciseQueue.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                    <Text style={styles.exerciseCount}>x{exercise.count} reps</Text>
                    <Text style={styles.exerciseDifficulty}>{exercise.difficulty}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* 주의사항 */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <View style={styles.noticeTextContainer}>
              <Text style={styles.noticeTitle}>Important</Text>
              <Text style={styles.noticeText}>Follow the instructions and video for each exercise carefully</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 시작 버튼 */}
      <TouchableOpacity
        style={[styles.startButton, exerciseQueue.length === 0 && styles.startButtonDisabled]}
        onPress={() => {
          // 운동 시작 시간 기록
          recordExerciseStart();
          // 첫 번째 운동의 소개 페이지로 이동
          router.push('/Exercise/ExerciseIntroPage');
        }}
        disabled={exerciseQueue.length === 0}
      >
         <Text style={styles.startButtonText}>Start Workout!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: { 
    fontSize: 24, 
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#5C7BEE',
    fontWeight: '600',
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIcon: {
    fontSize: 28,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#5C7BEE',
    opacity: 0.3,
  },
  exerciseListContainer: {
    marginBottom: 20,
  },
  exerciseListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5C7BEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseDuration: {
    fontSize: 13,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  exerciseDifficulty: {
    fontSize: 13,
    color: '#5C7BEE',
    fontWeight: '500',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF4C2',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  noticeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  startButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#5C7BEE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#5C7BEE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#fff' 
  },
});