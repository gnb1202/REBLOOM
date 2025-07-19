import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext'; // 전역 상태 접근

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

  trumpetcreeper_step1: require('../../assets/images/flowers/trumpetcreeper/trumpetcreeperstep1.png'),
  trumpetcreeper_step2: require('../../assets/images/flowers/trumpetcreeper/trumpetcreeperstep2.png'),

  tulip_step1: require('../../assets/images/flowers/tulip/tulipstep1.png'),
  tulip_step2: require('../../assets/images/flowers/tulip/tulipstep2.png'),
};

export default function PlantRewardPage() {
  const router = useRouter();
  const { currentFlowerId, progress, updateProgress } = useProgress(); // 전역 진행도 접근
  const [localProgress, setLocalProgress] = useState(0); // 시각적 애니메이션용

  // 실제 이미지 결정
  const imageKey = getStepImageName(currentFlowerId, progress);
  const image = flowerImages[imageKey];

  useEffect(() => {
    // 1. 애니메이션 효과
    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        if (prev < 100) return prev + 2;
        clearInterval(interval);
        return 100;
      });
    }, 20);

    // 2. 실제 진행도 반영 및 이동
    const timeout = setTimeout(() => {
      updateProgress(Math.min(progress + 10, 100)); // ✅ 전역 상태에 +10%
      router.push('/Exercise/CoinRewardPage');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image
          source={image} // 현재 꽃의 진행도에 맞는 이미지
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
