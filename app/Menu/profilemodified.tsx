import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProgress } from '../../context/ProgressContext';

export default function ProfileModified() {
  const router = useRouter();
  const { completedChallenges, selectedBadges, setSelectedBadges } = useProgress();

  const [image, setImage] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedBadges || []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('이미지 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleBadge = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(b => b !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    if (!password || !confirmPassword) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setSelectedBadges(selected); // ✅ 선택한 뱃지 저장
    Alert.alert('성공', '개인정보가 저장되었습니다.');
    router.back();
  };

  const badgeImages = {
    'flower-1': require('../../assets/images/badge/getflowerstep1.png'),
    'flower-2': require('../../assets/images/badge/getflowerstep2.png'),
    'flower-3': require('../../assets/images/badge/getflowerstep3.png'),
    'flower-4': require('../../assets/images/badge/getflowerstep4.png'),
    'attend-3': require('../../assets/images/badge/exercisestep1.png'),
    'attend-5': require('../../assets/images/badge/exercisestep2.png'),
    'attend-7': require('../../assets/images/badge/exercisestep3.png'),
    'attend-14': require('../../assets/images/badge/exercisestep4.png'),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            <View style={styles.badgeRow}>
              {selected.map(id => (
                <Image
                  key={id}
                  source={badgeImages[id]}
                  style={styles.badgeIcon}
                />
              ))}
            </View>
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

      {/* 뱃지 선택 */}
      <Text style={styles.selectTitle}>표시할 뱃지를 선택하세요</Text>
      <View style={styles.badgeSelectContainer}>
        {completedChallenges.map(id => (
          <TouchableOpacity
            key={id}
            onPress={() => toggleBadge(id)}
            style={[
              styles.selectableBadge,
              selected.includes(id) && styles.selectedBadge,
            ]}
          >
            <Image source={badgeImages[id]} style={styles.selectBadgeIcon} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 80,
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
    flexWrap: 'wrap',
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeIcon: {
    width: 20,
    height: 20,
    marginLeft: 4,
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
  selectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  badgeSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '85%',
  },
  selectableBadge: {
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 6,
    padding: 4,
  },
  selectedBadge: {
    borderColor: '#5C7BEE',
  },
  selectBadgeIcon: {
    width: 40,
    height: 40,
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
