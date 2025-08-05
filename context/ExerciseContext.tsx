import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ExerciseData {
  exerciseId: string;
  exerciseName: string;
  duration: number; // 분 단위
  difficulty: number; // 1-5
  targetAreas?: string[];
  startTime?: Date;
  endTime?: Date;
}

interface ExerciseContextType {
  currentExercise: ExerciseData | null;
  setCurrentExercise: (exercise: ExerciseData) => void;
  updateExerciseDuration: (duration: number) => void;
  clearCurrentExercise: () => void;
  calculateRewards: () => { currency: number; experience: number };
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

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

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({ children }) => {
  const [currentExercise, setCurrentExerciseState] = useState<ExerciseData | null>(null);

  const setCurrentExercise = (exercise: ExerciseData) => {
    setCurrentExerciseState({
      ...exercise,
      startTime: new Date()
    });
  };

  const updateExerciseDuration = (duration: number) => {
    if (currentExercise) {
      setCurrentExerciseState(prev => prev ? {
        ...prev,
        duration,
        endTime: new Date()
      } : null);
    }
  };

  const clearCurrentExercise = () => {
    setCurrentExerciseState(null);
  };

  const calculateRewards = () => {
    if (!currentExercise) return { currency: 0, experience: 0 };
    
    const baseCurrency = Math.floor(currentExercise.duration * currentExercise.difficulty * 2);
    const baseExperience = Math.floor(currentExercise.duration * currentExercise.difficulty);
    
    return {
      currency: Math.max(baseCurrency, 10), // 최소 10 코인
      experience: Math.max(baseExperience, 5) // 최소 5 경험치
    };
  };

  const value: ExerciseContextType = {
    currentExercise,
    setCurrentExercise,
    updateExerciseDuration,
    clearCurrentExercise,
    calculateRewards
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};