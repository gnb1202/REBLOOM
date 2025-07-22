import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

export default function ExerciseFeedbackPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const { incrementFeedbackCount } = useProgress();

  const emojis = ['😀', '😐', '😣'];

  const handleSubmit = () => {
    if (selected !== null) {
      incrementFeedbackCount(); // ✅ 저장 및 도전과제 반영 포함
      router.push('/Home_page/Homepage');
    } else {
      Alert.alert('선택 필요', '피드백을 선택해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.question}>운동강도 어땠나요?</Text>
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

      <TouchableOpacity style={styles.finishButton} onPress={handleSubmit}>
        <Text style={styles.finishText}>마치기</Text>
      </TouchableOpacity>

      {/* 개발용: 피드백 횟수 초기화 */}
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.removeItem('@exerciseFeedbackCount');
          Alert.alert('초기화됨', '피드백 횟수가 초기화되었습니다.');
        }}
      >
        <Text style={{ marginTop: 20, color: '#888' }}>횟수 초기화</Text>
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
    backgroundColor: '#ccc',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  finishText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
