import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, Alert, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../lib/auth';
import { getUserProfile, type UserProfile, getTasks, type Task, getUserReviews, type Review, listVolunteers, type Volunteer } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestCard from '../components/ui/RequestCard';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../constants/Colors';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const viewedUserIdString = params.userId as string | undefined;
  const numUserId = viewedUserIdString ? parseInt(viewedUserIdString, 10) : NaN;
  const viewedUserId = !isNaN(numUserId) && numUserId > 0 ? numUserId : null;
  const targetUserId = viewedUserId ?? user?.id ?? null;

  const initialTab = params.tab === 'requester' ? 'requester' : 'volunteer';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [userVolunteers, setUserVolunteers] = useState<Volunteer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [selectedTab, setSelectedTab] = useState<'volunteer' | 'requester'>(initialTab);

  useEffect(() => {
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
  }, [targetUserId, user?.id, viewedUserId]);

  useEffect(() => {
    if (!targetUserId) {
      setAllTasks([]);
      setUserVolunteers([]);
      return;
    }
    
    // Fetch tasks
    getTasks()
      .then((res) => {
        setAllTasks(res.results || []);
      })
      .catch(() => {
        Alert.alert('Error', 'Could not load task lists.');
        setAllTasks([]);
      });
    
    // Fetch user's volunteer records if viewing own profile or if user is logged in
    if (user && (targetUserId === user.id || !viewedUserId)) {
      listVolunteers()
        .then((volunteers) => {
          // Only include ACCEPTED volunteers for completed tasks
          setUserVolunteers(volunteers.filter(v => {
            const status = v.status?.toUpperCase() || '';
            return status === 'ACCEPTED';
          }));
        })
        .catch((err) => {
          console.error('Error fetching volunteers:', err);
          setUserVolunteers([]);
        });
    } else {
      setUserVolunteers([]);
    }
  }, [targetUserId, user?.id, viewedUserId]);

  const normalizeStatus = (status?: string) => (status || '').toLowerCase();
  const isActiveStatus = (status?: string) => {
    const value = normalizeStatus(status);
    return ['posted', 'assigned', 'in_progress'].includes(value);
  };
  const isPastStatus = (status?: string) => {
    const value = normalizeStatus(status);
    return ['completed', 'past', 'cancelled', 'expired'].includes(value);
  };

  // Helper function to check if a task is assigned to the target user
  const isTaskAssignedToUser = (task: Task): boolean => {
    if (!targetUserId) return false;
    
    // Check single assignee field
    if (task.assignee && task.assignee.id === targetUserId) {
      return true;
    }
    
    // Check if user has an ACCEPTED volunteer record for this task
    if (user && targetUserId === user.id) {
      const volunteerRecord = userVolunteers.find(v => {
        const taskId = typeof v.task === 'number' ? v.task : (v.task as Task)?.id;
        return taskId === task.id;
      });
      return volunteerRecord !== undefined;
    }
    
    return false;
  };

  const volunteerTasks = targetUserId
    ? allTasks.filter((task) => isTaskAssignedToUser(task))
    : [];
  const requesterTasks = targetUserId
    ? allTasks.filter((task) => task.creator && task.creator.id === targetUserId)
    : [];

  const activeVolunteerTasks = volunteerTasks.filter((task) => isActiveStatus(task.status));
  const pastVolunteerTasks = volunteerTasks.filter((task) => isPastStatus(task.status));
  const activeRequesterTasks = requesterTasks.filter((task) => isActiveStatus(task.status));
  const pastRequesterTasks = requesterTasks.filter((task) => isPastStatus(task.status));

  const getUrgencyLabel = (task: Task) => {
    switch (task.urgency_level) {
      case 3:
        return 'High';
      case 2:
        return 'Medium';
      case 1:
        return 'Low';
      default:
        return 'Medium';
    }
  };

  const renderTaskSection = (
    title: string,
    tasks: Task[],
    emptyMessage: string,
    routePath: '/v-request-details' | '/r-request-details'
  ) => (
    <View style={styles.taskSection}>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
      <View style={styles.taskListContainer}>
        {tasks.length === 0 ? (
          <Text style={[styles.emptyListText, { color: themeColors.textMuted }]}>{emptyMessage}</Text>
        ) : (
          tasks.map((task) => (
            <RequestCard
              key={task.id}
              title={task.title}
              category={task.category_display || task.category}
              urgencyLevel={getUrgencyLabel(task)}
              status={task.status_display || task.status}
              distance={task.location || 'N/A'}
              time={task.deadline ? new Date(task.deadline).toLocaleDateString() : ''}
              onPress={() => {
                // Check if current user is the creator of the task
                const isCreator = task.creator && task.creator.id === user?.id;
                const actualRoute = isCreator ? '/r-request-details' : '/v-request-details';
                router.push({ pathname: actualRoute, params: { id: task.id } });
              }}
            />
          ))
        )}
      </View>
    </View>
  );

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
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, marginBottom: 12 }}
          onPress={() => router.push('/signup')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Sign up"
        >
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderColor: colors.primary, borderWidth: 2, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
          onPress={() => router.push('/signin')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
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
            accessible

            accessibilityRole="button"
            accessibilityLabel="Retry loading profile"
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
  const firstName = profile.name?.trim() ?? '';
  const surname = profile.surname?.trim() ?? '';
  let displayName = '';
  if (firstName && surname && firstName.toLowerCase() !== surname.toLowerCase()) {
    displayName = `${firstName} ${surname}`;
  } else if (firstName) {
    displayName = firstName;
  } else if (surname) {
    displayName = surname;
  } else if (profile.username) {
    displayName = profile.username;
  }
  if (!displayName) {
    displayName = 'User';
  }
  const usernameLabel = profile.username ? `@${profile.username}` : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.profileHeaderRow, { /* marginTop might need adjustment if SafeAreaView adds too much space */ }]}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/feed')}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={28} color={themeColors.text} />
          </TouchableOpacity>
          <Image
            source={ profile.photo ? {uri: profile.photo } : require('../assets/images/empty_profile_photo.png')}
            style={[styles.profileAvatar, { backgroundColor: themeColors.card }]}
          />
          <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
            <Text
              style={[styles.profileName, { marginTop: 16, marginBottom: 4, fontSize: 18, color: themeColors.text }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {displayName}
            </Text>
            {usernameLabel ? (
              <Text style={[styles.profileUsername, { color: themeColors.textMuted }]}>{usernameLabel}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <RatingPill
                rating={profile.rating}
                reviewCount={reviews.length}
                backgroundColor={themeColors.pink}
                textColor={themeColors.onAccent}
                iconColor={themeColors.onAccent}
              />
            </View>
          </View>
          {isOwnProfile && (
              <>
                  <TouchableOpacity
                    onPress={() => router.push('/notifications')}
                    style={{ marginLeft: 12 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Open notifications"
                  >
                      <Ionicons name="notifications-outline" size={28} color={themeColors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    style={{ marginLeft: 12 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                  >
                      <Ionicons name="settings-outline" size={28} color={themeColors.text} />
                  </TouchableOpacity>
              </>
          )}
        </View>

        <View style={[styles.tabSelectorContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'volunteer' ? themeColors.primary : 'transparent' } ]}
            onPress={() => setSelectedTab('volunteer')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Show volunteer tasks"
            accessibilityState={{ selected: selectedTab === 'volunteer' }}
          >
            <Text style={[styles.tabButtonText, { color: selectedTab === 'volunteer' ? themeColors.card : themeColors.primary, fontWeight: selectedTab === 'volunteer' ? 'bold' : 'normal' }]}>
              {isOwnProfile ? 'My Volunteer Tasks' : 'Volunteer Tasks'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'requester' ? themeColors.primary : 'transparent' } ]}
            onPress={() => setSelectedTab('requester')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Show created tasks"
            accessibilityState={{ selected: selectedTab === 'requester' }}
          >
            <Text style={[styles.tabButtonText, { color: selectedTab === 'requester' ? themeColors.card : themeColors.primary, fontWeight: selectedTab === 'requester' ? 'bold' : 'normal' }]}>
              {isOwnProfile ? 'My Created Tasks' : 'Created Tasks'}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'volunteer' && (
          <>
            {renderTaskSection(
              isOwnProfile ? 'Active Tasks as Volunteer' : 'Active Volunteer Tasks',
              activeVolunteerTasks,
              'No active volunteer tasks.',
              '/v-request-details'
            )}
            {renderTaskSection(
              isOwnProfile ? 'Past Tasks as Volunteer' : 'Past Volunteer Tasks',
              pastVolunteerTasks,
              'No past volunteer tasks.',
              '/v-request-details'
            )}
          </>
        )}

        {selectedTab === 'requester' && (
          <>
            {renderTaskSection(
              isOwnProfile ? 'Active Tasks as Requester' : 'Active Requests',
              activeRequesterTasks,
              isOwnProfile ? 'No active requester tasks.' : 'No active requests.',
              '/r-request-details'
            )}
            {renderTaskSection(
              isOwnProfile ? 'Past Tasks as Requester' : 'Past Requests',
              pastRequesterTasks,
              isOwnProfile ? 'No past requester tasks.' : 'No past requests.',
              '/r-request-details'
            )}
          </>
        )}

        <View style={[styles.reviewsSectionContainer, {borderColor: themeColors.border}]}>
            <View style={styles.reviewsHeaderRow}>
              <Ionicons name="star-outline" size={20} color={themeColors.pink} />
              <Text style={[styles.reviewsHeaderText, {color: themeColors.text}]}>Reviews for {profile ? profile.name : 'User'}</Text>
            </View>
            {reviewsLoading && <ActivityIndicator color={themeColors.primary} style={{marginVertical: 16}} />}
            {reviewsError && <Text style={[styles.errorText, {color: themeColors.error}]}>{reviewsError}</Text>}
            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <Text style={[styles.emptyListText, { color: themeColors.textMuted, marginTop: 8, marginBottom: 16 }]}>No reviews yet for this user.</Text>
            )}
            {!reviewsLoading && !reviewsError && reviews.map((review) => (
              <ReviewCard
                key={review.id}
                reviewerName={`${review.reviewer.name} ${review.reviewer.surname}`}
                rating={review.score}
                comment={review.comment}
                timestamp={new Date(review.timestamp).toLocaleDateString()}
                avatarUrl={review.reviewer.photo}
              />
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileUsername: {
    fontSize: 14,
  },
  taskSection: {
    marginBottom: 16,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonText: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 12,
  },
  taskListContainer: {
    marginBottom: 16,
  },
  emptyListText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  reviewsSectionContainer: {
    marginBottom: 16,
    marginTop: 24,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewsHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 15,
    marginVertical: 16,
  }
}); 
