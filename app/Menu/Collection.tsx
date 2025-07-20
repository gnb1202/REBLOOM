import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

const silhouetteImage = require('../../assets/images/flowers/silhouette.png');

const flowerList = [
  {
    id: 'daisy',
    name: '데이지',
    desc: '순수함과 밝은 에너지',
    image: require('../../assets/images/flowers/daisy/daisystep3.png'),
  },
  {
    id: 'hydrangea',
    name: '수국',
    desc: '진심, 감사',
    image: require('../../assets/images/flowers/hydrangea/hydrangeastep2.png'),
  },
  {
    id: 'lavender',
    name: '라벤더',
    desc: '고요함과 힐링',
    image: require('../../assets/images/flowers/lavender/lavenderstep3.png'),
  },
  {
    id: 'lily',
    name: '백합',
    desc: '순결과 고귀함',
    image: require('../../assets/images/flowers/lily/lilystep3.png'),
  },
  {
    id: 'rose',
    name: '장미',
    desc: '사랑과 열정',
    image: require('../../assets/images/flowers/rose/rosestep3.png'),
  },
  {
    id: 'sunflower',
    name: '해바라기',
    desc: '희망과 충성',
    image: require('../../assets/images/flowers/sunflower/sunflowerstep2.png'),
  },
  {
    id: 'trumpetcreeper',
    name: '능소화',
    desc: '명예와 존경',
    image: require('../../assets/images/flowers/trumpetcreeper/trumpetcreeperstep2.png'),
  },
  {
    id: 'tulip',
    name: '튤립',
    desc: '사랑의 고백',
    image: require('../../assets/images/flowers/tulip/tulipstep2.png'),
  },
];

export default function Collection() {
  const router = useRouter();
  const { obtainedFlowers } = useProgress();

  const [selectedFlower, setSelectedFlower] = useState<{
    flower: typeof flowerList[0];
    isCollected: boolean;
  } | null>(null);

  const handlePress = (flower) => {
    const isCollected = obtainedFlowers.includes(flower.id);
    setSelectedFlower({ flower, isCollected });
  };

  // 줄 정렬 보정
  const remainder = flowerList.length % 3;
  const dummyCount = remainder === 0 ? 0 : 3 - remainder;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>수집 도감</Text>
      </View>

      {/* 꽃 그리드 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {flowerList.map((flower, index) => {
          const isCollected = obtainedFlowers.includes(flower.id);
          return (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => handlePress(flower)}
            >
              <Image
                source={isCollected ? flower.image : silhouetteImage}
                style={[styles.image, !isCollected && styles.silhouette]}
                resizeMode="contain"
              />
              <Text style={styles.label}>{isCollected ? flower.name : '???'}</Text>
            </TouchableOpacity>
          );
        })}

        {/* 정렬 보정용 투명 아이템 */}
        {Array.from({ length: dummyCount }).map((_, idx) => (
          <View key={`dummy-${idx}`} style={styles.item} />
        ))}
      </ScrollView>

      {/* 꽃 상세 팝업 */}
      <Modal
        visible={!!selectedFlower}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFlower(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={
                selectedFlower?.isCollected
                  ? selectedFlower.flower.image
                  : silhouetteImage
              }
              style={{ width: 100, height: 100, marginBottom: 10 }}
              resizeMode="contain"
            />
            {selectedFlower?.isCollected && (
              <Text style={styles.modalTitle}>{selectedFlower.flower.name}</Text>
            )}
            <Text style={styles.modalDesc}>{selectedFlower?.flower.desc}</Text>
            <TouchableOpacity
              onPress={() => setSelectedFlower(null)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/Menu/BackgroundCollection')}>
          <Text style={styles.tab}>배경</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>꽃</Text>
        <TouchableOpacity onPress={() => router.push('/Menu/FurnitureCollection')}>
          <Text style={styles.tab}>가구</Text>
        </TouchableOpacity>
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
    width: '100%',
    height: '100%',
    maxWidth: 80,
    maxHeight: 80,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  silhouette: {
    opacity: 0.3,
  },
  label: { fontSize: 12 },
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalClose: {
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalCloseText: { color: '#fff', fontWeight: 'bold' },
});
