import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useCoin } from '../../context/CoinContext';
import { useExercise } from '../../context/ExerciseContext';

export default function CoinRewardPage() {
  const router = useRouter();
  const { addCoins } = useCoin();
  const { calculateRewards, currentExercise } = useExercise();

  // 애니메이션 값
  const coinAnim = useRef(new Animated.Value(0)).current;
  const [rewarded, setRewarded] = useState(0);

  useEffect(() => {
    let coinAmount = 5;
    if (currentExercise) {
      const rewards = calculateRewards();
      addCoins(rewards.currency); // 계산된 코인 추가
      coinAmount = rewards.currency;
    } else {
      addCoins(coinAmount); // 기본값
    }
    setRewarded(coinAmount);

    // 애니메이션 실행
    Animated.spring(coinAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // 2초 뒤 이동
    const timeout = setTimeout(() => {
      router.push('/Exercise/ExerciseFeedbackPage');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.rewardText}>You got coins!</Text>
      <Animated.View
        style={[
          styles.coinBox,
          {
            // 위에서 아래로 슬라이드 + 커지는 애니메이션
            transform: [
              {
                translateY: coinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
              {
                scale: coinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.1],
                }),
              },
            ],
            opacity: coinAnim,
          },
        ]}
      >
        <Image
          source={require('../../assets/images/rewards/coin.png')}
          style={styles.coin}
          resizeMode="contain"
        />
        <Text style={styles.coinAmount}>+{rewarded} Coins</Text>
      </Animated.View>
      <View style={styles.chestBox}>
        <Image
          source={require('../../assets/images/rewards/chest.png')}
          style={styles.chest}
          resizeMode="contain"
        />
        {/* 빛나는 효과 */}
        <View style={styles.glow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  rewardText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FBC02D',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  coinBox: {
    alignItems: 'center',
    marginBottom: 22,
  },
  coin: {
    width: 85,
    height: 85,
    marginBottom: 6,
    shadowColor: '#F9D342',
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 6,
  },
  coinAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E6B200',
    marginTop: 2,
    textShadowColor: '#FFF9C4',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  chestBox: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chest: {
    width: 128,
    height: 128,
    zIndex: 2,
    shadowColor: '#FFD54F',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 7,
  },
  glow: {
    position: 'absolute',
    top: 24,
    left: 8,
    right: 8,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    opacity: 0.32,
    zIndex: 1,
    shadowColor: '#FFF59D',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 1,
  },
});
