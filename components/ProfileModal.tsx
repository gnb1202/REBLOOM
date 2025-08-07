import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../firebase.config';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const { user, userProfile, refreshProfile, calculateDaysSinceSurgery, signOut } = useAuth();
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState(userProfile?.profile?.selectedBadge || null);
  const [saving, setSaving] = useState(false);

  // 기본 뱃지 목록 (실제로는 사용자가 획득한 뱃지만 표시해야 함)
  const availableBadges = [
    {
      id: 'exercise1',
      name: 'Exercise Beginner',
      image: require('../assets/images/badge/exercisestep1.png'),
      description: 'First exercise completed'
    },
    {
      id: 'exercise2',
      name: 'Exercise Skilled',
      image: require('../assets/images/badge/exercisestep2.png'),
      description: '10 exercises completed'
    },
    {
      id: 'exercise3',
      name: 'Exercise Expert',
      image: require('../assets/images/badge/exercisestep3.png'),
      description: '50 exercises completed'
    },
    {
      id: 'exercise4',
      name: 'Exercise Master',
      image: require('../assets/images/badge/exercisestep4.png'),
      description: '100 exercises completed'
    },
    {
      id: 'flower1',
      name: 'Flower Lover',
      image: require('../assets/images/badge/getflowerstep1.png'),
      description: 'First flower obtained'
    },
    {
      id: 'flower2',
      name: 'Gardener',
      image: require('../assets/images/badge/getflowerstep2.png'),
      description: '5 flowers obtained'
    },
    {
      id: 'flower3',
      name: 'Flower Expert',
      image: require('../assets/images/badge/getflowerstep3.png'),
      description: '15 flowers obtained'
    },
    {
      id: 'flower4',
      name: 'Flower Master',
      image: require('../assets/images/badge/getflowerstep4.png'),
      description: '30 flowers obtained'
    },
  ];

  const handleBadgeSelect = (badgeId: string | null) => {
    setSelectedBadge(badgeId);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        profile: {
          ...userProfile?.profile,
          selectedBadge: selectedBadge
        }
      });
      
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully.');
      onClose();
    } catch (error) {
      console.error('Profile update failed:', error);
      Alert.alert('Error', 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout function called - starting direct logout');
    try {
      console.log('Starting logout process...');
      onClose();
      console.log('Modal closed');
      
      // 로그아웃 시작 전 안전한 대기
      console.log('Waiting before logout...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Calling signOut...');
      await signOut();
      console.log('signOut completed successfully');
      
      // 화면 전환 전 추가 대기
      console.log('Waiting before navigation...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Navigating to login page...');
      router.replace('/Entry_page/Loginpage');
      console.log('Navigation completed');
      
    } catch (error) {
      console.error('Logout error:', error);
      // 오류가 발생해도 로그인 화면으로 이동 (강제 로그아웃)
      console.log('Error occurred, forcing navigation to login');
      router.replace('/Entry_page/Loginpage');
      console.log('Force navigation completed');
    }
  };

  if (!userProfile) {
    return null;
  }

  const daysSinceSurgery = calculateDaysSinceSurgery();
  const surgeryDate = new Date(userProfile.surgeryDate).toLocaleDateString('en-US');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 기본 정보 */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nickname</Text>
                <Text style={styles.infoValue}>
                  {userProfile.profile?.nickname || userProfile.nickname || 'User'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Level</Text>
                <Text style={styles.infoValue}>Lv.{userProfile?.gameData?.level ?? 1}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Surgery Date</Text>
                <Text style={styles.infoValue}>{surgeryDate}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Days Since Surgery</Text>
                <Text style={styles.infoValue}>D+{daysSinceSurgery}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Consecutive Exercises</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.gameData?.consecutiveExercises ?? 0} days
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Exercises</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.gameData?.totalExercises ?? 0} times
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Currency</Text>
                <Text style={styles.coinValue}>
                  💰 {userProfile?.gameData?.currency ?? 0}
                </Text>
              </View>
            </View>

            {/* 로그아웃 버튼 */}
            <View style={styles.logoutSection}>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: '#ff4757', zIndex: 999 }]}
                onPress={() => {
                  console.log('Logout button touched!');
                  handleLogout();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* 뱃지 선택 */}
            <View style={styles.badgeSection}>
              <Text style={styles.sectionTitle}>Select Badge</Text>
              <Text style={styles.sectionSubtitle}>Choose a badge to display</Text>
              
              {/* 뱃지 없음 옵션 */}
              <TouchableOpacity
                style={[
                  styles.badgeOption,
                  !selectedBadge && styles.selectedBadge
                ]}
                onPress={() => handleBadgeSelect(null)}
              >
                <View style={styles.noBadgeContainer}>
                  <Text style={styles.noBadgeText}>No Badge</Text>
                </View>
                <Text style={styles.badgeName}>Default</Text>
              </TouchableOpacity>

              {/* 사용 가능한 뱃지들 */}
              <View style={styles.badgeGrid}>
                {availableBadges.map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={[
                      styles.badgeOption,
                      selectedBadge === badge.id && styles.selectedBadge
                    ]}
                    onPress={() => handleBadgeSelect(badge.id)}
                  >
                    <Image source={badge.image} style={styles.badgeImage} />
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeDescription} numberOfLines={2}>
                      {badge.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* 저장 버튼 */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minHeight: '60%',
    maxHeight: '85%',
    width: '90%',
    maxWidth: 400,
    flexDirection: 'column',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    minHeight: 300,
    paddingBottom: 10,
  },
  infoSection: {
    marginBottom: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  coinValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  badgeSection: {
    marginBottom: 12,
    minHeight: 120,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeOption: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBadge: {
    borderColor: '#5C7BEE',
    backgroundColor: '#f0f4ff',
  },
  noBadgeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noBadgeText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  badgeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  modalFooter: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#5C7BEE',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutSection: {
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProfileModal;