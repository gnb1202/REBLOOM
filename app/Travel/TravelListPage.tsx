import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getRandomUserProfiles } from '../../firebase.config';

interface UserProfile {
  uid: string;
  id: string;
  nickname: string;
  surgeryDate: string;
  gameData: {
    level: number;
    consecutiveExercises: number;
    currency: number;
  };
  profile?: {
    nickname?: string;
    selectedBadge?: string;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 더미 데이터 생성 함수
  const getDummyProfiles = (): UserProfile[] => {
    const today = new Date();
    
    const dummyProfiles: UserProfile[] = [
      {
        uid: 'dummy_001',
        id: 'honggildong',
        nickname: '홍길동',
        surgeryDate: new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 3,
          consecutiveExercises: 15,
          currency: 580
        },
        profile: {
          nickname: '홍길동',
          selectedBadge: 'exercise2'
        }
      },
      {
        uid: 'dummy_002',
        id: 'kimchulsoo',
        nickname: '김철수',
        surgeryDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 2,
          consecutiveExercises: 7,
          currency: 320
        },
        profile: {
          nickname: '김철수'
        }
      },
      {
        uid: 'dummy_003',
        id: 'leeyounghee',
        nickname: '이영희',
        surgeryDate: new Date(today.getTime() - 230 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 4,
          consecutiveExercises: 25,
          currency: 850
        },
        profile: {
          nickname: '이영희',
          selectedBadge: 'flower3'
        }
      },
      {
        uid: 'dummy_004',
        id: 'parkminsoo',
        nickname: '박민수',
        surgeryDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 1,
          consecutiveExercises: 3,
          currency: 150
        },
        profile: {
          nickname: '박민수'
        }
      },
      {
        uid: 'dummy_005',
        id: 'choijihye',
        nickname: '최지혜',
        surgeryDate: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 3,
          consecutiveExercises: 18,
          currency: 620
        },
        profile: {
          nickname: '최지혜',
          selectedBadge: 'exercise3'
        }
      },
      {
        uid: 'dummy_006',
        id: 'jungsubin',
        nickname: '정수빈',
        surgeryDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 2,
          consecutiveExercises: 12,
          currency: 410
        },
        profile: {
          nickname: '정수빈',
          selectedBadge: 'flower1'
        }
      },
      {
        uid: 'dummy_007',
        id: 'kangtaeyoung',
        nickname: '강태영',
        surgeryDate: new Date(today.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 5,
          consecutiveExercises: 30,
          currency: 1200
        },
        profile: {
          nickname: '강태영',
          selectedBadge: 'exercise4'
        }
      },
      {
        uid: 'dummy_008',
        id: 'yoonseoyeon',
        nickname: '윤서연',
        surgeryDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 2,
          consecutiveExercises: 5,
          currency: 280
        },
        profile: {
          nickname: '윤서연'
        }
      },
      {
        uid: 'dummy_009',
        id: 'jangminhyuk',
        nickname: '장민혁',
        surgeryDate: new Date(today.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 3,
          consecutiveExercises: 20,
          currency: 700
        },
        profile: {
          nickname: '장민혁',
          selectedBadge: 'flower2'
        }
      },
      {
        uid: 'dummy_010',
        id: 'limsoyoung',
        nickname: '임소영',
        surgeryDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gameData: {
          level: 1,
          consecutiveExercises: 8,
          currency: 200
        },
        profile: {
          nickname: '임소영',
          selectedBadge: 'exercise1'
        }
      }
    ];

    return dummyProfiles;
  };

  const calculateDaysSinceSurgery = (surgeryDate: string): number => {
    const surgery = new Date(surgeryDate);
    const today = new Date();
    const diffTime = today.getTime() - surgery.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const loadProfiles = async () => {
    try {
      const randomProfiles = await getRandomUserProfiles(12);
      // 현재 사용자는 제외
      const filteredProfiles = randomProfiles.filter(profile => profile.uid !== user?.uid);
      
      if (filteredProfiles.length > 0) {
        setProfiles(filteredProfiles);
      } else {
        // Firebase에서 데이터가 없거나 실패한 경우 더미 데이터 사용
        console.log('No Firebase data available, using dummy data.');
        setProfiles(getDummyProfiles());
      }
    } catch (error) {
      console.error('Failed to load profiles, using dummy data:', error);
      // Firebase 연결 실패 시 더미 데이터 사용
      setProfiles(getDummyProfiles());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  // 뱃지 이모지 매핑
  const getBadgeEmoji = (badgeId?: string): string => {
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

  const handleVisitRoom = (profile: UserProfile) => {
    // 다른 사용자의 방을 구경하는 기능 (추후 구현)
    Alert.alert(
      `${profile.profile?.nickname || profile.nickname}'s Room`,
      'Room visiting feature is in development.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Explore</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5C7BEE" />
          <Text style={styles.loadingText}>Looking for other users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/Home_page/Homepage')}>
          <Text style={styles.back}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Explore</Text>
      </View>

      {/* 프로필 카드 목록 */}
      <ScrollView 
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {profiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users to explore.</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          profiles.map((profile) => (
            <TouchableOpacity
              key={profile.uid}
              style={styles.profileCard}
              onPress={() => handleVisitRoom(profile)}
            >
              {/* 뱃지 및 레벨 */}
              <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeEmoji}>
                    {getBadgeEmoji(profile.profile?.selectedBadge)}
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lv.{profile.gameData?.level || 1}</Text>
                </View>
              </View>

              {/* 닉네임 */}
              <Text style={styles.nickname} numberOfLines={1}>
                {profile.profile?.nickname || profile.nickname || 'Anonymous'}
              </Text>

              {/* 수술 경과일 */}
              <Text style={styles.daysSince}>
                D+{calculateDaysSinceSurgery(profile.surgeryDate)}
              </Text>

              {/* 연속 운동 횟수 */}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseLabel}>Consecutive Exercises</Text>
                <Text style={styles.exerciseCount}>
                  {profile.gameData?.consecutiveExercises || 0} days
                </Text>
              </View>

              {/* 화폐 */}
              <View style={styles.coinInfo}>
                <Text style={styles.coinIcon}>💰</Text>
                <Text style={styles.coinAmount}>
                  {profile.gameData?.currency || 0}
                </Text>
              </View>

              {/* 방문 버튼 */}
              <View style={styles.visitButtonContainer}>
                <Text style={styles.visitButtonText}>Visit Room</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingTop: 40 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  back: { 
    fontSize: 24,
    color: '#333'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333'
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  profileCard: {
    width: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 12,
  },
  levelBadge: {
    backgroundColor: '#5C7BEE',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nickname: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  daysSince: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C7BEE',
    marginBottom: 8,
  },
  exerciseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseLabel: {
    fontSize: 11,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  coinAmount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  visitButtonContainer: {
    backgroundColor: '#5C7BEE',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
