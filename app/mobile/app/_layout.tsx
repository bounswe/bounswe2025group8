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
const publicAppRoutes = ['feed', 'categories', 'category', 'search', 'terms', 'requests', 'v-request-details', 'r-request-details', 'profile']; // NEW - Added 'profile'
// Add any other public/auth routes here, ensure 'index' is treated as an auth route if it's a landing page.

function RootNavigator() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments || (segments.length as number) === 0) {
      // Segments not yet available, or navigating to root.
      // This can happen during initial load or aggressive navigation resets like logout.
      // Returning early can prevent errors from trying to access segments[0] too soon.
      return;
    }
    const currentRoute = segments[0] || 'index';
    const inAuthGroup = authRoutes.includes(currentRoute);
    const inPublicAppGroup = publicAppRoutes.includes(currentRoute);

    if (!user && !inAuthGroup && !inPublicAppGroup) {
      // User is not signed in, not in an auth screen, AND not in a public app screen.
      // Redirect to the initial screen.
      router.replace('/index' as any);
    } else if (user && inAuthGroup) {
      // User is signed in and IS in an auth screen (e.g. /signin).
      // Redirect to the main app screen (e.g., feed).
      router.replace('/feed' as any);
    }
    // If user is null and inAuthGroup, they can stay (e.g. on /signin).
    // If user is null and inPublicAppGroup, they can stay (e.g. on /feed as guest).

  }, [user, segments, router]);

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
