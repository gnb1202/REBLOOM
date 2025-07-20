import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext'; // ✅ 전역 상태에서 obtainedFlowers 가져오기

// ✅ 수집 가능한 꽃 리스트
const flowerList = [
  {
    id: 'daisy',
    name: '데이지',
    image: require('../../assets/images/flowers/daisy/daisystep3.png'),
  },
  {
    id: 'hydrangea',
    name: '수국',
    image: require('../../assets/images/flowers/hydrangea/hydrangeastep2.png'),
  },
  {
    id: 'lavender',
    name: '라벤더',
    image: require('../../assets/images/flowers/lavender/lavenderstep3.png'),
  },
  {
    id: 'lily',
    name: '백합',
    image: require('../../assets/images/flowers/lily/lilystep3.png'),
  },
  {
    id: 'rose',
    name: '장미',
    image: require('../../assets/images/flowers/rose/rosestep3.png'),
  },
  {
    id: 'sunflower',
    name: '해바라기',
    image: require('../../assets/images/flowers/sunflower/sunflowerstep2.png'),
  },
  {
    id: 'trumpetcreeper',
    name: '능소화',
    image: require('../../assets/images/flowers/trumpetcreeper/trumpetcreeperstep2.png'),
  },
  {
    id: 'tulip',
    name: '튤립',
    image: require('../../assets/images/flowers/tulip/tulipstep2.png'),
  },
];

export default function Collection() {
  const router = useRouter();
  const { obtainedFlowers } = useProgress(); // ✅ 획득한 꽃 ID 배열

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>수집 도감</Text>
      </View>

      {/* 수집된 꽃만 표시 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {flowerList
          .filter(flower => obtainedFlowers.includes(flower.id)) // ✅ 획득한 꽃만 표시
          .map((flower, index) => (
            <View key={index} style={styles.item}>
              <Image source={flower.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.label}>{flower.name}</Text>
            </View>
          ))}
        {obtainedFlowers.length === 0 && (
          <Text style={{ marginTop: 40, fontSize: 14, color: '#888' }}>
            아직 수집한 꽃이 없습니다.
          </Text>
        )}
      </ScrollView>

      {/* 하단 탭 */}
      <View style={styles.tabBar}>
        <Text style={styles.tab}>배경</Text>
        <Text style={[styles.tab, styles.activeTab]}>꽃</Text>
        <Text style={styles.tab}>가구</Text>
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
  back: {
    fontSize: 22,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingBottom: 80,
  },
    item: {
      width: '33%',
      alignItems: 'center',
      marginBottom: 32,
    },
    image: {
      width: 80,
      height: 80,
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
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
  tab: {
    color: '#444',
    fontSize: 14,
  },
  activeTab: {
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#C6D3FF',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});
