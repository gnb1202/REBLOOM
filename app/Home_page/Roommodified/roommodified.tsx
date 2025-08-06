import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProgress } from '../../../context/ProgressContext';
import ToastMessage from '../../../components/ToastMessage';

import Background1 from '../../../assets/images/HomeBackgroundImages/Backgroundlevel1.png';
import Background2 from '../../../assets/images/HomeBackgroundImages/Backgroundlevel2.png';
import BaseBackground from '../../../assets/images/HomeBackgroundImages/BasicHomepage.png';

import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';
import ChairIcon from '../../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../../assets/images/furnitures/yellowstand.png';
import mailbox_A_black from '../../../assets/images/furnitures/mailbox/mailbox_A_black.png';
import mailbox_A_blackwhite from '../../../assets/images/furnitures/mailbox/mailbox_A_blackwhite.png';
import mailbox_A_white from '../../../assets/images/furnitures/mailbox/mailbox_A_white.png';
import signboard from '../../../assets/images/furnitures/signboard/Standingboard.png';

import daisy from '../../../assets/images/flowers/Display/daisy_display.png';
import hydrangea from '../../../assets/images/flowers/Display/hydrangea_display.png';
import lavender from '../../../assets/images/flowers/Display/lavender_display.png';
import lily from '../../../assets/images/flowers/Display/lily_display.png';
import rose from '../../../assets/images/flowers/Display/rose_display.png';
import sunflower from '../../../assets/images/flowers/Display/sunflower_display.png';
import freesia from '../../../assets/images/flowers/Display/freesia_display.png';
import tulip from '../../../assets/images/flowers/Display/tulip_display.png';

const flowerList = [
  { id: 'daisy', name: 'daisy', image: daisy },
  { id: 'hydrangea', name: 'hydrangea', image: hydrangea },
  { id: 'lavender', name: 'lavender', image: lavender },
  { id: 'lily', name: 'lily', image: lily },
  { id: 'rose', name: 'rose', image: rose },
  { id: 'sunflower', name: 'sunflower', image: sunflower },
  { id: 'freesia', name: 'freesia', image: freesia },
  { id: 'tulip', name: 'tulip', image: tulip },
];

const furnitureList = [
  { id: 'whiteroundchair', icon: ChairIcon },
  { id: 'yellowstand', icon: StandIcon },
  { id: 'mailbox_A_black', icon: mailbox_A_black },
  { id: 'mailbox_A_blackwhite', icon: mailbox_A_blackwhite },
  { id: 'mailbox_A_white', icon: mailbox_A_white },
  { id: 'signboard', icon: signboard },
];

const roomList = [
  { id: 'default', image: BaseBackground },
  { id: 'room1', image: Background1 },
  { id: 'room2', image: Background2 },
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
  const [selectedTab, setSelectedTab] = useState<'Background' | 'Flower' | 'Furniture'>('Background');
  const [flowers, setFlowers] = useState<{ x: number; y: number; id: string }[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<{ x: number; y: number; id: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<null | string>(null);
  const [tempSelectedRoom, setTempSelectedRoom] = useState<string>('default');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const containerRef = useRef(null);

  const {
    obtainedFlowers,
    obtainedFurniture,
    obtainedRooms,
    selectedRoom,
    setSelectedRoom,
    placedFlowers,
    placedFurniture,
    setPlacedFlowers,
    setPlacedFurniture,
  } = useProgress();

  useEffect(() => {
    setFlowers(placedFlowers);
    setFurnitureItems(placedFurniture);
    setTempSelectedRoom(selectedRoom || 'default');
  }, [placedFlowers, placedFurniture, selectedRoom]);

  const handleReturn = () => {
    router.push('/Home_page/Homepage');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleTouch = (event: any) => {
    let x = 0, y = 0;

    if (event.nativeEvent.locationX !== undefined && event.nativeEvent.locationY !== undefined) {
      x = event.nativeEvent.locationX;
      y = event.nativeEvent.locationY;
    } else if (
      typeof window !== 'undefined' &&
      event.nativeEvent?.clientX !== undefined &&
      event.nativeEvent?.clientY !== undefined &&
      containerRef.current &&
      // @ts-ignore
      typeof containerRef.current.getBoundingClientRect === 'function'
    ) {
      // @ts-ignore
      const rect = containerRef.current.getBoundingClientRect();
      x = event.nativeEvent.clientX - rect.left;
      y = event.nativeEvent.clientY - rect.top;
    }

    const adjustedX = x - 30;
    const adjustedY = y - 30;

    if (selectedItemId) {
      if (selectedTab === 'Flower' && obtainedFlowers.includes(selectedItemId)) {
        const newFlowers = [...flowers, { x: adjustedX, y: adjustedY, id: selectedItemId }];
        setFlowers(newFlowers);
        setPlacedFlowers(newFlowers);
        setSelectedItemId(null);
      } else if (selectedTab === 'Furniture' && obtainedFurniture.includes(selectedItemId)) {
        const newFurniture = [...furnitureItems, { x: adjustedX, y: adjustedY, id: selectedItemId }];
        setFurnitureItems(newFurniture);
        setPlacedFurniture(newFurniture);
        setSelectedItemId(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      await setSelectedRoom(tempSelectedRoom);
      setToastMessage('저장 완료!');
      setToastType('success');
      setToastVisible(true);
      setTimeout(() => {
        router.push('/Home_page/Homepage');
      }, 2500);
    } catch (error) {
      setToastMessage('저장 실패!');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const backgroundImage = roomList.find(bg => bg.id === tempSelectedRoom)?.image || BaseBackground;

  return (
    <View style={styles.fullScreen}>
      <ScrollView
        horizontal
        contentContainerStyle={{ width: scaledWidth, height: scaledHeight }}
        showsHorizontalScrollIndicator={false}
        bounces={false}
      >
        <ImageBackground
          source={backgroundImage}
          style={{ width: scaledWidth, height: scaledHeight }}
          resizeMode="cover"
        >
          <Pressable
            ref={containerRef}
            style={StyleSheet.absoluteFill}
            onPress={handleTouch}
          >
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
                    setPlacedFlowers(updated);
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
                    setPlacedFurniture(updated);
                  }}
                  style={[styles.placedImage, { left: item.x, top: item.y }]}
                >
                  <Image source={furnitureData.icon} style={{ width: 120, height: 120 }} />
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
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.tabContainer}>
          {['Background', 'Flower', 'Furniture'].map((tab) => (
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
          {selectedTab === 'Background' &&
            roomList
              .filter(room => room.id === 'default' || obtainedRooms.includes(room.id))
              .map(room => (
                <TouchableOpacity key={room.id} onPress={() => setTempSelectedRoom(room.id)}>
                  <Image
                    source={room.image}
                    style={[
                      styles.itemImage,
                      tempSelectedRoom === room.id && { borderColor: '#5C7BEE', borderWidth: 2 },
                    ]}
                  />
                </TouchableOpacity>
              ))}

          {selectedTab === 'Flower' &&
            flowerList
              .filter(f => obtainedFlowers.includes(f.id))
              .map((flower) => (
                <TouchableOpacity key={flower.id} onPress={() => handleSelectItem(flower.id)}>
                  <Image source={flower.image} style={styles.itemImage} />
                </TouchableOpacity>
              ))}

          {selectedTab === 'Furniture' &&
            furnitureList
              .filter(f => obtainedFurniture.includes(f.id))
              .map(item => (
                <TouchableOpacity key={item.id} onPress={() => handleSelectItem(item.id)}>
                  <Image source={item.icon} style={styles.itemImage} />
                </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
      
      <ToastMessage
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
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
