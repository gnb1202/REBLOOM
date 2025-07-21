import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileModified() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('이미지 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ 저장 버튼 처리
  const handleSave = () => {
    if (!password || !confirmPassword) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    Alert.alert('성공', '개인정보가 저장되었습니다.');
    router.back(); // 저장 후 이전 페이지로 이동
  };

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>개인정보 수정</Text>
      </View>

      {/* 프로필 박스 */}
      <View style={styles.profileBox}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImage} />
          )}
        </TouchableOpacity>

        <View style={styles.profileRight}>
          <View style={styles.nicknameRow}>
            <Text style={styles.nickname}>닉네임</Text>
            <Text style={styles.dot}>🟣</Text>
            <Text style={styles.star}>⭐</Text>
          </View>
          <Text style={styles.bio}>자기소개자기소개자기소개자기소개</Text>
          <Text style={styles.bio}>자기소개자기소개자기소개자기소개</Text>
        </View>
      </View>

      {/* 비밀번호 입력 */}
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 한 번 더 입력해주세요"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>저장</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    back: {
      fontSize: 20,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 36,
    },

  profileBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 16,
    width: '85%',
    marginTop: 40,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginRight: 16,
  },
  profileRight: {
    flex: 1,
    justifyContent: 'center',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  dot: {
    fontSize: 14,
    marginRight: 4,
  },
  star: {
    fontSize: 16,
  },
  bio: {
    fontSize: 12,
    color: '#333',
    textDecorationLine: 'underline',
  },
  input: {
    width: '85%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 6,
    marginTop: 40,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
