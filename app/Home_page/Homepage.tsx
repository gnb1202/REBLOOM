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

import BasicHomepage from '../../assets/images/HomeBackgroundImages/BasicHomepage.png';
import Blue1 from '../../assets/images/HomeBackgroundImages/blue_1.jpg';
import Blue2 from '../../assets/images/HomeBackgroundImages/blue_2.jpg';
import Green1 from '../../assets/images/HomeBackgroundImages/green_1.jpg';
import Green2 from '../../assets/images/HomeBackgroundImages/green_2.jpg';
import Pink1 from '../../assets/images/HomeBackgroundImages/pink_1.jpg';
import Pink2 from '../../assets/images/HomeBackgroundImages/pink_2.jpg';

import mailbox_A_black from '../../assets/images/furnitures/mailbox/mailbox_A_black.png';
import mailbox_A_blackwhite from '../../assets/images/furnitures/mailbox/mailbox_A_blackwhite.png';
import mailbox_A_white from '../../assets/images/furnitures/mailbox/mailbox_A_white.png';
import signboard from '../../assets/images/furnitures/signboard/Standingboard.png';
import ProfileCard from '../../components/ProfileCard';
import ProfileModal from '../../components/ProfileModal';

import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';

import daisy from '../../assets/images/flowers/Display/daisy_display.png';
import freesia from '../../assets/images/flowers/Display/freesia_display.png';
import hydrangea from '../../assets/images/flowers/Display/hydrangea_display.png';
import lavender from '../../assets/images/flowers/Display/lavender_display.png';
import lily from '../../assets/images/flowers/Display/lily_display.png';
import rose from '../../assets/images/flowers/Display/rose_display.png';
import sunflower from '../../assets/images/flowers/Display/sunflower_display.png';
import tulip from '../../assets/images/flowers/Display/tulip_display.png';

import sparkleGif from '../../assets/images/decoration/DecorationBackgroundSparkle.gif';
import deco1Gif from '../../assets/images/decoration/DecorationBackground1.gif';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;

const furnitureList = [
  { id: 'mailbox_A_black', overlay: mailbox_A_black, style: { width: 120, height: 120 } },
  { id: 'mailbox_A_blackwhite', overlay: mailbox_A_blackwhite, style: { width: 120, height: 120 } },
  { id: 'mailbox_A_white', overlay: mailbox_A_white, style: { width: 120, height: 120 } },
  { id: 'signboard', overlay: signboard, style: { width: 160, height: 140 } },
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

const decorationList = [
  { id: 'DecorationBackgroundSparkle', image: sparkleGif },
  { id: 'DecorationBackground1', image: deco1Gif },
];

const backgroundMap: { [key: string]: any } = {
  default: BasicHomepage,
  blue_1: Blue1,
  blue_2: Blue2,
  green_1: Green1,
  green_2: Green2,
  pink_1: Pink1,
  pink_2: Pink2,
};

export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean }) {
  const router = useRouter();
  const imageZoomRef = useRef<any>(null);
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
    selectedDecoration,
  } = useProgress();

  console.log('[Homepage] isLoaded:', isLoaded);
  console.log('[Homepage] selectedRoom:', selectedRoom);
  console.log('[Homepage] selectedDecoration:', selectedDecoration);

  useEffect(() => {
    console.log('[Homepage] useEffect selectedRoom:', selectedRoom);
  }, [selectedRoom]);

  useEffect(() => {
    if (isLoaded) {
      console.log('[Homepage] isLoaded:', isLoaded);
      console.log('[Homepage] selectedRoom:', selectedRoom);
      console.log('[Homepage] selectedDecoration:', selectedDecoration);
      console.log('[Homepage] placedFurniture:', placedFurniture);
      console.log('[Homepage] placedFlowers:', placedFlowers);
    }
  }, [isLoaded, selectedRoom, selectedDecoration, placedFurniture, placedFlowers]);

  const { userProfile } = useAuth();

  const minScale = dimensions.height / ORIGINAL_HEIGHT;
  const imageScaledWidth = ORIGINAL_WIDTH * minScale;
  const imageScaledHeight = ORIGINAL_HEIGHT * minScale;

  // ---- 로그용 useEffect ----
  useEffect(() => {
    console.log('isLoaded changed:', isLoaded);
  }, [isLoaded]);
  useEffect(() => {
    console.log('selectedRoom changed:', selectedRoom);
  }, [selectedRoom]);
  useEffect(() => {
    console.log('selectedDecoration changed:', selectedDecoration);
  }, [selectedDecoration]);
  useEffect(() => {
    console.log('placedFurniture changed:', placedFurniture);
  }, [placedFurniture]);
  useEffect(() => {
    console.log('placedFlowers changed:', placedFlowers);
  }, [placedFlowers]);
  useEffect(() => {
    console.log('dimensions changed:', dimensions);
  }, [dimensions]);
  // ----

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
    imageZoomRef.current?.centerOn?.({
      x: -offsetX,
      y: -offsetY,
      scale: minScale,
      duration: 0,
    });
  };

  // [핵심] selectedRoom이 isLoaded 후에만 backgroundMap 사용
  let roomBgKey = 'default';
  if (isLoaded && selectedRoom && backgroundMap[selectedRoom]) {
    roomBgKey = selectedRoom;
  }
  const backgroundImage = backgroundMap[roomBgKey];

  // ---- 렌더링 직전 상태 로그 ----
  console.log('Homepage Render', {
    isLoaded,
    selectedRoom,
    selectedDecoration,
    roomBgKey,
    backgroundImage,
    placedFurniture,
    placedFlowers,
  });

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
        key={`room-${placedFurniture?.length ?? 0}-${placedFlowers?.length ?? 0}-${roomBgKey}-${selectedDecoration || ''}`}
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
        {/* 배경 */}
        <Image
          source={backgroundImage}
          style={{ width: imageScaledWidth, height: imageScaledHeight }}
          resizeMode="cover"
        />

        {/* 데코레이션 오버레이 */}
        {selectedDecoration && (() => {
          const decoData = decorationList.find(d => d.id === selectedDecoration);
          return decoData ? (
            <Image
              source={decoData.image}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: imageScaledWidth,
                height: imageScaledHeight,
                zIndex: 5,
                pointerEvents: 'none',
              }}
              resizeMode="cover"
            />
          ) : null;
        })()}

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
        {(placedFurniture || []).map((item, index) => {
          const data = furnitureList.find(f => f.id === item?.id);
          if (!data || !item) return null;
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
        {(placedFlowers || []).map((item, index) => {
          const flowerData = flowerList.find(f => f.id === item?.id);
          if (!flowerData || !item) return null;
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
              <Text style={styles.menuItem}>Health Check</Text>
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

      {!isRoomOnly && isLoaded && (
        <>
          <View style={styles.profileCardContainer}>
            {userProfile && (
              <ProfileCard onPress={() => setShowProfileModal(true)} />
            )}
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
