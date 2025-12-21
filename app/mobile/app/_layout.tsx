import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '../lib/i18n';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

// Silence all LogBox overlays (warnings and errors) to prevent them from covering UI elements
LogBox.ignoreAllLogs();

import { AuthProvider, useAuth } from '../lib/auth';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';
import { NotificationProvider, useNotifications } from '../lib/NotificationContext';
import NotificationToast from '../components/ui/NotificationToast';

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
  'community-guidelines',
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
  const { newNotification, clearNewNotification } = useNotifications();

  useEffect(() => {
    if (!segments) {
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
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="search" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="community-guidelines" />
        <Stack.Screen name="requests" />
        <Stack.Screen name="v-request-details" />
        <Stack.Screen name="r-request-details" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="create_request" />
        <Stack.Screen name="cr_upload_photo" />
        <Stack.Screen name="cr_deadline" />
        <Stack.Screen name="cr_address" />
        <Stack.Screen name="select-volunteer" />
      </Stack>

      {/* Notification Toast */}
      {newNotification && (
        <NotificationToast
          notification={newNotification}
          onDismiss={clearNewNotification}
        />
      )}
    </>
  );
}

function ThemedStatusBar() {
  const { resolvedTheme } = useAppTheme();
  const style = resolvedTheme === 'light' ? 'dark' : 'light';
  return <StatusBar style={style} />;
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ThemedStatusBar />
          <RootNavigator />
        </NotificationProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
