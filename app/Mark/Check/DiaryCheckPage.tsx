import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { getTodayHealthCheck, saveDailyHealthCheck } from '../../../firebase.config';

export default function DiaryCheckPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyChecked, setAlreadyChecked] = useState(false);
  
  // 건강 체크 데이터
  const [condition, setCondition] = useState(0);
  const [painAreas, setPainAreas] = useState<string[]>([]);
  const [swelling, setSwelling] = useState(0);
  const [notes, setNotes] = useState('');

  const painAreaOptions = [
    'Knee', 'Ankle', 'Thigh', 'Calf', 'Toes', 'Lower back', 'Neck', 'Shoulder', 'Arm', 'Wrist'
  ];

  const conditionLabels = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Very Good'];
  const swellingLabels = ['', 'None', 'Mild', 'Moderate', 'Severe', 'Very Severe'];

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    if (!user) return;

    try {
      const todayCheck = await getTodayHealthCheck(user.uid);
      if (todayCheck) {
        setAlreadyChecked(true);
        setCondition(todayCheck.condition);
        setPainAreas(todayCheck.painAreas || []);
        setSwelling(todayCheck.swelling);
        setNotes(todayCheck.notes || '');
      }
    } catch (error) {
      console.error('Failed to check today\'s status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePainAreaToggle = (area: string) => {
    if (alreadyChecked) return;
    
    if (painAreas.includes(area)) {
      setPainAreas(painAreas.filter(a => a !== area));
    } else {
      setPainAreas([...painAreas, area]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Login required.');
      return;
    }

    if (condition === 0) {
      Alert.alert('Notice', 'Please select today\'s condition.');
      return;
    }

    if (swelling === 0) {
      Alert.alert('Notice', 'Please select swelling level.');
      return;
    }

    setSaving(true);
    try {
      await saveDailyHealthCheck(user.uid, {
        condition,
        painAreas,
        swelling,
        notes: notes.trim()
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C7BEE" />
        <Text style={styles.loadingText}>Loading health check information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>
        {alreadyChecked ? 'Today\'s Health Check (Completed)' : 'Today\'s Health Check'}
      </Text>

      {alreadyChecked && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>✅ Today's health check already completed!</Text>
        </View>
      )}

      {/* 컨디션 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How is your condition today?</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                condition === rating && styles.ratingButtonSelected,
                alreadyChecked && styles.ratingButtonDisabled
              ]}
              onPress={() => !alreadyChecked && setCondition(rating)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.ratingText,
                condition === rating && styles.ratingTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {condition > 0 && (
          <Text style={styles.ratingLabel}>{conditionLabels[condition]}</Text>
        )}
      </View>

      {/* 통증 부위 선택 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Please select areas with pain</Text>
        <Text style={styles.sectionSubtitle}>Multiple selection allowed (skip if no pain)</Text>
        <View style={styles.painAreasContainer}>
          {painAreaOptions.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.painAreaButton,
                painAreas.includes(area) && styles.painAreaButtonSelected,
                alreadyChecked && styles.painAreaButtonDisabled
              ]}
              onPress={() => handlePainAreaToggle(area)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.painAreaText,
                painAreas.includes(area) && styles.painAreaTextSelected
              ]}>
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 부종 정도 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How is your swelling level?</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                swelling === rating && styles.ratingButtonSelected,
                alreadyChecked && styles.ratingButtonDisabled
              ]}
              onPress={() => !alreadyChecked && setSwelling(rating)}
              disabled={alreadyChecked}
            >
              <Text style={[
                styles.ratingText,
                swelling === rating && styles.ratingTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {swelling > 0 && (
          <Text style={styles.ratingLabel}>{swellingLabels[swelling]}</Text>
        )}
      </View>

      {/* 추가 메모 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={[
            styles.notesInput,
            alreadyChecked && styles.notesInputDisabled
          ]}
          multiline
          numberOfLines={3}
          placeholder="Feel free to record your condition today..."
          value={notes}
          onChangeText={setNotes}
          editable={!alreadyChecked}
        />
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        {!alreadyChecked && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Complete Health Check</Text>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.push('/Home_page/Homepage')}
        >
          <Text style={styles.closeButtonText}>
            {alreadyChecked ? 'Go Back' : 'Do Later'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  completedBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  completedText: {
    color: '#155724',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  ratingButtonSelected: {
    backgroundColor: '#5C7BEE',
    borderColor: '#5C7BEE',
  },
  ratingButtonDisabled: {
    opacity: 0.6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  ratingTextSelected: {
    color: '#fff',
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#5C7BEE',
    fontWeight: '600',
  },
  painAreasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  painAreaButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  painAreaButtonSelected: {
    backgroundColor: '#5C7BEE',
    borderColor: '#5C7BEE',
  },
  painAreaButtonDisabled: {
    opacity: 0.6,
  },
  painAreaText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  painAreaTextSelected: {
    color: '#fff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  notesInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#5C7BEE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
