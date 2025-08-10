import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { getTodayHealthCheck, saveDailyHealthCheck } from '../../../firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DiaryCheckPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyChecked, setAlreadyChecked] = useState(false);
  
  // 5 new health check data
  const [bodyCondition, setBodyCondition] = useState(3);
  const [mood, setMood] = useState(2); // 0-4 for emojis
  const [armShoulderPain, setArmShoulderPain] = useState(1);
  const [stiffnessLevel, setStiffnessLevel] = useState(1);
  const [swellingLevel, setSwellingLevel] = useState(0);

  const moodEmojis = ['😭', '😢', '😐', '😊', '😁'];
  const moodLabels = ['Very Bad', 'Bad', 'Normal', 'Good', 'Very Good'];

  useEffect(() => {
    checkTodayStatus();
    checkAutoShow();
  }, []);

  const checkAutoShow = async () => {
    try {
      const lastShownDate = await AsyncStorage.getItem('healthCheckLastShown');
      const now = new Date();
      const currentHour = now.getHours();
      const today = now.toDateString();
      
      // Auto-show at 06:00 or first access after 06:00
      if (!lastShownDate || lastShownDate !== today) {
        if (currentHour >= 6) {
          await AsyncStorage.setItem('healthCheckLastShown', today);
          // Health check will be shown
        }
      }
    } catch (error) {
      console.error('Failed to check auto-show status:', error);
    }
  };

  const checkTodayStatus = async () => {
    if (!user) return;

    try {
      const todayCheck = await getTodayHealthCheck(user.uid);
      if (todayCheck) {
        setAlreadyChecked(true);
        // Load existing data if available
        setBodyCondition(todayCheck.bodyCondition || 3);
        setMood(todayCheck.mood || 2);
        setArmShoulderPain(todayCheck.armShoulderPain || 1);
        setStiffnessLevel(todayCheck.stiffnessLevel || 1);
        setSwellingLevel(todayCheck.swellingLevel || 0);
      }
    } catch (error) {
      console.error('Failed to check today\'s status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Login required.');
      return;
    }

    setSaving(true);
    try {
      await saveDailyHealthCheck(user.uid, {
        bodyCondition,
        mood,
        armShoulderPain,
        stiffnessLevel,
        swellingLevel,
        timestamp: new Date().toISOString()
      });

      Alert.alert(
        'Complete!',
        'Today\'s health check completed! 💪',
        [
          {
            text: 'OK',
            onPress: () => router.push('/Home_page/Homepage')
          }
        ]
      );
    } catch (error) {
      console.error('Failed to save health check:', error);
      Alert.alert('Error', 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDoLater = async () => {
    // Mark as "do later" and return to homepage
    await AsyncStorage.setItem('healthCheckDoLater', new Date().toISOString());
    router.push('/Home_page/Homepage');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={styles.loadingText}>Loading health check...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Health Check</Text>
        <Text style={styles.subtitle}>
          {alreadyChecked ? '✅ Completed Today' : 'How are you feeling today?'}
        </Text>
      </View>

      {/* Question 1: Body Condition */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>1. Overall Body Condition</Text>
        <Text style={styles.questionSubtitle}>Rate from 1 (worst) to 5 (best)</Text>
        <View style={styles.buttonRowContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                bodyCondition === value && styles.ratingButtonSelected,
                alreadyChecked && styles.buttonDisabled
              ]}
              onPress={() => !alreadyChecked && setBodyCondition(value)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.ratingButtonText,
                bodyCondition === value && styles.ratingButtonTextSelected
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 2: Mood */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>2. Today's Mood</Text>
        <Text style={styles.questionSubtitle}>Select the emoji that matches your mood</Text>
        <View style={styles.moodContainer}>
          {moodEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.moodButton,
                mood === index && styles.moodButtonSelected,
                alreadyChecked && styles.buttonDisabled
              ]}
              onPress={() => !alreadyChecked && setMood(index)}
              disabled={alreadyChecked}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
              <Text style={[
                styles.moodLabel,
                mood === index && styles.moodLabelSelected
              ]}>
                {moodLabels[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 3: Arm/Shoulder Pain */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>3. Arm/Shoulder Pain Level</Text>
        <Text style={styles.questionSubtitle}>Select pain level from 1 to 5</Text>
        <View style={styles.buttonRowContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                armShoulderPain === value && styles.ratingButtonSelected,
                alreadyChecked && styles.buttonDisabled
              ]}
              onPress={() => !alreadyChecked && setArmShoulderPain(value)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.ratingButtonText,
                armShoulderPain === value && styles.ratingButtonTextSelected
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 4: Stiffness Level */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>4. Stiffness Level</Text>
        <Text style={styles.questionSubtitle}>Select stiffness level from 1 to 5</Text>
        <View style={styles.buttonRowContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.ratingButton,
                stiffnessLevel === value && styles.ratingButtonSelected,
                alreadyChecked && styles.buttonDisabled
              ]}
              onPress={() => !alreadyChecked && setStiffnessLevel(value)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.ratingButtonText,
                stiffnessLevel === value && styles.ratingButtonTextSelected
              ]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question 5: Swelling Level */}
      <View style={styles.questionCard}>
        <Text style={styles.questionTitle}>5. Swelling Level</Text>
        <Text style={styles.questionSubtitle}>Select your swelling condition</Text>
        <View style={styles.swellingContainer}>
          {[
            { label: 'None', value: 0 },
            { label: 'Mild', value: 1 },
            { label: 'Severe', value: 2 }
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.swellingButton,
                swellingLevel === item.value && styles.swellingButtonSelected,
                alreadyChecked && styles.buttonDisabled
              ]}
              onPress={() => !alreadyChecked && setSwellingLevel(item.value)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.swellingButtonText,
                swellingLevel === item.value && styles.swellingButtonTextSelected
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!alreadyChecked && (
          <>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Complete Check</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.laterButton}
              onPress={handleDoLater}
            >
              <Text style={styles.laterButtonText}>Do Later</Text>
            </TouchableOpacity>
          </>
        )}
        
        {alreadyChecked && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/Home_page/Homepage')}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#5C7BEE',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8ECFF',
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5C7BEE',
    marginBottom: 10,
  },
  painHigh: {
    color: '#FF6B6B',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#95A5A6',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 60,
  },
  moodButtonSelected: {
    backgroundColor: '#E8ECFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#5C7BEE',
    fontWeight: '600',
  },
  buttonRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonSelected: {
    backgroundColor: '#E8ECFF',
    borderColor: '#5C7BEE',
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  ratingButtonTextSelected: {
    color: '#5C7BEE',
  },
  swellingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  swellingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swellingButtonSelected: {
    backgroundColor: '#E8ECFF',
    borderColor: '#5C7BEE',
  },
  swellingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  swellingButtonTextSelected: {
    color: '#5C7BEE',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  saveButton: {
    backgroundColor: '#5C7BEE',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#5C7BEE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  laterButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  laterButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#34495E',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});