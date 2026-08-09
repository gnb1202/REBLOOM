import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

// 단계별 이미지 결정 함수
function getStepImageName(flowerId: string, progress: number): string {
  const twoStep = ['hydrangea', 'sunflower', 'trumpetcreeper', 'tulip'];
  if (twoStep.includes(flowerId)) {
    return progress >= 50 ? `${flowerId}_step2` : `${flowerId}_step1`;
  } else {
    if (progress >= 80) return `${flowerId}_step3`;
    if (progress >= 40) return `${flowerId}_step2`;
    return `${flowerId}_step1`;
  }
}

// 이미지 매핑
const flowerImages = {
  daisy_step1: require('../../assets/images/flowers/daisy/daisystep1.png'),
    daisy_step2: require('../../assets/images/flowers/daisy/daisystep2.png'),
    daisy_step3: require('../../assets/images/flowers/daisy/daisystep3.png'),

    hydrangea_step1: require('../../assets/images/flowers/hydrangea/hydrangeastep1.png'),
    hydrangea_step2: require('../../assets/images/flowers/hydrangea/hydrangeastep2.png'),
    hydrangea_step3: require('../../assets/images/flowers/hydrangea/hydrangeastep3.png'),

    lavender_step1: require('../../assets/images/flowers/lavender/lavenderstep1.png'),
    lavender_step2: require('../../assets/images/flowers/lavender/lavenderstep2.png'),
    lavender_step3: require('../../assets/images/flowers/lavender/lavenderstep3.png'),

    lily_step1: require('../../assets/images/flowers/lily/lilystep1.png'),
    lily_step2: require('../../assets/images/flowers/lily/lilystep2.png'),
    lily_step3: require('../../assets/images/flowers/lily/lilystep3.png'),

    rose_step1: require('../../assets/images/flowers/rose/rosestep1.png'),
    rose_step2: require('../../assets/images/flowers/rose/rosestep2.png'),
    rose_step3: require('../../assets/images/flowers/rose/rosestep3.png'),

    sunflower_step1: require('../../assets/images/flowers/sunflower/sunflowerstep1.png'),
    sunflower_step2: require('../../assets/images/flowers/sunflower/sunflowerstep2.png'),
    sunflower_step3: require('../../assets/images/flowers/sunflower/sunflowerstep3.png'),

    tulip_step1: require('../../assets/images/flowers/tulip/tulipstep1.png'),
    tulip_step2: require('../../assets/images/flowers/tulip/tulipstep2.png'),
    tulip_step3: require('../../assets/images/flowers/tulip/tulipstep3.png'),

    freesia_step1: require('../../assets/images/flowers/freesia/freesiastep1.png'),
    freesia_step2: require('../../assets/images/flowers/freesia/freesiastep2.png'),
    freesia_step3: require('../../assets/images/flowers/freesia/freesiastep3.png'),
};

export default function PlantRewardPage() {
  const router = useRouter();

  // ✅ updateProgress → setProgress 으로 수정
  const { currentFlowerId, progress, setProgress } = useProgress();
  const [localProgress, setLocalProgress] = useState(0); // 애니메이션용

  const imageKey = getStepImageName(currentFlowerId, progress);
  const image = flowerImages[imageKey];

  useEffect(() => {
    // 1. 현재 진행도에서 10% 증가한 목표값 계산
    const targetProgress = Math.min(progress + 10, 100);
    
    // 2. 애니메이션 효과 (현재 진행도에서 목표 진행도까지만 증가)
    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 1, targetProgress);
        }
        clearInterval(interval);
        return targetProgress;
      });
    }, 20);

    // 3. 실제 진행도 반영 및 이동 (하루에 한 번만 성장 허용)
    const timeout = setTimeout(async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const lastGrowthDate = await AsyncStorage.getItem('@lastFlowerGrowthDate');
      
      if (lastGrowthDate !== today) {
        // 오늘 첫 번째 운동이므로 꽃 성장 허용
        const newProgress = Math.min(progress + 10, 100);
        setProgress(newProgress);
        await AsyncStorage.setItem('@lastFlowerGrowthDate', today);
      }
      // 하루에 한 번 성장 제한과 관계없이 보상 페이지로 이동
      router.push('/Exercise/CoinRewardPage');
    }, 2000);

    // 4. 초기 로컬 진행도를 현재 진행도로 설정
    setLocalProgress(progress);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${localProgress}%` }]}>
            <Text style={styles.progressText}>{localProgress}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#ddd',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 180,
    marginBottom: 20,
  },
  barBackground: {
    width: 200,
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: 20,
    backgroundColor: '#B2B8FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
