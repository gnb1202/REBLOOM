import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../../context/ProgressContext';

const flowerData = {
  daisy: { name: '데이지', desc: '순수함과 밝은 에너지' },
  hydrangea: { name: '수국', desc: '진심, 감사' },
  lavender: { name: '라벤더', desc: '힐링과 평온' },
  lily: { name: '백합', desc: '순결과 평온' },
  rose: { name: '장미', desc: '사랑과 열정' },
  sunflower: { name: '해바라기', desc: '희망과 충성' },
  trumpetcreeper: { name: '능소화', desc: '영광' },
  tulip: { name: '튤립', desc: '사랑의 고백' },
};

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

const flowerSequence = [
  'daisy',
  'hydrangea',
  'lavender',
  'lily',
  'rose',
  'sunflower',
  'trumpetcreeper',
  'tulip',
];

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

function getFlowerMessage(progress: number): string {
  if (progress >= 100) return '🌼 예쁘게 피었습니다!';
  if (progress >= 80) return '🌸 거의 다 피었어요!';
  if (progress >= 40) return '🌿 꽃이 자라고 있어요!';
  return '🌱 아직 새싹이에요!';
}

export default function Flowermanage() {
  const router = useRouter();
  const {
    currentFlowerId,
    progress,
    setProgress,
    setCurrentFlowerId,
    addObtainedFlower,
     completeChallenge,
      obtainedFlowers,
  } = useProgress();
  const [hasAwarded, setHasAwarded] = useState(false);

  const flower = flowerData[currentFlowerId];
  const imageKey = getStepImageName(currentFlowerId, progress);
  const image = flowerImages[imageKey];

  useEffect(() => {
    if (progress >= 100 && !hasAwarded) {
      Alert.alert('🎉 꽃을 획득했어요!', '꽃이 만개했습니다!');

      // 수집에 추가
      addObtainedFlower(currentFlowerId);

      const count = obtainedFlowers.length + 1;
          if (count <= 4) {
            const challengeId = `flower-${count}`;
            completeChallenge(challengeId);
          }

      // 다음 꽃으로 이동
      const currentIndex = flowerSequence.indexOf(currentFlowerId);
      const nextFlower = flowerSequence[currentIndex + 1] || '';

      setCurrentFlowerId(nextFlower);
      setProgress(0);
      setHasAwarded(true);
    }

    if (progress < 100 && hasAwarded) {
      setHasAwarded(false); // 상태 복구
    }
  }, [progress]);

  if (!flower) {
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 100 }}>🌸 현재 관리 중인 꽃이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>꽃 관리</Text>
      </View>

      {/* 진행률 바 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressTextLeft}>{progress}%</Text>
      </View>

      {/* 이미지 */}
      <Image source={image} style={styles.image} resizeMode="contain" />

      {/* 텍스트 */}
      <Text style={styles.name}>{flower.name}</Text>
      <Text style={styles.desc}>{flower.desc}</Text>
      <Text style={styles.statusMessage}>{getFlowerMessage(progress)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  backButton: {
    paddingRight: 10,
  },
  back: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '80%',
    height: 20,
    marginTop: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  progressBar: {
    position: 'absolute',
    height: 20,
    backgroundColor: '#B2B8FF',
    borderRadius: 10,
    zIndex: 1,
  },
  progressTextLeft: {
    position: 'absolute',
    left: 8,
    zIndex: 2,
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  image: {
    width: 120,
    height: 120,
    marginTop: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },
  desc: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
  },
  statusMessage: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4A4A',
  },
});
