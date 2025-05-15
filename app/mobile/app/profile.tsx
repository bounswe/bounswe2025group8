import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../lib/auth';
import { getUserProfile, type UserProfile } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const params = useLocalSearchParams();
  const initialTab = params.tab === 'requester' ? 'requester' : 'volunteer';
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>(initialTab);
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const loadProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        const profileData = await AsyncStorage.getItem('userProfile');
        if (profileData) {
          setProfile(JSON.parse(profileData));
        } else if (user?.id) {
          const response = await getUserProfile(user.id);
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
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?.id]);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 20, marginBottom: 16 }}>You are browsing as a guest.</Text>
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 24 }}>Sign up or sign in to access your profile!</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, marginBottom: 12 }} onPress={() => router.push('/signup')}>
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderColor: colors.primary, borderWidth: 2, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }} onPress={() => router.push('/signin')}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (error) {
    return <Text style={{ color: 'red' }}>{error}</Text>;
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 18, marginBottom: 16 }}>No profile data found.</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
          onPress={() => {
            setLoading(true);
            getUserProfile(user.id)
              .then(res => setProfile(res.data))
              .catch(() => setError('Failed to load profile'))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={{ color: colors.background, fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pass real profile data to ProfileTop and other components
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray, paddingTop: 36 }]}>
      <ProfileTop MOCK_USER={{
        name: profile.name + ' ' + profile.surname,
        profileImageUrl: 'empty_profile_photo.png', // You may want to add a real photo field to your backend
        totalRating: profile.rating,
        totalReviewCount: profile.completed_task_count,
        volunteerRating: profile.rating, // Adjust as needed
        volunteerReviewCount: profile.completed_task_count, // Adjust as needed
        requesterRating: profile.rating, // Adjust as needed
        requesterReviewCount: profile.completed_task_count, // Adjust as needed
      }} />
      {/* ...rest of your UI, using real data... */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  reviewsSection: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
  },
  reviewsTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 10,
  },
}); 