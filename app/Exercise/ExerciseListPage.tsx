
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useExercise, ExerciseItem } from '../../context/ExerciseContext';
import { useAuth } from '../../context/AuthContext';
import { useMusicPlayer } from '../../context/MusicContext';
import { generateExerciseRecommendations, type RecommendedExercise } from '../../utils/recommendation';
import { EXERCISE_INSTRUCTIONS } from '../../utils/exerciseInstructions';

// Convert exercise instructions to ExerciseItem format
const exerciseList: ExerciseItem[] = Object.values(EXERCISE_INSTRUCTIONS).map(instruction => ({
  id: instruction.id,
  title: instruction.name,
  description: instruction.instructions.join(' '),
  duration: instruction.duration,
  difficulty: instruction.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
  target: instruction.targetArea.toUpperCase(),
  imageUrl: require('../../assets/images/icon.png'),
  count: instruction.repetitions,
}));

// 운동 데이터 검증 및 기본값 설정 함수
const validateExerciseData = (exercise: ExerciseItem): ExerciseItem => ({
  ...exercise,
  id: exercise.id || `exercise_${Date.now()}`,
  title: exercise.title || 'Untitled Exercise',
  description: exercise.description || 'No description available',
  duration: exercise.duration || '5 minutes',
  difficulty: exercise.difficulty || 'EASY',
  target: exercise.target || 'GENERAL',
  count: exercise.count || 10,
});

// 추천 운동 데이터 검증 함수
const validateRecommendedExercise = (rec: RecommendedExercise): RecommendedExercise => ({
  ...rec,
  score: typeof rec.score === 'number' ? rec.score : 0,
  exercise: validateExerciseData(rec.exercise),
  reason: rec.reason || 'Recommended for you',
});

export default function ExerciseListPage() {
  const router = useRouter();
  const { startExerciseQueue } = useExercise(); // ExerciseContext 사용
  const { user } = useAuth();
  const { switchTheme } = useMusicPlayer(); // 음악 플레이어 사용
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [recommendedExercises, setRecommendedExercises] = useState<RecommendedExercise[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [targetBodyPart, setTargetBodyPart] = useState<string>('');

  useEffect(() => {
    loadRecommendations();
    // 운동 페이지에 들어오면 운동 테마로 전환
    switchTheme('exercise');
    console.log('🎵 운동 페이지 진입 - 운동 테마 재생');
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) {
      setLoadingRecommendations(false);
      return;
    }

    try {
      setLoadingRecommendations(true);
      const result = await generateExerciseRecommendations(user.uid);
      
      if (result.recommendations.length > 0) {
        setRecommendedExercises(result.recommendations);
        setTargetBodyPart(result.targetBodyPart);
        console.log('Loaded recommendations:', result.recommendations.length);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const getExerciseOrder = (exerciseId: string) => {
    const index = selectedExercises.indexOf(exerciseId);
    return index !== -1 ? index + 1 : null;
  };

  const handleStartExercise = () => {
    if (selectedExercises.length > 0) {
      // Find the full exercise objects for selected exercise IDs
      const selectedExerciseObjects = exerciseList.filter(exercise => 
        selectedExercises.includes(exercise.id)
      );
      
      // Set the selected exercise queue in ExerciseContext
      startExerciseQueue(selectedExerciseObjects);
      
      // Navigate to Explain page
      router.push('/Exercise/Explain');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '#4CAF50';
      case 'MEDIUM':
        return '#FFA726';
      case 'HARD':
        return '#E53935';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          switchTheme('main'); // 메인 테마로 전환
          router.replace('/Home_page/Homepage');
        }}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Plan your Exercise Session!</Text>
        <View style={styles.spacer}/>
      </View>

      <ScrollView style={styles.exerciseList}>
        {/* AI Recommended Exercises Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {targetBodyPart && typeof targetBodyPart === 'string' && targetBodyPart.trim().length > 0 && (
            <Text style={styles.targetPartText}>
              Today's focus: {targetBodyPart.toUpperCase()}
            </Text>
          )}
          {loadingRecommendations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#5C7BEE" />
              <Text style={styles.loadingText}>Analyzing your condition...</Text>
            </View>
          ) : recommendedExercises.length > 0 ? (
            recommendedExercises.map((rec) => {
              const validatedRec = validateRecommendedExercise(rec);
              const exercise = exerciseList.find(ex => ex.id === validatedRec.exercise.id);
              if (!exercise) return null;
              const validatedExercise = validateExerciseData(exercise);
              
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    styles.recommendedCard,
                    selectedExercises.includes(exercise.id) && styles.selectedCard,
                  ]}
                  onPress={() => handleExerciseSelect(exercise.id)}
                >
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.scoreText}>
                      Score: {typeof validatedRec.score === 'number' ? validatedRec.score.toFixed(1) : 'N/A'}
                    </Text>
                  </View>
                  <Image source={exercise.imageUrl} style={styles.exerciseImage} />
                  <View style={styles.exerciseInfo}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.exerciseTitle}>{validatedExercise.title}</Text>
                      {(() => {
                        const order = getExerciseOrder(exercise.id);
                        return order !== null && order !== undefined && (
                          <View style={styles.orderBadge}>
                            <Text style={styles.orderText}>{String(order)}</Text>
                          </View>
                        );
                      })()}
                    </View>
                    <Text style={styles.exerciseDescription}>
                      {validatedExercise.description}
                    </Text>
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.exerciseTarget}>{validatedExercise.target}</Text>
                      <Text style={styles.exerciseDuration}>⏱ {validatedExercise.duration}</Text>
                      <Text style={styles.exerciseCount}>🔄 {validatedExercise.count} reps</Text>
                      <Text
                        style={[
                          styles.exerciseDifficulty,
                          { color: getDifficultyColor(validatedExercise.difficulty) },
                        ]}
                      >
                        Difficulty: {validatedExercise.difficulty}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noRecommendationsText}>No personalized recommendations available</Text>
          )}
        </View>

        {/* All Exercises Section */}
        <View style={styles.allExercisesSection}>
          <Text style={styles.sectionTitle}>All Exercises</Text>
          {exerciseList.map((exercise) => {
            const validatedExercise = validateExerciseData(exercise);
            return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                selectedExercises.includes(exercise.id) && styles.selectedCard,
              ]}
              onPress={() => handleExerciseSelect(exercise.id)}
            >
              <Image source={exercise.imageUrl} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <View style={styles.titleContainer}>
                  <Text style={styles.exerciseTitle}>{validatedExercise.title}</Text>
                  {(() => {
                    const order = getExerciseOrder(exercise.id);
                    return order !== null && order !== undefined && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderText}>{String(order)}</Text>
                      </View>
                    );
                  })()}
                </View>
                <Text style={styles.exerciseDescription}>
                  {validatedExercise.description}
                </Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseTarget}>{validatedExercise.target}</Text>
                  <Text style={styles.exerciseDuration}>⏱ {validatedExercise.duration}</Text>
                  <Text style={styles.exerciseCount}>🔄 {validatedExercise.count} reps</Text>
                  <Text
                    style={[
                      styles.exerciseDifficulty,
                      { color: getDifficultyColor(validatedExercise.difficulty) },
                    ]}
                  >
                    Difficulty: {validatedExercise.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.startButton,
          selectedExercises.length === 0 && styles.startButtonDisabled,
        ]}
        onPress={handleStartExercise}
        disabled={selectedExercises.length === 0}
      >
        <Text style={styles.startButtonText}>
          {selectedExercises.length > 0 
            ? `Start ${selectedExercises.length} Exercise${selectedExercises.length > 1 ? 's' : ''}`
            : 'Select Exercises'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderBadge: {
    backgroundColor: '#5C7BEE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  orderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recommendedSection: {
    marginBottom: 30,
  },
  allExercisesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  exerciseTarget: {
    fontSize: 18,
    color: '#5C7BEE',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: 28,
    marginRight: 15,
    color: '#333',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#5C7BEE',
    borderWidth: 2,
  },
  exerciseImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDuration: {
    fontSize: 18,
    color: '#5C7BEE',
  },
  exerciseCount: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  exerciseDifficulty: {
    fontSize: 18,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#5C7BEE',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFEF0',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#5C7BEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  scoreText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetPartText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    color: '#666',
  },
  recommendationReason: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cautionText: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  noRecommendationsText: {
    fontSize: 20,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  spacer: {
    width: 24,
  },
});
