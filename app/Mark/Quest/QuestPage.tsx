import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';

const { height } = Dimensions.get('window');

const getBadgeImage = (level: number) => {
  switch (level) {
    case 1:
      return require('../../../assets/images/badge/getflowerstep1.png');
    case 2:
      return require('../../../assets/images/badge/getflowerstep2.png');
    case 3:
      return require('../../../assets/images/badge/getflowerstep3.png');
    case 4:
      return require('../../../assets/images/badge/getflowerstep4.png');
    default:
      return null;
  }
};

const feedbackSteps = [
  { id: 'feedback-3', emoji: '🗣️', text: 'Record 3 exercise feedback sessions' },
  { id: 'feedback-5', emoji: '🗣️', text: 'Complete 5 recovery assessments' },
  { id: 'feedback-7', emoji: '🗣️', text: 'Submit 7 rehabilitation progress reports' },
];

export default function QuestPage() {
  const router = useRouter();
  const {
    flowerBadgeLevel,
    completedChallenges,
    completeChallenge,
    exerciseFeedbackCount,
    attendanceStreak, // ✅ Get attendance streak count
  } = useProgress();

  const badgeImage = getBadgeImage(flowerBadgeLevel);

  const [selectedTab, setSelectedTab] = useState('Daily');
  const [flowerStepIndex, setFlowerStepIndex] = useState(0);
  const [exerciseStepIndex, setExerciseStepIndex] = useState(0);
  const [attendanceStepIndex, setAttendanceStepIndex] = useState(0);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<string | null>(null);

  const flowerChallengeSteps = [
    { id: 'flower-1', emoji: '🌸', text: 'Complete first rehabilitation milestone (1 flower)' },
    { id: 'flower-2', emoji: '🌸', text: 'Reach second recovery stage (2 flowers)' },
    { id: 'flower-3', emoji: '🌸', text: 'Achieve advanced recovery (3 flowers)' },
    { id: 'flower-4', emoji: '🌸', text: 'Master rehabilitation program (4 flowers)' },
  ];
  const exerciseSteps = [
    { id: 'time-100', emoji: '⏱️', text: 'Complete 100 minutes of rehabilitation exercises' },
    { id: 'time-300', emoji: '⏱️', text: 'Achieve 300 minutes of therapeutic activity' },
    { id: 'time-500', emoji: '⏱️', text: 'Reach 500 minutes of recovery exercises' },
  ];
  const attendanceSteps = [
    { id: 'attend-3', emoji: '📅', text: '3 days consistent rehabilitation' },
    { id: 'attend-5', emoji: '📅', text: '5 days continuous recovery routine' },
    { id: 'attend-7', emoji: '📅', text: 'Complete 1 week of daily exercises' },
    { id: 'attend-14', emoji: '📅', text: '2 weeks of dedicated rehabilitation' },
  ];

  const challengeQuests = [
    flowerChallengeSteps[flowerStepIndex],
    exerciseSteps[exerciseStepIndex],
    attendanceSteps[attendanceStepIndex],
    feedbackSteps.find((step) => !completedChallenges.includes(step.id)),
  ];

  const allQuests = [
    { id: '1', emoji: '💊', text: 'Take prescribed medication', type: 'Daily' },
    { id: '2', emoji: '🚶', text: 'Complete 10 minutes of gentle walking', type: 'Daily' },
    { id: '3', emoji: '💪', text: 'Perform 5 shoulder exercises', type: 'Daily' },
    { id: '4', emoji: '📝', text: 'Log pain level in recovery diary', type: 'Daily' },
    { id: '5', emoji: '🎯', text: 'Complete 3 full exercise sessions', type: 'Weekly' },
    { id: '6', emoji: '📊', text: 'Submit weekly progress report', type: 'Weekly' },
    { id: '7', emoji: '🏥', text: 'Attend follow-up appointment', type: 'Monthly' },
    { id: '8', emoji: '🎖️', text: 'Achieve 80% exercise compliance', type: 'Monthly' },
    ...challengeQuests.filter(Boolean).map((q) => ({ ...q, type: 'Challenge' })),
  ];

  const filtered = allQuests.filter((q) => q.type === selectedTab);

  useEffect(() => {
    const nextFlowerIndex = flowerChallengeSteps.findIndex(
      (step) => !completedChallenges.includes(step.id)
    );
    if (nextFlowerIndex !== -1) setFlowerStepIndex(nextFlowerIndex);

    const nextExerciseIndex = exerciseSteps.findIndex(
      (step) => !completedChallenges.includes(step.id)
    );
    if (nextExerciseIndex !== -1) setExerciseStepIndex(nextExerciseIndex);

    const nextAttendanceIndex = attendanceSteps.findIndex(
      (step) => !completedChallenges.includes(step.id)
    );
    if (nextAttendanceIndex !== -1) setAttendanceStepIndex(nextAttendanceIndex);
  }, [completedChallenges]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quest</Text>

      <View style={styles.tabWrapper}>
        {['Daily', 'Weekly', 'Monthly', 'Challenge'].map((tab, index, array) => {
          const isActive = selectedTab === tab;
          const isFirst = index === 0;
          const isLast = index === array.length - 1;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tab, isFirst && styles.firstTab, isLast && styles.lastTab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const done = completedChallenges.includes(item.id);

          const canComplete = (() => {
            if (item.id.startsWith('flower-')) {
              const required = parseInt(item.id.split('-')[1], 10);
              return flowerBadgeLevel >= required;
            }
            if (item.id.startsWith('feedback-')) {
              const required = parseInt(item.id.split('-')[1], 10);
              return exerciseFeedbackCount >= required;
            }
            if (item.id.startsWith('attend-')) {
              const required = parseInt(item.id.split('-')[1], 10);
              return attendanceStreak >= required;
            }

            return true;
          })();

          const isRecentlyCompleted = recentlyCompletedId === item.id;

          return (
            <View style={[styles.questCard, done && styles.questCardDone]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.questText, done && styles.questTextDone]}>{item.text}</Text>
              <TouchableOpacity
                style={[
                  styles.completeBtn,
                  (done || !canComplete || isRecentlyCompleted) && styles.completeBtnDone,
                ]}
                disabled={done || !canComplete || isRecentlyCompleted}
                onPress={() => {
                  completeChallenge(item.id);
                  setRecentlyCompletedId(item.id);
                }}
              >
                <Text style={styles.completeBtnText}>{done ? 'Completed' : 'Complete'}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push('/Home_page/Homepage')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2F4034',
    marginBottom: 20,
  },
  tabWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3F5C45',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8F5EF',
  },
  firstTab: {
    borderTopLeftRadius: 12,
  },
  lastTab: {
    borderTopRightRadius: 12,
  },
  activeTab: {
    backgroundColor: '#3F5C45',
    borderBottomWidth: 2,
    borderBottomColor: '#3F5C45',
  },
  tabText: {
    color: '#3F5C45',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  list: {
    paddingBottom: 100,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C4D4BD',
    marginBottom: 12,
  },
  questCardDone: {
    backgroundColor: '#E7F2E0',
    borderColor: '#A8C8A0',
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  questText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  questTextDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  completeBtn: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeBtnDone: {
    backgroundColor: '#A8C8A0',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#3F5C45',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
});
