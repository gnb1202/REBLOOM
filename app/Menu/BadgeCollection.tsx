import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProgress } from '../../context/ProgressContext';

// Shop에서 쓰는 Decoration 목록 그대로 import (중복 방지)
import sparkleGif from '../../assets/images/decoration/DecorationBackgroundSparkle.gif';
import deco1Gif from '../../assets/images/decoration/DecorationBackground1.gif';

const decorationList = [
  { id: 'DecorationBackground1', name: 'Animated Deco 1', image: deco1Gif },
  { id: 'DecorationBackgroundSparkle', name: 'Sparkle Animation', image: sparkleGif },
  // 추가 Decoration 있으면 여기에!
];

export default function DecorationCollection() {
  const router = useRouter();
  const { obtainedDecorations } = useProgress();

  // 실제로 소유한 데코만 필터링
  const obtainedDecorationsList = decorationList.filter(item => obtainedDecorations?.includes(item.id));

  // 🔥 추가: 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDeco, setSelectedDeco] = useState<any>(null);

  // 데코 클릭 핸들러
  const handlePress = (item: any) => {
    setSelectedDeco(item);
    setModalVisible(true);
  };

  // 모달 닫기
  const handleClose = () => {
    setModalVisible(false);
    setSelectedDeco(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Menu/Menupage')}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Decoration Collection</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {obtainedDecorationsList.length === 0 ? (
          <Text style={styles.emptyText}>No Decoration obtained yet.</Text>
        ) : (
          obtainedDecorationsList.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <Image source={item.image} style={styles.image} resizeMode="contain" />
              <Text style={styles.label}>{item.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 확대 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={{ fontSize: 22, color: '#333' }}>×</Text>
            </TouchableOpacity>
            {selectedDeco && (
              <>
                <Image
                  source={selectedDeco.image}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalLabel}>{selectedDeco.name}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => router.push('/Menu/BackgroundCollection')}>
          <Text style={styles.tab}>Background</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/Collection')}>
          <Text style={styles.tab}>Flower</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Menu/FurnitureCollection')}>
          <Text style={styles.tab}>Furniture</Text>
        </TouchableOpacity>
        <Text style={[styles.tab, styles.activeTab]}>Decoration</Text>
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
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingBottom: 80,
  },
  item: {
    width: '45%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    backgroundColor: '#FAFAFF',
    shadowColor: '#aaa',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  label: { fontSize: 15, fontWeight: 'bold' },
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
  // ----------- Modal styles -----------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 250,
    minHeight: 260,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 2,
    padding: 6,
  },
  modalImage: {
    width: 180,
    height: 180,
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
