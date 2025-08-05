import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import doorImage from '../assets/images/StartImages/startpage.png';

const { width, height } = Dimensions.get('window');

export default function Startpage() {
  const router = useRouter();
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissionsOnce = async () => {
      const alreadyLaunched = await AsyncStorage.getItem('alreadyLaunched');

      if (Platform.OS === 'web') {
        setPermissionsGranted(true);
        return;
      }

      if (alreadyLaunched === 'true') {
        setPermissionsGranted(true);
        return;
      }

      try {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

        if (cameraStatus === 'granted' && mediaStatus === 'granted') {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            'Permission required',
            'To use the app, you need camera and gallery permissions.',
            [
              {
                text: 'Go to settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setPermissionsGranted(false),
              },
            ]
          );
        }
      } catch (err) {
        console.error('Error occurred while requesting permissions:', err);
        setPermissionsGranted(false);
      }
    };

    checkPermissionsOnce();
  }, []);

  if (permissionsGranted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={{ marginTop: 12 }}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permissionsGranted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#000', textAlign: 'center' }}>
          Permission denied.
          {'\n'}Please allow permissions in settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ImageBackground
        source={doorImage}
        style={styles.backgroundImage}
        resizeMode={Platform.OS === 'web' ? 'contain' : 'cover'}
      />

      <View style={styles.overlayContent}>
        <Text style={styles.title}>Re:Bloom</Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => router.push('/Entry_page/LoadingPage')}>
            <Text style={styles.menuText}>Login</Text>
          </TouchableOpacity>


          <Text style={styles.menuDivider}>|</Text>

          <TouchableOpacity onPress={() => router.push('/Entry_page/Signuppage')}>
            <Text style={styles.menuText}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: Platform.OS === 'web' ? '100%' : '100%',
    top: 0,
    ...(Platform.OS === 'web' && { objectFit: 'contain' }),
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 150,
  },
  title: {
    position: 'absolute',
    top: 70,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#000',
  },
  menuDivider: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
});