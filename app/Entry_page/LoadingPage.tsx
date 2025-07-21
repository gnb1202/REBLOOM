import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';

// ✅ GIF 이미지 import (경로는 실제 파일에 맞게 조정)
import loadingGif from '../../assets/images/animations/loading_animation.gif';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Entry_page/Loginpage');
    }, 2000); // 애니메이션 시간에 맞게 조정

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={loadingGif}
        style={styles.image}
        resizeMode="contain"
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
  image: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
  },
});
