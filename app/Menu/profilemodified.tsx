import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../firebase.config';

export default function ProfileModified() {
  const router = useRouter();
  const { completedChallenges, selectedBadges, setSelectedBadges } = useProgress();
  const { user, userProfile, refreshProfile } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedBadges || []);
  const [saving, setSaving] = useState(false);

  // 사용자 프로필 데이터로 초기값 설정
  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.profile?.bio || '');
      if (userProfile.profile?.avatar) {
        setImage(userProfile.profile.avatar);
      }
    }
  }, [userProfile]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Image access permission is required.');
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

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }


    if (!password || !confirmPassword) {
      Alert.alert('Notice', 'Please enter your password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Notice', 'Passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      // Firebase에 프로필 업데이트
      const profileUpdates = {
        profile: {
          bio: bio.trim(),
          selectedBadge: selected[0] || null, // 첫 번째 선택한 뱃지를 대표 뱃지로 설정
          avatar: image || null,
        }
      };

      await updateUserProfile(user.uid, profileUpdates);
      setSelectedBadges(selected); // 로컬 상태도 업데이트
      
      // 프로필 새로고침
      await refreshProfile();

      Alert.alert('Success', 'Profile information has been saved.');
      router.back();
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.title}>Edit Profile</Text>
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
            <Text style={styles.nicknameLabel}>Nickname:</Text>
            <Text style={styles.nicknameDisplay}>
              {userProfile?.profile?.nickname || userProfile?.nickname || 'No nickname set'}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {selected.map(id => (
              <Image
                key={id}
                source={badgeImages[id]}
                style={styles.badgeIcon}
              />
            ))}
          </View>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={2}
            maxLength={100}
          />
        </View>
      </View>

      {/* 비밀번호 입력 */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* 뱃지 선택 */}
      <Text style={styles.selectTitle}>Select badges to display</Text>
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
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
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
  nicknameLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
    width: 70,
  },
  nicknameDisplay: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
  bioInput: {
    fontSize: 12,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
    marginTop: 6,
    textAlignVertical: 'top',
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
    backgroundColor: '#5C7BEE',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 6,
    marginTop: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ddd',
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
