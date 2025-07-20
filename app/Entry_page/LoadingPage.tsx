import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

// ✅ 정확한 경로로 애니메이션 파일 import
import loadingAnimation from '../../assets/lottie/loading_animation.json';

export default function LoadingPage() {
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={loadingAnimation}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          router.replace('/Entry_page/Loginpage');
        }}
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottie: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
  },
});
