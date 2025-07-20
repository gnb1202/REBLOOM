import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExerciseIntroPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>1. 심호흡 운동</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• 어떤걸 위한 운동인지</Text>
          <Text style={styles.bullet}>• 해당 운동 시 주의사항</Text>
          <Text style={styles.bulletSub}>  • 격려문구</Text>
          <Text style={styles.bulletSub}>  • etc</Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/Exercise/ExerciseVideoPage')}
      >
        <Text style={styles.nextButtonText}>다음으로</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 80,
  },
  contentBox: {
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  bulletList: {
    gap: 6,
  },
  bullet: {
    fontSize: 16,
  },
  bulletSub: {
    fontSize: 14,
    paddingLeft: 12,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
