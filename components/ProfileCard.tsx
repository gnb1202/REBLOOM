import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

interface ProfileCardProps {
  onPress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onPress }) => {
  const { userProfile, calculateDaysSinceSurgery } = useAuth();
  const { flowerBadgeLevel, attendanceStreak, exerciseFeedbackCount } = useProgress();

  // 획득한 뱃지 확인 및 표시할 뱃지 결정
  const getAcquiredBadge = (): string => {
    // 꽃 뱃지 (가장 높은 우선순위)
    if (flowerBadgeLevel >= 4) return '🌻';
    if (flowerBadgeLevel >= 3) return '🌺';
    if (flowerBadgeLevel >= 2) return '🌼';
    if (flowerBadgeLevel >= 1) return '🌸';
    
    // 출석 뱃지
    if (attendanceStreak >= 14) return '📅';
    if (attendanceStreak >= 7) return '📅';
    if (attendanceStreak >= 5) return '📅';
    if (attendanceStreak >= 3) return '📅';
    
    // 피드백 뱃지
    if (exerciseFeedbackCount >= 7) return '🗣️';
    if (exerciseFeedbackCount >= 5) return '🗣️';
    if (exerciseFeedbackCount >= 3) return '🗣️';
    
    // 획득한 뱃지가 없으면 기본 아이콘
    return '🏅';
  };

  if (!userProfile?.gameData) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.loadingText}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  // 필수 데이터 검증
  const { level = 1, consecutiveExercises = 0, currency = 0 } = userProfile.gameData;
  const { nickname: profileNickname } = userProfile.profile || {};
  const nickname = profileNickname || userProfile.nickname || 'User';
  
  // 획득한 뱃지 가져오기
  const displayBadge = getAcquiredBadge();

  const daysSinceSurgery = calculateDaysSinceSurgery();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* 뱃지와 레벨 */}
        <View style={styles.topRow}>
          <View style={styles.badgeContainer}>
            <View style={styles.defaultBadge}>
              <Text style={styles.badgeText}>
                {displayBadge}
              </Text>
            </View>
          </View>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Lv.{level}</Text>
          </View>
        </View>

        {/* 닉네임 */}
        <Text style={styles.nickname} numberOfLines={1}>
          {nickname}
        </Text>

        {/* 수술 경과일 */}
        <Text style={styles.daysSince}>
          D+{daysSinceSurgery}
        </Text>

        {/* 연속 운동 횟수 */}
        <View style={styles.exerciseRow}>
          <Text style={styles.exerciseLabel}>Streak</Text>
          <Text style={styles.exerciseCount}>
            {consecutiveExercises} days
          </Text>
        </View>

        {/* 화폐 */}
        <View style={styles.coinRow}>
          <Text style={styles.coinIcon}>💰</Text>
          <Text style={styles.coinAmount}>
            {currency}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    minWidth: 140,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  badgeContainer: {
    width: 24,
    height: 24,
  },
  defaultBadge: {
    width: 24,
    height: 24,  
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 16,
  },
  levelContainer: {
    backgroundColor: '#5C7BEE',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nickname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    width: '100%',
  },
  daysSince: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C7BEE',
    marginBottom: 6,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  exerciseLabel: {
    fontSize: 14,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileCard;