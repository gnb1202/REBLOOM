import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Mainmenu() {
  const router = useRouter();

  // 메뉴 정보 리스트
  const menuList = [
    {
      title: 'Health Report',
      color: ['#E5F7FF', '#388e3c'],
      onPress: () => router.push('/Menu/Report'),
    },
    {
      title: 'Quest',
      color: ['#E5F7FF', '#0097a7'],
      onPress: () => router.push('/Mark/Quest/QuestPage'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* 상단바 */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/Home_page/Homepage')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Main Menu</Text>
      </View>

      {/* 메뉴 리스트 */}
      {menuList.map((item) => (
        <TouchableOpacity
          key={item.title}
          style={[
            styles.menuButton,
            { borderColor: item.color[0] }
          ]}
          onPress={item.onPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.menuTitle, { color: item.color[1] }]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    width: '100%',
    height: 42,
    marginBottom: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 60,
    top: 0,
    padding: 6,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 30,
    color: '#4a90e2',
    fontWeight: '500',
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
  },
  menuButton: {
    width: width * 0.84,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2.5,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  menuTitle: {
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
