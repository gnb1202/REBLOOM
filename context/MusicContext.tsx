import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type MusicTheme = 'main' | 'exercise';

interface MusicContextType {
  isPlaying: boolean;
  currentTheme: MusicTheme;
  switchTheme: (theme: MusicTheme) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  volume: number;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  return context;
};

// 음악 파일 매핑
const MUSIC_FILES = {
  main: require('../assets/music/MainTheme.mp3'),
  exercise: require('../assets/music/ExerciseTheme.mp3'),
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<MusicTheme>('main');
  const [volume, setVolumeState] = useState(0.5); // 기본 볼륨 50%
  const soundRef = useRef<Audio.Sound | null>(null);
  const isInitialized = useRef(false);

  // Audio 초기화
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Audio 모드 설정
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });

        isInitialized.current = true;
        console.log('🎵 Audio 시스템 초기화 완료');
        
        // 기본 메인 테마 로드 및 재생
        await loadAndPlayTheme('main');
      } catch (error) {
        console.error('❌ Audio 초기화 실패:', error);
      }
    };

    initializeAudio();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadAndPlayTheme = async (theme: MusicTheme) => {
    try {
      // 기존 사운드 정리
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // 새 사운드 로드
      const { sound } = await Audio.Sound.createAsync(
        MUSIC_FILES[theme],
        {
          shouldPlay: true,
          isLooping: true,
          volume: volume,
        }
      );

      soundRef.current = sound;
      setCurrentTheme(theme);
      setIsPlaying(true);
      
      console.log(`🎵 테마 변경: ${theme === 'main' ? '메인 테마' : '운동 테마'}`);

      // 재생 상태 모니터링
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying || false);
        }
      });

    } catch (error) {
      console.error(`❌ ${theme} 테마 로드 실패:`, error);
    }
  };

  const switchTheme = async (theme: MusicTheme) => {
    if (!isInitialized.current || theme === currentTheme) return;
    
    console.log(`🔄 테마 전환: ${currentTheme} → ${theme}`);
    await loadAndPlayTheme(theme);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          console.log('⏸️ 음악 일시정지');
        } else {
          await soundRef.current.playAsync();
          console.log('▶️ 음악 재생');
        }
      }
    } catch (error) {
      console.error('❌ 재생/일시정지 실패:', error);
    }
  };

  const setVolume = async (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(clampedVolume);
        console.log(`🔊 볼륨 설정: ${Math.round(clampedVolume * 100)}%`);
      } catch (error) {
        console.error('❌ 볼륨 설정 실패:', error);
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTheme,
        switchTheme,
        togglePlayPause,
        setVolume,
        volume,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};