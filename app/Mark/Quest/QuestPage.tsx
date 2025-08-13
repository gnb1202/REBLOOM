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
    attendanceStreak,
    checkDailyAttendance,
    todayAttended,
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

      {/* Badge Display Section */}
      <View style={styles.badgeSection}>
        <Text style={styles.badgeTitle}>Your Badges</Text>
        <View style={styles.badgeContainer}>
          {/* Flower Badge */}
          <View style={styles.badgeItem}>
            {badgeImage ? (
              <Image source={badgeImage} style={styles.badgeImage} />
            ) : (
              <View style={styles.badgePlaceholder}>
                <Text style={styles.badgePlaceholderText}>🌸</Text>
              </View>
            )}
            <Text style={styles.badgeLabel}>Flower</Text>
            <Text style={styles.badgeValue}>Lv.{flowerBadgeLevel}</Text>
          </View>

          {/* Attendance Badge */}
          <View style={styles.badgeItem}>
            <TouchableOpacity
              onPress={checkDailyAttendance}
              disabled={todayAttended}
              style={[styles.attendanceBadge, todayAttended && styles.attendanceBadgeCompleted]}
            >
              <Text style={styles.attendanceBadgeEmoji}>📅</Text>
              <Text style={styles.attendanceBadgeCount}>{attendanceStreak}</Text>
            </TouchableOpacity>
            <Text style={styles.badgeLabel}>Attendance</Text>
            <Text style={styles.badgeValue}>{attendanceStreak} days</Text>
          </View>

          {/* Exercise Feedback Badge */}
          <View style={styles.badgeItem}>
            <View style={styles.feedbackBadge}>
              <Text style={styles.feedbackBadgeEmoji}>🗣️</Text>
              <Text style={styles.feedbackBadgeCount}>{exerciseFeedbackCount}</Text>
            </View>
            <Text style={styles.badgeLabel}>Feedback</Text>
            <Text style={styles.badgeValue}>{exerciseFeedbackCount} sessions</Text>
          </View>
        </View>

        {/* Daily Attendance Check Button */}
        {!todayAttended && (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={checkDailyAttendance}
          >
            <Text style={styles.checkInButtonText}>🎯 Daily Check-in</Text>
          </TouchableOpacity>
        )}
      </View>

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
    fontSize: 26,
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
    fontSize: 18,
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
    fontSize: 24,
    marginRight: 12,
  },
  questText: {
    flex: 1,
    fontSize: 18,
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
    fontSize: 16,
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
  // Badge Section Styles
  badgeSection: {
    backgroundColor: '#F5F2EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0DDD4',
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F4034',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  badgeItem: {
    alignItems: 'center',
    flex: 1,
  },
  badgeImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  badgePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E5DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePlaceholderText: {
    fontSize: 20,
  },
  attendanceBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5C7BEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceBadgeCompleted: {
    backgroundColor: '#4CAF50',
  },
  attendanceBadgeEmoji: {
    fontSize: 20,
  },
  attendanceBadgeCount: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  feedbackBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF8A65',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackBadgeEmoji: {
    fontSize: 20,
  },
  feedbackBadgeCount: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  badgeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F5C45',
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
