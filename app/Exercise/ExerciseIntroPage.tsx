import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercise } from '../../context/ExerciseContext';
import { useEffect } from 'react';

export default function ExerciseIntroPage() {
  const router = useRouter();
  const { getCurrentExercise, exerciseQueue, currentExerciseIndex } = useExercise();

  const currentExercise = getCurrentExercise();

  // 현재 운동 정보가 없으면 로딩 중 또는 이전 페이지로 이동
  useEffect(() => {
    // 컨텍스트가 로드되었지만 큐가 비어있다면 리스트 페이지로 돌려보냄
    if (!currentExercise) {
      // 잠시 후 실행하여 무한 루프 방지
      setTimeout(() => router.replace('/Exercise/ExerciseListPage'), 100);
    }
  }, [currentExercise, router]);

  if (!currentExercise) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={{marginTop: 10}}>Loading exercise...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          {`Exercise ${currentExerciseIndex + 1} of ${exerciseQueue.length}`}
        </Text>
      </View>

      <View style={styles.contentBox}>
        <Text style={styles.title}>{`${currentExerciseIndex + 1}. ${currentExercise.title}`}</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>🎯 Target: {currentExercise.target}</Text>
          <Text style={styles.bullet}>💪 Difficulty: {currentExercise.difficulty}</Text>
          <Text style={styles.bullet}>⏱️ Duration: {currentExercise.duration}</Text>
          <Text style={styles.bullet}>🔄 Repetitions: {currentExercise.count} reps</Text>
          <Text style={styles.bulletDescription}>{currentExercise.description}</Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/Exercise/ExerciseVideoPage')}
      >
        <Text style={styles.nextButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    width: '100%',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C7BEE',
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  bulletList: {
    gap: 12,
    width: '100%',
  },
  bullet: {
    fontSize: 16,
    color: '#555',
  },
  bulletDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    lineHeight: 24,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 15,
  },
  nextButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#5C7BEE',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});