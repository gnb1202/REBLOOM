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

import BaseBackground from '../../assets/images/HomeBackgroundImages/FirstBaseBackground.png';
import AddChair from '../../assets/images/Roommodifiedimages/Addchair.png';
import AddStand from '../../assets/images/Roommodifiedimages/Addstand.png';
import { useProgress } from '../../context/ProgressContext';

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

  const { hasChair, hasStand } = useProgress();

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

  const openOnlyOneOverlay = (target: 'quest' | 'shop' | 'diary') => {
    setShowQuest(target === 'quest');
    setShowShop(target === 'shop');
    setShowDiary(target === 'diary');
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
      >
        <Image
          source={BaseBackground}
          style={{ width: imageScaledWidth, height: imageScaledHeight }}
          resizeMode="cover"
        />

        {hasChair && (
          <Image
            source={AddChair}
            style={[styles.addChairImage, { left: 900, top: 1050 }]}
            resizeMode="contain"
          />
        )}

        {hasStand && (
          <Image
            source={AddStand}
            style={[styles.addStandImage, { left: 1200, top: 950 }]}
            resizeMode="contain"
          />
        )}
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

      {isRoomOnly && (
        <View style={styles.saveButtonWrapper}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => alert('저장되었습니다!')}
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
            <TouchableOpacity onPress={() => openOnlyOneOverlay('diary')}>
              <View style={styles.indicatorDot} />
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
              <Text style={styles.bottomText}>탐험</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Menu/Menupage')}>
              <Text style={styles.bottomText}>menu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Exercise/Explain')}>
              <Text style={styles.bottomText}>운동하기</Text>
            </TouchableOpacity>
          </View>

          {showQuest && <View style={styles.overlayPartial}><QuestPage /></View>}
          {showShop && <View style={styles.overlayPartial}><ShopPage /></View>}
          {showDiary && <View style={styles.overlayPartial}><DiaryCheckPage /></View>}
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
  addChairImage: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  addStandImage: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
});
