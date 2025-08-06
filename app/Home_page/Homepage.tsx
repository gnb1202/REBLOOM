import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

import DiaryCheckPage from '../Mark/Check/DiaryCheckPage';
import QuestPage from '../Mark/Quest/QuestPage';
import ShopPage from '../Mark/Shop/ShopPage';

import Background1 from '../../assets/images/HomeBackgroundImages/Backgroundlevel1.png';
import Background2 from '../../assets/images/HomeBackgroundImages/Backgroundlevel2.png';
import BaseBackground from '../../assets/images/HomeBackgroundImages/BasicHomepage.png';

import ChairIcon from '../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../assets/images/furnitures/yellowstand.png';
import ProfileCard from '../../components/ProfileCard';
import ProfileModal from '../../components/ProfileModal';
import { useProgress } from '../../context/ProgressContext';

// 🌸 꽃 이미지 import
import daisy from '../../assets/images/flowers/Display/daisy_display.png';
import freesia from '../../assets/images/flowers/Display/freesia_display.png';
import hydrangea from '../../assets/images/flowers/Display/hydrangea_display.png';
import lavender from '../../assets/images/flowers/Display/lavender_display.png';
import lily from '../../assets/images/flowers/Display/lily_display.png';
import rose from '../../assets/images/flowers/Display/rose_display.png';
import sunflower from '../../assets/images/flowers/Display/sunflower_display.png';
import tulip from '../../assets/images/flowers/Display/tulip_display.png';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;

const furnitureList = [
  { id: 'whiteroundchair', overlay: ChairIcon, style: { width: 150, height: 150 } },
  { id: 'yellowstand', overlay: StandIcon, style: { width: 200, height: 250 } },
];

const flowerList = [
  { id: 'daisy', image: daisy },
  { id: 'hydrangea', image: hydrangea },
  { id: 'lavender', image: lavender },
  { id: 'lily', image: lily },
  { id: 'rose', image: rose },
  { id: 'sunflower', image: sunflower },
  { id: 'freesia', image: freesia },
  { id: 'tulip', image: tulip },
];

const backgroundMap: { [key: string]: any } = {
  room1: Background1,
  room2: Background2,
};

export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean }) {
  const router = useRouter();
  const imageZoomRef = useRef(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [showQuest, setShowQuest] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const {
    isLoaded,
    placedFurniture,
    placedFlowers,
    setPlacedFurniture,
    selectedRoom,
  } = useProgress();

  const minScale = dimensions.height / ORIGINAL_HEIGHT;
  const imageScaledWidth = ORIGINAL_WIDTH * minScale;
  const imageScaledHeight = ORIGINAL_HEIGHT * minScale;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setTimeout(centerImage, 100);
    });
    return () => subscription?.remove?.();
  }, []);

  const centerImage = () => {
    const offsetX = (imageScaledWidth - dimensions.width) / 2;
    const offsetY = (imageScaledHeight - dimensions.height) / 2;

    imageZoomRef.current?.centerOn({
      x: -offsetX,
      y: -offsetY,
      scale: minScale,
      duration: 0,
    });
  };

  const handlePlaceFurniture = (id: string, x: number, y: number) => {
    const alreadyPlaced = placedFurniture.some(item => item.id === id);
    if (alreadyPlaced) {
      Alert.alert('Already Placed', 'This furniture is already placed in the room.');
      return;
    }
    const newItem = { id, x, y };
    setPlacedFurniture([...placedFurniture, newItem]);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7BEE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageZoom
        key={JSON.stringify({ placedFurniture, placedFlowers })}
        ref={imageZoomRef}
        cropWidth={dimensions.width}
        cropHeight={dimensions.height}
        imageWidth={imageScaledWidth}
        imageHeight={imageScaledHeight}
        panToMove={true}
        pinchToZoom={false}
        doubleClickZoom={false}
        enableCenterFocus={false}
        minScale={minScale}
        maxScale={minScale}
        useNativeDriver={true}
        onLayout={() => {
          if (!layoutReady) {
            setLayoutReady(true);
            setTimeout(centerImage, 100);
          }
        }}
      >
        <Image
          source={backgroundMap[selectedRoom] || BaseBackground}
          style={{ width: imageScaledWidth, height: imageScaledHeight }}
          resizeMode="cover"
        />

        {/* 문 클릭 → 이동 */}
        <TouchableOpacity
          onPress={() => router.push('/Home_page/TravelLoadingPage')}
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.06,
            top: imageScaledHeight * 0.49,
            width: imageScaledWidth * 0.13,
            height: imageScaledHeight * 0.28,
            zIndex: 5,
          }}
        >
          <View style={{ flex: 1 }} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/Home_page/ExerciseLoadingPage')}
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.81,
            top: imageScaledHeight * 0.49,
            width: imageScaledWidth * 0.13,
            height: imageScaledHeight * 0.28,
            zIndex: 5,
          }}
        >
          <View style={{ flex: 1 }} />
        </TouchableOpacity>

        {/* 가구 */}
        {placedFurniture.map((item, index) => {
          const data = furnitureList.find(f => f.id === item.id);
          if (!data) return null;
          return (
            <Image
              key={`furniture-${index}`}
              source={data.overlay}
              style={[{ position: 'absolute', left: item.x, top: item.y }, data.style]}
              resizeMode="contain"
            />
          );
        })}

        {/* 꽃 */}
        {placedFlowers.map((item, index) => {
          const flowerData = flowerList.find(f => f.id === item.id);
          if (!flowerData) return null;
          return (
            <Image
              key={`flower-${index}`}
              source={flowerData.image}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: 60,
                height: 60,
              }}
              resizeMode="contain"
            />
          );
        })}
      </ImageZoom>

      {/* 메뉴 버튼 */}
      <View style={styles.rightCircleWrapper}>
        <TouchableOpacity onPress={() => setShowDropdown(true)}>
          <Image
            source={require('../../assets/images/Modifiy/modifiedbutton.png')}
            style={styles.modifiedImageButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 모달 드롭다운 메뉴 */}
      <Modal
        transparent
        animationType="fade"
        visible={showDropdown}
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenuModal}>
            <TouchableOpacity onPress={() => { setShowDropdown(false); setShowShop(true); }}>
              <Text style={styles.menuItem}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); setShowQuest(true); }}>
              <Text style={styles.menuItem}>Quest</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); setShowDiary(true); }}>
              <Text style={styles.menuItem}>Diary Check</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/Home_page/Roommodified/roommodified'); }}>
              <Text style={styles.menuItem}>Room Modify</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowDropdown(false); router.push('/Menu/Menupage'); }}>
              <Text style={styles.menuItem}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {!isRoomOnly && (
        <>
          <View style={styles.profileCardContainer}>
            <ProfileCard onPress={() => setShowProfileModal(true)} />
          </View>

          {showQuest && <View style={styles.overlayPartial}><QuestPage /></View>}
          {showShop && <View style={styles.overlayPartial}><ShopPage /></View>}
          {showDiary && <View style={styles.overlayPartial}><DiaryCheckPage /></View>}

          <ProfileModal
            visible={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.bottomButton} onPress={() => router.push('/Home_page/TravelLoadingPage')}>
              <Text style={styles.bottomButtonText}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton} onPress={() => router.push('/Exercise/ExerciseListPage')}>
              <Text style={styles.bottomButtonText}>Exercise</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCardContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 10,
  },
  rightCircleWrapper: { position: 'absolute', right: 20, top: 100, zIndex: 10 },
  overlayPartial: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '94%',
    backgroundColor: '#FFFFFFEE', zIndex: 100, paddingTop: 60,
  },
  modifiedImageButton: { width: 40, height: 40 },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 10,
  },
  bottomButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomButtonText: {
    color: '#5C7BEE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdownMenuModal: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
});
