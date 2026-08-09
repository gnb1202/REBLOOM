// Main exports for the recommendation system
export {
  generateExerciseRecommendations,
  updateWeightsAfterExercise,
  saveExerciseFeedbackRating,
  getFallbackRecommendations,
  type RecommendedExercise,
  type RecommendationResult,
} from './recommendationEngine';

export {
  selectTargetBodyPart,
  isPartSafeToExercise,
  adjustWeightsBasedOnHealth,
  updateWeightsBasedOnFeedback,
  getBalancedRecommendation,
  type UserHealthStatus,
  type BodyPartWeights,
} from './bodyPartSelector';

export {
  calculateExerciseScore,
  generateRecommendationReason,
  generateCautionNotes,
  type ExerciseContext,
} from './scoreCalculator';

export {
  EXERCISE_DATABASE,
  INITIAL_BODY_PART_WEIGHTS,
  SCORE_WEIGHTS,
  DIFFICULTY_MAP,
  getExerciseById,
  getExercisesByTargetPart,
  type ExerciseMetadata,
} from './constants';