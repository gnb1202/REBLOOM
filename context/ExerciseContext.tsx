
import React, { createContext, ReactNode, useContext, useState } from 'react';

// 운동 항목 데이터 타입 정의
export interface ExerciseItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  target: string;
  imageUrl: any;
  count: number; // 운동 반복 횟수
}

// Context가 관리할 상태와 함수들의 타입 정의
interface ExerciseContextType {
  exerciseQueue: ExerciseItem[];
  currentExerciseIndex: number;
  exerciseStartTime: Date | null;
  exerciseEndTime: Date | null;
  
  // 운동 큐를 시작(설정)하는 함수
  startExerciseQueue: (exercises: ExerciseItem[]) => void;
  
  // 다음 운동으로 넘어가는 함수
  advanceToNextExercise: () => void;
  
  // 현재 진행 중인 운동 정보를 가져오는 함수
  getCurrentExercise: () => ExerciseItem | null;
  
  // 큐에 있는 모든 운동이 끝났는지 확인하는 함수
  isQueueFinished: () => boolean;
  
  // 운동 큐를 초기화하는 함수
  clearExerciseQueue: () => void;

  // 전체 큐의 운동 시간을 계산하는 함수
  getTotalDuration: () => number;
  
  // 실제 운동 시작 시간 기록
  recordExerciseStart: () => void;
  
  // 실제 운동 종료 시간 기록
  recordExerciseEnd: () => void;
  
  // 실제 소요 시간 계산 (초 단위)
  getActualDuration: () => number;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

// 다른 컴포넌트에서 ExerciseContext를 쉽게 사용하기 위한 커스텀 훅
export const useExercise = () => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider');
  }
  return context;
};

interface ExerciseProviderProps {
  children: ReactNode;
}

// Context의 실제 로직을 담고 있는 Provider 컴포넌트
export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({ children }) => {
  // 선택된 운동 목록을 저장하는 상태 (운동 큐)
  const [exerciseQueue, setExerciseQueue] = useState<ExerciseItem[]>([]);
  // 현재 진행 중인 운동의 큐 내 인덱스를 저장하는 상태
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  // 실제 운동 시작 시간
  const [exerciseStartTime, setExerciseStartTime] = useState<Date | null>(null);
  // 실제 운동 종료 시간
  const [exerciseEndTime, setExerciseEndTime] = useState<Date | null>(null);

  // 운동 큐를 설정하고 첫 번째 운동부터 시작
  const startExerciseQueue = (exercises: ExerciseItem[]) => {
    setExerciseQueue(exercises);
    setCurrentExerciseIndex(0);
    setExerciseStartTime(null);
    setExerciseEndTime(null);
  };

  // 다음 운동으로 인덱스를 이동
  const advanceToNextExercise = () => {
    setCurrentExerciseIndex(prevIndex => prevIndex + 1);
  };

  // 현재 운동 큐에서 현재 인덱스에 해당하는 운동 정보 반환
  const getCurrentExercise = () => {
    if (exerciseQueue.length > 0 && currentExerciseIndex < exerciseQueue.length) {
      return exerciseQueue[currentExerciseIndex];
    }
    return null;
  };

  // 모든 운동이 완료되었는지 확인
  const isQueueFinished = () => {
    return currentExerciseIndex >= exerciseQueue.length;
  };

  // 운동 큐와 인덱스를 초기 상태로 리셋
  const clearExerciseQueue = () => {
    setExerciseQueue([]);
    setCurrentExerciseIndex(0);
    setExerciseStartTime(null);
    setExerciseEndTime(null);
  };

  // 큐에 있는 모든 운동의 총 소요 시간(분)을 계산
  const getTotalDuration = () => {
    return exerciseQueue.reduce((total, exercise) => {
      const durationInMin = parseInt(exercise.duration.split(' ')[0], 10);
      return total + durationInMin;
    }, 0);
  };
  
  // 실제 운동 시작 시간 기록
  const recordExerciseStart = () => {
    setExerciseStartTime(new Date());
    setExerciseEndTime(null);
  };
  
  // 실제 운동 종료 시간 기록
  const recordExerciseEnd = () => {
    setExerciseEndTime(new Date());
  };
  
  // 실제 소요 시간 계산 (초 단위)
  const getActualDuration = () => {
    if (exerciseStartTime && exerciseEndTime) {
      return Math.floor((exerciseEndTime.getTime() - exerciseStartTime.getTime()) / 1000);
    }
    if (exerciseStartTime && !exerciseEndTime) {
      // 아직 진행 중인 경우 현재 시간까지 계산
      return Math.floor((new Date().getTime() - exerciseStartTime.getTime()) / 1000);
    }
    return 0;
  };

  // Context를 통해 제공할 값들
  const value: ExerciseContextType = {
    exerciseQueue,
    currentExerciseIndex,
    exerciseStartTime,
    exerciseEndTime,
    startExerciseQueue,
    advanceToNextExercise,
    getCurrentExercise,
    isQueueFinished,
    clearExerciseQueue,
    getTotalDuration,
    recordExerciseStart,
    recordExerciseEnd,
    getActualDuration,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};

export default ExerciseContext;
