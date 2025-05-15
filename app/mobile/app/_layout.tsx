// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../lib/auth';
import { Colors } from '../constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme';

const myLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const myDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

// Define your route groups
const authRoutes = ['index', 'signin', 'signup', 'forgot-password'];
// Add any other public/auth routes here, ensure 'index' is treated as an auth route if it's a landing page.

function RootNavigator() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = authRoutes.includes(segments[0] || 'index'); 
    // segments[0] might be undefined if at the very root, treat as 'index'

    if (!user && !inAuthGroup) {
      // User is not signed in and is not in an auth screen.
      // Redirect to the sign-in screen.
      router.replace('/index' as any); // Or '/signin' as any if you prefer direct login
    } else if (user && inAuthGroup) {
      // User is signed in and is in an auth screen.
      // Redirect to the main app screen (e.g., feed).
      router.replace('/feed' as any);
    }
  }, [user, segments, router]); // Add router to dependencies

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="feed" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="create_request" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="terms" />
      {/* Add other screens here */}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? myDarkTheme : myLightTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
