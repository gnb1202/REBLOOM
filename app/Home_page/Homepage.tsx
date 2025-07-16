import React, { useRef, useState } from 'react';
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
import QuestPage from '../Mark/Quest/QuestPage'; // ← 실제 경로 확인하세요

const IMAGE_WIDTH = 1500;
const IMAGE_HEIGHT = 1123;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const minScale = Math.min(screenWidth / IMAGE_WIDTH, screenHeight / IMAGE_HEIGHT);

export default function Homepage() {
  const router = useRouter();
  const imageZoomRef = useRef(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [showQuest, setShowQuest] = useState(false);

  const centerImage = () => {
    imageZoomRef.current?.centerOn({
      x: IMAGE_WIDTH / 2,
      y: IMAGE_HEIGHT / 2,
      scale: minScale,
      duration: 0,
    });
  };

  return (
    <View style={styles.container} onLayout={() => {
      if (!layoutReady) {
        setLayoutReady(true);
        setTimeout(centerImage, 100);
      }
    }}>
      <ImageZoom
        ref={imageZoomRef}
        cropWidth={screenWidth}
        cropHeight={screenHeight}
        imageWidth={IMAGE_WIDTH}
        imageHeight={IMAGE_HEIGHT}
        panToMove={true}
        pinchToZoom={true}
        enableCenterFocus={false}
        minScale={minScale}
        maxScale={3}
        useNativeDriver={true}
      >
        <Image
          source={require('../../assets/images/HomeBackgroundImages/Backgroundex2.png')}
          style={styles.image}
          resizeMode="cover"
        />
      </ImageZoom>

      {/* 상단 탭 */}
      <View style={styles.topTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>프로필정보</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>경과</Text>
        </TouchableOpacity>
      </View>

      {/* 수정 버튼 */}
      <View style={styles.rightCircleWrapper}>
        <TouchableOpacity
          style={styles.topRightCircle}
          onPress={() => router.push('/Home_page/Roommodified/roommodified')}
        />
      </View>

      {/* 상점 / 퀘스트 아이콘 */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorDot} />

        <TouchableOpacity onPress={() => router.push('/Mark/Shop/ShopPage')}>
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

      {/* 하단 메뉴바 */}
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

      {/* 퀘스트 오버레이 */}
      {showQuest && (
        <View style={styles.overlay}>
          <View style={styles.questRow}>
            <View style={styles.questContent}>
              <QuestPage />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowQuest(false)}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignSelf: 'center',
  },
  topTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  activeTab: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 2,
  },
  inactiveTab: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inactiveTabText: {
    color: '#000',
    fontSize: 14,
  },
  rightCircleWrapper: {
    position: 'absolute',
    right: 20,
    top: 100,
    zIndex: 10,
  },
  topRightCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 20,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    flexDirection: 'row',
    gap: 16,
    zIndex: 20,
    alignItems: 'center',
  },
  indicatorDot: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd',
    borderRadius: 15,
  },
  questDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questIcon: {
    width: 30,
    height: 30,
  },
  shopDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIcon: {
    width: 30,
    height: 30,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#5C7BEE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    zIndex: 10,
  },
  bottomText: {
    color: '#fff',
    fontSize: 14,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '94%',
    backgroundColor: '#FFFFFFEE',
    zIndex: 100,
    paddingTop: 0,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  questContent: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#3F5C45',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },

  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
