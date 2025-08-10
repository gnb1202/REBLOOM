import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import {
    checkLikeStatus,
    getOtherUserRoomData,
    getUserLikeCount,
    getUserProfile,
    toggleLike,
} from '../../firebase.config';
import { useAuth } from '../../context/AuthContext';

// 방 배경 이미지들
import Background1 from '../../assets/images/HomeBackgroundImages/Backgroundlevel1.png';
import Background2 from '../../assets/images/HomeBackgroundImages/Backgroundlevel2.png';
import BaseBackground from '../../assets/images/HomeBackgroundImages/BasicHomepage.png';

// 꽃 표시용 이미지들
import daisy from '../../assets/images/flowers/Display/daisy_display.png';
import freesia from '../../assets/images/flowers/Display/freesia_display.png';
import hydrangea from '../../assets/images/flowers/Display/hydrangea_display.png';
import lavender from '../../assets/images/flowers/Display/lavender_display.png';
import lily from '../../assets/images/flowers/Display/lily_display.png';
import rose from '../../assets/images/flowers/Display/rose_display.png';
import sunflower from '../../assets/images/flowers/Display/sunflower_display.png';
import tulip from '../../assets/images/flowers/Display/tulip_display.png';

// 가구 이미지들
import ChairIcon from '../../assets/images/furnitures/whiteroundchair.png';
import StandIcon from '../../assets/images/furnitures/yellowstand.png';

const ORIGINAL_WIDTH = 2300;
const ORIGINAL_HEIGHT = 1518;
const dimensions = Dimensions.get('window');
const minScale = dimensions.height / ORIGINAL_HEIGHT;
const imageScaledWidth = ORIGINAL_WIDTH * minScale;
const imageScaledHeight = ORIGINAL_HEIGHT * minScale;

const flowerImages = {
  daisy,
  hydrangea,
  lavender,
  lily,
  rose,
  sunflower,
  freesia,
  tulip,
};

const furnitureImages = {
  whiteroundchair: ChairIcon,
  yellowstand: StandIcon,
};

const roomBackgrounds = {
  default: BaseBackground,
  basic: BaseBackground,
  level1: Background1,
  level2: Background2,
  modern: Background2, // 예시
};

interface RoomData {
  selectedRoom: string;
  flowers: { x: number; y: number; id: string }[];
  furniture: { x: number; y: number; id: string }[];
  obtainedFlowers: string[];
  obtainedFurniture: string[];
  flowerBadgeLevel: number;
  surgeryDate: string | null;
  selectedBadge: string | null;
  createdAt?: any;
}

export default function VisitedRoomPage() {
  const router = useRouter();
  const { userId, nickname } = useLocalSearchParams();
  const { user } = useAuth();

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoCollapsed, setInfoCollapsed] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState<any>(null);

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // 가입일 포맷 함수
  const formatJoinDate = (createdAt: any): string => {
    if (!createdAt) return 'Unknown';
    
    let date: Date;
    if (createdAt.toDate) {
      // Firestore Timestamp
      date = createdAt.toDate();
    } else if (createdAt.seconds) {
      // Firestore Timestamp in plain object
      date = new Date(createdAt.seconds * 1000);
    } else if (typeof createdAt === 'string') {
      // String date
      date = new Date(createdAt);
    } else {
      // Already a Date object or unknown format
      date = new Date(createdAt);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  };

  // 뱃지 이모지 매핑 함수
  const getBadgeEmoji = (badgeId?: string | null): string => {
    const badgeEmojiMap: { [key: string]: string } = {
      'exercise1': '🎯',
      'exercise2': '💪',
      'exercise3': '🏃‍♂️',
      'exercise4': '🏆',
      'flower1': '🌸',
      'flower2': '🌼',
      'flower3': '🌺',
      'flower4': '🌻',
    };
    
    return badgeEmojiMap[badgeId || ''] || '🏅';
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userId || typeof userId !== 'string') {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 방 데이터와 사용자 프로필 동시 로드
        const [room, userProfile, initialLikeCount, initialLikedStatus] = await Promise.all([
          getOtherUserRoomData(userId),
          getUserProfile(userId),
          getUserLikeCount(userId),
          user ? checkLikeStatus(user.uid, userId) : false,
        ]);

        if (room) {
          setRoomData(room);
        } else {
          setError('Room data not found');
        }

        if (userProfile && userProfile.createdAt) {
          setUserCreatedAt(userProfile.createdAt);
        }

        setLikeCount(initialLikeCount);
        setIsLiked(initialLikedStatus);

      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError('Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, user]);

  const handleLike = async () => {
    if (!user || !userId || typeof userId !== 'string' || likeLoading) {
      return;
    }

    setLikeLoading(true);
    try {
      const { liked, success } = await toggleLike(user.uid, userId);
      if (success) {
        setIsLiked(liked);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    } finally {
      setLikeLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C7BEE" />
          <Text style={styles.loadingText}>Loading {nickname}'s room...</Text>
        </View>
      </View>
    );
  }

  if (error || !roomData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Unable to load room data'}
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const backgroundImage = roomBackgrounds[roomData.selectedRoom as keyof typeof roomBackgrounds] || roomBackgrounds.default;

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButtonCircle}
      >
        <Text style={styles.backText}>{'←'}</Text>
      </TouchableOpacity>

      {/* 닉네임's Flower Shop 타이틀 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{nickname}'s Flower Shop</Text>
        <View style={styles.likeSection}>
          <TouchableOpacity 
            onPress={handleLike} 
            disabled={likeLoading}
            style={styles.heartButton}
          >
            <Text style={[styles.heartIcon, isLiked && styles.heartIconLiked]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.likeCountText}>{likeCount}</Text>
        </View>
      </View>

      {/* 메인 방 영역 */}
      <View style={styles.roomContainer}>
        <ImageZoom
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
        >
          <View style={{ width: imageScaledWidth, height: imageScaledHeight, position: 'relative' }}>
            <Image
              source={backgroundImage}
              style={{ width: imageScaledWidth, height: imageScaledHeight }}
              resizeMode="cover"
            />
            
            {/* 배치된 꽃들 */}
            {roomData.flowers.map((flower, index) => {
              const flowerImage = flowerImages[flower.id as keyof typeof flowerImages];
              if (!flowerImage) return null;

              return (
                <View
                  key={`flower-${index}`}
                  style={[
                    styles.placedItem,
                    {
                      left: flower.x * minScale,
                      top: flower.y * minScale,
                    },
                  ]}
                >
                  <Image
                    source={flowerImage}
                    style={[styles.flowerImage, { transform: [{ scale: minScale }] }]}
                    resizeMode="contain"
                  />
                </View>
              );
            })}

            {/* 배치된 가구들 */}
            {roomData.furniture.map((item, index) => {
              const furnitureImage = furnitureImages[item.id as keyof typeof furnitureImages];
              if (!furnitureImage) return null;

              return (
                <View
                  key={`furniture-${index}`}
                  style={[
                    styles.placedItem,
                    {
                      left: item.x * minScale,
                      top: item.y * minScale,
                    },
                  ]}
                >
                  <Image
                    source={furnitureImage}
                    style={[styles.furnitureImage, { transform: [{ scale: minScale }] }]}
                    resizeMode="contain"
                  />
                </View>
              );
            })}
          </View>
        </ImageZoom>
      </View>

      {/* 하단 정보 */}
      <View style={[styles.infoContainer, infoCollapsed && styles.infoContainerCollapsed]}>
        <TouchableOpacity 
          onPress={() => setInfoCollapsed(!infoCollapsed)}
          style={styles.infoCollapseButton}
        >
          <Text style={styles.collapseIcon}>{infoCollapsed ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {!infoCollapsed && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Since</Text>
                <Text style={styles.statValue}>{formatJoinDate(userCreatedAt)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Badge</Text>
                <Text style={styles.statValue}>{getBadgeEmoji(roomData.selectedBadge)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Collected Flowers</Text>
                <Text style={styles.statValue}>{roomData.obtainedFlowers.length}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButtonCircle: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  backText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  roomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 0,
  },
  placedItem: {
    position: 'absolute',
    zIndex: 5,
  },
  flowerImage: {
    width: 60,
    height: 60,
  },
  furnitureImage: {
    width: 80,
    height: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  infoContainerCollapsed: {
    paddingVertical: 8,
  },
  infoCollapseButton: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5C7BEE',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    marginRight: 8,
    padding: 4,
  },
  likeText: {
    fontSize: 24,
    color: '#ccc',
  },
  likedText: {
    color: '#ff6b6b',
  },
  collapseIcon: {
    fontSize: 14,
    color: '#666',
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: 70,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  heartButton: {
    padding: 4,
  },
  heartIcon: {
    fontSize: 20,
  },
  heartIconLiked: {
    textShadowColor: 'rgba(255, 107, 107, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  likeCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
});