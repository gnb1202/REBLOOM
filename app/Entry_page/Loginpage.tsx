import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function Loginpage() {
  const router = useRouter();
  const { signIn, user } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/Home_page/Homepage');
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter your ID.');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(userId.trim(), password);
      router.replace('/Home_page/Homepage');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 */}
      <Text style={styles.title}>Login</Text>

      {/* 입력창 */}
      <TextInput
        placeholder="Enter your ID"
        placeholderTextColor="#999"
        style={styles.input}
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        placeholder="Enter your password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {/* 로그인 버튼 */}
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* 하단 메뉴 */}
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => router.push('/Entry_page/Signuppage')}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
     color: '#222',
  },
  loginButton: {
    backgroundColor: '#4F73FF',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  linkText: {
    color: '#222',
    fontSize: 13,
  },
  divider: {
    marginHorizontal: 6,
    color: '#999',
  },
});
