<<<<<<< HEAD
=======
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '../lib/auth';
<<<<<<< HEAD
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';
=======
import { AppThemeProvider, type ThemeName } from '../lib/theme';
import { Colors } from '../constants/Colors';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)

export const unstable_settings = {
  anchor: '(tabs)',
};

const authRoutes = ['index', 'signin', 'signup', 'forgot-password'];
const publicAppRoutes = [
  'feed',
  'categories',
  'category',
  'search',
  'terms',
  'requests',
  'v-request-details',
  'r-request-details',
  'profile',
  'settings',
  'notifications',
  'create_request',
  'cr_upload_photo',
  'cr_deadline',
  'cr_address',
  'select-volunteer',
];

function RootNavigator() {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!segments || segments.length === 0) {
      return;
    }

    const currentRoute = segments[0] || 'index';
    const inAuthGroup = authRoutes.includes(currentRoute);
    const inPublicGroup = publicAppRoutes.includes(currentRoute);

    if (!user && !inAuthGroup && !inPublicGroup) {
      router.replace('/' as any);
    } else if (user && inAuthGroup) {
      router.replace('/feed' as any);
    }
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
      <Stack.Screen name="cr_upload_photo" />
      <Stack.Screen name="cr_deadline" />
      <Stack.Screen name="cr_address" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="r-request-details" />
      <Stack.Screen name="v-request-details" />
      <Stack.Screen name="select-volunteer" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}

<<<<<<< HEAD
function ThemedStatusBar() {
  const { resolvedTheme } = useAppTheme();
  const style = resolvedTheme === 'light' ? 'dark' : 'light';
  return <StatusBar style={style} />;
}
=======
const navigationThemes: Record<ThemeName, Theme> = {
  light: createNavigationTheme('light'),
  dark: createNavigationTheme('dark'),
  highContrast: createNavigationTheme('highContrast'),
};

function createNavigationTheme(themeName: ThemeName): Theme {
  const palette = Colors[themeName];
  const base = themeName === 'light' ? DefaultTheme : DarkTheme;

  return {
    ...base,
    dark: themeName !== 'light',
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      notification: palette.secondary,
    },
  };
}

function NavigationRoot() {
  const colorScheme = useColorScheme();
  const theme = navigationThemes[colorScheme];
  const statusBarStyle = colorScheme === 'light' ? 'dark' : 'light';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <RootNavigator />
      <StatusBar style={statusBarStyle} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
<<<<<<< HEAD
        <RootNavigator />
        <ThemedStatusBar />
=======
        <NavigationRoot />
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
      </AppThemeProvider>
    </AuthProvider>
  );
}
