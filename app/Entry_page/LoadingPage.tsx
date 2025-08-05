import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';

import loadingGif from '../../assets/images/animations/loading_animation.gif';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Entry_page/Loginpage');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const windowWidth = Dimensions.get('window').width;
  const imageSize = Platform.OS === 'web'
    ? windowWidth * 0.4 // 웹에서는 40%
    : windowWidth * 0.8; // 앱에서는 80%

  return (
    <View style={styles.container}>
      <Image
        source={loadingGif}
        style={[styles.image, { width: imageSize, height: imageSize }]}
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
  },
});
