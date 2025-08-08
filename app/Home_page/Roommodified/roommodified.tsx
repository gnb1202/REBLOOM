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
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../../../context/ProgressContext';
import ToastMessage from '../../../components/ToastMessage';

import Background1 from '../../../assets/images/HomeBackgroundImages/Backgroundlevel1.png';
import Background2 from '../../../assets/images/HomeBackgroundImages/Backgroundlevel2.png';
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

const furnitureList = [
  { id: 'mailbox_A_black', icon: mailbox_A_black },
  { id: 'mailbox_A_blackwhite', icon: mailbox_A_blackwhite },
  { id: 'mailbox_A_white', icon: mailbox_A_white },
  { id: 'signboard', icon: signboard },
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

  // 데코레이션 선택 임시 상태
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

  // [로그] 모든 상태 변화 추적
  useEffect(() => {
    console.log('[RoomModified] obtainedFlowers:', obtainedFlowers);
    console.log('[RoomModified] obtainedFurniture:', obtainedFurniture);
    console.log('[RoomModified] obtainedRooms:', obtainedRooms);
    console.log('[RoomModified] obtainedDecorations:', obtainedDecorations);
    console.log('[RoomModified] selectedRoom:', selectedRoom);
    console.log('[RoomModified] selectedDecoration:', selectedDecoration);
    console.log('[RoomModified] placedFlowers:', placedFlowers);
    console.log('[RoomModified] placedFurniture:', placedFurniture);
    console.log('[RoomModified] (local) flowers:', flowers);
    console.log('[RoomModified] (local) furnitureItems:', furnitureItems);
    console.log('[RoomModified] tempSelectedRoom:', tempSelectedRoom);
    console.log('[RoomModified] tempSelectedDecoration:', tempSelectedDecoration);
  }, [
    obtainedFlowers, obtainedFurniture, obtainedRooms, obtainedDecorations,
    selectedRoom, selectedDecoration, placedFlowers, placedFurniture,
    flowers, furnitureItems, tempSelectedRoom, tempSelectedDecoration
  ]);

  useEffect(() => {
    setFlowers(placedFlowers);
    setFurnitureItems(placedFurniture);
    setTempSelectedRoom(selectedRoom || 'default');
    setTempSelectedDecoration(selectedDecoration ?? null);
    console.log('[RoomModified] useEffect - placedFlowers:', placedFlowers, 'placedFurniture:', placedFurniture, 'selectedRoom:', selectedRoom, 'selectedDecoration:', selectedDecoration);
  }, [placedFlowers, placedFurniture, selectedRoom, selectedDecoration]);

  const handleReturn = () => {
    console.log('[RoomModified] handleReturn()');
    router.push('/Home_page/Homepage');
  };

  const handleSelectItem = (itemId: string) => {
    console.log('[RoomModified] handleSelectItem:', itemId);
    setSelectedItemId(itemId);
  };

  // 터치로 꽃/가구만 배치(Decoration은 배치 X)
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
    console.log('[RoomModified] handleTouch:', { x, y, adjustedX, adjustedY, selectedItemId, selectedTab });

    if (selectedItemId) {
      if (selectedTab === 'Flower' && obtainedFlowers.includes(selectedItemId)) {
        const newFlowers = [...flowers, { x: adjustedX, y: adjustedY, id: selectedItemId }];
        console.log('[RoomModified] Flower placed:', newFlowers);
        setFlowers(newFlowers);
        setPlacedFlowers(newFlowers);
        setSelectedItemId(null);
      } else if (selectedTab === 'Furniture' && obtainedFurniture.includes(selectedItemId)) {
        const newFurniture = [...furnitureItems, { x: adjustedX, y: adjustedY, id: selectedItemId }];
        console.log('[RoomModified] Furniture placed:', newFurniture);
        setFurnitureItems(newFurniture);
        setPlacedFurniture(newFurniture);
        setSelectedItemId(null);
      }
      // Decoration은 여기서 아무 것도 안함!
    }
  };

  // 저장버튼: 데코도 저장
  const handleSave = async () => {
    try {
      console.log('[RoomModified] handleSave() START', { tempSelectedRoom, tempSelectedDecoration });
      await setSelectedRoom(tempSelectedRoom);
      await setSelectedDecoration(tempSelectedDecoration);
      setToastMessage('저장 완료!');
      setToastType('success');
      setToastVisible(true);
      setTimeout(() => {
        console.log('[RoomModified] handleSave() ROUTE TO HOMEPAGE');
        router.replace('/Home_page/Homepage'); // replace 사용시 뒤로가기도 깔끔
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
          {/* 닫기 버튼(상단 chevron-up) */}
          <View style={styles.centerExpandButtonContainerTop}>
            <TouchableOpacity
              onPress={() => {
                console.log('[RoomModified] Overlay 닫힘');
                setIsOverlayVisible(false);
              }}
              style={styles.expandIconBox}
            >
              <Ionicons name="chevron-up" size={30} color="#5C7BEE" />
            </TouchableOpacity>
          </View>
          <View style={styles.tabContainer}>
            {['Background', 'Flower', 'Furniture', 'Decoration'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, selectedTab === tab && styles.activeTab]}
                onPress={() => {
                  console.log('[RoomModified] Tab 변경:', tab);
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
                  <TouchableOpacity key={room.id} onPress={() => {
                    console.log('[RoomModified] Background 선택:', room.id);
                    setTempSelectedRoom(room.id);
                  }}>
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
            {selectedTab === 'Decoration' && (
              <>
                {decorationList
                  .filter(deco => obtainedDecorations.includes(deco.id))
                  .map(deco => (
                    <TouchableOpacity
                      key={deco.id}
                      onPress={() => {
                        console.log('[RoomModified] Decoration 선택:', deco.id);
                        setTempSelectedDecoration(deco.id);
                      }}
                      style={[
                        styles.itemImage,
                        tempSelectedDecoration === deco.id && { borderColor: '#5C7BEE', borderWidth: 2 },
                      ]}
                    >
                      <Image source={deco.image} style={styles.itemImage} />
                    </TouchableOpacity>
                  ))}
                {/* "선택안함" 버튼 */}
                <TouchableOpacity
                  onPress={() => {
                    console.log('[RoomModified] Decoration 선택 해제');
                    setTempSelectedDecoration(null);
                  }}
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

      {/* 상단 중앙에 확장(드롭) 버튼 (닫혀있을 때만 표시) */}
      {!isOverlayVisible && (
        <View style={styles.centerExpandButtonContainerTop}>
          <TouchableOpacity
            onPress={() => {
              console.log('[RoomModified] Overlay 열림');
              setIsOverlayVisible(true);
              setIsOverlayExpanded(true);
            }}
            style={styles.expandIconBox}
          >
            <Ionicons name="chevron-down" size={30} color="#5C7BEE" />
          </TouchableOpacity>
        </View>
      )}

      {/* 아래쪽에 기존 이미지 영역(그림 배치 영역) */}
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
          {/* 데코 오버레이 (미리보기: tempSelectedDecoration 사용) */}
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
                    console.log('[RoomModified] Flower 삭제:', updated);
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
                    console.log('[RoomModified] Furniture 삭제:', updated);
                  }}
                  style={[styles.placedFurnitureImage, { left: item.x, top: item.y }]}
                >
                  <Image source={furnitureData.icon} style={{ width: 120, height: 120 }} />
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </ImageBackground>
      </ScrollView>

      {/* 오른쪽 상단 기존 버튼 */}
      <View style={styles.topRightContainer}>
        <TouchableOpacity onPress={handleReturn}>
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
  placedFurnitureImage: {
    position: 'absolute',
    width: 120,
    height: 120,
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
