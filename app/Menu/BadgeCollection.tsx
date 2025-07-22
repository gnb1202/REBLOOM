import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

const badgeList = [
  { id: 'flower-1', name: '꽃 1개 키움', image: require('../../assets/images/badge/getflowerstep1.png') },
  { id: 'flower-2', name: '꽃 2개 키움', image: require('../../assets/images/badge/getflowerstep2.png') },
  { id: 'flower-3', name: '꽃 3개 키움', image: require('../../assets/images/badge/getflowerstep3.png') },
  { id: 'flower-4', name: '꽃 4개 키움', image: require('../../assets/images/badge/getflowerstep4.png') },
  { id: 'attend-3', name: '3일 출석', image: require('../../assets/images/badge/exercisestep1.png') },
  { id: 'attend-5', name: '5일 출석', image: require('../../assets/images/badge/exercisestep2.png') },
  { id: 'attend-7', name: '7일 출석', image: require('../../assets/images/badge/exercisestep3.png') },
  { id: 'attend-14', name: '14일 출석', image: require('../../assets/images/badge/exercisestep4.png') },
];

export default function BadgeCollection() {
  const router = useRouter();
  const { completedChallenges } = useProgress();

  const obtainedBadges = badgeList.filter(badge => completedChallenges.includes(badge.id));

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>획득한 뱃지</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {obtainedBadges.length === 0 ? (
          <Text style={styles.emptyText}>아직 획득한 뱃지가 없어요.</Text>
        ) : (
          obtainedBadges.map((badge) => (
            <View key={badge.id} style={styles.item}>
              <Image source={badge.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.label}>{badge.name}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/Menu/BackgroundCollection')}>
          <Text style={styles.tab}>배경</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
          <Text style={styles.tab}>꽃</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/FurnitureCollection')}>
          <Text style={styles.tab}>가구</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>뱃지</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  back: { fontSize: 22, marginRight: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingBottom: 80,
  },
  item: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E6ECFF',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tab: { color: '#444', fontSize: 14 },
  activeTab: {
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#C6D3FF',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});
