import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const flowerOrder = [
  'daisy',
  'hydrangea',
  'lavender',
  'lily',
  'rose',
  'sunflower',
  'trumpetcreeper',
  'tulip',
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
});

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgressState] = useState(0);
  const [currentFlowerId, setCurrentFlowerIdState] = useState('');
  const [obtainedFlowersState, setObtainedFlowersState] = useState<string[]>([]);
  const [obtainedFurnitureState, setObtainedFurnitureState] = useState<string[]>([]);
  const [hasChair, setHasChairState] = useState(false);
  const [hasStand, setHasStandState] = useState(false);
  const [coins, setCoins] = useState(1000);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flowerBadgeLevel, setFlowerBadgeLevel] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [exerciseFeedbackCount, setExerciseFeedbackCount] = useState(0);


  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('@flowerProgress');
        const savedFlowerId = await AsyncStorage.getItem('@currentFlowerId');
        const savedObtained = await AsyncStorage.getItem('@obtainedFlowers');
        const savedFurniture = await AsyncStorage.getItem('@obtainedFurniture');
        const savedHasChair = await AsyncStorage.getItem('@hasChair');
        const savedHasStand = await AsyncStorage.getItem('@hasStand');
        const savedCoins = await AsyncStorage.getItem('@coins');
        const savedBadgeLevel = await AsyncStorage.getItem('@flowerBadgeLevel');
        const savedCompletedChallenges = await AsyncStorage.getItem('@completedChallenges');
        const savedFeedbackCount = await AsyncStorage.getItem('@exerciseFeedbackCount');

        if (savedFeedbackCount !== null) setExerciseFeedbackCount(JSON.parse(savedFeedbackCount));
        if (savedProgress !== null) setProgressState(JSON.parse(savedProgress));
        if (savedObtained !== null) setObtainedFlowersState(JSON.parse(savedObtained));
        if (savedFurniture !== null) setObtainedFurnitureState(JSON.parse(savedFurniture));
        if (savedHasChair !== null) setHasChairState(JSON.parse(savedHasChair));
        if (savedHasStand !== null) setHasStandState(JSON.parse(savedHasStand));
        if (savedCoins !== null) setCoins(JSON.parse(savedCoins));
        if (savedBadgeLevel !== null) setFlowerBadgeLevel(JSON.parse(savedBadgeLevel));
        if (savedCompletedChallenges !== null) setCompletedChallenges(JSON.parse(savedCompletedChallenges));

        if (savedFlowerId !== null) {
          setCurrentFlowerIdState(savedFlowerId);
        } else {
          await AsyncStorage.setItem('@currentFlowerId', 'daisy');
          setCurrentFlowerIdState('daisy');
        }
      } catch (e) {
        console.error('저장된 데이터 불러오기 실패:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

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

      // 피드백 도전과제 조건 충족 시 자동 완료 처리
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
    try {
      const updated = [...new Set([...obtainedFlowersState, id])];
      setObtainedFlowersState(updated);
      await AsyncStorage.setItem('@obtainedFlowers', JSON.stringify(updated));
    } catch (e) {
      console.error('수집 꽃 저장 실패:', e);
    }
  };

  const addObtainedFurniture = async (id: string) => {
    try {
      const updated = [...new Set([...obtainedFurnitureState, id])];
      setObtainedFurnitureState(updated);
      await AsyncStorage.setItem('@obtainedFurniture', JSON.stringify(updated));
    } catch (e) {
      console.error('수집 가구 저장 실패:', e);
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
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);