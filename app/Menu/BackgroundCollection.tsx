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

import Backgroundlevel1 from '../../assets/images/HomeBackgroundImages/Backgroundlevel1.png';
import Backgroundlevel2 from '../../assets/images/HomeBackgroundImages/Backgroundlevel2.png';

const backgroundList = [
  {
    id: 'bg1',
    desc: '맑고 시원한 하늘 풍경',
    image: Backgroundlevel1,
  },
  {
    id: 'bg2',
    desc: '푸르른 자연의 숲',
    image: Backgroundlevel2,
  },
];

export default function BackgroundCollection() {
  const router = useRouter();
  const [selectedBackground, setSelectedBackground] = useState(null);

  const remainder = backgroundList.length % 3;
  const dummyCount = remainder === 0 ? 0 : 3 - remainder;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>배경 도감</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {backgroundList.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() => setSelectedBackground(item)}
          >
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
        {Array.from({ length: dummyCount }).map((_, i) => (
          <View key={`dummy-${i}`} style={styles.item} />
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedBackground}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBackground(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image
              source={selectedBackground?.image}
              style={{ width: 100, height: 100, marginBottom: 10 }}
              resizeMode="contain"
            />
            <Text style={styles.modalDesc}>{selectedBackground?.desc}</Text>
            <TouchableOpacity
              onPress={() => setSelectedBackground(null)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.tabBar}>
              <Text style={[styles.tab, styles.activeTab]}>배경</Text>
              <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
                <Text style={styles.tab}>꽃</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
                              <Text style={styles.tab}>꽃</Text>
                            </TouchableOpacity>
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
