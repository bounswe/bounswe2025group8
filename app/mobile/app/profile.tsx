import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import TabButton from '../components/ui/TabButton';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { type ReviewCardProps } from '../components/ui/ReviewCard';
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
  const router = useRouter();
  const { user } = useAuth();

  const viewedUserIdString = params.userId as string | undefined;
  const viewedUserId = viewedUserIdString ? Number(viewedUserIdString) : null;

  const initialTab = params.tab === 'requester' ? 'requester' : 'volunteer';
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>(initialTab);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<'volunteer' | 'requester'>(initialTab);

  useEffect(() => {
    const targetUserId = viewedUserId || user?.id;

    if (!targetUserId) {
      if (!user && !viewedUserId) {
      } else {
        setError('User ID not available to load profile.');
      }
      setLoading(false);
      setProfile(null);
      return;
    }

    const loadProfileForTargetUser = async () => {
      try {
        setError(null);
        setLoading(true);
        console.log('[ProfileScreen] Starting loadProfileForTargetUser. ViewedID:', viewedUserId, 'UserID:', user?.id);

        if (viewedUserId && viewedUserId !== user?.id) {
          console.log('[ProfileScreen] Fetching profile for OTHER user:', viewedUserId);
          const fetchedProfile = await getUserProfile(viewedUserId);
          console.log('[ProfileScreen] API response for other user (direct):', JSON.stringify(fetchedProfile));
          if (fetchedProfile?.id) {
            setProfile(fetchedProfile);
            console.log('[ProfileScreen] Set profile for other user.');
          } else {
            setProfile(null);
            setError('Profile not found for this user.');
            console.log('[ProfileScreen] Profile not found for other user.');
          }
        } else if (user?.id) {
          console.log('[ProfileScreen] Attempting to load OWN profile for user ID:', user.id);
          const profileDataFromStorage = await AsyncStorage.getItem('userProfile');
          console.log('[ProfileScreen] AsyncStorage profileData:', profileDataFromStorage ? 'found' : 'not found');
          if (profileDataFromStorage) {
            const parsedProfile: UserProfile = JSON.parse(profileDataFromStorage);
            console.log('[ProfileScreen] Parsed AsyncStorage profile:', JSON.stringify(parsedProfile));
            if (parsedProfile.id === user.id) {
                console.log('[ProfileScreen] Using profile from AsyncStorage.');
                setProfile(parsedProfile);
            } else {
                console.log('[ProfileScreen] AsyncStorage profile ID mismatch. Fetching from API.');
                const fetchedProfile = await getUserProfile(user.id);
                console.log('[ProfileScreen] API response for own user (after mismatch, direct):', JSON.stringify(fetchedProfile));
                if (fetchedProfile?.id) {
                    setProfile(fetchedProfile);
                    await AsyncStorage.setItem('userProfile', JSON.stringify(fetchedProfile));
                    console.log('[ProfileScreen] Set profile from API (after mismatch) and updated AsyncStorage.');
                } else {
                    setProfile(null);
                    await AsyncStorage.removeItem('userProfile');
                    setError('Failed to load your profile.');
                    console.log('[ProfileScreen] Failed to load own profile from API (after mismatch).');
                }
            }
          } else {
            console.log('[ProfileScreen] No profile in AsyncStorage. Fetching from API for own user.');
            const fetchedProfile = await getUserProfile(user.id);
            console.log('[ProfileScreen] API response for own user (no AsyncStorage, direct):', JSON.stringify(fetchedProfile));
            if (fetchedProfile?.id) {
              setProfile(fetchedProfile);
              await AsyncStorage.setItem('userProfile', JSON.stringify(fetchedProfile));
              console.log('[ProfileScreen] Set profile from API (no AsyncStorage) and updated AsyncStorage.');
            } else {
              setProfile(null);
              await AsyncStorage.removeItem('userProfile');
              setError('Failed to load your profile.');
              console.log('[ProfileScreen] Failed to load own profile from API (no AsyncStorage).');
            }
          }
        } else {
            setError('Cannot determine which profile to load.');
            console.log('[ProfileScreen] Cannot determine target user ID.');
            setProfile(null);
        }
      } catch (err: any) {
        console.error('[ProfileScreen] CATCH BLOCK ERROR in loadProfileForTargetUser:', err);
        setError(viewedUserId ? 'Failed to load user profile.' : 'Failed to load your profile. Error: ' + err.message);
        setProfile(null);
      } finally {
        setLoading(false);
        console.log('[ProfileScreen] Finished loadProfileForTargetUser.');
      }
    };

    loadProfileForTargetUser();
  }, [user?.id, viewedUserId]);

  useEffect(() => {
    if (!user) {
        setAllTasks([]);
        return;
    }
    getTasks().then(res => {
      setAllTasks(res.results || []);
    }).catch(() => {
        Alert.alert('Error', 'Could not load task lists.');
        setAllTasks([]);
    });
  }, [user]);

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

  useEffect(() => {
    if (!profile?.id) {
        setReviews([]);
        return;
    }
    setReviewsLoading(true);
    setReviewsError(null);
    getUserReviews(profile.id)
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => setReviewsError('Failed to load reviews'))
      .finally(() => setReviewsLoading(false));
  }, [profile?.id]);

  if (!viewedUserId && !user) {
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
    return <ActivityIndicator size="large" color={colors.primary} style={{flex:1, justifyContent: 'center', alignItems: 'center'}} />;
  }

  if (error && !profile) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ color: 'red', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 }}
            onPress={() => {
                const targetUserIdForRetry = viewedUserId || user?.id;
                if (targetUserIdForRetry) {
                    setLoading(true);
                    setError(null);
                    getUserProfile(targetUserIdForRetry)
                        .then(fetchedProfile => {
                            setProfile(fetchedProfile);
                            if (!viewedUserId && fetchedProfile?.id) {
                                AsyncStorage.setItem('userProfile', JSON.stringify(fetchedProfile));
                            }
                        })
                        .catch(() => setError(viewedUserId? 'Failed to load user profile.' : 'Failed to load your profile.'))
                        .finally(() => setLoading(false));
                } else {
                    Alert.alert("Error", "Cannot retry: User ID is not available.");
                }
            }}
          >
            <Text style={{ color: colors.background, fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>Profile data is not available.</Text>
      </View>
    );
  }
  
  const isOwnProfile = user?.id === profile.id;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}>
      <View style={[styles.profileHeaderRow, { backgroundColor: themeColors.background, marginTop: 32 }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/feed')} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={28} color={themeColors.text} />
        </TouchableOpacity>
        <Image
          source={ profile.photo ? {uri: profile.photo } : require('../assets/images/empty_profile_photo.png')}
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
        {isOwnProfile && (
            <>
                <TouchableOpacity onPress={() => router.push('/notifications')} style={{ marginLeft: 12 }}>
                    <Ionicons name="notifications-outline" size={28} color={themeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/settings')} style={{ marginLeft: 12 }}>
                    <Ionicons name="settings-outline" size={28} color={themeColors.text} />
                </TouchableOpacity>
            </>
        )}
      </View>

      {isOwnProfile && (
          <View style={{ flexDirection: 'row', marginHorizontal: 24, marginTop: 18, marginBottom: 18, borderRadius: 12, backgroundColor: '#f3f0ff', overflow: 'hidden' }}>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: selectedTab === 'volunteer' ? '#7C6AED' : 'transparent' }}
              onPress={() => setSelectedTab('volunteer')}
            >
              <Text style={{ color: selectedTab === 'volunteer' ? '#fff' : '#7C6AED', fontWeight: '600', fontSize: 16 }}>My Volunteer Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: selectedTab === 'requester' ? '#7C6AED' : 'transparent' }}
              onPress={() => setSelectedTab('requester')}
            >
              <Text style={{ color: selectedTab === 'requester' ? '#fff' : '#7C6AED', fontWeight: '600', fontSize: 16 }}>My Created Tasks</Text>
            </TouchableOpacity>
          </View>
      )}

      {isOwnProfile && selectedTab === 'volunteer' && <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Active Tasks as Volunteer</Text>
        <View style={{ marginBottom: 16, marginTop: 12 }}>
          {activeVolunteerTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No active volunteer tasks.</Text>
          ) : (
            activeVolunteerTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={req.photo || require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({ 
                  pathname: '/v-request-details',
                  params: { id: req.id } 
                })}
              />
            ))
          )}
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Past Tasks as Volunteer</Text>
        <View style={{ marginBottom: 32, marginTop: 12 }}>
          {pastVolunteerTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No past volunteer tasks.</Text>
          ) : (
            pastVolunteerTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={req.photo || require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({ 
                  pathname: '/v-request-details',
                  params: { id: req.id } 
                })}
              />
            ))
          )}
        </View>
      </>}

      {isOwnProfile && selectedTab === 'requester' && <>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Active Tasks as Requester</Text>
        <View style={{ marginBottom: 16, marginTop: 12 }}>
          {activeRequesterTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No active requester tasks.</Text>
          ) : (
            activeRequesterTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={req.photo || require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({ 
                  pathname: '/r-request-details',
                  params: { id: req.id } 
                })}
              />
            ))
          )}
        </View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8, marginLeft: 16, color: colors.text }}>Past Tasks as Requester</Text>
        <View style={{ marginBottom: 32, marginTop: 12 }}>
          {pastRequesterTasks.length === 0 ? (
            <Text style={{ color: colors.text, marginTop: 8, marginLeft: 16 }}>No past requester tasks.</Text>
          ) : (
            pastRequesterTasks.map(req => (
              <RequestCard
                key={req.id}
                title={req.title}
                imageUrl={req.photo || require('../assets/images/help.png')}
                category={req.category_display || req.category}
                urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
                status={req.status_display || req.status}
                distance={req.location || 'N/A'}
                time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
                onPress={() => router.push({ 
                  pathname: '/r-request-details',
                  params: { id: req.id } 
                })}
              />
            ))
          )}
        </View>
      </>}

      <View style={styles.reviewsSectionContainer}>
          <View style={styles.reviewsHeaderRow}>
            <Ionicons name="star-outline" size={20} color={themeColors.pink} />
            <Text style={styles.reviewsHeaderText}>Reviews for {profile ? profile.name : 'User'}</Text>
          </View>
          {reviewsLoading && <ActivityIndicator color={colors.primary} />}
          {reviewsError && <Text style={{color: 'red', marginLeft: 16}}>{reviewsError}</Text>}
          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <Text style={{ color: colors.text, marginLeft: 16, marginTop: 8 }}>No reviews yet for this user.</Text>
          )}
          {!reviewsLoading && !reviewsError && reviews.map((review) => (
            <ReviewCard 
                key={review.id} 
                author={review.reviewer.name} 
                score={review.score}
                comment={review.comment}
                date={new Date(review.timestamp).toLocaleDateString()} 
                imageUrl={review.reviewer.photo || require('../assets/images/empty_profile_photo.png')}
            />
          ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
    paddingTop: 36,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
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
  reviewsSectionContainer: {
    marginHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
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
  },
}); 