import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ProgressProvider } from '../context/ProgressContext';
import { CoinProvider } from '../context/CoinContext';
import { AuthProvider } from '../context/AuthContext';
import { ExerciseProvider } from '../context/ExerciseContext';
import { MusicProvider } from '../context/MusicContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text style={{ fontSize: 16 }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ExerciseProvider>
        <CoinProvider>
          <ProgressProvider>
            <MusicProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="Exercise/ExerciseIntroPage"
                    options={{ animation: 'none' }}
                  />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </MusicProvider>
          </ProgressProvider>
        </CoinProvider>
      </ExerciseProvider>
    </AuthProvider>
  );
}
