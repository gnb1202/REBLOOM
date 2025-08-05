import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useCoin } from '../../context/CoinContext';
import { useExercise } from '../../context/ExerciseContext';

export default function CoinRewardPage() {
  const router = useRouter();
  const { addCoins } = useCoin();
  const { calculateRewards, currentExercise } = useExercise();

  useEffect(() => {
    if (currentExercise) {
      const rewards = calculateRewards();
      addCoins(rewards.currency); // 계산된 코인 추가
    } else {
      addCoins(5); // 기본값
    }
    
    const timeout = setTimeout(() => {
      router.push('/Exercise/ExerciseFeedbackPage');
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/rewards/coin.png')} // 대소문자 주의
        style={styles.coin}
        resizeMode="contain"
      />
      <Image
        source={require('../../assets/images/rewards/chest.png')}
        style={styles.chest}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  coin: { width: 80, height: 80, marginBottom: 20 },
  chest: { width: 120, height: 120 },
});

