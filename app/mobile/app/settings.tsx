import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, Button } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as apiLogout } from '../lib/api';
import { useAuth } from '../lib/auth';
import { CommonActions } from '@react-navigation/native';
import { useAppTheme, type ThemePreference } from '@/theme/ThemeProvider';

export default function Settings() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout: contextLogout } = useAuth();
  const { tokens: themeColors, preference, setPreference } = useAppTheme();

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: themeColors.text, fontSize: 18, marginBottom: 16 }}>
          You must sign in to access settings.
        </Text>
        <Button title="Go to Home" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const resetToLaunch = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'index' }],
      })
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            resetToLaunch();
            await apiLogout();
            await AsyncStorage.removeItem('token');
            await contextLogout();
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const themeOptions: { label: string; description: string; value: ThemePreference }[] = [
    { label: 'Match Device', description: 'Follow the OS appearance', value: 'system' },
    { label: 'Light', description: 'Bright backgrounds, high contrast text', value: 'light' },
    { label: 'Dark', description: 'Dark surfaces for low-light comfort', value: 'dark' },
    { label: 'High Contrast', description: 'Maximum contrast for accessibility', value: 'highContrast' },
  ];

  const handleThemeSelect = async (nextPreference: ThemePreference) => {
    await setPreference(nextPreference);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.headerBar, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>Appearance</Text>
          <Text style={[styles.sectionDescription, { color: themeColors.textMuted }]}>
            Choose how the app looks. Your choice is saved on this device.
          </Text>
          <View accessible accessibilityRole="radiogroup">
            {themeOptions.map(option => {
              const isActive = preference === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleThemeSelect(option.value)}
                  style={[
                    styles.themeOption,
                    {
                      borderColor: isActive ? themeColors.primary : themeColors.border,
                      backgroundColor: isActive ? themeColors.pressedBackground : themeColors.card,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={option.label}
                  accessibilityHint={option.description}
                  activeOpacity={0.9}
                >
                  <View style={styles.themeOptionText}>
                    <Text style={[styles.themeOptionLabel, { color: themeColors.text }]}>{option.label}</Text>
                    <Text style={[styles.themeOptionDescription, { color: themeColors.textMuted }]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons
                    name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isActive ? themeColors.primary : themeColors.icon}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: themeColors.error, borderColor: themeColors.error }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={themeColors.card} />
          <Text style={[styles.logoutText, { color: themeColors.card }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 25 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  section: {
    alignSelf: 'stretch',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  themeOptionText: {
    flex: 1,
    marginRight: 12,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeOptionDescription: {
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 32,
    alignSelf: 'stretch',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
