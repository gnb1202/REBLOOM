import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

import doorImage from '../../assets/images/StartImages/Startimage.png';

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
            '권한 필요',
            '앱을 사용하려면 카메라와 갤러리 권한이 필요합니다.',
            [
              {
                text: '설정으로 이동',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                },
              },
              {
                text: '취소',
                style: 'cancel',
                onPress: () => setPermissionsGranted(false),
              },
            ]
          );
        }
      } catch (err) {
        console.error('권한 요청 중 오류 발생:', err);
        setPermissionsGranted(false);
      }
    };

    checkPermissionsOnce();
  }, []);

  if (permissionsGranted === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={{ marginTop: 12 }}>권한을 확인하는 중입니다...</Text>
      </View>
    );
  }

  if (!permissionsGranted) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#000', textAlign: 'center' }}>
          권한이 거부되어 앱을 실행할 수 없습니다.
          {'\n'}설정에서 권한을 허용해주세요.
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
          <TouchableOpacity onPress={() => router.push('/Entry_page/Loginpage')}>
            <Text style={styles.menuText}>로그인</Text>
          </TouchableOpacity>

          <Text style={styles.menuDivider}>|</Text>

          <TouchableOpacity onPress={() => router.push('/Entry_page/Signuppage')}>
            <Text style={styles.menuText}>회원가입</Text>
          </TouchableOpacity>

          <Text style={styles.menuDivider}>|</Text>

          <TouchableOpacity onPress={() => alert('ID/PW 찾기 페이지로 이동 예정')}>
            <Text style={styles.menuText}>ID/PW 찾기</Text>
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
    paddingBottom: 100,
  },
  title: {
    position: 'absolute',
    top: 40,
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
