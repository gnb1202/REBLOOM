import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useExercise } from '../../context/ExerciseContext';

export default function ExerciseSummaryPage() {
  const router = useRouter();
  const { exerciseQueue, getTotalDuration, clearExerciseQueue, getActualDuration } = useExercise();

  const totalDuration = getTotalDuration();
  const actualDurationInSeconds = getActualDuration();
  const actualMinutes = Math.floor(actualDurationInSeconds / 60);
  const actualSeconds = actualDurationInSeconds % 60;

  const handleGetReward = () => {
    // 1. PlantRewardPage로 이동
    router.push('/Exercise/PlantRewardPage');

    // 2. 1.5초 후 CoinRewardPage로 이동
    setTimeout(() => {
      router.push('/Exercise/CoinRewardPage');
    }, 1500);

    // 3. 3초 후 ExerciseFeedbackPage로 이동 (1.5 + 1.5)
    setTimeout(() => {
      router.replace('/Exercise/ExerciseFeedbackPage');
    }, 3000);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.celebrateBox}>
        <Text style={styles.celebrateIcon}>🎉</Text>
        <Text style={styles.header}>{"Today's workout is over!\nCongratulations!"}</Text>
      </View>

      <Text style={styles.subHeader}>Exercise Statistics</Text>

      <View style={styles.summaryBox}>
        <View style={styles.pieChartPlaceholder}>
          <Text style={styles.chartLabel}>Area of Exercise</Text>
          <Text style={styles.pieIcon}>💪</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Exercises</Text>
          <Text style={styles.detailValue}>{exerciseQueue.length}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expected Time</Text>
          <Text style={styles.detailValue}>{totalDuration}:00 min</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Actual Exercise Time</Text>
          <Text style={styles.detailValue}>{actualMinutes}:{actualSeconds.toString().padStart(2, '0')} min</Text>
        </View>
      </View>

      <Text style={styles.subHeader}>Completed Exercises</Text>
      <View style={styles.exerciseListBox}>
        {exerciseQueue.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <Text style={styles.exerciseNumber}>{index + 1}.</Text>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
            <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.endButton}
        onPress={handleGetReward}
        activeOpacity={0.85}
      >
        <Text style={styles.endButtonText}>Get Reward</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 36,
    backgroundColor: '#FFFFFF',
  },
  celebrateBox: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFF4C2',
    borderRadius: 16,
    paddingTop: 30,
    paddingBottom: 16,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  celebrateIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#444',
    letterSpacing: 1,
    lineHeight: 34,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C7BEE',
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    width: '92%',
    alignItems: 'center',
    marginBottom: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  pieChartPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F6F7FB',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#5C7BEE',
  },
  chartLabel: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  pieIcon: {
    fontSize: 40,
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: '#E6ECFF',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '96%',
    marginVertical: 8,
  },
  detailLabel: { fontSize: 16, fontWeight: '600', color: '#555' },
  detailValue: { fontSize: 16, color: '#5C7BEE', fontWeight: 'bold' },

  endButton: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 14,
    paddingHorizontal: 38,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 12,
    shadowColor: '#5C7BEE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  exerciseListBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '92%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECFF',
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C7BEE',
    marginRight: 10,
    width: 25,
  },
  exerciseTitle: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#999',
  },
});