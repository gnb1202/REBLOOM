import {
  getBodyPartWeights,
  updateBodyPartWeights,
  getRecentExerciseHistory,
  getLatestHealthCheck,
  getExerciseFeedback,
  saveExerciseFeedback,
  getUserProfile,
} from '../../firebase.config';

import {
  ExerciseMetadata,
  EXERCISE_DATABASE,
  getExercisesByTargetPart,
  WEIGHT_UPDATE_FACTORS,
  BALANCE_TRACKING,
  calculatePartFrequency,
} from './constants';

import {
  selectTargetBodyPart,
  isPartSafeToExercise,
  UserHealthStatus,
  BodyPartWeights,
  updateWeightsBasedOnFeedback,
  adjustWeightsBasedOnHealth,
} from './bodyPartSelector';

import {
  calculateExerciseScore,
  ExerciseContext,
  generateRecommendationReason,
  generateCautionNotes,
} from './scoreCalculator';

// Recommendation result interface
export interface RecommendedExercise {
  exercise: ExerciseMetadata;
  score: number;
  reason: string;
  cautions: string[];
  targetPart: string;
}

export interface RecommendationResult {
  recommendations: RecommendedExercise[];
  targetBodyPart: string;
  healthStatus: UserHealthStatus;
  partBalance?: Record<string, number>; // 부위별 운동 빈도
  message?: string;
}

/**
 * Main function to generate exercise recommendations
 * 균형 잡힌 운동 추천을 위한 메인 함수
 */
export async function generateExerciseRecommendations(
  userId: string
): Promise<RecommendationResult> {
  try {
    console.log('Generating balanced recommendations for user:', userId);
    
    // 1. Load comprehensive user context
    const context = await loadUserContext(userId);
    
    if (!context) {
      throw new Error('Failed to load user context');
    }
    
    // 2. 부위별 운동 빈도 계산
    const partFrequency = calculatePartFrequency(context.recentExercises);
    console.log('Part frequency (last 7 days):', partFrequency);
    
    // 3. Select target body part with balance consideration
    const targetPart = selectTargetBodyPart(
      context.healthStatus,
      context.bodyPartWeights,
      context.recentExercises
    );
    
    console.log('Selected target body part:', targetPart);
    
    // 4. Get ALL safe exercises, not just target part
    let candidateExercises = getExercisesByTargetPart(targetPart);
    
    // 균형을 위해 다른 부위 운동도 일부 포함
    if (candidateExercises.length < 3) {
      // 목표 부위 운동이 부족하면 다른 안전한 부위 운동도 추가
      const otherParts = ['shoulder', 'arm', 'chest', 'neck']
        .filter(part => part !== targetPart && isPartSafeToExercise(part, context.healthStatus));
      
      for (const part of otherParts) {
        candidateExercises = candidateExercises.concat(
          getExercisesByTargetPart(part).slice(0, 1)
        );
      }
    }
    
    if (candidateExercises.length === 0) {
      console.warn('No exercises found for any safe body part');
      return getFallbackRecommendation(context.healthStatus);
    }
    
    // 5. Score and rank exercises with enhanced context
    const scoredExercises = candidateExercises.map(exercise => {
      const enhancedContext: ExerciseContext = {
        healthStatus: context.healthStatus,
        recentExercises: context.recentExercises,
        exerciseFeedback: context.exerciseFeedback,
        lastExerciseResults: context.lastExerciseResults,
        consecutiveExerciseDays: context.consecutiveExerciseDays,
      };
      
      const score = calculateExerciseScore(exercise, enhancedContext);
      const reason = generateRecommendationReason(exercise, score, enhancedContext);
      const cautions = generateCautionNotes(exercise, enhancedContext);
      
      return {
        exercise,
        score,
        reason,
        cautions,
        targetPart: exercise.targetParts[0], // Primary target
      };
    });
    
    // 6. Sort by score and ensure variety
    scoredExercises.sort((a, b) => b.score - a.score);
    
    // 상위 운동 중 다양한 부위 포함되도록 선택
    const topRecommendations = selectDiverseExercises(scoredExercises, 3);
    
    console.log('Top recommendations:', topRecommendations.map(r => ({
      id: r.exercise.id,
      score: r.score,
      parts: r.exercise.targetParts,
    })));
    
    return {
      recommendations: topRecommendations,
      targetBodyPart: targetPart,
      healthStatus: context.healthStatus,
      partBalance: partFrequency,
    };
    
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return getFallbackRecommendation();
  }
}

/**
 * Load comprehensive user context including all relevant data
 */
async function loadUserContext(userId: string): Promise<{
  healthStatus: UserHealthStatus;
  bodyPartWeights: BodyPartWeights;
  recentExercises: string[];
  exerciseFeedback: Map<string, number>;
  lastExerciseResults?: Map<string, string>;
  consecutiveExerciseDays?: number;
} | null> {
  try {
    // Load health check data
    const healthCheck = await getLatestHealthCheck(userId);
    
    // Default health status if no check found
    const healthStatus: UserHealthStatus = healthCheck ? {
      bodyCondition: healthCheck.condition || healthCheck.bodyCondition || 3,
      mood: healthCheck.mood !== undefined ? healthCheck.mood : 2,
      armShoulderPain: healthCheck.armShoulderPain || 1,
      stiffnessLevel: healthCheck.stiffnessLevel || 1,
      swellingLevel: healthCheck.swelling || healthCheck.swellingLevel || 0,
    } : {
      bodyCondition: 3,
      mood: 2,
      armShoulderPain: 1,
      stiffnessLevel: 1,
      swellingLevel: 0,
    };
    
    // Load body part weights (4개 부위만)
    const weights = await getBodyPartWeights(userId);
    const bodyPartWeights: BodyPartWeights = {
      shoulder: weights.shoulder || 1.0,
      arm: weights.arm || 1.0,
      chest: weights.chest || 1.0,
      neck: weights.neck || 1.0,
    };
    
    // Load recent exercise history
    const recentExercises = await getRecentExerciseHistory(userId, BALANCE_TRACKING.DAYS_TO_TRACK);
    
    // Load feedback for all exercises
    const exerciseFeedback = new Map<string, number>();
    const lastExerciseResults = new Map<string, string>();
    
    for (const exercise of EXERCISE_DATABASE) {
      const feedback = await getExerciseFeedback(userId, exercise.id);
      if (feedback) {
        if (feedback.avgRating) {
          exerciseFeedback.set(exercise.id, feedback.avgRating);
        }
        if (feedback.lastFeedback) {
          lastExerciseResults.set(exercise.id, feedback.lastFeedback);
        }
      }
    }
    
    // Get user profile for streak info
    const userProfile = await getUserProfile?.(userId);
    const consecutiveExerciseDays = userProfile?.exerciseStreak || 0;
    
    return {
      healthStatus,
      bodyPartWeights,
      recentExercises,
      exerciseFeedback,
      lastExerciseResults,
      consecutiveExerciseDays,
    };
    
  } catch (error) {
    console.error('Failed to load user context:', error);
    return null;
  }
}

/**
 * Select diverse exercises to ensure balanced workout
 */
function selectDiverseExercises(
  scoredExercises: RecommendedExercise[],
  count: number
): RecommendedExercise[] {
  const selected: RecommendedExercise[] = [];
  const usedParts = new Set<string>();
  
  // First pass: Select top scoring exercises with different primary parts
  for (const exercise of scoredExercises) {
    if (selected.length >= count) break;
    
    const primaryPart = exercise.exercise.targetParts[0];
    if (!usedParts.has(primaryPart)) {
      selected.push(exercise);
      usedParts.add(primaryPart);
    }
  }
  
  // Second pass: Fill remaining slots with highest scores
  if (selected.length < count) {
    for (const exercise of scoredExercises) {
      if (selected.length >= count) break;
      if (!selected.includes(exercise)) {
        selected.push(exercise);
      }
    }
  }
  
  return selected;
}

/**
 * Update weights after completing exercises with feedback consideration
 */
export async function updateWeightsAfterExercise(
  userId: string,
  completedExerciseIds: string[],
  overallFeedback?: string // 'Easy', 'Normal', 'Hard'
): Promise<boolean> {
  try {
    // Get current weights
    const currentWeights = await getBodyPartWeights(userId);
    
    // Convert to our 4-part structure
    const weights: BodyPartWeights = {
      shoulder: currentWeights.shoulder || 1.0,
      arm: currentWeights.arm || 1.0,
      chest: currentWeights.chest || 1.0,
      neck: currentWeights.neck || 1.0,
    };
    
    // Track which parts were exercised
    const exercisedParts = new Set<string>();
    
    for (const exerciseId of completedExerciseIds) {
      const exercise = EXERCISE_DATABASE.find(ex => ex.id === exerciseId);
      if (exercise) {
        exercise.targetParts.forEach(part => {
          if (part in weights) {
            exercisedParts.add(part);
          }
        });
      }
    }
    
    // Convert feedback to numeric (Easy=5, Normal=3, Hard=1)
    const feedbackScore = overallFeedback === 'Easy' ? 5 : 
                         overallFeedback === 'Hard' ? 1 : 3;
    
    // Update weights based on feedback
    const updatedWeights = updateWeightsBasedOnFeedback(
      weights,
      Array.from(exercisedParts),
      feedbackScore
    );
    
    // Normalize weights to ensure balance
    const total = Object.values(updatedWeights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights: Record<string, number> = {};
    
    Object.entries(updatedWeights).forEach(([part, weight]) => {
      // Keep weights between MIN and MAX
      normalizedWeights[part] = Math.max(
        WEIGHT_UPDATE_FACTORS.MIN_WEIGHT,
        Math.min(WEIGHT_UPDATE_FACTORS.MAX_WEIGHT, weight)
      );
    });
    
    // Save updated weights
    await updateBodyPartWeights(userId, normalizedWeights);
    
    console.log('Updated and normalized body part weights:', normalizedWeights);
    return true;
    
  } catch (error) {
    console.error('Failed to update weights after exercise:', error);
    return false;
  }
}

/**
 * Save feedback for completed exercise
 */
export async function saveExerciseFeedbackRating(
  userId: string,
  exerciseId: string,
  rating: number
): Promise<boolean> {
  try {
    return await saveExerciseFeedback(userId, exerciseId, rating);
  } catch (error) {
    console.error('Failed to save exercise feedback:', error);
    return false;
  }
}

/**
 * Get fallback recommendations when personalization fails
 */
function getFallbackRecommendation(
  healthStatus?: UserHealthStatus
): RecommendationResult {
  // Safe exercises for each body part
  const safeExercises = [
    'neck_rotation',     // Neck - easiest
    'shoulder_flexion',  // Shoulder - gentle
    'elbow_exercise',    // Arm - simple
    'chest_stretch',     // Chest - stretching
  ];
  
  const fallbackExercises = safeExercises
    .map(id => EXERCISE_DATABASE.find(ex => ex.id === id))
    .filter(ex => ex !== undefined) as ExerciseMetadata[];
  
  const recommendations = fallbackExercises.slice(0, 3).map(exercise => ({
    exercise,
    score: 70,
    reason: 'Gentle exercise for balanced workout',
    cautions: ['Start slowly and listen to your body'],
    targetPart: exercise.targetParts[0],
  }));
  
  return {
    recommendations,
    targetBodyPart: 'neck', // Safest default
    healthStatus: healthStatus || {
      bodyCondition: 3,
      mood: 2,
      armShoulderPain: 1,
      stiffnessLevel: 1,
      swellingLevel: 0,
    },
    message: 'Showing gentle exercises for safety',
  };
}

export { getFallbackRecommendation as getFallbackRecommendations };