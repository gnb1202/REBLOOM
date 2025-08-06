import Slider from '@react-native-community/slider';
import { ResizeMode, Video } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ExerciseVideoPage() {
  const router = useRouter();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState<any>(null);

  useEffect(() => {
    const backAction = () => {
      if (isExpanded) {
        setIsExpanded(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [isExpanded]);

  const toggleCamera = () => {
    setCameraType(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const handleSliderChange = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!permission) return <Text>카메라 권한 요청 중...</Text>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.endButton}>
          <Text style={styles.endButtonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ 시범 영상 */}
      <View style={[styles.previewBox, isExpanded && styles.previewBoxExpanded]}>
        <Video
          ref={videoRef}
          source={require('../../assets/images/animations/demo.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          useNativeControls={false}
          onPlaybackStatusUpdate={status => setVideoStatus(status)}
        />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewText}>시범영상</Text>
        </View>

        {/* ✅ 슬라이더 or 시간 */}
        {videoStatus && (
          <View style={styles.sliderContainer}>
            {Platform.OS !== 'web' ? (
              <Slider
                style={{ width: '90%' }}
                minimumValue={0}
                maximumValue={videoStatus.durationMillis || 0}
                value={videoStatus.positionMillis || 0}
                onSlidingComplete={handleSliderChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#888888"
                thumbTintColor="#5C7BEE"
              />
            ) : (
              <Text style={styles.timeText}>
                {formatTime(videoStatus.positionMillis)} / {formatTime(videoStatus.durationMillis)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* ✅ 본 영상 (카메라) - 확대 중이면 숨김 */}
      {!isExpanded && (
        <View style={styles.mainVideoBox}>
          <CameraView style={StyleSheet.absoluteFill} facing={cameraType} />
          <View style={styles.overlay}>
            <Text style={styles.mainText}>본 영상</Text>
            <Text style={styles.subInfo}>본 영상 화면에서{"\n"}횟수 / 자세정확도 등 표시</Text>
            <TouchableOpacity onPress={toggleCamera}>
              <Text style={styles.toggleButton}>🔄 전면/후면 전환</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 하단 컨트롤 바 */}
      {!isExpanded && (
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.controlText}>◁</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.controlText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.controlText}>⛶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 운동 종료 버튼 */}
      {!isExpanded && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => router.push('/Exercise/ExerciseSummaryPage')}
        >
          <Text style={styles.endButtonText}>운동 종료</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    position: 'relative',
  },
  previewBox: {
    flex: 2,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  previewBoxExpanded: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#000',
    margin: 0,
    borderRadius: 0,
  },
  previewOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  previewText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainVideoBox: {
    flex: 4,
    backgroundColor: '#000',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subInfo: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  toggleButton: {
    color: '#fff',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  controlText: {
    fontSize: 16,
    color: '#444',
  },
  endButton: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 24,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
});
