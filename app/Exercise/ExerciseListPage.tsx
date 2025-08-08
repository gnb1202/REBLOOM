import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ExerciseItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  target: string;
  imageUrl: any; // 임시로 any 타입 사용
}

const exerciseList: ExerciseItem[] = [
  {
    id: 'shoulder_flexion',
    title: 'Shoulder Flexion',
    description: 'Shoulder flexion exercise to improve forward range of motion',
    duration: '3 min',
    difficulty: 'EASY',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_abduction_1',
    title: 'Shoulder Abduction 1',
    description: 'Shoulder abduction exercise to improve lateral mobility',
    duration: '3 min',
    difficulty: 'EASY',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_abduction_2',
    title: 'Shoulder Abduction 2',
    description: 'Shoulder support exercise using lower extremity movements',
    duration: '3 min',
    difficulty: 'MEDIUM',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_external_rotation_1',
    title: 'Shoulder External Rotation 1',
    description: 'Shoulder external rotation exercise to strengthen rotator cuff',
    duration: '3 min',
    difficulty: 'MEDIUM',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_external_rotation_2',
    title: 'Shoulder External Rotation 2',
    description: 'Reverse direction shoulder external rotation exercise',
    duration: '3 min',
    difficulty: 'MEDIUM',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_external_rotation',
    title: 'Shoulder External Rotation',
    description: 'Basic shoulder external rotation exercise',
    duration: '3 min',
    difficulty: 'EASY',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_abduction_3',
    title: 'Shoulder Abduction 3',
    description: 'Advanced shoulder abduction exercise',
    duration: '3 min',
    difficulty: 'HARD',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'side_stretch',
    title: 'Side Stretch',
    description: 'Side stretching to relax torso and shoulder muscles',
    duration: '2 min',
    difficulty: 'EASY',
    target: 'STRETCH',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'elbow_exercise',
    title: 'Elbow Exercise',
    description: 'Elbow flexion exercise to improve arm mobility',
    duration: '2 min',
    difficulty: 'EASY',
    target: 'ARM',
    imageUrl: require('../../assets/images/icon.png'),
  },
  {
    id: 'shoulder_joint',
    title: 'Shoulder Joint Exercise',
    description: 'Comprehensive exercise to improve overall shoulder joint mobility',
    duration: '4 min',
    difficulty: 'MEDIUM',
    target: 'SHOULDER',
    imageUrl: require('../../assets/images/icon.png'),
  }
];

export default function ExerciseListPage() {
  const router = useRouter();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleStartExercise = () => {
    if (selectedExercises.length > 0) {
      router.push({
        pathname: '/Exercise/Explain',
        params: { exercises: selectedExercises.join(',') }
      });
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
        {/* Recommended Exercises Section */}
        <View style={styles.recommendedSection}>
          <Text style={styles.sectionTitle}>💫 Recommended Exercises</Text>
          {exerciseList
              .filter(ex => ex.target === 'SHOULDER' && ex.difficulty === 'EASY')
            .slice(0, 3)
            .map((exercise) => (
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
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseTarget}>{exercise.target}</Text>
                <Text style={styles.exerciseDuration}>⏱ {exercise.duration}</Text>
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
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDescription}>
                  {exercise.description}
                </Text>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseTarget}>{exercise.target}</Text>
                  <Text style={styles.exerciseDuration}>⏱ {exercise.duration}</Text>
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
});