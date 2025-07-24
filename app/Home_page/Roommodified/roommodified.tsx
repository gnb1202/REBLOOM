import React, { useEffect, useState } from 'react';
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
import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';
import ChairIcon from '../../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../../assets/images/furnitures/yellowstand.png';

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

const furnitureList = [
  { id: 'whiteroundchair', icon: ChairIcon },
  { id: 'yellowstand', icon: StandIcon },
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
  const [furnitureItems, setFurnitureItems] = useState<{ x: number; y: number; id: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<null | string>(null);

  const {
    obtainedFlowers,
    obtainedFurniture,
    placedFlowers,
    placedFurniture,
    setPlacedFlowers,
    setPlacedFurniture,
  } = useProgress();

  useEffect(() => {
    setFlowers(placedFlowers);
    setFurnitureItems(placedFurniture);
  }, []);

  const handleReturn = () => {
    router.push('/Home_page/Homepage');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    if (selectedTab === '꽃' && selectedItemId && obtainedFlowers.includes(selectedItemId)) {
      setFlowers([...flowers, { x: locationX - 30, y: locationY - 30, id: selectedItemId }]);
      setSelectedItemId(null);
    }

    if (selectedTab === '가구' && selectedItemId && obtainedFurniture.includes(selectedItemId)) {
      setFurnitureItems([...furnitureItems, { x: locationX - 30, y: locationY - 30, id: selectedItemId }]);
      setSelectedItemId(null);
    }
  };

  const handleSave = async () => {
    await setPlacedFlowers(flowers);
    await setPlacedFurniture(furnitureItems);
    Alert.alert('저장되었습니다!');
    router.push('/Home_page/Homepage');
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
          <Pressable style={StyleSheet.absoluteFill} onPress={handleTouch}>
            {flowers.map((item, index) => {
              const flowerData = flowerList.find(f => f.id === item.id);
              if (!flowerData) return null;
              return (
                <TouchableOpacity
                  key={`flower-${index}`}
                  onLongPress={() => {
                    const updated = [...flowers];
                    updated.splice(index, 1);
                    setFlowers(updated);
                  }}
                  style={[styles.placedImage, { left: item.x, top: item.y }]}
                >
                  <Image source={flowerData.image} style={{ width: 60, height: 60 }} />
                </TouchableOpacity>
              );
            })}

            {furnitureItems.map((item, index) => {
              const furnitureData = furnitureList.find(f => f.id === item.id);
              if (!furnitureData) return null;
              return (
                <TouchableOpacity
                  key={`furniture-${index}`}
                  onLongPress={() => {
                    const updated = [...furnitureItems];
                    updated.splice(index, 1);
                    setFurnitureItems(updated);
                  }}
                  style={[styles.placedImage, { left: item.x, top: item.y }]}
                >
                  <Image source={furnitureData.icon} style={{ width: 60, height: 60 }} />
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </ImageBackground>
      </ScrollView>

      <View style={styles.topRightContainer}>
        <TouchableOpacity onPress={handleReturn}>
          <Image source={ModifiedButton} style={styles.modifiedImageButton} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.tabContainer}>
          {['배경', '꽃', '가구'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => {
                setSelectedTab(tab as any);
                setSelectedItemId(null);
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
                  <Image source={item.icon} style={styles.itemImage} />
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
