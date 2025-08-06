import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useExercise } from '../../context/ExerciseContext';
import { useProgress } from '../../context/ProgressContext';
import { saveExerciseRecord } from '../../firebase.config';

export default function ExerciseFeedbackPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { incrementFeedbackCount } = useProgress();
  const { currentExercise, clearCurrentExercise, calculateRewards } = useExercise();
  const { user, refreshProfile } = useAuth();

  const emojis = ['😀', '😐', '😣'];

  const handleSubmit = async () => {
    if (selected === null) {
      Alert.alert('Selection Required', 'Please select your feedback.');
      return;
    }

    if (!user || !currentExercise) {
      Alert.alert('Error', 'No exercise information available.');
      router.push('/Home_page/Homepage');
      return;
    }

    setSaving(true);
    try {
      // 피드백을 1-5 점수로 변환 (😀=5, 😐=3, 😣=1)
      const feedbackRating = selected === 0 ? 5 : selected === 1 ? 3 : 1;
      
      // Firebase에 운동 기록 저장
      await saveExerciseRecord(user.uid, {
        exerciseId: currentExercise.exerciseId,
        exerciseName: currentExercise.exerciseName,
        duration: currentExercise.duration,
        difficulty: currentExercise.difficulty,
        feedback: {
          rating: feedbackRating,
          comment: selected === 0 ? 'Good' : selected === 1 ? 'Average' : 'Difficult'
        }
      });

      // 기존 피드백 카운트 증가
      incrementFeedbackCount();
      
      // 사용자 프로필 새로고침 (업데이트된 게임 데이터 반영)
      await refreshProfile();
      
      // 현재 운동 정보 클리어
      clearCurrentExercise();

      // 보상 정보 표시
      const rewards = calculateRewards();
      Alert.alert(
        'Exercise Complete! 🎉',
        `Great job!\n\n💰 ${rewards.currency} Coins earned\n⭐ ${rewards.experience} Experience gained`,
        [
          {
            text: 'OK',
            onPress: () => router.push('/Home_page/Homepage')
          }
        ]
      );

    } catch (error) {
      console.error('Failed to save exercise record:', error);
      Alert.alert('Error', 'Failed to save exercise record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.question}>How was the exercise intensity?</Text>
        <View style={styles.emojiRow}>
          {emojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelected(index)}
              style={[
                styles.emojiWrapper,
                selected === index && styles.selectedEmoji,
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.finishButton, saving && styles.finishButtonDisabled]} 
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.finishText}>Finish</Text>
        )}
      </TouchableOpacity>

      {/* 개발용: 피드백 횟수 초기화 */}
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem('@exerciseFeedbackCount');
          Alert.alert('Reset', 'Feedback count has been reset.');
        }}
      >
        <Text style={{ marginTop: 20, color: '#888' }}>Reset Count</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  box: {
    backgroundColor: '#ddd',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  emojiWrapper: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 8,
  },
  selectedEmoji: {
    backgroundColor: '#B2B8FF',
  },
  emoji: {
    fontSize: 32,
  },
  finishButton: {
    marginTop: 40,
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  finishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  finishText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
