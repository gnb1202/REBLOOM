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

import BaseBackground from '../../../assets/images/HomeBackgroundImages/FirstBaseBackground.png';
import AddChair from '../../../assets/images/Roommodifiedimages/Addchair.png';
import AddStand from '../../../assets/images/Roommodifiedimages/Addstand.png';
import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';
import ChairIcon from '../../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../../assets/images/furnitures/yellowstand.png';

import daisy from '../../../assets/images/flowers/daisy/daisystep3.png';
// ... (다른 꽃 이미지 생략)

const flowerList = [
  { id: 'daisy', name: '데이지', image: daisy },
  // ... (다른 꽃들 추가)
];

const furnitureList = [
  { id: 'whiteroundchair', icon: ChairIcon, overlay: AddChair },
  { id: 'yellowstand', icon: StandIcon, overlay: AddStand },
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
  const [selectedFlowerReady, setSelectedFlowerReady] = useState<null | string>(null);
  const [tempFurniture, setTempFurniture] = useState<string[]>([]);

  const {
    obtainedFlowers,
    obtainedFurniture,
    setHasChair,
    setHasStand,
  } = useProgress();

  const handleSelectItem = (itemId: string) => {
    setSelectedFlowerReady(null); // reset flower
    if (selectedTab === '가구') {
      if (tempFurniture.includes(itemId)) {
        setTempFurniture(prev => prev.filter(id => id !== itemId));
      } else {
        setTempFurniture(prev => [...prev, itemId]);
      }
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
    setHasChair(tempFurniture.includes('whiteroundchair'));
    setHasStand(tempFurniture.includes('yellowstand'));
    Alert.alert('저장되었습니다!');
  };

  const handleReturn = () => {
    router.replace('/Home_page/Homepage');
  };

  return (
    <View style={styles.fullScreen}>
      <ScrollView
        horizontal
        contentContainerStyle={{ width: scaledWidth, height: scaledHeight }}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <ImageBackground
          source={BaseBackground}
          style={{ width: scaledWidth, height: scaledHeight }}
          resizeMode="cover"
        >
          {tempFurniture.includes('whiteroundchair') && (
            <Image source={AddChair} style={styles.overlayFurniture} resizeMode="contain" />
          )}
          {tempFurniture.includes('yellowstand') && (
            <Image source={AddStand} style={styles.overlayFurniture} resizeMode="contain" />
          )}

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
          </Pressable>
        </ImageBackground>
      </ScrollView>

      {/* 상단 버튼 */}
      <View style={styles.topRightContainer}>
        <TouchableOpacity onPress={handleReturn}>
          <Image source={ModifiedButton} style={styles.modifiedImageButton} />
        </TouchableOpacity>

        {isRoomOnly === 'true' && (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 하단 탭 + 아이템 */}
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

        <ScrollView horizontal contentContainerStyle={styles.itemScrollContainer}>
          {selectedTab === '꽃' &&
            flowerList
              .filter(f => obtainedFlowers.includes(f.id))
              .map((flower) => (
                <TouchableOpacity key={flower.id} onPress={() => handleSelectItem(flower.id)}>
                  <Image source={flower.image} style={styles.itemImage} />
                </TouchableOpacity>
              ))}

          {selectedTab === '가구' &&
            furnitureList
              .filter(f => obtainedFurniture.includes(f.id))
              .map(item => (
                <TouchableOpacity key={item.id} onPress={() => handleSelectItem(item.id)}>
                  <Image
                    source={item.icon}
                    style={[
                      styles.itemImage,
                      tempFurniture.includes(item.id) && { borderWidth: 2, borderColor: '#5C7BEE' },
                    ]}
                  />
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#fff' },
  placedImage: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  overlayFurniture: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  topRightContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    alignItems: 'center',
    gap: 10,
  },
  modifiedImageButton: {
    width: 40,
    height: 40,
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    minHeight: 80,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
    borderRadius: 8,
  },
});
