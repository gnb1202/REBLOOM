import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import BaseBackground from '../../assets/images/HomeBackgroundImages/FirstBaseBackground.png';

import ChairIcon from '../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../assets/images/furnitures/yellowstand.png';
import ProfileCard from '../../components/ProfileCard';
import ProfileModal from '../../components/ProfileModal';
import { useProgress } from '../../context/ProgressContext';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;

const furnitureList = [
  { id: 'whiteroundchair', overlay: ChairIcon, style: { width: 150, height: 150 } },
  { id: 'yellowstand', overlay: StandIcon, style: { width: 200, height: 250 } },
];

const backgroundMap: { [key: string]: any } = {
  room1: Background1,
  room2: Background2,
};

export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean }) {
  const router = useRouter();
  const imageZoomRef = useRef(null);
  const [layoutReady, setLayoutReady] = useState(false);
  // 출석체크 state 제거
  const [showQuest, setShowQuest] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const {
    isLoaded,
    placedFurniture,
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

  // 오버레이 관리 함수
  const openOnlyOneOverlay = (target: 'quest' | 'shop' | 'diary') => {
    setShowQuest(target === 'quest');
    setShowShop(target === 'shop');
    setShowDiary(target === 'diary');
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
        key={JSON.stringify(placedFurniture)}
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
      </ImageZoom>

      <View style={styles.rightCircleWrapper}>
        <TouchableOpacity
          onPress={() =>
            isRoomOnly
              ? router.replace('/Home_page/Homepage')
              : router.push('/Home_page/Roommodified/roommodified')
          }
        >
          <Image
            source={require('../../assets/images/Modifiy/modifiedbutton.png')}
            style={styles.modifiedImageButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {!isRoomOnly && (
        <>
          {/* 프로필 카드 */}
          <View style={styles.profileCardContainer}>
            <ProfileCard onPress={() => setShowProfileModal(true)} />
          </View>

          <View style={styles.indicatorContainer}>
            {/* 건강 체크 버튼 */}
            <TouchableOpacity onPress={() => openOnlyOneOverlay('diary')}>
              <View style={styles.healthCheckDot}>
                <Text style={styles.healthCheckText}>💊</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => openOnlyOneOverlay('shop')}>
              <View style={styles.shopDot}>
                <Image
                  source={require('../../assets/images/Shop/Shopmark.png')}
                  style={styles.shopIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => openOnlyOneOverlay('quest')}>
              <View style={styles.questDot}>
                <Image
                  source={require('../../assets/images/Quest/Questmark.png')}
                  style={styles.questIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => router.push('/Travel/TravelListPage')}>
              <Text style={styles.bottomText}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Menu/Menupage')}>
              <Text style={styles.bottomText}>Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Exercise/Explain')}>
              <Text style={styles.bottomText}>Exercise</Text>
            </TouchableOpacity>
          </View>

          {showQuest && <View style={styles.overlayPartial}><QuestPage /></View>}
          {showShop && <View style={styles.overlayPartial}><ShopPage /></View>}
          {showDiary && <View style={styles.overlayPartial}><DiaryCheckPage /></View>}
          
          {/* 프로필 모달 */}
          <ProfileModal 
            visible={showProfileModal} 
            onClose={() => setShowProfileModal(false)} 
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCardContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 10,
  },
  rightCircleWrapper: { position: 'absolute', right: 20, top: 100, zIndex: 10 },
  indicatorContainer: {
    position: 'absolute', bottom: 60, left: 20, flexDirection: 'row', gap: 16,
    zIndex: 20, alignItems: 'center',
  },
  healthCheckDot: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  healthCheckText: { fontSize: 16 },
  questDot: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
  },
  questIcon: { width: 30, height: 30 },
  shopDot: {
    width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
  },
  shopIcon: { width: 30, height: 30 },
  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#5C7BEE',
    flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, zIndex: 10,
  },
  bottomText: { color: '#fff', fontSize: 14 },
  overlayPartial: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '94%',
    backgroundColor: '#FFFFFFEE', zIndex: 100, paddingTop: 60,
  },
  modifiedImageButton: { width: 40, height: 40 },
});
