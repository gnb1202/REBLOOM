import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProgress } from '../../../context/ProgressContext';

import BaseBackground from '../../../assets/images/HomeBackgroundImages/BaseBackground.png';
import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';

import daisy from '../../../assets/images/flowers/daisy/daisystep3.png';
import hydrangea from '../../../assets/images/flowers/hydrangea/hydrangeastep2.png';
import lavender from '../../../assets/images/flowers/lavender/lavenderstep3.png';
import lily from '../../../assets/images/flowers/lily/lilystep3.png';
import rose from '../../../assets/images/flowers/rose/rosestep3.png';
import sunflower from '../../../assets/images/flowers/sunflower/sunflowerstep2.png';
import trumpetcreeper from '../../../assets/images/flowers/trumpetcreeper/trumpetcreeperstep2.png';
import tulip from '../../../assets/images/flowers/tulip/tulipstep2.png';

const flowerList = [
  { id: 'daisy', name: '데이지', image: daisy },
  { id: 'hydrangea', name: '수국', image: hydrangea },
  { id: 'lavender', name: '라벤더', image: lavender },
  { id: 'lily', name: '백합', image: lily },
  { id: 'rose', name: '장미', image: rose },
  { id: 'sunflower', name: '해바라기', image: sunflower },
  { id: 'trumpetcreeper', name: '능소화', image: trumpetcreeper },
  { id: 'tulip', name: '튤립', image: tulip },
];

// 수집 가능한 가구 목록
const furnitureList = [
  { id: 'chair' },
  { id: 'table' },
  { id: 'lamp' },
];

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;
const screenHeight = Dimensions.get('window').height;
const minScale = screenHeight / ORIGINAL_HEIGHT;
const scaledWidth = ORIGINAL_WIDTH * minScale;
const scaledHeight = ORIGINAL_HEIGHT * minScale;

export default function RoomModified() {
  const router = useRouter();
  const { isRoomOnly } = useLocalSearchParams();

  const [selectedTab, setSelectedTab] = useState<'배경' | '꽃' | '가구'>('배경');
  const [flowers, setFlowers] = useState<{ x: number; y: number; id: string }[]>([]);
  const [furniture, setFurniture] = useState<{ x: number; y: number; id: string }[]>([]);
  const [selectedFlowerReady, setSelectedFlowerReady] = useState<null | string>(null);

  // 수집한 꽃과 가구 정보 가져오기
  const { obtainedFlowers, obtainedFurniture } = useProgress();

  const handleSelectItem = (itemId: string) => {
    if (selectedTab === '가구') {
      setFurniture([...furniture, { x: 100, y: 400, id: itemId }]);
    } else if (selectedTab === '꽃') {
      setSelectedFlowerReady(itemId);
    }
  };

  const handleTouch = (event: any) => {
    if (selectedTab === '꽃' && selectedFlowerReady) {
      const { locationX, locationY } = event.nativeEvent;
      setFlowers([...flowers, { x: locationX - 30, y: locationY - 30, id: selectedFlowerReady }]);
      setSelectedFlowerReady(null);
    }
  };

  const handleSave = () => {
    Alert.alert('저장되었습니다!');
  };

  const handleReturn = () => {
    router.replace('/Home_page/Homepage');
  };

  return (
    <View style={styles.fullScreen}>
      <ImageBackground
        source={BaseBackground}
        style={styles.backgroundImage}
        imageStyle={{
          width: scaledWidth,
          height: scaledHeight,
          marginLeft: (Dimensions.get('window').width - scaledWidth) / 2,
        }}
        resizeMode="cover"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTouch}>
          {flowers.map((item, index) => {
            const flowerData = flowerList.find(f => f.id === item.id);
            if (!flowerData) return null;
            return (
              <Image
                key={`flower-${index}`}
                source={flowerData.image}
                style={[styles.placedImage, { left: item.x, top: item.y }]}
              />
            );
          })}

          {furniture.map((item, index) => (
            <Pressable
              key={`furniture-${index}`}
              onLongPress={() => {
                setFurniture((prev) => prev.filter((_, i) => i !== index));
              }}
              style={[styles.furnitureBox, { left: item.x, top: item.y }]}
            />
          ))}
        </Pressable>
      </ImageBackground>

      <View style={styles.topButtonRightAlignedWithHomepage}>
        <TouchableOpacity onPress={handleReturn}>
          <Image source={ModifiedButton} style={styles.modifiedImageButton} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {isRoomOnly === 'true' && (
        <View style={styles.saveButtonFixedAlignedWithHomepage}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.tabContainer}>
          {['배경', '꽃', '가구'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => {
                setSelectedTab(tab as any);
                setSelectedFlowerReady(null);
              }}
            >
              <Text style={selectedTab === tab ? styles.activeText : styles.inactiveText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={[
            styles.itemScrollContainer,
            { minHeight: 80 }, // 배경/가구 탭에도 공간 확보
          ]}
        >
          {selectedTab === '꽃' &&
            flowerList
              .filter(flower => obtainedFlowers.includes(flower.id))
              .map((flower) => (
                <TouchableOpacity key={flower.id} onPress={() => handleSelectItem(flower.id)}>
                  <Image source={flower.image} style={styles.flowerImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}

          {selectedTab === '가구' &&
            furnitureList
              .filter(f => obtainedFurniture.includes(f.id))
              .map(item => (
                <TouchableOpacity key={item.id} onPress={() => handleSelectItem(item.id)}>
                  <View style={styles.itemBox} />
                </TouchableOpacity>
              ))}
        </ScrollView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placedImage: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  furnitureBox: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFFEE',
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#5C7BEE',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#555',
  },
  itemScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  itemBox: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
  },
  flowerImage: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  topButtonRightAlignedWithHomepage: {
    position: 'absolute',
    right: 20,
    top: 100,
    zIndex: 10,
  },
  saveButtonFixedAlignedWithHomepage: {
    position: 'absolute',
    left: 20,
    top: 100,
    zIndex: 10,
  },
  modifiedImageButton: {
    width: 40,
    height: 40,
  },
  saveButton: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
