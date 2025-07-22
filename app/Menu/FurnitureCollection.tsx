import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

import chair1 from '../../assets/images/furnitures/whiteroundchair.png';
import stand1 from '../../assets/images/furnitures/yellowstand.png';

const furnitureList = [
  {
    id: 'whiteroundchair',
    name: '테이블',
    desc: '심플하고 튼튼한 테이블',
    image: chair1,
  },
  {
    id: 'yellowstand',
    name: '의자',
    desc: '편안한 디자인의 의자',
    image: stand1,
  },
];

export default function FurnitureCollection() {
  const router = useRouter();
  const { obtainedFurniture } = useProgress();
  const [selectedFurniture, setSelectedFurniture] = useState(null);

  const ownedItems = furnitureList.filter((item) =>
    obtainedFurniture.includes(item.id)
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>가구 도감</Text>
      </View>

      {/* 획득한 가구 목록만 표시 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {ownedItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => setSelectedFurniture(item)}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 상세 모달 */}
      <Modal
        visible={!!selectedFurniture}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFurniture(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={selectedFurniture?.image}
              style={{ width: 100, height: 100, marginBottom: 10 }}
              resizeMode="contain"
            />
            <Text style={styles.modalTitle}>{selectedFurniture?.name}</Text>
            <Text style={styles.modalDesc}>{selectedFurniture?.desc}</Text>
            <TouchableOpacity
              onPress={() => setSelectedFurniture(null)}
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
        <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
          <Text style={styles.tab}>꽃</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>가구</Text>
        <TouchableOpacity onPress={() => router.push('/Menu/BadgeCollection')}>
          <Text style={styles.tab}>뱃지</Text>
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
