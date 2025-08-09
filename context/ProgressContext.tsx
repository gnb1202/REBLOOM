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
  // Decoration 관련 기능
  obtainedDecorations: string[];
  addObtainedDecoration: (id: string) => void;
  placedDecorations: { x: number; y: number; id: string }[];
  setPlacedDecorations: (items: { x: number; y: number; id: string }[]) => void;
  setPlacedDecorationsLocal: (items: { x: number; y: number; id: string }[]) => void;
  selectedDecoration: string | null;
  setSelectedDecoration: (id: string | null) => void;
};

const defaultProgressContext: ProgressContextType = {
  progress: 0,
  currentFlowerId: 'daisy',
  setProgress: () => {},
  setCurrentFlowerId: () => {},
  obtainedFlowers: [],
  addObtainedFlower: () => {},
  obtainedFurniture: [],
  addObtainedFurniture: () => {},
  obtainedRooms: [],
  addObtainedRoom: () => {},
  selectedRoom: 'default',
  setSelectedRoom: () => {},
  hasChair: false,
  setHasChair: () => {},
  hasStand: false,
  setHasStand: () => {},
  coins: 1000,
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
  obtainedDecorations: [],
  addObtainedDecoration: () => {},
  placedDecorations: [],
  setPlacedDecorations: () => {},
  setPlacedDecorationsLocal: () => {},
  selectedDecoration: null,
  setSelectedDecoration: () => {},
};

const ProgressContext = createContext<ProgressContextType>(defaultProgressContext);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [progress, setProgressState] = useState(0);
  const [currentFlowerId, setCurrentFlowerIdState] = useState(defaultProgressContext.currentFlowerId);
  const [obtainedFlowersState, setObtainedFlowersState] = useState<string[]>([]);
  const [obtainedFurnitureState, setObtainedFurnitureState] = useState<string[]>([]);
  const [obtainedRoomsState, setObtainedRoomsState] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoomState] = useState(defaultProgressContext.selectedRoom);
  const [hasChair, setHasChairState] = useState(false);
  const [hasStand, setHasStandState] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flowerBadgeLevel, setFlowerBadgeLevel] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [exerciseFeedbackCount, setExerciseFeedbackCount] = useState(0);
  const [placedFlowers, setPlacedFlowersState] = useState<{ x: number; y: number; id: string }[]>([]);
  const [placedFurniture, setPlacedFurnitureState] = useState<{ x: number; y: number; id: string }[]>([]);
  const [obtainedDecorationsState, setObtainedDecorationsState] = useState<string[]>([]);
  const [placedDecorationsState, setPlacedDecorationsState] = useState<{ x: number; y: number; id: string }[]>([]);
  const [selectedDecorationState, setSelectedDecorationState] = useState<string | null>(null);

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
        const savedObtainedDecorations = await AsyncStorage.getItem('@obtainedDecorations');
        const savedPlacedDecorations = await AsyncStorage.getItem('@placedDecorations');
        const savedSelectedDecoration = await AsyncStorage.getItem('@selectedDecoration');

        console.log('[ProgressContext] 초기 로드', {
          savedProgress, savedFlowerId, savedObtained, savedFurniture, savedRooms, savedSelectedRoom,
          savedHasChair, savedHasStand, savedCoins, savedBadgeLevel, savedCompletedChallenges, savedFeedbackCount,
          savedPlacedFlowers, savedPlacedFurniture, savedObtainedDecorations, savedPlacedDecorations, savedSelectedDecoration
        });

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
        if (savedPlacedFurniture !== null) {
          setPlacedFurnitureState(JSON.parse(savedPlacedFurniture));
        } else {
          // 📌 첫 시작 시 기본 우체통 제공
          const defaultMailbox = { id: 'mailbox_A_black', x: 0, y: 0 }; // x, y는 Homepage에서 재계산됨
          setPlacedFurnitureState([defaultMailbox]);
          await AsyncStorage.setItem('@placedFurniture', JSON.stringify([defaultMailbox]));
        }
        if (savedObtainedDecorations !== null) setObtainedDecorationsState(JSON.parse(savedObtainedDecorations));
        if (savedPlacedDecorations !== null) setPlacedDecorationsState(JSON.parse(savedPlacedDecorations));
        if (savedSelectedDecoration !== null) setSelectedDecorationState(savedSelectedDecoration);

        if (savedFlowerId !== null) {
          setCurrentFlowerIdState(savedFlowerId);
        } else {
          await AsyncStorage.setItem('@currentFlowerId', 'daisy');
          setCurrentFlowerIdState('daisy');
        }

        if (user) {
          await loadFromFirebase(user.uid);
        }
      } catch (e) {
        console.error('[ProgressContext] 저장된 데이터 불러오기 실패:', e);
      } finally {
        setIsLoaded(true);
        console.log('[ProgressContext] isLoaded → true');
      }
    };
    loadData();
  }, [user]);

  const setSelectedDecoration = async (id: string | null) => {
    setSelectedDecorationState(id);
    if (id) {
      await AsyncStorage.setItem('@selectedDecoration', id);
    } else {
      await AsyncStorage.removeItem('@selectedDecoration');
    }
    console.log('[ProgressContext] setSelectedDecoration', id);
    if (user && isLoaded) setTimeout(autoSyncToFirebase, 100);
  };

  const addObtainedDecoration = async (id: string) => {
    try {
      if (!obtainedDecorationsState.includes(id)) {
        const updated = [...obtainedDecorationsState, id];
        setObtainedDecorationsState(updated);
        await AsyncStorage.setItem('@obtainedDecorations', JSON.stringify(updated));
        console.log('[ProgressContext] addObtainedDecoration', updated);
        if (user && isLoaded) {
          setTimeout(autoSyncToFirebase, 100);
        }
      }
    } catch (e) {
      console.error('[ProgressContext] 수집 데코레이션 저장 실패:', e);
    }
  };

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
    console.log('[ProgressContext] incrementFeedbackCount', newCount);

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
      console.log('[ProgressContext] setProgress', value);
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('[ProgressContext] 진행도 저장 실패:', e);
    }
  };

  const setCurrentFlowerId = async (id: string) => {
    try {
      await AsyncStorage.setItem('@currentFlowerId', id);
      setCurrentFlowerIdState(id);
      console.log('[ProgressContext] setCurrentFlowerId', id);
    } catch (e) {
      console.error('[ProgressContext] 꽃 ID 저장 실패:', e);
    }
  };

  const addObtainedFlower = async (id: string) => {
    console.warn('꽃은 상점 구매가 불가능합니다. 운동을 통해서만 획득 가능합니다.');
    return;
  };

  const addObtainedFurniture = async (id: string) => {
    try {
      const updated = [...new Set([...obtainedFurnitureState, id])];
      setObtainedFurnitureState(updated);
      await AsyncStorage.setItem('@obtainedFurniture', JSON.stringify(updated));
      console.log('[ProgressContext] addObtainedFurniture', updated);
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('[ProgressContext] 수집 가구 저장 실패:', e);
    }
  };

  const addObtainedRoom = async (id: string) => {
    try {
      const updated = [...new Set([...obtainedRoomsState, id])];
      setObtainedRoomsState(updated);
      await AsyncStorage.setItem('@obtainedRooms', JSON.stringify(updated));
      console.log('[ProgressContext] addObtainedRoom', updated);
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('[ProgressContext] 수집 방 저장 실패:', e);
    }
  };

  const setSelectedRoom = async (id: string) => {
    try {
      setSelectedRoomState(id);
      await AsyncStorage.setItem('@selectedRoom', id);
      console.log('[ProgressContext] setSelectedRoom', id);
      setTimeout(autoSyncToFirebase, 100);
    } catch (e) {
      console.error('[ProgressContext] 선택된 방 저장 실패:', e);
    }
  };

  const setHasChair = async (value: boolean) => {
    try {
      setHasChairState(value);
      await AsyncStorage.setItem('@hasChair', JSON.stringify(value));
      console.log('[ProgressContext] setHasChair', value);
    } catch (e) {
      console.error('[ProgressContext] 의자 상태 저장 실패:', e);
    }
  };

  const setHasStand = async (value: boolean) => {
    try {
      setHasStandState(value);
      await AsyncStorage.setItem('@hasStand', JSON.stringify(value));
      console.log('[ProgressContext] setHasStand', value);
    } catch (e) {
      console.error('[ProgressContext] 스탠드 상태 저장 실패:', e);
    }
  };

  const syncWithFirebaseRetry = async (userId: string, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await syncWithFirebase(userId);
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error('[ProgressContext] Firebase 동기화 최종 실패 - 모든 재시도 완료');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  };

  const autoSyncToFirebase = async () => {
    if (user && isLoaded) {
      await syncWithFirebaseRetry(user.uid, 3);
    }
  };

  const setPlacedFlowers = async (items: { x: number; y: number; id: string }[]) => {
    try {
      setPlacedFlowersState(items);
      await AsyncStorage.setItem('@placedFlowers', JSON.stringify(items));
      console.log('[ProgressContext] setPlacedFlowers', items);
      if (user && isLoaded) {
        await syncWithFirebaseRetry(user.uid, 3);
      }
    } catch (e) {
      console.error('[ProgressContext] 꽃 위치 저장 실패:', e);
    }
  };

  const setPlacedFurniture = async (items: { x: number; y: number; id: string }[]) => {
    try {
      setPlacedFurnitureState(items);
      await AsyncStorage.setItem('@placedFurniture', JSON.stringify(items));
      console.log('[ProgressContext] setPlacedFurniture', items);
      if (user && isLoaded) {
        await syncWithFirebaseRetry(user.uid, 3);
      }
    } catch (e) {
      console.error('[ProgressContext] 가구 위치 저장 실패:', e);
    }
  };

  const spendCoins = async (amount: number) => {
    if (coins >= amount) {
      const updated = coins - amount;
      setCoins(updated);
      await AsyncStorage.setItem('@coins', JSON.stringify(updated));
      console.log('[ProgressContext] spendCoins', updated);
      return true;
    } else {
      return false;
    }
  };

  const setPlacedDecorationsLocal = (items: { x: number; y: number; id: string }[]) => {
    setPlacedDecorationsState(items);
    console.log('[ProgressContext] setPlacedDecorationsLocal', items);
  };

  const setPlacedDecorations = async (items: { x: number; y: number; id: string }[]) => {
    try {
      setPlacedDecorationsState(items);
      await AsyncStorage.setItem('@placedDecorations', JSON.stringify(items));
      console.log('[ProgressContext] setPlacedDecorations', items);
      if (user && isLoaded) {
        await syncWithFirebaseRetry(user.uid, 3);
      }
    } catch (e) {
      console.error('[ProgressContext] 데코레이션 위치 저장 실패:', e);
    }
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
        decorations: placedDecorationsState,
        obtainedDecorations: obtainedDecorationsState,
        selectedDecoration: selectedDecorationState,
      });
      console.log('[ProgressContext] syncWithFirebase 완료');
    } catch (error) {
      console.error('[ProgressContext] Firebase 동기화 실패:', error);
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
        if (roomData.decorations) setPlacedDecorationsState(roomData.decorations);
        if (roomData.obtainedDecorations) setObtainedDecorationsState(roomData.obtainedDecorations);
        if (roomData.progress !== undefined) setProgressState(roomData.progress);
        if (roomData.currentFlowerId) setCurrentFlowerIdState(roomData.currentFlowerId);
        if (roomData.coins !== undefined) setCoins(roomData.coins);
        if (roomData.hasChair !== undefined) setHasChairState(roomData.hasChair);
        if (roomData.hasStand !== undefined) setHasStandState(roomData.hasStand);
        if (roomData.flowerBadgeLevel !== undefined) setFlowerBadgeLevel(roomData.flowerBadgeLevel);
        if (roomData.completedChallenges) setCompletedChallenges(roomData.completedChallenges);
        if (roomData.exerciseFeedbackCount !== undefined) setExerciseFeedbackCount(roomData.exerciseFeedbackCount);
        if (roomData.selectedDecoration !== undefined) setSelectedDecorationState(roomData.selectedDecoration);
        console.log('[ProgressContext] loadFromFirebase', roomData);
      }
    } catch (error) {
      console.error('[ProgressContext] Firebase에서 방 데이터 로드 실패:', error);
    }
  };

  // value 변화 추적용 로그 (디버깅에 매우 유용)
  useEffect(() => {
    if (isLoaded) {
      console.log('[ProgressContext] Provider value', {
        progress,
        currentFlowerId,
        obtainedFlowers: obtainedFlowersState,
        obtainedFurniture: obtainedFurnitureState,
        obtainedRooms: obtainedRoomsState,
        selectedRoom,
        hasChair,
        hasStand,
        coins,
        isLoaded,
        flowerBadgeLevel,
        completedChallenges,
        exerciseFeedbackCount,
        placedFlowers,
        placedFurniture,
        obtainedDecorations: obtainedDecorationsState,
        placedDecorations: placedDecorationsState,
        selectedDecoration: selectedDecorationState,
      });
    }
  }, [
    progress, currentFlowerId, obtainedFlowersState, obtainedFurnitureState,
    obtainedRoomsState, selectedRoom, hasChair, hasStand, coins, isLoaded,
    flowerBadgeLevel, completedChallenges, exerciseFeedbackCount, placedFlowers,
    placedFurniture, obtainedDecorationsState, placedDecorationsState, selectedDecorationState
  ]);

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
        obtainedDecorations: obtainedDecorationsState,
        addObtainedDecoration,
        placedDecorations: placedDecorationsState,
        setPlacedDecorations,
        setPlacedDecorationsLocal,
        selectedDecoration: selectedDecorationState,
        setSelectedDecoration,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
