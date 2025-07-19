import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../context/ProgressContext';

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
  // 예시 (실제 경로에 맞게 수정)
  daisy_step1: require('../assets/images/flowers/daisy/daisystep1.png'),
  daisy_step2: require('../assets/images/flowers/daisy/daisystep2.png'),
  daisy_step3: require('../assets/images/flowers/daisy/daisystep3.png'),
  // ... (다른 꽃들도 추가)
};

function getStepImageName(flowerId: string, progress: number): string {
  let step = 1;
  if (progress >= 80) step = 3;
  else if (progress >= 40) step = 2;
  return `${flowerId}_step${step}`;
}

export default function FlowerDetail() {
  const router = useRouter();
  const { currentFlowerId, progress, updateProgress, goToNextFlower, isLast } = useProgress();

  const flower = flowerData[currentFlowerId];
  const image = flowerImages[getStepImageName(currentFlowerId, progress)];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>꽃 관리</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressTextLeft}>{progress}%</Text> {/* ✅ 왼쪽 고정 텍스트 */}
      </View>

      <Image source={image} style={styles.image} resizeMode="contain" />

      <Text style={styles.name}>{flower.name}</Text>
      <Text style={styles.desc}>{flower.desc}</Text>

      {/* 성장 버튼 */}
      <TouchableOpacity
        onPress={() => updateProgress(progress + 20)}
        style={{ marginTop: 20 }}
        disabled={progress >= 100}
      >
        <Text style={{ color: 'blue' }}>진행도 +20%</Text>
      </TouchableOpacity>

      {/* 다음 꽃 버튼 */}
      <TouchableOpacity
        onPress={goToNextFlower}
        disabled={progress < 100 || isLast}
        style={{ marginTop: 10, opacity: progress < 100 || isLast ? 0.4 : 1 }}
      >
        <Text style={{ color: 'green' }}>
          {isLast ? '마지막 꽃입니다' : '다음 꽃으로 이동'}
        </Text>
      </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
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
});
