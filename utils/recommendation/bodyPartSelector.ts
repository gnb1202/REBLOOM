import { PAIN_THRESHOLDS, BALANCE_TRACKING, calculatePartFrequency } from './constants';

// User health status interface
export interface UserHealthStatus {
  bodyCondition: number;      // 1-5
  mood: number;               // 0-4  
  armShoulderPain: number;    // 1-5
  stiffnessLevel: number;     // 1-5
  swellingLevel: number;      // 0-2
}

// Body part weights interface (4개 부위만 사용)
export interface BodyPartWeights {
  shoulder: number;
  arm: number;
  chest: number;
  neck: number;
}

/**
 * 건강 설문 데이터를 기반으로 가중치 조정
 * @param weights 현재 가중치
 * @param healthStatus 건강 상태
 * @returns 조정된 가중치
 */
export function adjustWeightsBasedOnHealth(
  weights: BodyPartWeights,
  healthStatus: UserHealthStatus
): BodyPartWeights {
  const adjusted = { ...weights };
  
  // 1. armShoulderPain이 높으면 shoulder/arm 가중치 감소
  if (healthStatus.armShoulderPain >= PAIN_THRESHOLDS.HIGH) {
    adjusted.shoulder *= 0.3;  // 70% 감소
    adjusted.arm *= 0.3;
    adjusted.chest *= 1.2;      // 대체 운동 추천
    adjusted.neck *= 1.2;
  } else if (healthStatus.armShoulderPain >= PAIN_THRESHOLDS.MEDIUM) {
    adjusted.shoulder *= 0.6;  // 40% 감소
    adjusted.arm *= 0.7;
  }
  
  // 2. stiffnessLevel이 높으면 neck 가중치 증가 (스트레칭 필요)
  if (healthStatus.stiffnessLevel >= 4) {
    adjusted.neck *= 1.5;  // 목 운동 우선
    adjusted.chest *= 0.7; // 가슴 운동은 줄임
  } else if (healthStatus.stiffnessLevel >= 3) {
    adjusted.neck *= 1.3;
  }
  
  // 3. swellingLevel이 높으면 전체 강도 조정
  if (healthStatus.swellingLevel === 2) {
    // 심한 부종 - 어깨/팔 제한
    adjusted.shoulder *= 0.4;
    adjusted.arm *= 0.4;
    adjusted.chest *= 0.8;
    adjusted.neck *= 1.2;  // 목 운동으로 대체
  } else if (healthStatus.swellingLevel === 1) {
    adjusted.shoulder *= 0.8;
    adjusted.arm *= 0.8;
  }
  
  // 4. mood가 낮으면 쉬운 운동 선호
  if (healthStatus.mood <= 1) {
    // 기분이 안 좋을 때는 목 운동 같은 가벼운 운동 우선
    adjusted.neck *= 1.3;
    adjusted.chest *= 0.9;
  }
  
  // 5. bodyCondition이 낮으면 난이도 조정
  if (healthStatus.bodyCondition <= 2) {
    // 컨디션이 나쁠 때는 목/가슴 위주
    adjusted.shoulder *= 0.7;
    adjusted.arm *= 0.8;
    adjusted.chest *= 1.1;
    adjusted.neck *= 1.2;
  }
  
  return adjusted;
}

/**
 * Select target body part based on user's current condition and weights
 * 균형 잡힌 운동을 위한 부위 선택
 */
export function selectTargetBodyPart(
  healthStatus: UserHealthStatus,
  bodyPartWeights: BodyPartWeights,
  recentExercises: string[] = []
): string {
  // 1. 건강 상태 기반 가중치 조정
  const adjustedWeights = adjustWeightsBasedOnHealth(bodyPartWeights, healthStatus);
  
  // 2. 최근 운동 빈도 계산
  const partFrequency = calculatePartFrequency(recentExercises);
  
  // 3. 균형 운동을 위한 추가 가중치 조정
  Object.keys(adjustedWeights).forEach(part => {
    // 최근에 안 한 부위에 보너스
    if (partFrequency[part] === 0) {
      adjustedWeights[part as keyof BodyPartWeights] *= 1.5;
    }
    // 너무 많이 한 부위는 페널티
    else if (partFrequency[part] >= 3) {
      adjustedWeights[part as keyof BodyPartWeights] *= 0.5;
    }
  });
  
  // 4. 제외할 부위 결정
  const excludedParts = new Set<string>();
  
  // 극심한 통증이 있을 때
  if (healthStatus.armShoulderPain >= 5) {
    excludedParts.add('shoulder');
    excludedParts.add('arm');
  }
  
  // 심한 부종이 있을 때
  if (healthStatus.swellingLevel === 2) {
    if (healthStatus.armShoulderPain >= 3) {
      excludedParts.add('shoulder');
      excludedParts.add('arm');
    }
  }
  
  // 5. 가용한 부위 중 최고 가중치 선택
  const availableParts = Object.entries(adjustedWeights)
    .filter(([part]) => !excludedParts.has(part))
    .sort(([, weightA], [, weightB]) => weightB - weightA);
  
  // 6. 모든 부위가 제외된 경우 가장 안전한 목 운동
  if (availableParts.length === 0) {
    console.log('No parts available, defaulting to neck exercises');
    return 'neck';
  }
  
  const selectedPart = availableParts[0][0];
  
  console.log('Selected target body part:', selectedPart);
  console.log('Adjusted weights:', adjustedWeights);
  console.log('Part frequency (last 7 days):', partFrequency);
  
  return selectedPart;
}

/**
 * 운동 결과 기반 가중치 업데이트
 * @param currentWeights 현재 가중치
 * @param exercisedParts 운동한 부위들
 * @param feedback 운동 피드백 (Easy=5, Normal=3, Hard=1)
 */
export function updateWeightsBasedOnFeedback(
  currentWeights: BodyPartWeights,
  exercisedParts: string[],
  feedback: number
): BodyPartWeights {
  const updated = { ...currentWeights };
  
  exercisedParts.forEach(part => {
    if (part in updated) {
      const key = part as keyof BodyPartWeights;
      
      // 피드백에 따른 가중치 조정
      if (feedback >= 4) {
        // Easy - 다음에는 더 적게
        updated[key] *= 0.8;
      } else if (feedback <= 2) {
        // Hard - 휴식 필요
        updated[key] *= 0.5;
      } else {
        // Normal - 표준 감소
        updated[key] *= 0.9;
      }
    }
  });
  
  // 운동하지 않은 부위 가중치 증가
  Object.keys(updated).forEach(part => {
    if (!exercisedParts.includes(part)) {
      const key = part as keyof BodyPartWeights;
      updated[key] *= 1.1;
    }
  });
  
  return updated;
}

/**
 * 균형 잡힌 운동을 위한 부위 추천
 */
export function getBalancedRecommendation(
  partFrequency: Record<string, number>
): string[] {
  // 빈도가 낮은 순으로 정렬
  const sorted = Object.entries(partFrequency)
    .sort(([, a], [, b]) => a - b)
    .map(([part]) => part);
  
  return sorted;
}

/**
 * Check if a specific body part is safe to exercise
 */
export function isPartSafeToExercise(
  part: string,
  healthStatus: UserHealthStatus
): boolean {
  // 목은 거의 항상 안전
  if (part === 'neck') {
    return healthStatus.stiffnessLevel < 5;
  }
  
  // 어깨/팔 안전성 체크
  if ((part === 'shoulder' || part === 'arm')) {
    if (healthStatus.armShoulderPain >= PAIN_THRESHOLDS.HIGH) {
      return false;
    }
    if (healthStatus.swellingLevel === 2) {
      return false;
    }
  }
  
  // 가슴 운동 안전성
  if (part === 'chest') {
    // 극심한 경직 시 제한
    if (healthStatus.stiffnessLevel >= 5) {
      return false;
    }
  }
  
  // 전반적 컨디션 체크
  if (healthStatus.bodyCondition === 1) {
    // 매우 나쁜 컨디션에서는 목 운동만
    return part === 'neck';
  }
  
  return true;
}