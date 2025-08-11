import {
  ExerciseMetadata,
  SCORE_WEIGHTS,
  PAIN_THRESHOLDS,
  SWELLING_LEVELS,
  STIFFNESS_THRESHOLDS,
  CONDITION_THRESHOLDS,
  BALANCE_TRACKING,
  calculatePartFrequency
} from './constants';
import { UserHealthStatus } from './bodyPartSelector';

// Enhanced exercise context with more data
export interface ExerciseContext {
  healthStatus: UserHealthStatus;
  recentExercises: string[];
  exerciseFeedback: Map<string, number>; // exercise id -> average rating (1-5)
  lastExerciseResults?: Map<string, string>; // exercise id -> last feedback (Easy/Normal/Hard)
  consecutiveExerciseDays?: number; // 연속 운동일수
}

/**
 * Calculate comprehensive score for an exercise based on user context
 * 건강 설문과 운동 결과를 모두 활용한 점수 계산
 */
export function calculateExerciseScore(
  exercise: ExerciseMetadata,
  context: ExerciseContext
): number {
  let score = exercise.baseScore; // Start with base score
  
  // 1. Condition Assessment (25%)
  const conditionScore = assessConditionCompatibility(exercise, context.healthStatus);
  score += conditionScore * SCORE_WEIGHTS.CONDITION;
  
  // 2. Pain Check (25%)
  const painScore = assessPainCompatibility(exercise, context.healthStatus);
  score += painScore * SCORE_WEIGHTS.PAIN;
  
  // 3. Swelling Check (15%)
  const swellingScore = assessSwellingCompatibility(exercise, context.healthStatus);
  score += swellingScore * SCORE_WEIGHTS.SWELLING;
  
  // 4. Stiffness Check (15%)
  const stiffnessScore = assessStiffnessCompatibility(exercise, context.healthStatus);
  score += stiffnessScore * SCORE_WEIGHTS.STIFFNESS;
  
  // 5. Exercise Variety (10%)
  const varietyScore = assessExerciseVariety(exercise, context.recentExercises);
  score += varietyScore * SCORE_WEIGHTS.VARIETY;
  
  // 6. Feedback Score (10%)
  const feedbackScore = assessFeedbackScore(exercise, context);
  score += feedbackScore * (SCORE_WEIGHTS.FEEDBACK || 0.1);
  
  // 7. Balance Bonus (균형 운동 보너스)
  const balanceBonus = calculateBalanceBonus(exercise, context.recentExercises);
  score += balanceBonus;
  
  // 8. Mood adjustment (기분에 따른 조정)
  score = adjustScoreForMood(score, context.healthStatus.mood, exercise.difficulty);
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
}

/**
 * Assess exercise compatibility with user's condition
 */
function assessConditionCompatibility(
  exercise: ExerciseMetadata,
  healthStatus: UserHealthStatus
): number {
  const conditionDiff = healthStatus.bodyCondition - exercise.minConditionRequired;
  
  // Perfect match
  if (conditionDiff === 0) {
    return 10;
  }
  
  // User condition is better than required - good!
  if (conditionDiff > 0) {
    if (healthStatus.bodyCondition >= CONDITION_THRESHOLDS.GOOD && 
        exercise.recommendedFor.highCondition) {
      return 15;
    }
    if (healthStatus.bodyCondition === CONDITION_THRESHOLDS.FAIR && 
        exercise.recommendedFor.mediumCondition) {
      return 12;
    }
    return 5;
  }
  
  // User condition is worse than required - penalize
  if (conditionDiff < 0) {
    return conditionDiff * 15; // -15 per level below requirement
  }
  
  return 0;
}

/**
 * Assess exercise compatibility with pain level
 */
function assessPainCompatibility(
  exercise: ExerciseMetadata,
  healthStatus: UserHealthStatus
): number {
  const painLevel = healthStatus.armShoulderPain;
  
  // Check if exercise targets painful areas
  const targetsPainfulArea = exercise.targetParts.includes('shoulder') || 
                            exercise.targetParts.includes('arm');
  
  // No pain - all good
  if (painLevel <= PAIN_THRESHOLDS.LOW) {
    return 10;
  }
  
  // Medium pain
  if (painLevel === PAIN_THRESHOLDS.MEDIUM) {
    if (targetsPainfulArea) {
      return exercise.contraindicatedFor.highPain ? -20 : -10;
    }
    return 0;
  }
  
  // High pain
  if (painLevel >= PAIN_THRESHOLDS.HIGH) {
    if (targetsPainfulArea) {
      return -25;
    }
    if (exercise.contraindicatedFor.highPain) {
      return -15;
    }
    return -5;
  }
  
  return 0;
}

/**
 * Assess exercise compatibility with swelling level
 */
function assessSwellingCompatibility(
  exercise: ExerciseMetadata,
  healthStatus: UserHealthStatus
): number {
  const swellingLevel = healthStatus.swellingLevel;
  
  // No swelling - good
  if (swellingLevel === SWELLING_LEVELS.NONE) {
    return 5;
  }
  
  // Mild swelling
  if (swellingLevel === SWELLING_LEVELS.MILD) {
    if (exercise.difficulty >= 3) {
      return -10;
    }
    return -5;
  }
  
  // Severe swelling
  if (swellingLevel === SWELLING_LEVELS.SEVERE) {
    if (exercise.contraindicatedFor.highSwelling) {
      return -20;
    }
    if (exercise.difficulty >= 2) {
      return -15;
    }
    return -10;
  }
  
  return 0;
}

/**
 * Assess exercise compatibility with stiffness level
 */
function assessStiffnessCompatibility(
  exercise: ExerciseMetadata,
  healthStatus: UserHealthStatus
): number {
  const stiffnessLevel = healthStatus.stiffnessLevel;
  
  // Low stiffness - good
  if (stiffnessLevel <= STIFFNESS_THRESHOLDS.LOW) {
    return 5;
  }
  
  // Medium stiffness
  if (stiffnessLevel === STIFFNESS_THRESHOLDS.MEDIUM) {
    // 목 운동은 경직에 도움
    if (exercise.targetParts.includes('neck')) {
      return 10;
    }
    if (exercise.difficulty >= 3) {
      return -8;
    }
    return -3;
  }
  
  // High stiffness
  if (stiffnessLevel >= STIFFNESS_THRESHOLDS.HIGH) {
    if (exercise.targetParts.includes('neck')) {
      return 15; // 목 운동 강력 추천
    }
    if (exercise.contraindicatedFor.highStiffness) {
      return -15;
    }
    return -10;
  }
  
  return 0;
}

/**
 * 운동 다양성 평가 (최근 운동 이력 기반)
 */
function assessExerciseVariety(
  exercise: ExerciseMetadata,
  recentExercises: string[]
): number {
  if (!recentExercises.includes(exercise.id)) {
    return 10; // 최근에 안 한 운동 - 좋음
  }
  
  // 얼마나 최근에 했는지 계산
  const index = recentExercises.indexOf(exercise.id);
  if (index < 3) {
    return -10; // 매우 최근 - 강한 페널티
  }
  if (index < 7) {
    return -5; // 어느정도 최근
  }
  
  return 0;
}

/**
 * 운동 결과 피드백 기반 점수 평가
 */
function assessFeedbackScore(
  exercise: ExerciseMetadata,
  context: ExerciseContext
): number {
  // 평균 평점 기반
  const avgRating = context.exerciseFeedback.get(exercise.id);
  
  // 마지막 결과 기반
  const lastResult = context.lastExerciseResults?.get(exercise.id);
  
  let score = 0;
  
  // 평균 평점 반영
  if (avgRating) {
    if (avgRating >= 4.5) score += 10;
    else if (avgRating >= 4.0) score += 7;
    else if (avgRating >= 3.5) score += 5;
    else if (avgRating >= 3.0) score += 2;
    else if (avgRating < 2.5) score -= 5;
  }
  
  // 마지막 결과 반영
  if (lastResult) {
    if (lastResult === 'Easy') {
      // 쉬웠다면 난이도 높은 운동 가능
      if (exercise.difficulty >= 2) score += 5;
    } else if (lastResult === 'Hard') {
      // 어려웠다면 쉬운 운동 추천
      if (exercise.difficulty === 1) score += 5;
      else if (exercise.difficulty >= 3) score -= 10;
    }
  }
  
  // 연속 운동일이 많으면 쉬운 운동 선호
  if (context.consecutiveExerciseDays && context.consecutiveExerciseDays >= 5) {
    if (exercise.difficulty === 1) score += 5;
    if (exercise.difficulty >= 3) score -= 5;
  }
  
  return score;
}

/**
 * 균형 운동을 위한 보너스 계산
 */
function calculateBalanceBonus(
  exercise: ExerciseMetadata,
  recentExercises: string[]
): number {
  const partFrequency = calculatePartFrequency(recentExercises);
  
  let bonus = 0;
  
  exercise.targetParts.forEach(part => {
    // 최근 7일간 한 번도 안 한 부위면 큰 보너스
    if (partFrequency[part] === 0) {
      bonus += BALANCE_TRACKING.BALANCE_BONUS;
    }
    // 적게 한 부위면 작은 보너스
    else if (partFrequency[part] < BALANCE_TRACKING.MIN_EXERCISES_PER_PART) {
      bonus += BALANCE_TRACKING.BALANCE_BONUS / 2;
    }
  });
  
  return bonus;
}

/**
 * 기분에 따른 점수 조정
 */
function adjustScoreForMood(
  score: number,
  mood: number,
  difficulty: number
): number {
  if (mood <= 1) {
    // 기분이 나쁠 때는 쉬운 운동 선호
    if (difficulty === 1) score *= 1.1;
    if (difficulty >= 3) score *= 0.8;
  } else if (mood >= 4) {
    // 기분이 좋을 때는 도전적인 운동 가능
    if (difficulty >= 2) score *= 1.05;
  }
  
  return score;
}

/**
 * 추천 이유 생성 (개선된 버전)
 */
export function generateRecommendationReason(
  exercise: ExerciseMetadata,
  score: number,
  context: ExerciseContext
): string {
  const reasons: string[] = [];
  const partFrequency = calculatePartFrequency(context.recentExercises);
  
  // 균형 운동 관련
  exercise.targetParts.forEach(part => {
    if (partFrequency[part] === 0) {
      reasons.push(`${part.toUpperCase()} needs attention`);
    }
  });
  
  // 컨디션 매칭
  if (context.healthStatus.bodyCondition >= exercise.minConditionRequired) {
    if (exercise.recommendedFor.highCondition && 
        context.healthStatus.bodyCondition >= CONDITION_THRESHOLDS.GOOD) {
      reasons.push("Perfect for your energy level");
    }
  }
  
  // 경직도 관련
  if (context.healthStatus.stiffnessLevel >= STIFFNESS_THRESHOLDS.MEDIUM) {
    if (exercise.targetParts.includes('neck')) {
      reasons.push("Helps with stiffness");
    }
  }
  
  // 운동 다양성
  if (!context.recentExercises.includes(exercise.id)) {
    reasons.push("New exercise for variety");
  }
  
  // 피드백 기반
  const avgRating = context.exerciseFeedback.get(exercise.id);
  if (avgRating && avgRating >= 4) {
    reasons.push("You've enjoyed this before");
  }
  
  return reasons.slice(0, 2).join(" • ") || "Recommended for you";
}

/**
 * 주의사항 생성 (개선된 버전)
 */
export function generateCautionNotes(
  exercise: ExerciseMetadata,
  context: ExerciseContext
): string[] {
  const cautions: string[] = [];
  
  // 통증 관련
  if (context.healthStatus.armShoulderPain >= PAIN_THRESHOLDS.MEDIUM) {
    if (exercise.targetParts.includes('shoulder') || exercise.targetParts.includes('arm')) {
      cautions.push("Be gentle with painful areas");
    }
  }
  
  // 부종 관련
  if (context.healthStatus.swellingLevel >= SWELLING_LEVELS.MILD) {
    cautions.push("Stop if swelling increases");
  }
  
  // 경직 관련
  if (context.healthStatus.stiffnessLevel >= STIFFNESS_THRESHOLDS.MEDIUM) {
    if (!exercise.targetParts.includes('neck')) {
      cautions.push("Warm up thoroughly first");
    }
  }
  
  // 난이도 관련
  if (exercise.difficulty >= 2 && context.healthStatus.bodyCondition <= 3) {
    cautions.push("Take breaks as needed");
  }
  
  // 연속 운동일 관련
  if (context.consecutiveExerciseDays && context.consecutiveExerciseDays >= 5) {
    cautions.push("Listen to your body");
  }
  
  return cautions.slice(0, 2);
}