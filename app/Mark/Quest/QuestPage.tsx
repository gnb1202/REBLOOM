import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function QuestPage() {
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState('일간');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const [flowerStepIndex, setFlowerStepIndex] = useState(0);
  const [exerciseStepIndex, setExerciseStepIndex] = useState(0);
  const [attendanceStepIndex, setAttendanceStepIndex] = useState(0);

  const flowerChallengeSteps = [
    { id: 'flower-1', emoji: '🌸', text: '꽃을 1개 완전히 키우기' },
    { id: 'flower-3', emoji: '🌸', text: '꽃을 3개 완전히 키우기' },
    { id: 'flower-5', emoji: '🌸', text: '꽃을 5개 완전히 키우기' },
  ];
  const exerciseSteps = [
    { id: 'time-100', emoji: '⏱️', text: '총 운동 시간 100분 달성하기' },
    { id: 'time-300', emoji: '⏱️', text: '총 운동 시간 300분 달성하기' },
    { id: 'time-500', emoji: '⏱️', text: '총 운동 시간 500분 달성하기' },
  ];
  const attendanceSteps = [
    { id: 'attend-3', emoji: '📅', text: '3일 연속 출석하기' },
    { id: 'attend-7', emoji: '📅', text: '7일 연속 출석하기' },
    { id: 'attend-14', emoji: '📅', text: '14일 연속 출석하기' },
  ];

  const challengeQuests = [
    flowerChallengeSteps[flowerStepIndex],
    exerciseSteps[exerciseStepIndex],
    attendanceSteps[attendanceStepIndex],
  ];

  const allQuests = [
    { id: '1', emoji: '☕️', text: '차를 한 잔 내리기', type: '일간' },
    { id: '2', emoji: '🌱', text: '식물을 세 번 쓰다듬기', type: '일간' },
    { id: '3', emoji: '❓', text: '퀴즈 정답 맞히기', type: '주간' },
    { id: '4', emoji: '💰', text: '600 달러 벌기', type: '월간' },
    ...challengeQuests.map((q) => ({ ...q, type: '도전과제' })),
  ];

  const filtered = allQuests.filter((q) => q.type === selectedTab);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const isAlready = prev.includes(id);
      let updated = isAlready ? prev.filter((v) => v !== id) : [...prev, id];

      if (!isAlready) {
        if (id.startsWith('flower-') && flowerStepIndex < flowerChallengeSteps.length - 1) {
          setFlowerStepIndex((i) => i + 1);
          updated = updated.filter((v) => !v.startsWith('flower-'));
        }
        if (id.startsWith('time-') && exerciseStepIndex < exerciseSteps.length - 1) {
          setExerciseStepIndex((i) => i + 1);
          updated = updated.filter((v) => !v.startsWith('time-'));
        }
        if (id.startsWith('attend-') && attendanceStepIndex < attendanceSteps.length - 1) {
          setAttendanceStepIndex((i) => i + 1);
          updated = updated.filter((v) => !v.startsWith('attend-'));
        }
      }

      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>퀘스트</Text>

      <View style={styles.tabWrapper}>
        {['일간', '주간', '월간', '도전과제'].map((tab, index, array) => {
          const isActive = selectedTab === tab;
          const isFirst = index === 0;
          const isLast = index === array.length - 1;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tab,
                isFirst && styles.firstTab,
                isLast && styles.lastTab,
                isActive && styles.activeTab,
              ]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const done = completedIds.includes(item.id);
          return (
            <View style={[styles.questCard, done && styles.questCardDone]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.questText, done && styles.questTextDone]}>
                {item.text}
              </Text>
              <TouchableOpacity
                style={[styles.completeBtn, done && styles.completeBtnDone]}
                onPress={() => toggleComplete(item.id)}
              >
                <Text style={styles.completeBtnText}>
                  {done ? '완료됨' : '완료'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* ✅ 닫기 버튼 */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.push('/Home_page/Homepage')}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>닫기</Text>
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
