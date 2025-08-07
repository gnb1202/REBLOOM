import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface ProfileCardProps {
  onPress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onPress }) => {
  const { userProfile, calculateDaysSinceSurgery } = useAuth();

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

  if (!userProfile?.gameData) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.loadingText}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  // 필수 데이터 검증
  const { level = 1, consecutiveExercises = 0, currency = 0 } = userProfile.gameData;
  const { nickname: profileNickname, selectedBadge } = userProfile.profile || {};
  const nickname = profileNickname || userProfile.nickname || 'User';

  const daysSinceSurgery = calculateDaysSinceSurgery();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        {/* 뱃지와 레벨 */}
        <View style={styles.topRow}>
          <View style={styles.badgeContainer}>
            <View style={styles.defaultBadge}>
              <Text style={styles.badgeText}>
                {getBadgeEmoji(selectedBadge)}
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
    fontSize: 12,
  },
  levelContainer: {
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
    width: '100%',
  },
  daysSince: {
    fontSize: 16,
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
    fontSize: 10,
    color: '#666',
  },
  exerciseCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
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
  loadingText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProfileCard;