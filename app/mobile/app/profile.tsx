import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, type UserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If user is not logged in, show guest prompt immediately
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.text, { color: colors.text }]}>You are browsing as a guest.</Text>
        <Text style={[styles.info, { color: colors.text, textAlign: 'center', marginBottom: 24 }]}>
          Sign up to create requests, volunteer, and access your profile!
        </Text>
        <TouchableOpacity style={[styles.signupBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/signup')}>
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (!user) return; // Don't run effect if not logged in
    const loadProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        console.log('Profile page user:', user);
        const profileData = await AsyncStorage.getItem('userProfile');
        console.log('Profile page AsyncStorage userProfile:', profileData);
        if (profileData) {
          setProfile(JSON.parse(profileData));
        } else if (user?.id) {
          const response = await getUserProfile(user.id);
          console.log('Profile page API response:', response);
          const profileObj = response && (response.data || response);
          if (profileObj && profileObj.id) {
            setProfile(profileObj);
            await AsyncStorage.setItem('userProfile', JSON.stringify(profileObj));
          } else {
            setProfile(null);
            await AsyncStorage.removeItem('userProfile');
          }
        } else {
          setError('No user ID found.');
        }
      } catch (err) {
        setError('Failed to load profile.');
        console.error('Profile page error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.text, { color: colors.text }]}>{error}</Text>
      </SafeAreaView>
    );
  }
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.text, { color: colors.text }]}>No profile data found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.text, { color: colors.text }]}>Profile</Text>
      <Text style={[styles.info, { color: colors.text }]}>Name: {profile.name} {profile.surname}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Username: {profile.username}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Email: {profile.email}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Phone: {profile.phone_number}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Location: {profile.location}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Rating: {profile.rating}</Text>
      <Text style={[styles.info, { color: colors.text }]}>Completed Tasks: {profile.completed_task_count}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
  },
  signupBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: 0,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
});
