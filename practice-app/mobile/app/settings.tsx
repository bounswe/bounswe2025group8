import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const { colors } = useTheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      // Only consider user logged in if both token and userId exist
      setIsLoggedIn(!!(token && userId));
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all authentication data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      setIsLoggedIn(false); // Update the state immediately
      
      // Navigate to index page
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
      
      <View style={styles.settingsContainer}>
        {isLoggedIn ? (
          // Logged in user options
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.card }]} 
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Logout',
                    onPress: handleLogout,
                    style: 'destructive'
                  }
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
            <Text style={[styles.logoutText, { color: '#e74c3c' }]}>Logout</Text>
          </TouchableOpacity>
        ) : (
          // Guest options
          <>
            <TouchableOpacity 
              style={[styles.authButton, { backgroundColor: colors.primary }]} 
              onPress={() => router.push('/signin')}
            >
              <Ionicons name="log-in-outline" size={24} color="#fff" />
              <Text style={[styles.authButtonText, { color: '#fff' }]}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.authButton, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]} 
              onPress={() => router.push('/signup')}
            >
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
              <Text style={[styles.authButtonText, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60,
  },
  settingsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
