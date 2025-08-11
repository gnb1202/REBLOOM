import { OpenSans_700Bold_Italic, useFonts } from '@expo-google-fonts/open-sans';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

import deco1Gif from '../../assets/images/decoration/DecorationBackground1.gif';
import sparkleGif from '../../assets/images/decoration/DecorationBackgroundSparkle.gif';

// 🔽 화단
import flowerbed from '../../assets/images/flowerbed/flowerbed.png';

// 🔽 추가: Exercise 버튼 이미지(요청 경로)
import ExerciseButton from '../../assets/images/entrybutton/ExerciseButton.png';
import ExploreButton from '../../assets/images/entrybutton/ExploreButton.png';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;

const furnitureList = [
  { id: 'mailbox_A_black', overlay: mailbox_A_black, style: { width: 150, height: 300 } },
  { id: 'mailbox_A_blackwhite', overlay: mailbox_A_blackwhite, style: { width: 200, height: 400 } },
  { id: 'mailbox_A_white', overlay: mailbox_A_white, style: { width: 200, height: 400 } },
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

// 🔧 화단 클릭(hit) 영역 축소 비율
const FLOWERBED_HIT_INSET_X = 0.24;
const FLOWERBED_HIT_INSET_Y = 0.40;

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
  const [hasNewHealthCheck, setHasNewHealthCheck] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [fontsLoaded] = useFonts({
    OpenSans_700Bold_Italic,
  });

  const {
    isLoaded,
    placedFurniture,
    placedFlowers,
    selectedRoom,
    selectedDecoration,
  } = useProgress();

  const { user, userProfile } = useAuth();

  const minScale = dimensions.height / ORIGINAL_HEIGHT;
  const imageScaledWidth = ORIGINAL_WIDTH * minScale;
  const imageScaledHeight = ORIGINAL_HEIGHT * minScale;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setTimeout(centerImage, 100);
    });
    checkHealthCheckStatus();
    checkAutoShowHealthCheck();
    loadShopLikeData();
    return () => subscription?.remove?.();
  }, [user]);

  const checkHealthCheckStatus = async () => {
    try {
      if (!user) return;
      
      const { getTodayHealthCheck } = await import('../../firebase.config');
      const todayCheck = await getTodayHealthCheck(user.uid);
      if (!todayCheck) {
        setHasNewHealthCheck(true);
      }
    } catch (error) {
      console.error('Failed to check health status:', error);
    }
  };

  const checkAutoShowHealthCheck = async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();
      
      const lastShownDate = await AsyncStorage.getItem('healthCheckLastShown');
      const doLaterTime = await AsyncStorage.getItem('healthCheckDoLater');
      
      // Check if it's after 06:00 and haven't shown today
      if (currentHour >= 6 && lastShownDate !== today) {
        // Check if user didn't select "Do Later" recently (within last 2 hours)
        if (doLaterTime) {
          const doLaterDate = new Date(doLaterTime);
          const hoursSinceDoLater = (now.getTime() - doLaterDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceDoLater < 2) return; // Don't auto-show if clicked Do Later within 2 hours
        }
        
        await AsyncStorage.setItem('healthCheckLastShown', today);
        // Auto-navigate to health check
        setTimeout(() => {
          router.push('/Mark/Check/DiaryCheckPage');
        }, 1500); // Small delay to let homepage load first
      }
    } catch (error) {
      console.error('Failed to check auto-show:', error);
    }
  };

  const loadShopLikeData = async () => {
    try {
      if (!user) return;
      
      const { getShopLikeData } = await import('../../firebase.config');
      const likeData = await getShopLikeData(user.uid, user.uid);
      
      setLikeCount(likeData.likeCount);
      setIsLiked(likeData.isLiked);
    } catch (error) {
      console.error('Failed to load shop like data:', error);
    }
  };

  const handleLikePress = async () => {
    try {
      if (!user) return;
      
      const newIsLiked = !isLiked;
      
      // Update UI immediately for responsiveness
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      
      // Update Firebase
      const { updateShopLike } = await import('../../firebase.config');
      const result = await updateShopLike(user.uid, user.uid, newIsLiked);
      
      // Update with actual values from Firebase
      setLikeCount(result.likeCount);
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error('Failed to update shop like:', error);
      // Revert on error
      setIsLiked(isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

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

  // 화단 위치/크기 (요청 비율)
  const getFlowerbedRect = (W: number, H: number) => {
    const width = W * 0.42;
    const height = H * 0.35;
    const left = W * 0.50;
    const top = H * 1.009 - height;
    return { left, top, width, height };
  };

  let roomBgKey = 'default';
  if (isLoaded && selectedRoom && backgroundMap[selectedRoom]) {
    roomBgKey = selectedRoom;
  }
  const backgroundImage = backgroundMap[roomBgKey];

  if (!isLoaded || !fontsLoaded) {
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
        panToMove
        pinchToZoom={false}
        doubleClickZoom={false}
        enableCenterFocus={false}
        minScale={minScale}
        maxScale={minScale}
        useNativeDriver
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

        {/* 데코레이션 */}
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

        {/* 🔽 화단: 이미지 + 축소된 클릭(hit) 레이어 */}
        {(() => {
          const rect = getFlowerbedRect(imageScaledWidth, imageScaledHeight);

          // 클릭 레이어 크기 계산
          const hitW = rect.width * (1 - 2 * FLOWERBED_HIT_INSET_X);
          const hitH = rect.height * (1 - FLOWERBED_HIT_INSET_Y);
          const hitLeft = rect.left + rect.width * FLOWERBED_HIT_INSET_X;
          const hitTop = rect.top + rect.height * FLOWERBED_HIT_INSET_Y;

          return (
            <>
              {/* 화단 이미지 (포인터 비활성화) */}
              <Image
                source={flowerbed}
                style={{
                  position: 'absolute',
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  zIndex: 6,
                  pointerEvents: 'none',
                }}
                resizeMode="contain"
              />
              {/* 축소된 클릭(hit) 영역 */}
              <TouchableOpacity
                onPress={() => router.push('/Menu/Flowermanage')}
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  left: hitLeft,
                  top: hitTop,
                  width: hitW,
                  height: hitH,
                  zIndex: 7,
                }}
              />
            </>
          );
        })()}

        <TouchableOpacity
          onPress={() => router.push('/Home_page/TravelLoadingPage')}
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.0225, // 왼쪽 끝 근처
            top: imageScaledHeight * 0.35, // 문 위쪽
            width: imageScaledWidth * 0.135,
            height: imageScaledHeight * 0.15,
            zIndex: 8,
          }}
        >
          <Image
            source={ExploreButton}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 🔽 Exercise 버튼 - 오른쪽 문 위에 표시 (눌러서 이동) */}
        <TouchableOpacity
          onPress={() => router.push('/Exercise/ExerciseListPage')}
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.845, // 오른쪽 끝 근처
            top: imageScaledHeight * 0.365, // 상단 가까이
            width: imageScaledWidth * 0.135, // 기존보다 크게
            height: imageScaledHeight * 0.15,
            zIndex: 8,
          }}
        >
          <Image
            source={ExerciseButton}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 왼쪽 문 클릭 - 탐험 (기존 투명 영역) */}
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

        {/* 오른쪽 문 클릭 - 운동 (기존 투명 영역) */}
        <TouchableOpacity
          onPress={() => router.push('/Exercise/ExerciseListPage')}
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

          if (item.id.startsWith('mailbox_')) {
            return (
              <TouchableOpacity
                key={`furniture-${index}`}
                onPress={() => router.push('/Menu/Menupage')}
                style={{ position: 'absolute', left: item.x, top: item.y }}
                activeOpacity={0.8}
              >
                <Image source={data.overlay} style={data.style} resizeMode="contain" />
              </TouchableOpacity>
            );
          }

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
                width: 150,
                height: 150,
              }}
              resizeMode="contain"
            />
          );
        })}

        {/* 간판 텍스트 */}
        <Text
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.25,
            top: imageScaledHeight * 0.05,
            fontSize: 54,
            fontFamily: 'OpenSans_700Bold_Italic',
            color: '#4A4A4A',
            textAlign: 'center',
            width: imageScaledWidth * 0.5,
            zIndex: 10,
          }}
        >
          {userProfile?.nickname || userProfile?.profile?.nickname || 'Guest'}'s Flower Shop
        </Text>

        {/* 좋아요 버튼 */}
        <TouchableOpacity
          onPress={handleLikePress}
          style={{
            position: 'absolute',
            left: imageScaledWidth * 0.76 - 50,
            top: imageScaledHeight * 0.055 + 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 4 }}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4A4A4A' }}>
            {likeCount}
          </Text>
        </TouchableOpacity>
      </ImageZoom>

      {/* 메뉴 버튼 */}
<View style={styles.leftButtonContainer}>
  <TouchableOpacity onPress={() => router.push('/Home_page/HelpPage')} style={styles.button}>
    <Text style={styles.buttonText}>?</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    onPress={() => router.push('/Mark/Check/DiaryCheckPage')} 
    style={[styles.button, styles.healthButton]}
  >
    <Text style={styles.buttonText}>Health Check</Text>
    {hasNewHealthCheck && (
      <View style={styles.notificationDot} />
    )}
  </TouchableOpacity>
</View>

<View style={styles.rightButtonContainer}>
  <TouchableOpacity onPress={() => router.push('/Home_page/Roommodified/roommodified')} style={styles.button}>
    <Text style={styles.buttonText}>Room Modify</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => router.push('/Mark/Shop/ShopPage')} style={styles.button}>
    <Text style={styles.buttonText}>Shop</Text>
  </TouchableOpacity>
</View>

      {/* 드롭다운 */}
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

  // ⬇️ 새로 추가: 왼쪽 상단( ? 버튼 )
leftButtonContainer: {
  position: 'absolute',
  top: 40,
  left: '14%', // ← px 대신 % 사용
  zIndex: 10,
  flexDirection: 'row',
  gap: 10,
},

// ⬇️ 오른쪽 상단( Room Modify / Shop )
rightButtonContainer: {
  position: 'absolute',
  top: 40,
  right: '13%', // ← px 대신 % 사용
  zIndex: 10,
  flexDirection: 'row',
  gap: 10,
},

  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  healthButton: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  overlayPartial: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '94%',
    backgroundColor: '#FFFFFFEE',
    zIndex: 100,
    paddingTop: 60,
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
