import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';

export default function QuestPage() {
  const [selectedTab, setSelectedTab] = useState('일간');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const allQuests = [
    { id: '1', emoji: '☕️', text: '차를 한 잔 내리기', type: '일간' },
    { id: '2', emoji: '🌱', text: '식물을 세 번 쓰다듬기', type: '일간' },
    { id: '3', emoji: '❓', text: '퀴즈 정답 맞히기', type: '주간' },
    { id: '4', emoji: '💰', text: '600 달러 벌기', type: '월간' },
  ];

  const filtered = allQuests.filter((q) => q.type === selectedTab);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>퀘스트</Text>

      <View style={styles.tabs}>
        {['일간', '주간', '월간'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
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
              <Text
                style={[
                  styles.questText,
                  done && styles.questTextDone,
                ]}
              >
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
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFDF6',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2F4034',
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F2EDE4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#90A18C',
  },
  tabText: {
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2F4034',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 20,
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
};
