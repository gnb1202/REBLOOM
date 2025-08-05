import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';

import loadingGif from '../../assets/images/animations/loading_animation_door.gif';

export default function TravelLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Travel/TravelListPage');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={loadingGif}
        style={styles.bottomRightImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomRightImage: {
    position: 'absolute',
    width: 300,       // 원하는 크기로 조절 가능
    height: 300,
    bottom: 30,       // 하단 여백
    right: 20,        // 오른쪽 여백
  },
});
