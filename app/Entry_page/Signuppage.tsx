import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';

export default function Signuppage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [dateError, setDateError] = useState('');

  const validateId = (value: string) => /^[a-z0-9]+$/.test(value);
  const validatePassword = (value: string) => value.length >= 6;
  const validateNickname = (value: string) => value.length <= 6;
  const validateDate = (value: string) =>
    /^\d{4}-\d{1,2}-\d{1,2}$/.test(value);

  const handleDateSelect = (day: any) => {
    setSurgeryDate(day.dateString);
    setShowDatePicker(false);
    setDateError('');
  };

  const handleSignUp = async () => {
    let hasError = false;
    setIdError('');
    setPasswordError('');
    setNicknameError('');
    setDateError('');

    if (!id.trim()) {
      setIdError('Please enter your ID.');
      hasError = true;
    } else if (!validateId(id.trim())) {
      setIdError('Only lowercase letters and numbers are allowed.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }

    if (!nickname.trim()) {
      setNicknameError('Please enter your nickname.');
      hasError = true;
    } else if (!validateNickname(nickname.trim())) {
      setNicknameError('Nickname must be 6 characters or less.');
      hasError = true;
    }

    if (!surgeryDate) {
      setDateError('Please select surgery date.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await signUp(id.trim(), password, nickname.trim(), surgeryDate);
      Alert.alert(
        'Sign Up Complete',
        'Sign up completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/Home_page/Homepage')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>
      <ScrollView contentContainerStyle={styles.formContainer}>

        <TextInput
          style={styles.input}
          placeholder="Enter your nickname"
          value={nickname}
          onChangeText={setNickname}
        />
        {nicknameError ? <Text style={styles.error}>{nicknameError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Enter your ID"
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
        />
        {idError ? <Text style={styles.error}>{idError}</Text> : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eye}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

        <TouchableOpacity
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
          disabled={loading}
        >
          <Text style={[styles.dateText, !surgeryDate && styles.placeholderText]}>
            {surgeryDate || 'Select surgery date'}
          </Text>
        </TouchableOpacity>
        {dateError ? <Text style={styles.error}>{dateError}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 날짜 선택 모달 */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Surgery Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [surgeryDate]: { selected: true, selectedColor: '#3B63F2' }
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: '#3B63F2',
                todayTextColor: '#3B63F2',
                arrowColor: '#3B63F2',
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  formContainer: {
    paddingBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eye: {
    fontSize: 18,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#3B63F2',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
});
