import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../../../context/ProgressContext';
import ToastMessage from '../../../components/ToastMessage';

import BaseBackground from '../../../assets/images/HomeBackgroundImages/BasicHomepage.png';
import Blue1 from '../../../assets/images/HomeBackgroundImages/blue_1.jpg';
import Blue2 from '../../../assets/images/HomeBackgroundImages/blue_2.jpg';
import Green1 from '../../../assets/images/HomeBackgroundImages/green_1.jpg';
import Green2 from '../../../assets/images/HomeBackgroundImages/green_2.jpg';
import Pink1 from '../../../assets/images/HomeBackgroundImages/pink_1.jpg';
import Pink2 from '../../../assets/images/HomeBackgroundImages/pink_2.jpg';

import ModifiedButton from '../../../assets/images/Modifiy/modifiedbutton.png';
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

import sparkleGif from '../../../assets/images/decoration/DecorationBackgroundSparkle.gif';
import deco1Gif from '../../../assets/images/decoration/DecorationBackground1.gif';

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

// ✅ Homepage.tsx와 동일한 크기로 맞춤
const furnitureList = [
  { id: 'mailbox_A_black',      icon: mailbox_A_black,      style: { width: 150, height: 300 } },
  { id: 'mailbox_A_blackwhite', icon: mailbox_A_blackwhite, style: { width: 200, height: 400 } },
  { id: 'mailbox_A_white',      icon: mailbox_A_white,      style: { width: 200, height: 400 } },
  { id: 'signboard',            icon: signboard,            style: { width: 160, height: 140 } },
];

const roomList = [
  { id: 'default', image: BaseBackground },
  { id: 'blue_1', image: Blue1 },
  { id: 'blue_2', image: Blue2 },
  { id: 'green_1', image: Green1 },
  { id: 'green_2', image: Green2 },
  { id: 'pink_1', image: Pink1 },
  { id: 'pink_2', image: Pink2 },
];

const decorationList = [
  { id: 'DecorationBackgroundSparkle', name: 'Sparkle', image: sparkleGif },
  { id: 'DecorationBackground1', name: 'Decoration 1', image: deco1Gif },
];

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;
const screenHeight = Dimensions.get('window').height;
const minScale = screenHeight / ORIGINAL_HEIGHT;
const scaledWidth = ORIGINAL_WIDTH * minScale;
const scaledHeight = ORIGINAL_HEIGHT * minScale;

// ✅ 우체통 고정 좌표(Homepage와 동일 로직)
const getMailboxPosition = (imageW: number, imageH: number, boxW: number, boxH: number) => {
  const pillarCenterX = imageW * 0.395;
  const floorLineY = imageH * 0.855;
  const deltaX = -15;
  const deltaY = +100;

  return {
    left: pillarCenterX - boxW / 2 + deltaX,
    top: floorLineY - boxH + deltaY,
  };
};

export default function RoomModified() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'Background' | 'Flower' | 'Furniture' | 'Decoration'>('Background');
  const [flowers, setFlowers] = useState<{ x: number; y: number; id: string }[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<{ x: number; y: number; id: string }[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<null | string>(null);
  const [tempSelectedRoom, setTempSelectedRoom] = useState<string>('default');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isOverlayExpanded, setIsOverlayExpanded] = useState(true);

  const {
    obtainedFlowers,
    obtainedFurniture,
    obtainedRooms,
    obtainedDecorations,
    selectedRoom,
    setSelectedRoom,
    placedFlowers,
    placedFurniture,
    setPlacedFlowers,
    setPlacedFurniture,
    selectedDecoration,
    setSelectedDecoration,
  } = useProgress();
  const [tempSelectedDecoration, setTempSelectedDecoration] = useState<string | null>(selectedDecoration);

  const containerRef = useRef(null);

  useEffect(() => {
    setFlowers(placedFlowers);
    setFurnitureItems(placedFurniture);
    setTempSelectedRoom(selectedRoom || 'default');
    setTempSelectedDecoration(selectedDecoration ?? null);

    // 📌 mailbox 초기 위치 설정
    const mailbox = placedFurniture.find(f => f.id.startsWith('mailbox_'));
    if (mailbox && mailbox.x === 0 && mailbox.y === 0) {
      const fData = furnitureList.find(f => f.id === mailbox.id);
      if (fData) {
        const w = fData.style.width;
        const h = fData.style.height;
        const pos = getMailboxPosition(scaledWidth, scaledHeight, w, h);
        
        const updatedFurniture = placedFurniture.map(f => 
          f.id === mailbox.id ? { ...f, x: pos.left, y: pos.top } : f
        );
        setPlacedFurniture(updatedFurniture);
      }
    }
  }, [placedFlowers, placedFurniture, selectedRoom, selectedDecoration]);

  const handleReturn = () => {
    router.push('/Home_page/Homepage');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  // 터치로 꽃/가구 배치 (mailbox는 고정 좌표 + 실제 크기 사용)
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
        let placeX = adjustedX;
        let placeY = adjustedY;

        // 📌 mailbox 계열은 Homepage와 동일한 크기 사용 + 비율 고정 좌표
        if (selectedItemId.startsWith('mailbox_')) {
          const fData = furnitureList.find(f => f.id === selectedItemId);
          const w = fData?.style?.width ?? 120;
          const h = fData?.style?.height ?? 120;
          const pos = getMailboxPosition(scaledWidth, scaledHeight, w, h);
          placeX = pos.left;
          placeY = pos.top;

          // 기존 mailbox 찾아서 교체, 없으면 추가
          const existingMailboxIndex = furnitureItems.findIndex(item => item.id.startsWith('mailbox_'));
          let newFurniture;
          if (existingMailboxIndex > -1) {
            newFurniture = [...furnitureItems];
            newFurniture[existingMailboxIndex] = { x: placeX, y: placeY, id: selectedItemId };
          } else {
            newFurniture = [...furnitureItems, { x: placeX, y: placeY, id: selectedItemId }];
          }
          setFurnitureItems(newFurniture);
          setPlacedFurniture(newFurniture);

        } else {
          const newFurniture = [...furnitureItems, { x: placeX, y: placeY, id: selectedItemId }];
          setFurnitureItems(newFurniture);
          setPlacedFurniture(newFurniture);
        }
        setSelectedItemId(null);
      }
    }
  };

  const handleSave = async () => {
    try {
      await setSelectedRoom(tempSelectedRoom);
      await setSelectedDecoration(tempSelectedDecoration);
      setToastMessage('저장 완료!');
      setToastType('success');
      setToastVisible(true);
      setTimeout(() => {
        router.replace('/Home_page/Homepage');
      }, 2000);
    } catch (error) {
      setToastMessage('저장 실패!');
      setToastType('error');
      setToastVisible(true);
      console.error('[RoomModified] handleSave() ERROR:', error);
    }
  };

  const backgroundImage = roomList.find(bg => bg.id === tempSelectedRoom)?.image || BaseBackground;

  return (
    <View style={styles.fullScreen}>
      {/* === 상단 오버레이 메뉴 === */}
      {isOverlayVisible && (
        <View style={[styles.overlayTop, isOverlayExpanded && styles.overlayExpanded]}>
          {/* 닫기 */}
          <View style={styles.centerExpandButtonContainerTop}>
            <TouchableOpacity
              onPress={() => setIsOverlayVisible(false)}
              style={styles.expandIconBox}
            >
              <Ionicons name="chevron-up" size={30} color="#5C7BEE" />
            </TouchableOpacity>
          </View>

          {/* 탭 */}
          <View style={styles.tabContainer}>
            {['Background', 'Flower', 'Furniture', 'Decoration'].map((tab) => (
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

          {/* 아이템 리스트 */}
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
                  <TouchableOpacity key={flower.id} onPress={() => setSelectedItemId(flower.id)}>
                    <Image source={flower.image} style={styles.itemImage} />
                  </TouchableOpacity>
                ))}

            {selectedTab === 'Furniture' &&
              furnitureList
                .filter(f => obtainedFurniture.includes(f.id))
                .map(item => (
                  <TouchableOpacity key={item.id} onPress={() => setSelectedItemId(item.id)}>
                    <Image source={item.icon} style={styles.itemImage} />
                  </TouchableOpacity>
                ))}

            {selectedTab === 'Decoration' && (
              <>
                {decorationList
                  .filter(deco => obtainedDecorations.includes(deco.id))
                  .map(deco => (
                    <TouchableOpacity
                      key={deco.id}
                      onPress={() => setTempSelectedDecoration(deco.id)}
                      style={[
                        styles.itemImage,
                        tempSelectedDecoration === deco.id && { borderColor: '#5C7BEE', borderWidth: 2 },
                      ]}
                    >
                      <Image source={deco.image} style={styles.itemImage} />
                    </TouchableOpacity>
                  ))}
                {/* 선택 해제 */}
                <TouchableOpacity
                  onPress={() => setTempSelectedDecoration(null)}
                  style={[
                    styles.itemImage,
                    !tempSelectedDecoration && { borderColor: '#5C7BEE', borderWidth: 2, justifyContent: 'center', alignItems: 'center' }
                  ]}
                >
                  <Text style={{ color: '#999', fontSize: 13, textAlign: 'center', flex: 1, textAlignVertical: 'center' }}>None</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <View style={styles.expandedArea}>
            <Text style={styles.expandedText}></Text>
          </View>
        </View>
      )}

      {/* 상단 중앙 expand 버튼 (닫혀 있을 때) */}
      {!isOverlayVisible && (
        <View style={styles.centerExpandButtonContainerTop}>
          <TouchableOpacity
            onPress={() => {
              setIsOverlayVisible(true);
              setIsOverlayExpanded(true);
            }}
            style={styles.expandIconBox}
          >
            <Ionicons name="chevron-down" size={30} color="#5C7BEE" />
          </TouchableOpacity>
        </View>
      )}

      {/* 배경/배치 영역 */}
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
          {/* 데코 오버레이 (미리보기) */}
          {tempSelectedDecoration && (() => {
            const decoData = decorationList.find(d => d.id === tempSelectedDecoration);
            return decoData ? (
              <Image
                source={decoData.image}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: scaledWidth,
                  height: scaledHeight,
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
                resizeMode="cover"
              />
            ) : null;
          })()}

          <Pressable
            ref={containerRef}
            style={StyleSheet.absoluteFill}
            onPress={handleTouch}
          >
            {/* 꽃 배치 */}
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
                  style={[
                    styles.placedImage,
                    { left: item.x, top: item.y, overflow: 'visible' },
                  ]}
                >
                  <Image
                    source={flowerData.image}
                    style={{ width: 70, height: 70 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}

            {/* 가구 배치 */}
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
                  style={[styles.placedFurnitureImage, { left: item.x, top: item.y }]} // 래퍼는 크기 없음
                >
                  <Image source={furnitureData.icon} style={furnitureData.style} resizeMode="contain" />
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </ImageBackground>
      </ScrollView>

      {/* 오른쪽 상단 버튼들 */}
      <View style={styles.topRightContainer}>
        <TouchableOpacity onPress={() => router.push('/Home_page/Homepage')}>
          <Image source={ModifiedButton} style={styles.modifiedImageButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
  // ✅ 래퍼에서 고정 크기 제거 (이미지에 실제 style 적용)
  placedFurnitureImage: {
    position: 'absolute',
  },
  topRightContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    alignItems: 'center',
    gap: 10,
    zIndex: 30,
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
  centerExpandButtonContainerTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    alignItems: 'center',
    zIndex: 40,
  },
  overlayTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#FFFFFFEE',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 30,
    paddingBottom: 16,
    paddingTop: 38,
    minHeight: 180,
    maxHeight: 240,
  },
  overlayExpanded: {},
  expandIconBox: {
    backgroundColor: '#F0F1FF',
    borderRadius: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 6,
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
    resizeMode: 'contain',
    backgroundColor: '#f7f7fa',
  },
  expandedArea: {
    marginTop: 12,
    alignItems: 'center',
  },
  expandedText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
});
