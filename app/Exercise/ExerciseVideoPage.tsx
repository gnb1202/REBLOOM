import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Video } from 'expo-av';

export default function ExerciseVideoPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePlayPause = async () => {
    if (!status?.isLoaded) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleSliderValueChange = async (value) => {
    if (status?.isLoaded) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.previewBox, isExpanded && { flex: 6 }]}>
        <Video
          ref={videoRef}
          source={require('../../assets/images/animations/demo.mp4')}
          style={styles.video}
          resizeMode="cover"
          useNativeControls={false}
          shouldPlay
          isLooping
          onPlaybackStatusUpdate={setStatus}
        />
      </View>

      {!isExpanded && (
        <View style={styles.mainVideoBox}>
          <Text style={styles.mainText}>본 영상</Text>
          <Text style={styles.subInfo}>횟수 / 자세정확도 표시 등</Text>
        </View>
      )}

      {status?.isLoaded && (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status.durationMillis}
          value={status.positionMillis}
          onSlidingComplete={handleSliderValueChange}
          minimumTrackTintColor="#5C7BEE"
          maximumTrackTintColor="#ccc"
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.controlText}>◁</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause}>
          <Text style={styles.controlText}>{status?.isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.controlText}>⛶</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.endButton}
        onPress={() => router.push('/Exercise/ExerciseSummaryPage')}
      >
        <Text style={styles.endButtonText}>운동 종료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  previewBox: {
    backgroundColor: '#000',
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  mainVideoBox: {
    backgroundColor: '#bbb',
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12,
  },
  mainText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  subInfo: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  slider: {
    marginVertical: 8,
    width: '100%',
    height: 40,
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
});
