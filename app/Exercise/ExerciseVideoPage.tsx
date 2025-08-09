import Slider from '@react-native-community/slider';
import { ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useExercise } from '../../context/ExerciseContext';

// 운동 ID와 비디오 파일을 매핑
const videoSources: { [key: string]: any } = {
  shoulder_flexion: require('../../assets/images/animations/demo.mp4'),
  shoulder_abduction_1: require('../../assets/images/animations/demo.mp4'),
  // ... 다른 운동 비디오들도 여기에 추가 ...
  default: require('../../assets/images/animations/demo.mp4'),
};

export default function ExerciseVideoPage() {
  const router = useRouter();
  const { getCurrentExercise } = useExercise();
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState<any>(null);

  const currentExercise = getCurrentExercise();

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

  if (!currentExercise) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={{marginTop: 10}}>Loading exercise video...</Text>
      </View>
    );
  }

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

  const videoSource = videoSources[currentExercise.id] || videoSources.default;

  return (
    <View style={styles.container}>
      <Text style={styles.exerciseTitle}>{currentExercise.title}</Text>

      {/* 시범 영상 */}
      <View style={[styles.previewBox, isExpanded && styles.previewBoxExpanded]}>
        <Video
          ref={videoRef}
          source={videoSource}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          useNativeControls={false}
          onPlaybackStatusUpdate={status => setVideoStatus(status)}
        />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewText}>Demonstration Video</Text>
        </View>
        {/* 슬라이더 or 시간 */}
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

        {/* 전체화면에서만 오른쪽 위에 ✕ 버튼 */}
        {isExpanded && (
          <TouchableOpacity
            onPress={toggleExpand}
            style={styles.fullScreenExitBtn}
          >
            <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 하단 컨트롤 바 (전체화면 아닐 때만) */}
      {!isExpanded && (
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.controlText}>◁ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.controlText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          {/* ⛶ 버튼: 전체화면 진입 */}
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.controlText}>⛶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 운동 시작 버튼 */}
      {!isExpanded && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => router.push('/Exercise/ExerciseDo')}
        >
          <Text style={styles.endButtonText}>Let's Do it!</Text>
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
  exerciseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  previewBox: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullScreenExitBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#2228',
    borderRadius: 18,
    padding: 10,
    zIndex: 1000,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  controlText: {
    fontSize: 18,
    color: '#444',
    paddingHorizontal: 16,
  },
  endButton: {
    backgroundColor: '#5C7BEE',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 24,
    elevation: 2,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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