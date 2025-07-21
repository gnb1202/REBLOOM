import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProgressContextType = {
  progress: number;
  currentFlowerId: string;
  setProgress: (value: number) => void;
  setCurrentFlowerId: (id: string) => void;
  obtainedFlowers: string[];
  addObtainedFlower: (id: string) => void;
  obtainedFurniture: string[];
  addObtainedFurniture: (id: string) => void;
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
});

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

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgressState] = useState(0);
  const [currentFlowerId, setCurrentFlowerIdState] = useState('');
  const [obtainedFlowersState, setObtainedFlowersState] = useState<string[]>([]);
  const [obtainedFurnitureState, setObtainedFurnitureState] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('@flowerProgress');
        const savedFlowerId = await AsyncStorage.getItem('@currentFlowerId');
        const savedObtained = await AsyncStorage.getItem('@obtainedFlowers');
        const savedFurniture = await AsyncStorage.getItem('@obtainedFurniture');

        if (savedProgress !== null) setProgressState(JSON.parse(savedProgress));
        if (savedObtained !== null) setObtainedFlowersState(JSON.parse(savedObtained));
        if (savedFurniture !== null) setObtainedFurnitureState(JSON.parse(savedFurniture));

        if (savedFlowerId !== null) {
          setCurrentFlowerIdState(savedFlowerId);
        } else {
          await AsyncStorage.setItem('@currentFlowerId', 'daisy');
          setCurrentFlowerIdState('daisy');
        }
      } catch (e) {
        console.error('저장된 데이터 불러오기 실패:', e);
      }
    };
    loadData();
  }, []);

  const setProgress = async (value: number) => {
    try {
      if (value >= 100) {
        const currentIndex = flowerOrder.indexOf(currentFlowerId);
        const nextFlowerId = flowerOrder[currentIndex + 1];

        const updated = [...new Set([...obtainedFlowersState, currentFlowerId])];
        setObtainedFlowersState(updated);
        await AsyncStorage.setItem('@obtainedFlowers', JSON.stringify(updated));

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
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
