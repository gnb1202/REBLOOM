import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
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

  // 웹 스타일 이모지(색 강조)
  const emojis = ['😃', '😐', '😤'];
  const labels = ['Easy', 'Normal', 'Hard'];

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
      const feedbackRating = selected === 0 ? 5 : selected === 1 ? 3 : 1;
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
      incrementFeedbackCount();
      await refreshProfile();
      clearCurrentExercise();
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
      {/* 중앙 헤더 */}
      <Text style={styles.title}>How was today's workout?</Text>
      <Text style={styles.subtitle}>Please rate the exercise intensity</Text>

      {/* 이모지 카드 박스 */}
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
                // 선택된 이모지는 elevation, 그림자 더 강조
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

      {/* Finish 버튼 */}
      <TouchableOpacity
        style={[
          styles.finishButton,
          saving && styles.finishButtonDisabled,
          selected !== null && !saving && styles.finishButtonActive,
        ]}
        onPress={handleSubmit}
        disabled={saving}
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
    shadowOpacity: 0.30,
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
    borderWidth: 0,
    shadowColor: '#E6ECFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 1,
  },
  selectedEmoji: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#B2B8FF',
    elevation: 8,
    shadowColor: '#A2B8FF',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px 0 #A2B8FF30',
      },
      default: {},
    }),
    zIndex: 2,
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
    backgroundColor: '#789BFB',
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
    backgroundColor: '#ccc',
  },
  finishText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },

});
