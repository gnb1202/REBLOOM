import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 예시 데이터 (props 또는 context로 대체 가능)
const totalExerciseTime = '3시간 25분';
const exerciseCompletionRate = 87;
const bodyPartProgress = [
  { part: '어깨', lastWeek: 60, thisWeek: 75 },
  { part: '무릎', lastWeek: 40, thisWeek: 65 },
  { part: '허리', lastWeek: 50, thisWeek: 55 },
];
const achievements = [
  '운동 루틴 100% 달성',
  '통증 지수 30% 감소',
  '어깨 가동 범위 20도 증가',
];

export default function Report() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>운동 리포트</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>● 운동 수행 현황</Text>
        <Text style={styles.text}>총 운동 시간: {totalExerciseTime}</Text>
        <Text style={styles.text}>운동 수행률: {exerciseCompletionRate}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>● 부위별 운동 수행률 변화</Text>
        {bodyPartProgress.map((item) => (
          <Text key={item.part} style={styles.text}>
            {item.part}: {item.lastWeek}% → {item.thisWeek}%
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>● 주요 성과</Text>
        {achievements.map((item, index) => (
          <Text key={index} style={styles.text}>• {item}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
});
