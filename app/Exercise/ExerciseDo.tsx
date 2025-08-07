import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExerciseDo() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const router = useRouter();

  if (!permission) return <Text>Requesting camera permissions...</Text>;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Camera permission is required.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.allowBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단: Front/Back 버튼 */}
      <View style={styles.topRight}>
        <TouchableOpacity
          onPress={() => setCameraType(type => (type === 'front' ? 'back' : 'front'))}
          style={styles.toggleBtn}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Front/Back</Text>
        </TouchableOpacity>
      </View>
      {/* 카메라 */}
      <CameraView style={styles.camera} facing={cameraType} />
      {/* 하단: Next 버튼 */}
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => router.push('/Exercise/ExerciseSummaryPage')}
      >
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', position: 'relative' },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  topRight: {
    position: 'absolute',
    top: 28,
    right: 28,
    zIndex: 10,
  },
  toggleBtn: {
    backgroundColor: '#5C7BEEAA',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 2,
  },
  nextBtn: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    backgroundColor: '#5C7BEE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 60,
    elevation: 2,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  allowBtn: {
    marginTop: 10, padding: 10, backgroundColor: '#5C7BEE', borderRadius: 8,
  }
});
