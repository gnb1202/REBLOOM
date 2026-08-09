import { useEffect } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import loadingGif from '../../assets/images/animations/loading_animation_door.gif';

export default function TravelLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/Travel/ExplorePage');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={loadingGif}
        style={styles.centerImage}
        resizeMode="contain"
      />
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
  centerImage: {
    width: 300,
    height: 300,
  },
});
