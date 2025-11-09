import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, Button } from 'react-native';
<<<<<<< HEAD
=======
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@react-navigation/native';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as apiLogout } from '../lib/api';
import { useAuth } from '../lib/auth';
import { CommonActions } from '@react-navigation/native';
<<<<<<< HEAD
import { useAppTheme, type ThemePreference } from '@/theme/ThemeProvider';
=======
import { useAppTheme, type ThemePreference } from '../lib/theme';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)

export default function Settings() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout: contextLogout } = useAuth();
<<<<<<< HEAD
  const { tokens: themeColors, preference, setPreference } = useAppTheme();
=======
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const { preference, setPreference } = useAppTheme();
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)

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
<<<<<<< HEAD
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
=======
        <View style={[styles.section, { borderColor: themeColors.border, backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Appearance</Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.textMuted }]}>
            Pick how the app looks. Match system follows your device automatically.
          </Text>
          {themePreferenceOptions.map((option) => {
            const isActive = preference === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionRow,
                  {
                    borderColor: isActive ? themeColors.primary : themeColors.border,
                    backgroundColor: themeColors.background,
                  },
                ]}
                onPress={() => setPreference(option.value)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, { color: themeColors.text }]}>{option.label}</Text>
                  <Text style={[styles.optionDescription, { color: themeColors.textMuted }]}>
                    {option.description}
                  </Text>
                </View>
                {isActive ? (
                  <Ionicons name="checkmark-circle" size={22} color={themeColors.primary} />
                ) : (
                  <View style={[styles.optionIndicator, { borderColor: themeColors.border }]} />
                )}
              </TouchableOpacity>
            );
          })}
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
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
    alignItems: 'stretch',
    gap: 24,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 12,
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

const themePreferenceOptions: Array<{ label: string; description: string; value: ThemePreference }> = [
  {
    label: 'Match System',
    description: 'Syncs with your device appearance setting.',
    value: 'system',
  },
  {
    label: 'Light',
    description: 'Bright background with high legibility.',
    value: 'light',
  },
  {
    label: 'Dark',
    description: 'Dimmed UI for comfortable low-light use.',
    value: 'dark',
  },
  {
    label: 'High Contrast',
    description: 'Maximum contrast for readability and accessibility.',
    value: 'highContrast',
  },
];
