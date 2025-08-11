
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

export default function ExerciseListPage() {
  const router = useRouter();
  const { startExerciseQueue } = useExercise(); // ExerciseContext 사용
  const { user } = useAuth();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [recommendedExercises, setRecommendedExercises] = useState<RecommendedExercise[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [targetBodyPart, setTargetBodyPart] = useState<string>('');

  useEffect(() => {
    loadRecommendations();
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
        <TouchableOpacity onPress={() => router.replace('/Home_page/Homepage')}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Plan your Exercise Session!</Text>
        <View style={{width:24}}/>
      </View>

      <ScrollView style={styles.exerciseList}>
        {/* AI Recommended Exercises Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>🤖 AI Recommended for You</Text>
          {targetBodyPart && (
            <Text style={styles.targetPartText}>Today's focus: {targetBodyPart.toUpperCase()}</Text>
          )}
          {loadingRecommendations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#5C7BEE" />
              <Text style={styles.loadingText}>Analyzing your condition...</Text>
            </View>
          ) : recommendedExercises.length > 0 ? (
            recommendedExercises.map((rec) => {
              const exercise = exerciseList.find(ex => ex.id === rec.exercise.id);
              if (!exercise) return null;
              
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
                    <Text style={styles.scoreText}>Score: {rec.score}</Text>
                  </View>
                  <Image source={exercise.imageUrl} style={styles.exerciseImage} />
                  <View style={styles.exerciseInfo}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                      {getExerciseOrder(exercise.id) && (
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderText}>{getExerciseOrder(exercise.id)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.exerciseDescription}>
                      {exercise.description}
                    </Text>
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.exerciseTarget}>{exercise.target}</Text>
                      <Text style={styles.exerciseDuration}>⏱ {exercise.duration}</Text>
                      <Text style={styles.exerciseCount}>🔄 {exercise.count} reps</Text>
                      <Text
                        style={[
                          styles.exerciseDifficulty,
                          { color: getDifficultyColor(exercise.difficulty) },
                        ]}
                      >
                        Difficulty: {exercise.difficulty}
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
          {exerciseList.map((exercise) => (
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
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  {getExerciseOrder(exercise.id) && (
                    <View style={styles.orderBadge}>
                      <Text style={styles.orderText}>{getExerciseOrder(exercise.id)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.exerciseDescription}>
                  {exercise.description}
                </Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseTarget}>{exercise.target}</Text>
                  <Text style={styles.exerciseDuration}>⏱ {exercise.duration}</Text>
                  <Text style={styles.exerciseCount}>🔄 {exercise.count} reps</Text>
                  <Text
                    style={[
                      styles.exerciseDifficulty,
                      { color: getDifficultyColor(exercise.difficulty) },
                    ]}
                  >
                    Difficulty: {exercise.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendedSection: {
    marginBottom: 30,
  },
  allExercisesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  exerciseTarget: {
    fontSize: 14,
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
    fontSize: 24,
    marginRight: 15,
    color: '#333',
  },
  title: {
    fontSize: 24,
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
    padding: 15,
    marginBottom: 15,
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
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#5C7BEE',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  exerciseDifficulty: {
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#5C7BEE',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  targetPartText: {
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});
