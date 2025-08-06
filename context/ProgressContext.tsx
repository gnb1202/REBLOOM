import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUserRoomData, saveUserRoomData } from '../firebase.config';
import { useAuth } from './AuthContext';

const flowerOrder = [
  'daisy',
  'hydrangea',
  'lavender',
  'lily',
  'rose',
  'sunflower',
  'tulip',
  'freesia',
];

const getFlowerBadgeLevel = (count: number) => {
  return Math.min(count, 4);
};

type ProgressContextType = {
  progress: number;
  currentFlowerId: string;
  setProgress: (value: number) => void;
  setCurrentFlowerId: (id: string) => void;
  obtainedFlowers: string[];
  addObtainedFlower: (id: string) => void;
  obtainedFurniture: string[];
  addObtainedFurniture: (id: string) => void;
  obtainedRooms: string[];
  addObtainedRoom: (id: string) => void;
  selectedRoom: string;
  setSelectedRoom: (id: string) => void;
  hasChair: boolean;
  setHasChair: (value: boolean) => void;
  hasStand: boolean;
  setHasStand: (value: boolean) => void;
  coins: number;
  spendCoins: (amount: number) => Promise<boolean>;
  isLoaded: boolean;
  flowerBadgeLevel: number;
  completeChallenge: (id: string) => void;
  completedChallenges: string[];
  exerciseFeedbackCount: number;
  incrementFeedbackCount: () => void;
  placedFlowers: { x: number; y: number; id: string }[];
  setPlacedFlowers: (items: { x: number; y: number; id: string }[]) => void;
  placedFurniture: { x: number; y: number; id: string }[];
  setPlacedFurniture: (items: { x: number; y: number; id: string }[]) => void;
  syncWithFirebase: (userId: string) => Promise<void>;
  loadFromFirebase: (userId: string) => Promise<void>;
  updateProgress: (value: number) => void;
  goToNextFlower: () => void;
  isLast: boolean;
  // Decoration 구매 관련 추가
  purchasedDecorations: string[];
  addPurchasedDecoration: (id: string) => void;
};

const ProgressContext = createContext<ProgressContextType>({
  progress: 0,
  currentFlowerId: '',
  setProgress: () => {},
  setCurrentFlowerId: () => {},
  obtainedFlowers: [],
  addObtainedFlower: () => {},
  obtainedFurniture: [],
  addObtainedFurniture: () => {},
  obtainedRooms: [],
  addObtainedRoom: () => {},
  selectedRoom: '',
  setSelectedRoom: () => {},
  hasChair: false,
  setHasChair: () => {},
  hasStand: false,
  setHasStand: () => {},
  coins: 0,
  spendCoins: async () => false,
  isLoaded: false,
  flowerBadgeLevel: 0,
  completeChallenge: () => {},
  completedChallenges: [],
  exerciseFeedbackCount: 0,
  incrementFeedbackCount: () => {},
  placedFlowers: [],
  setPlacedFlowers: () => {},
  placedFurniture: [],
  setPlacedFurniture: () => {},
  syncWithFirebase: async () => {},
  loadFromFirebase: async () => {},
  updateProgress: () => {},
  goToNextFlower: () => {},
  isLast: false,
  purchasedDecorations: [],
  addPurchasedDecoration: () => {},
});

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [progress, setProgressState] = useState(0);
  const [currentFlowerId, setCurrentFlowerIdState] = useState('');
  const [obtainedFlowersState, setObtainedFlowersState] = useState<string[]>([]);
  const [obtainedFurnitureState, setObtainedFurnitureState] = useState<string[]>([]);
  const [obtainedRoomsState, setObtainedRoomsState] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoomState] = useState('');
  const [hasChair, setHasChairState] = useState(false);
  const [hasStand, setHasStandState] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flowerBadgeLevel, setFlowerBadgeLevel] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [exerciseFeedbackCount, setExerciseFeedbackCount] = useState(0);
  const [placedFlowers, setPlacedFlowersState] = useState<{ x: number; y: number; id: string }[]>([]);
  const [placedFurniture, setPlacedFurnitureState] = useState<{ x: number; y: number; id: string }[]>([]);
  // 추가
  const [purchasedDecorations, setPurchasedDecorations] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('@flowerProgress');
        const savedFlowerId = await AsyncStorage.getItem('@currentFlowerId');
        const savedObtained = await AsyncStorage.getItem('@obtainedFlowers');
        const savedFurniture = await AsyncStorage.getItem('@obtainedFurniture');
        const savedRooms = await AsyncStorage.getItem('@obtainedRooms');
        const savedSelectedRoom = await AsyncStorage.getItem('@selectedRoom');
        const savedHasChair = await AsyncStorage.getItem('@hasChair');
        const savedHasStand = await AsyncStorage.getItem('@hasStand');
        const savedCoins = await AsyncStorage.getItem('@coins');
        const savedBadgeLevel = await AsyncStorage.getItem('@flowerBadgeLevel');
        const savedCompletedChallenges = await AsyncStorage.getItem('@completedChallenges');
        const savedFeedbackCount = await AsyncStorage.getItem('@exerciseFeedbackCount');
        const savedPlacedFlowers = await AsyncStorage.getItem('@placedFlowers');
        const savedPlacedFurniture = await AsyncStorage.getItem('@placedFurniture');
        const savedPurchasedDecorations = await AsyncStorage.getItem('@purchasedDecorations');

        if (savedRooms !== null) setObtainedRoomsState(JSON.parse(savedRooms));
        if (savedSelectedRoom !== null) setSelectedRoomState(savedSelectedRoom);
        if (savedFeedbackCount !== null) setExerciseFeedbackCount(JSON.parse(savedFeedbackCount));
        if (savedProgress !== null) setProgressState(JSON.parse(savedProgress));
        if (savedObtained !== null) setObtainedFlowersState(JSON.parse(savedObtained));
        if (savedFurniture !== null) setObtainedFurnitureState(JSON.parse(savedFurniture));
        if (savedHasChair !== null) setHasChairState(JSON.parse(savedHasChair));
        if (savedHasStand !== null) setHasStandState(JSON.parse(savedHasStand));
        if (savedCoins !== null) setCoins(JSON.parse(savedCoins));
        if (savedBadgeLevel !== null) setFlowerBadgeLevel(JSON.parse(savedBadgeLevel));
        if (savedCompletedChallenges !== null) setCompletedChallenges(JSON.parse(savedCompletedChallenges));
        if (savedPlacedFlowers !== null) setPlacedFlowersState(JSON.parse(savedPlacedFlowers));
        if (savedPlacedFurniture !== null) setPlacedFurnitureState(JSON.parse(savedPlacedFurniture));
        if (savedPurchasedDecorations !== null) setPurchasedDecorations(JSON.parse(savedPurchasedDecorations));

        if (savedFlowerId !== null) {
          setCurrentFlowerIdState(savedFlowerId);
        } else {
          await AsyncStorage.setItem('@currentFlowerId', 'daisy');
          setCurrentFlowerIdState('daisy');
        }

        // 2단계: Firebase에서 최신 데이터 로드 (사용자가 로그인한 경우)
        if (user) {
          console.log('Firebase에서 최신 데이터 로딩 시작...');
          await loadFromFirebase(user.uid);
          console.log('Firebase 데이터 로딩 완료');
        }
      } catch (e) {
        console.error('저장된 데이터 불러오기 실패:', e);
      } finally {
        setIsLoaded(true);
        console.log('모든 데이터 로딩 완료, isLoaded: true');
      }
    };
    loadData();
  }, [user]);

  const completeChallenge = async (id: string) => {
    setCompletedChallenges((prev) => {
      if (!prev.includes(id)) {
        const updated = [...prev, id];
        AsyncStorage.setItem('@completedChallenges', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const incrementFeedbackCount = async () => {
    const newCount = exerciseFeedbackCount + 1;
    setExerciseFeedbackCount(newCount);
    await AsyncStorage.setItem('@exerciseFeedbackCount', JSON.stringify(newCount));

    if (newCount === 3) await completeChallenge('feedback-3');
    else if (newCount === 5) await completeChallenge('feedback-5');
    else if (newCount === 7) await completeChallenge('feedback-7');
  };

  const setProgress = async (value: number) => {
    try {
      if (value >= 100) {
        const currentIndex = flowerOrder.indexOf(currentFlowerId);
        const nextFlowerId = flowerOrder[currentIndex + 1];

        const updated = [...new Set([...obtainedFlowersState, currentFlowerId])];
        setObtainedFlowersState(updated);
        await AsyncStorage.setItem('@obtainedFlowers', JSON.stringify(updated));

        const newLevel = getFlowerBadgeLevel(updated.length);
        setFlowerBadgeLevel(newLevel);
        await AsyncStorage.setItem('@flowerBadgeLevel', JSON.stringify(newLevel));

        const flowerCount = updated.length;
        await completeChallenge(`flower-${flowerCount}`);

        if (nextFlowerId) {
          setCurrentFlowerIdState(nextFlowerId);
          await AsyncStorage.setItem('@currentFlowerId', nextFlowerId);
        } else {
          setCurrentFlowerIdState('');
          await AsyncStorage.removeItem('@currentFlowerId');
        }

        setProgressState(0);
        await AsyncStorage.setItem('@flowerProgress', '0');
      } else {
        setProgressState(value);
        await AsyncStorage.setItem('@flowerProgress', JSON.stringify(value));
      }
      // Firebase 자동 동기화
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('진행도 저장 실패:', e);
    }
  };

  const setCurrentFlowerId = async (id: string) => {
    try {
      await AsyncStorage.setItem('@currentFlowerId', id);
      setCurrentFlowerIdState(id);
    } catch (e) {
      console.error('꽃 ID 저장 실패:', e);
    }
  };

  const addObtainedFlower = async (id: string) => {
    // 꽃은 상점에서 구매할 수 없으며, 오직 운동을 통해서만 획득 가능
    console.warn('꽃은 상점 구매가 불가능합니다. 운동을 통해서만 획득 가능합니다.');
    return;
  };

  const addObtainedFurniture = async (id: string) => {
    try {
      const updated = [...new Set([...obtainedFurnitureState, id])];
      setObtainedFurnitureState(updated);
      await AsyncStorage.setItem('@obtainedFurniture', JSON.stringify(updated));
      // Firebase 자동 동기화
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('수집 가구 저장 실패:', e);
    }
  };

  const addObtainedRoom = async (id: string) => {
    try {
      const updated = [...new Set([...obtainedRoomsState, id])];
      setObtainedRoomsState(updated);
      await AsyncStorage.setItem('@obtainedRooms', JSON.stringify(updated));
      // Firebase 자동 동기화
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('수집 방 저장 실패:', e);
    }
  };

  const setSelectedRoom = async (id: string) => {
    try {
      setSelectedRoomState(id);
      await AsyncStorage.setItem('@selectedRoom', id);
      // Firebase 자동 동기화
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('선택된 방 저장 실패:', e);
    }
  };

  const setHasChair = async (value: boolean) => {
    try {
      setHasChairState(value);
      await AsyncStorage.setItem('@hasChair', JSON.stringify(value));
    } catch (e) {
      console.error('의자 상태 저장 실패:', e);
    }
  };

  const setHasStand = async (value: boolean) => {
    try {
      setHasStandState(value);
      await AsyncStorage.setItem('@hasStand', JSON.stringify(value));
    } catch (e) {
      console.error('스탠드 상태 저장 실패:', e);
    }
  };

  // Firebase 동기화 재시도 로직
  const syncWithFirebaseRetry = async (userId: string, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await syncWithFirebase(userId);
        console.log(`Firebase 동기화 성공 (시도 ${attempt}/${maxRetries})`);
        return;
      } catch (error) {
        console.error(`Firebase 동기화 실패 (시도 ${attempt}/${maxRetries}):`, error);
        if (attempt === maxRetries) {
          console.error('Firebase 동기화 최종 실패 - 모든 재시도 완료');
        } else {
          // 재시도 전 대기 (지수 백오프)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  };

  // Firebase 자동 동기화 헬퍼 함수 (기존 코드 호환성 유지)
  const autoSyncToFirebase = async () => {
    if (user && isLoaded) {
      await syncWithFirebaseRetry(user.uid, 3);
    }
  };

  const setPlacedFlowers = async (items: { x: number; y: number; id: string }[]) => {
    try {
      setPlacedFlowersState(items);
      await AsyncStorage.setItem('@placedFlowers', JSON.stringify(items));
      
      // Firebase 즉시 동기화 (재시도 로직 포함)
      if (user && isLoaded) {
        console.log('꽃 배치 데이터 Firebase 동기화 시작...');
        await syncWithFirebaseRetry(user.uid, 3);
      }
    } catch (e) {
      console.error('꽃 위치 저장 실패:', e);
    }
  };

  const setPlacedFurniture = async (items: { x: number; y: number; id: string }[]) => {
    try {
      setPlacedFurnitureState(items);
      await AsyncStorage.setItem('@placedFurniture', JSON.stringify(items));
      
      // Firebase 즉시 동기화 (재시도 로직 포함)
      if (user && isLoaded) {
        console.log('가구 배치 데이터 Firebase 동기화 시작...');
        await syncWithFirebaseRetry(user.uid, 3);
      }
    } catch (e) {
      console.error('가구 위치 저장 실패:', e);
    }
  };

  const spendCoins = async (amount: number) => {
    if (coins >= amount) {
      const updated = coins - amount;
      setCoins(updated);
      await AsyncStorage.setItem('@coins', JSON.stringify(updated));
      return true;
    } else {
      return false;
    }
  };

  // Decoration 구매 로직 추가
  const addPurchasedDecoration = async (id: string) => {
    setPurchasedDecorations(prev => {
      if (!prev.includes(id)) {
        const updated = [...prev, id];
        AsyncStorage.setItem('@purchasedDecorations', JSON.stringify(updated));
        // TODO: Firebase에 저장 필요 시 여기에 추가
        return updated;
      }
      return prev;
    });
  };

  const syncWithFirebase = async (userId: string) => {
    try {
      await saveUserRoomData(userId, {
        furniture: placedFurniture,
        selectedRoom: selectedRoom,
        flowers: placedFlowers,
        obtainedFlowers: obtainedFlowersState,
        obtainedFurniture: obtainedFurnitureState,
        obtainedRooms: obtainedRoomsState,
        progress: progress,
        currentFlowerId: currentFlowerId,
        coins: coins,
        hasChair: hasChair,
        hasStand: hasStand,
        flowerBadgeLevel: flowerBadgeLevel,
        completedChallenges: completedChallenges,
        exerciseFeedbackCount: exerciseFeedbackCount,
        purchasedDecorations: purchasedDecorations, // decoration도 함께 저장
      });
      console.log('Firebase 동기화 완료');
    } catch (error) {
      console.error('Firebase 동기화 실패:', error);
    }
  };

  const loadFromFirebase = async (userId: string) => {
    try {
      const roomData = await getUserRoomData(userId);
      if (roomData) {
        if (roomData.furniture) setPlacedFurnitureState(roomData.furniture);
        if (roomData.selectedRoom) setSelectedRoomState(roomData.selectedRoom);
        if (roomData.flowers) setPlacedFlowersState(roomData.flowers);
        if (roomData.obtainedFlowers) setObtainedFlowersState(roomData.obtainedFlowers);
        if (roomData.obtainedFurniture) setObtainedFurnitureState(roomData.obtainedFurniture);
        if (roomData.obtainedRooms) setObtainedRoomsState(roomData.obtainedRooms);
        if (roomData.progress !== undefined) setProgressState(roomData.progress);
        if (roomData.currentFlowerId) setCurrentFlowerIdState(roomData.currentFlowerId);
        if (roomData.coins !== undefined) setCoins(roomData.coins);
        if (roomData.hasChair !== undefined) setHasChairState(roomData.hasChair);
        if (roomData.hasStand !== undefined) setHasStandState(roomData.hasStand);
        if (roomData.flowerBadgeLevel !== undefined) setFlowerBadgeLevel(roomData.flowerBadgeLevel);
        if (roomData.completedChallenges) setCompletedChallenges(roomData.completedChallenges);
        if (roomData.exerciseFeedbackCount !== undefined) setExerciseFeedbackCount(roomData.exerciseFeedbackCount);

        console.log('Firebase에서 방 데이터 로드 완료');
      }
    } catch (error) {
      console.error('Firebase에서 방 데이터 로드 실패:', error);
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        currentFlowerId,
        setProgress,
        setCurrentFlowerId,
        obtainedFlowers: obtainedFlowersState,
        addObtainedFlower,
        obtainedFurniture: obtainedFurnitureState,
        addObtainedFurniture,
        obtainedRooms: obtainedRoomsState,
        addObtainedRoom,
        selectedRoom,
        setSelectedRoom,
        hasChair,
        setHasChair,
        hasStand,
        setHasStand,
        coins,
        spendCoins,
        isLoaded,
        flowerBadgeLevel,
        completeChallenge,
        completedChallenges,
        exerciseFeedbackCount,
        incrementFeedbackCount,
        placedFlowers,
        setPlacedFlowers,
        placedFurniture,
        setPlacedFurniture,
        syncWithFirebase,
        loadFromFirebase,
        updateProgress: setProgress,
        goToNextFlower: () => {
          const currentIndex = flowerOrder.indexOf(currentFlowerId);
          if (currentIndex !== -1 && currentIndex < flowerOrder.length - 1) {
            const nextFlower = flowerOrder[currentIndex + 1];
            setCurrentFlowerId(nextFlower);
            setProgress(0);
          }
        },
        isLast: flowerOrder.indexOf(currentFlowerId) === flowerOrder.length - 1,
        purchasedDecorations,
        addPurchasedDecoration,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
