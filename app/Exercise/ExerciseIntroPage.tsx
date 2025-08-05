import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExerciseIntroPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>1. Long Deep Breathing</Text>
        <View style={styles.bulletList}>
          <Text style={styles.bullet}>• What is it for?</Text>
          <Text style={styles.bullet}>• What to pay attention to?</Text>
          <Text style={styles.bulletSub}>  • Encouragement</Text>
          <Text style={styles.bulletSub}>  • etc</Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => router.push('/Exercise/ExerciseVideoPage')}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 80,
  },
  contentBox: {
    backgroundColor: '#ddd',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  bulletList: {
    gap: 6,
  },
  bullet: {
    fontSize: 16,
  },
  bulletSub: {
    fontSize: 14,
    paddingLeft: 12,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
