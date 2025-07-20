import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import QuestPage from '../Mark/Quest/QuestPage';
import ShopPage from '../Mark/Shop/ShopPage';
import DiaryCheckPage from '../Mark/Check/DiaryCheckPage';

import BaseBackground from '../../assets/images/HomeBackgroundImages/BaseBackground.png'; // ✅ 고정된 배경

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;

export default function Homepage({ isRoomOnly = false }: { isRoomOnly?: boolean }) {
  const router = useRouter();
  const imageZoomRef = useRef(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [showQuest, setShowQuest] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

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

  return (
    <View style={styles.container}>
      <ImageZoom
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
        style={{ zIndex: 0 }}
      >
        {/* ✅ 고정된 배경 이미지 */}
        <Image
          source={BaseBackground}
          style={{ width: imageScaledWidth, height: imageScaledHeight }}
          resizeMode="cover"
        />
      </ImageZoom>

      {/* 상단 진입/복귀 버튼 */}
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

      {/* 저장하기 버튼 */}
      {isRoomOnly && (
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              console.log('저장되었습니다.');
              alert('저장되었습니다!');
            }}
          >
            <Text style={styles.saveButtonText}>저장하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isRoomOnly && (
        <>
          <View style={styles.topTabs}>
            <TouchableOpacity
              style={styles.activeTab}
              onPress={() => router.push('/Menu/profilemodified')}
            >
              <Text style={styles.activeTabText}>프로필정보</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab}>
              <Text style={styles.inactiveTabText}>경과</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.indicatorContainer}>
            <TouchableOpacity onPress={() => setShowDiary(true)}>
              <View style={styles.indicatorDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowShop(true)}>
              <View style={styles.shopDot}>
                <Image
                  source={require('../../assets/images/Shop/Shopmark.png')}
                  style={styles.shopIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQuest(true)}>
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
              <Text style={styles.bottomText}>탐험</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Menu/Menupage')}>
              <Text style={styles.bottomText}>menu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Exercise/Explain')}>
              <Text style={styles.bottomText}>운동하기</Text>
            </TouchableOpacity>
          </View>

          {showQuest && (
            <View style={styles.overlayPartial}>
              <QuestPage />
              <TouchableOpacity style={styles.closeButtonBottom} onPress={() => setShowQuest(false)}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          )}

          {showShop && (
            <View style={styles.overlayPartial}>
              <View style={styles.questHeaderCentered}>
                <Text style={styles.overlayTitle}>상점</Text>
              </View>
              <ShopPage />
              <TouchableOpacity style={styles.closeButtonBottom} onPress={() => setShowShop(false)}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDiary && (
            <View style={styles.overlayPartial}>
              <DiaryCheckPage />
              <TouchableOpacity style={styles.closeButtonBottom} onPress={() => setShowDiary(false)}>
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#000' },
  topTabs: {
    flexDirection: 'row', paddingHorizontal: 20, paddingTop: 40,
    position: 'absolute', top: 0, left: 0, zIndex: 10,
  },
  activeTab: {
    backgroundColor: '#5C7BEE', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 2,
  },
  inactiveTab: { marginLeft: 20, justifyContent: 'center' },
  activeTabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  inactiveTabText: { color: '#000', fontSize: 14 },
  rightCircleWrapper: { position: 'absolute', right: 20, top: 100, zIndex: 10 },
  indicatorContainer: {
    position: 'absolute', bottom: 60, left: 20, flexDirection: 'row', gap: 16,
    zIndex: 20, alignItems: 'center',
  },
  indicatorDot: { width: 30, height: 30, backgroundColor: '#ddd', borderRadius: 15 },
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
  questHeaderCentered: { alignItems: 'center', marginBottom: 10 },
  overlayTitle: { fontSize: 18, fontWeight: 'bold', color: '#3F5C45' },
  closeButtonBottom: {
    alignSelf: 'center', marginTop: 12, backgroundColor: '#3F5C45',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  closeText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  saveButtonWrapper: {
    position: 'absolute', bottom: 30, alignSelf: 'center', zIndex: 10,
  },
  saveButton: {
    backgroundColor: '#5C7BEE', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16,
  },
  modifiedImageButton: {
    width: 40,
    height: 40,
  },
});
