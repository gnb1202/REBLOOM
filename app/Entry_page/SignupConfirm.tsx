// Entry_page/Signupconfirm.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Signupconfirm() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/Entry_page/Loginpage');
    }, 3000); // 3초 후 이동

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Signup completed.</Text>
      <Text style={styles.subtext}>3 seconds later, you will be redirected to the login screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 13,
    color: '#666',
  },
});
