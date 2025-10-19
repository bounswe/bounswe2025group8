import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, useColorScheme, Platform, Button } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as apiLogout } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Colors } from '../constants/Colors';
import { CommonActions } from '@react-navigation/native';

export default function Settings() {
  const { colors } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout: contextLogout } = useAuth();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];

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
