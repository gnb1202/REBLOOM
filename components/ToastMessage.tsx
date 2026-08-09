import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ToastMessageProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

export default function ToastMessage({ message, type, visible, onHide }: ToastMessageProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        type === 'success' ? styles.success : styles.error,
        { opacity: fadeAnim },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 150,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  error: {
    backgroundColor: '#F44336',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});