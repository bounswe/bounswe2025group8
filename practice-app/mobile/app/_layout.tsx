// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const myLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#636AE8', // purple
  },
};

const myDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#636AE8', // purple
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // The below should be 'dark', but it can be changed to 'light' for testing
    <ThemeProvider value={colorScheme === 'dark' ? myDarkTheme : myLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Plain Stack—no bottom tabs */}
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="figmaComponentPage" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
