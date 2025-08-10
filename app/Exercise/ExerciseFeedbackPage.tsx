import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useExercise } from '../../context/ExerciseContext';
import { saveExerciseSession } from '../../firebase.config';

export default function ExerciseFeedbackPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { 
    exerciseQueue, 
    clearExerciseQueue, 
    getTotalDuration, 
    getActualDuration,
    exerciseStartTime,
    exerciseEndTime
  } = useExercise();
  const { user } = useAuth();

  const emojis = ['😃', '😐', '😤'];
  const labels = ['Easy', 'Normal', 'Hard'];

  const handleFinish = async () => {
    if (selected === null) {
      Alert.alert('Selection Required', 'Please select your feedback.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSaving(true);

    try {
      // 피드백을 1-5 점수로 변환 (Easy=5, Normal=3, Hard=1)
      const feedbackRating = selected === 0 ? 5 : selected === 1 ? 3 : 1;
      
      // 운동 데이터 준비
      const sessionData = {
        exercises: exerciseQueue.map(exercise => ({
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          duration: exercise.duration,
          difficulty: exercise.difficulty,
          target: exercise.target,
          count: exercise.count,
        })),
        totalDuration: getActualDuration(), // 실제 소요 시간 (초)
        startTime: exerciseStartTime,
        endTime: exerciseEndTime,
        overallFeedback: labels[selected],
        feedbackRating: feedbackRating,
      };

      console.log('Saving exercise session data:', sessionData);
      
      // Firebase에 데이터 저장
      const sessionId = await saveExerciseSession(user.uid, sessionData);
      console.log('Exercise session saved with ID:', sessionId);

      // 운동 큐를 비우지 않고 홈으로 이동
      // (다음 운동 세션 시작 시 자동으로 새로운 큐로 교체됨)
      router.replace('/Home_page/Homepage');
      
    } catch (error) {
      console.error('Failed to save exercise session:', error);
      Alert.alert(
        'Save Failed', 
        'Failed to save your exercise data. Would you like to continue anyway?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) },
          { text: 'Continue', onPress: () => router.replace('/Home_page/Homepage') }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How was today's workout?</Text>
      <Text style={styles.subtitle}>Please rate the overall exercise intensity</Text>

      <View style={styles.box}>
        <View style={styles.emojiRow}>
          {emojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelected(index)}
              activeOpacity={0.8}
              style={[
                styles.emojiWrapper,
                selected === index && styles.selectedEmoji,
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={[
                styles.emojiLabel,
                selected === index && styles.emojiLabelSelected,
              ]}>
                {labels[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.finishButton,
          saving && styles.finishButtonDisabled,
          selected !== null && !saving && styles.finishButtonActive,
        ]}
        onPress={handleFinish}
        disabled={saving || selected === null}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.finishText}>Finish</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 28,
    textAlign: 'center',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 30,
    paddingVertical: 34,
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 5,
    minWidth: 320,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: '#F6F8FC',
    borderRadius: 16,
    minWidth: 80,
    minHeight: 110,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#E6ECFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 1,
  },
  selectedEmoji: {
    backgroundColor: '#fff',
    borderColor: '#5C7BEE',
    elevation: 8,
    shadowColor: '#5C7BEE',
    shadowOpacity: 0.25,
    transform: [{ translateY: -5 }],
  },
  emoji: {
    fontSize: 42,
    marginBottom: 7,
  },
  emojiLabel: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },
  emojiLabelSelected: {
    color: '#5C7BEE',
    fontWeight: 'bold',
  },
  finishButton: {
    marginTop: 14,
    marginBottom: 10,
    backgroundColor: '#ccc',
    paddingHorizontal: 50,
    paddingVertical: 17,
    borderRadius: 15,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: '#789BFB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  finishButtonActive: {
    backgroundColor: '#5C7BEE',
  },
  finishButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  finishText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
});