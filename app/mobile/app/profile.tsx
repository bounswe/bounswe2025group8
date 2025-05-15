import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../lib/auth';
import { getUserProfile, type UserProfile, getTasks, type Task, getUserReviews, type Review } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestCard from '../components/ui/RequestCard';
import { Ionicons } from '@expo/vector-icons';

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
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Tab state for Volunteer/Requester
  const [selectedTab, setSelectedTab] = useState<'volunteer' | 'requester'>('volunteer');

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

  useEffect(() => {
    if (!user) return;
    getTasks().then(res => {
      setAllTasks(res.results);
    });
  }, [user]);

  // Filter tasks for each role
  const activeVolunteerTasks = user
    ? allTasks.filter(t => t.assignee && t.assignee.id === user.id && t.status !== 'completed' && t.status !== 'past')
    : [];
  const pastVolunteerTasks = user
    ? allTasks.filter(t => t.assignee && t.assignee.id === user.id && (t.status === 'completed' || t.status === 'past'))
    : [];
  const activeRequesterTasks = user
    ? allTasks.filter(t => t.creator && t.creator.id === user.id && t.status !== 'completed' && t.status !== 'past')
    : [];
  const pastRequesterTasks = user
    ? allTasks.filter(t => t.creator && t.creator.id === user.id && (t.status === 'completed' || t.status === 'past'))
    : [];

  // Log tasks for debugging
  console.log('allTasks:', allTasks);
  console.log('activeVolunteerTasks:', activeVolunteerTasks);
  console.log('pastVolunteerTasks:', pastVolunteerTasks);
  console.log('activeRequesterTasks:', activeRequesterTasks);
  console.log('pastRequesterTasks:', pastRequesterTasks);

  // Fetch reviews when profile is loaded
  useEffect(() => {
    if (!profile) return;
    setReviewsLoading(true);
    setReviewsError(null);
    getUserReviews(profile.id)
      .then(res => setReviews(res.data.reviews))
      .catch(() => setReviewsError('Failed to load reviews'))
      .finally(() => setReviewsLoading(false));
  }, [profile]);

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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}> 
      {/* Profile Header */}
      <View style={[styles.profileHeaderRow, { backgroundColor: themeColors.background, marginTop: 32 }]}> 
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Image
          source={require('../assets/images/empty_profile_photo.png')}
          style={styles.profileAvatar}
        />
        <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
          <Text style={[styles.profileName, { marginTop: 16, marginBottom: 4, fontSize: 18, color: themeColors.text }]} numberOfLines={2} ellipsizeMode="tail">{profile.name} {profile.surname}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <RatingPill
              rating={profile.rating}
              reviewCount={profile.completed_task_count}
              backgroundColor={themeColors.pink}
              textColor="#fff"
              iconColor="#fff"
            />
          </View>
        </View>
        {/* Notifications and Settings icons */}
        <TouchableOpacity onPress={() => router.push('/notifications')} style={{ marginLeft: 12 }}>
          <Ionicons name="notifications-outline" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings')} style={{ marginLeft: 12 }}>
          <Ionicons name="settings-outline" size={28} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 24, marginTop: 18, marginBottom: 18, borderRadius: 12, backgroundColor: '#f3f0ff', overflow: 'hidden' }}>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: selectedTab === 'volunteer' ? '#7C6AED' : 'transparent' }}
          onPress={() => setSelectedTab('volunteer')}
        >
          <Text style={{ color: selectedTab === 'volunteer' ? '#fff' : '#7C6AED', fontWeight: '600', fontSize: 16 }}>Volunteer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: selectedTab === 'requester' ? '#7C6AED' : 'transparent' }}
          onPress={() => setSelectedTab('requester')}
        >
          <Text style={{ color: selectedTab === 'requester' ? '#fff' : '#7C6AED', fontWeight: '600', fontSize: 16 }}>Requester</Text>
        </TouchableOpacity>
      </View>

      {/* Volunteer Section */}
      {selectedTab === 'volunteer' && <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Active Tasks</Text>
        <View style={{ marginBottom: 16, marginTop: 12 }}>
          {activeVolunteerTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No active volunteer tasks found.</Text>
          ) : (
            activeVolunteerTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({
                  pathname: (req.creator && user && req.creator.id === user.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: req.id }
                })}
              />
            ))
          )}
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Past Tasks</Text>
        <View style={{ marginBottom: 32, marginTop: 12 }}>
          {pastVolunteerTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No past volunteer tasks found.</Text>
          ) : (
            pastVolunteerTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({
                  pathname: (req.creator && user && req.creator.id === user.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: req.id }
                })}
              />
            ))
          )}
        </View>
      </>}

      {/* Requester Section */}
      {selectedTab === 'requester' && <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Active Tasks</Text>
        <View style={{ marginBottom: 16, marginTop: 12 }}>
          {activeRequesterTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No active requester tasks found.</Text>
          ) : (
            activeRequesterTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({
                  pathname: (req.creator && user && req.creator.id === user.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: req.id }
                })}
              />
            ))
          )}
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Past Tasks</Text>
        <View style={{ marginBottom: 32, marginTop: 12 }}>
          {pastRequesterTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No past requester tasks found.</Text>
          ) : (
            pastRequesterTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({
                  pathname: (req.creator && user && req.creator.id === user.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: req.id }
                })}
              />
            ))
          )}
        </View>
      </>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
    paddingTop: 36,
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#7C6AED',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#7C6AED',
    fontWeight: 'bold',
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
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    marginTop:36,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eee',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  segmentedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f0ff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 18,
    marginTop: 8,
    overflow: 'hidden',
  },
  segmentedTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  segmentedTabActive: {
    backgroundColor: '#7C6AED',
  },
  segmentedTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C6AED',
  },
  segmentedTabTextActive: {
    color: '#fff',
  },
  requestsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 24,
  },
  requestsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  requestsCardImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  requestsCardTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
    color: '#222',
  },
  requestsCardBadge: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: '#7C6AED',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requestsCardBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  reviewsSectionContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsHeaderText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#E573B7',
  },
  seeAllReviewsBtn: {
    alignSelf: 'center',
    marginTop: 8,
  },
  seeAllReviewsText: {
    color: '#7C6AED',
    fontWeight: '500',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 