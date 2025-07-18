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

// 📦 배경 이미지 (Homepage.tsx와 동일하게)
import MorningImage from '../../../assets/images/HomeBackgroundImages/Backgroundmorningimage.png';
import AfternoonImage from '../../../assets/images/HomeBackgroundImages/Backgroundafternoonimage.png';
import EveningImage from '../../../assets/images/HomeBackgroundImages/Backgroundeveningimage.png';
import NightImage from '../../../assets/images/HomeBackgroundImages/Backgroundnightimage2.png';

// 📦 버튼 이미지
import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;
const screenHeight = Dimensions.get('window').height;

const minScale = screenHeight / ORIGINAL_HEIGHT;
const scaledWidth = ORIGINAL_WIDTH * minScale;
const scaledHeight = ORIGINAL_HEIGHT * minScale;

const backgroundImages = [MorningImage, AfternoonImage, EveningImage, NightImage];

export default function RoomModified() {
  const router = useRouter();
  const { isRoomOnly } = useLocalSearchParams();

  const [selectedTab, setSelectedTab] = useState<'배경' | '꽃' | '가구'>('배경');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [flowers, setFlowers] = useState<{ x: number; y: number }[]>([]);
  const [furniture, setFurniture] = useState<{ x: number; y: number }[]>([]);
  const [selectedFlowerReady, setSelectedFlowerReady] = useState(false);

  const handleSelectItem = (index: number) => {
    if (selectedTab === '배경') {
      setBackgroundIndex(index % backgroundImages.length);
    } else if (selectedTab === '가구') {
      setFurniture([...furniture, { x: 60 + index * 50, y: 400 }]);
    } else if (selectedTab === '꽃') {
      setSelectedFlowerReady(true);
    }
  };

  const handleTouch = (event: any) => {
    if (selectedTab === '꽃' && selectedFlowerReady) {
      const { locationX, locationY } = event.nativeEvent;
      setFlowers([...flowers, { x: locationX - 30, y: locationY - 30 }]);
      setSelectedFlowerReady(false);
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
        source={backgroundImages[backgroundIndex]}
        style={styles.backgroundImage}
        imageStyle={{
          width: scaledWidth,
          height: scaledHeight,
          marginLeft: (Dimensions.get('window').width - scaledWidth) / 2,
        }}
        resizeMode="cover"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTouch}>
          {flowers.map((item, index) => (
            <View
              key={`flower-${index}`}
              style={[styles.objectBox, { left: item.x, top: item.y }]}
            />
          ))}
          {furniture.map((item, index) => (
            <View
              key={`furniture-${index}`}
              style={[styles.furnitureBox, { left: item.x, top: item.y }]}
            />
          ))}
        </Pressable>
      </ImageBackground>

      {/* 🔁 홈으로 가기 버튼 (이미지 버튼으로 대체) */}
      <View style={styles.topButtonRight}>
        <TouchableOpacity onPress={handleReturn}>
          <Image source={ModifiedButton} style={styles.modifiedImageButton} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* 💾 저장하기 버튼 (텍스트 버튼) */}
      {isRoomOnly === 'true' && (
        <View style={styles.saveButtonFixed}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ⬇ 하단 탭 오버레이 */}
      <View style={styles.overlay}>
        <View style={styles.tabContainer}>
          {['배경', '꽃', '가구'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => {
                setSelectedTab(tab as any);
                setSelectedFlowerReady(false);
              }}
            >
              <Text style={selectedTab === tab ? styles.activeText : styles.inactiveText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal contentContainerStyle={styles.itemScrollContainer}>
          {[0, 1, 2, 3, 4].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => handleSelectItem(index)}>
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
  objectBox: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
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
  topButtonRight: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 10,
  },
  modifiedImageButton: {
    width: 40,
    height: 40,
  },
  saveButtonFixed: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 10,
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
