import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth, getUserProfile, signInWithCustomId, signOutUser, signUpWithCustomId } from '../firebase.config';

interface UserProfile {
  id: string;
  nickname: string;
  surgeryDate: string;
  createdAt: any;
  lastLoginAt: any;
  gameData: {
    currency: number;
    level: number;
    totalExercises: number;
    consecutiveExercises: number;
  };
  profile?: {
    nickname?: string;
    avatar?: string;
    selectedBadge?: string;
  };
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (userId: string, password: string) => Promise<void>;
  signUp: (userId: string, password: string, nickname: string, surgeryDate: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  calculateDaysSinceSurgery: () => number;
  addFirestoreListener: (unsubscribe: () => void) => void;
  removeFirestoreListener: (unsubscribe: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreListeners, setFirestoreListeners] = useState<Array<() => void>>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setLoading(true);
      setUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile as UserProfile);
        } catch (error) {
          console.error('프로필 로딩 실패:', error);
          // 프로필 로딩 실패 시 사용자 상태 초기화
          setUser(null);
          setUserProfile(null);
        }
      } else {
        // 로그아웃 시 안전한 상태 정리
        console.log('사용자 로그아웃됨, 상태 정리 중...');
        setUserProfile(null);
        
        // Firestore 리스너들 정리 (현재 상태 값을 직접 사용)
        setFirestoreListeners(currentListeners => {
          currentListeners.forEach(unsubscribe => {
            try {
              unsubscribe();
            } catch (error) {
              console.warn('Auth state 변경 중 리스너 정리 오류:', error);
            }
          });
          return []; // 빈 배열로 초기화
        });
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []); // dependency 배열을 비워서 무한 루프 방지

  const signIn = async (userId: string, password: string) => {
    setLoading(true);
    try {
      await signInWithCustomId(userId, password);
    } catch (error: any) {
      let errorMessage = 'Login failed.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User ID does not exist.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid ID format.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userId: string, password: string, nickname: string, surgeryDate: string) => {
    setLoading(true);
    try {
      const userData = {
        nickname,
        surgeryDate,
        profile: {
          nickname,
          selectedBadge: null
        }
      };
      
      await signUpWithCustomId(userId, password, userData);
    } catch (error: any) {
      let errorMessage = 'Sign up failed.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'ID already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('AuthContext signOut 시작');
      
      // 1. 모든 Firestore 리스너 정리
      console.log('Firestore 리스너 정리 중...');
      firestoreListeners.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('리스너 정리 중 오류:', error);
        }
      });
      setFirestoreListeners([]);
      
      // 2. Firebase Auth 로그아웃
      await signOutUser();
      console.log('signOutUser 완료');
      
      // 3. 상태 초기화
      setUser(null);
      setUserProfile(null);
      console.log('상태 초기화 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile as UserProfile);
      } catch (error) {
        console.error('프로필 새로고침 실패:', error);
      }
    }
  };

  const calculateDaysSinceSurgery = (): number => {
    if (!userProfile?.surgeryDate) return 0;
    
    const surgeryDate = new Date(userProfile.surgeryDate);
    const today = new Date();
    const diffTime = today.getTime() - surgeryDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const addFirestoreListener = (unsubscribe: () => void) => {
    setFirestoreListeners(prev => [...prev, unsubscribe]);
  };

  const removeFirestoreListener = (unsubscribe: () => void) => {
    setFirestoreListeners(prev => prev.filter(listener => listener !== unsubscribe));
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    calculateDaysSinceSurgery,
    addFirestoreListener,
    removeFirestoreListener
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};