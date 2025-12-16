import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image, Alert, SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../lib/auth';
import { getUserProfile, type UserProfile, getTasks, getUserTasks, type Task, getUserReviews, type Review, listVolunteers, type Volunteer, uploadProfilePhoto, deleteProfilePhoto, submitUserReport, BACKEND_BASE_URL, followUser, unfollowUser, getFollowers, getFollowing, type FollowerInfo, type FollowingInfo, getAllBadges, getUserBadges, checkBadges, type Badge, type UserBadge } from '../lib/api';
import { ReportModal } from '../components/ReportModal';
import FollowListModal from '../components/ui/FollowListModal';
import BadgeModal from '../components/ui/BadgeModal';
import BadgeComponent from '../components/ui/Badge';
import BadgeDetailModal from '../components/ui/BadgeDetailModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RequestCard from '../components/ui/RequestCard';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import NotificationIconWithBadge from '../components/ui/NotificationIconWithBadge';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // Follow-related state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState<FollowerInfo[]>([]);
  const [following, setFollowing] = useState<FollowingInfo[]>([]);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Badge-related state
  const [earnedUserBadges, setEarnedUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | UserBadge | null>(null);
  const [badgeDetailModalVisible, setBadgeDetailModalVisible] = useState(false);

  const [selectedTab, setSelectedTab] = useState<'volunteer' | 'requester'>(initialTab);

  const { t } = useTranslation();

  const handleReportUser = async (reportType: string, description: string) => {
    if (!profile?.id) return;
    try {
      await submitUserReport(profile.id, reportType, description);
      Alert.alert(t('common.success'), t('profile.reportSuccess'));
      setReportModalVisible(false);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('profile.reportError'));
    }
  };

  const handlePhotoUpload = async () => {
    if (!user?.id) return;

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('common.error'), t('profile.photoPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUploading(true);
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'profile.jpg';

        await uploadProfilePhoto(user.id, asset.uri, fileName);

        // Refresh profile
        const updatedProfile = await getUserProfile(user.id);
        setProfile(updatedProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        Alert.alert(t('common.success'), t('profile.photoSuccess'));
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(t('common.error'), t('profile.photoError'));
    } finally {
      setPhotoUploading(false);
    }
  };

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

  // Fetch follower and following data
  useEffect(() => {
    if (!profile?.id) {
      setFollowers([]);
      setFollowing([]);
      setFollowersCount(0);
      setFollowingCount(0);
      setIsFollowing(false);
      return;
    }

    const fetchFollowData = async () => {
      try {
        const [followersList, followingList] = await Promise.all([
          getFollowers(profile.id),
          getFollowing(profile.id),
        ]);

        setFollowers(followersList);
        setFollowing(followingList);
        setFollowersCount(followersList.length);
        setFollowingCount(followingList.length);

        // Check if current user is following this profile
        if (user?.id && profile.id !== user.id) {
          const currentUserFollowing = await getFollowing(user.id);
          const isCurrentlyFollowing = currentUserFollowing.some(
            (followedUser) => followedUser.id === profile.id
          );
          setIsFollowing(isCurrentlyFollowing);
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      }
    };

    fetchFollowData();
  }, [profile?.id, user?.id]);

  useEffect(() => {
    if (!targetUserId) {
      setAllTasks([]);
      setUserVolunteers([]);
      return;
    }

    // Fetch tasks for this specific user (automatically fetches all pages)
    getUserTasks(targetUserId)
      .then((res) => {
        setAllTasks(res.results || []);
      })
      .catch(() => {
        Alert.alert(t('common.error'), t('profile.loadTasksError', { defaultValue: 'Could not load task lists.' }));
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

  // Refresh task data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!targetUserId) return;

      console.log('[ProfileScreen] Screen focused - refreshing task data');

      // Refresh tasks for this specific user (automatically fetches all pages)
      getUserTasks(targetUserId)
        .then((res) => {
          setAllTasks(res.results || []);
        })
        .catch((err) => {
          console.error('Error refreshing tasks on focus:', err);
        });

      // Refresh volunteer records if needed
      if (user && (targetUserId === user.id || !viewedUserId)) {
        listVolunteers()
          .then((volunteers) => {
            setUserVolunteers(volunteers.filter(v => {
              const status = v.status?.toUpperCase() || '';
              return status === 'ACCEPTED';
            }));
          })
          .catch((err) => {
            console.error('Error refreshing volunteers on focus:', err);
          });
      }
    }, [targetUserId, user?.id, viewedUserId])
  );

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
        return t('urgency.high');
      case 2:
        return t('urgency.medium');
      case 1:
        return t('urgency.low');
      default:
        return t('urgency.medium');
    }
  };

  const formatStatusLabel = (status?: string) => {
    const base = status || 'Status';
    return t(`requestDetails.status.${base.toLowerCase().replace(/\s+/g, '_')}`);
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
              category={t(`categories.${task.category}`, { defaultValue: task.category_display || task.category })}
              urgencyLevel={getUrgencyLabel(task)}
              status={formatStatusLabel(task.status)}
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
      .then(res => {
        console.log('[ProfileScreen] Reviews response:', JSON.stringify(res.data.reviews));
        setReviews(res.data.reviews || []);
      })
      .catch(() => setReviewsError(t('profile.loadReviewsError')))
      .finally(() => setReviewsLoading(false));
  }, [profile?.id]);

  // Fetch badges when profile loads
  useEffect(() => {
    if (!targetUserId) {
      setEarnedUserBadges([]);
      setAllBadges([]);
      return;
    }

    const fetchBadges = async () => {
      try {
        setBadgesLoading(true);
        
        // Check badges for own profile (to award new badges)
        if (user?.id && targetUserId === user.id) {
          try {
            await checkBadges();
            console.log('[ProfileScreen] Badge check completed');
          } catch (error) {
            console.error('[ProfileScreen] Error checking badges:', error);
            // Don't show error to user, just log it
          }
        }

        // Fetch user badges and all badges in parallel
        const [userBadgesData, allBadgesData] = await Promise.all([
          getUserBadges(targetUserId),
          getAllBadges(),
        ]);

        // Store full UserBadge objects to preserve earned_at information
        setEarnedUserBadges(userBadgesData);
        setAllBadges(allBadgesData);
      } catch (error) {
        console.error('[ProfileScreen] Error fetching badges:', error);
        // Don't show error to user, just set empty arrays
        setEarnedUserBadges([]);
        setAllBadges([]);
      } finally {
        setBadgesLoading(false);
      }
    };

    fetchBadges();
  }, [targetUserId, user?.id]);

  if (!viewedUserId && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 20, marginBottom: 16 }}>{t('profile.guestMessage')}</Text>
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 24 }}>{t('profile.guestAction')}</Text>
        <TouchableOpacity
          style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, marginBottom: 12 }}
          onPress={() => router.push('/signup')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Sign up"
        >
          <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>{t('auth.signUp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderColor: colors.primary, borderWidth: 2, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
          onPress={() => router.push('/signin')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>{t('auth.signIn')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
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
                .catch(() => setError(viewedUserId ? 'Failed to load user profile.' : 'Failed to load your profile.'))
                .finally(() => setLoading(false));
            } else {
              Alert.alert(t('common.error'), "Cannot retry: User ID is not available.");
            }
          }}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Retry loading profile"
        >
          <Text style={{ color: colors.background, fontWeight: 'bold' }}>{t('profile.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>{t('profile.dataUnavailable')}</Text>
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
    displayName = t('profile.defaultUser');
  }
  const usernameLabel = profile.username ? `@${profile.username}` : '';

  const handleFollowToggle = async () => {
    if (!profile?.id || !user?.id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        // Update followers list
        setFollowers((prev) => prev.filter((f) => f.id !== user.id));
        Alert.alert(t('common.success'), t('profile.unfollowSuccess', { defaultValue: 'You have unfollowed this user.' }));
      } else {
        await followUser(profile.id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        // Optionally add current user to followers list
        if (user.id) {
          // Get current user profile from AsyncStorage
          const currentUserProfileData = await AsyncStorage.getItem('userProfile');
          if (currentUserProfileData) {
            const currentUserProfile: UserProfile = JSON.parse(currentUserProfileData);
            const newFollower: FollowerInfo = {
              id: user.id,
              username: currentUserProfile.username || '',
              name: currentUserProfile.name || '',
              surname: currentUserProfile.surname || '',
              profile_photo: currentUserProfile.profile_photo || null,
              followed_at: new Date().toISOString(),
            };
            setFollowers((prev) => [newFollower, ...prev]);
          }
        }
        Alert.alert(t('common.success'), t('profile.followSuccess', { defaultValue: 'You are now following this user.' }));
      }
    } catch (error: any) {
      console.error('Follow toggle error:', error);
      Alert.alert(t('common.error'), error.message || t('profile.followError'));
    } finally {
      setFollowLoading(false);
    }
  };

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
          <View style={styles.avatarContainer}>
            <Image
              source={(profile.profile_photo || profile.photo) ? { uri: profile.profile_photo || profile.photo } : require('../assets/images/empty_profile_photo.png')}
              style={[styles.profileAvatar, { backgroundColor: themeColors.card }]}
            />
            {isOwnProfile && (
              <TouchableOpacity
                style={[styles.editPhotoButton, { backgroundColor: themeColors.primary }]}
                onPress={handlePhotoUpload}
                disabled={photoUploading}
              >
                {photoUploading ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Ionicons name="camera" size={16} color={themeColors.card} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
                <NotificationIconWithBadge size={28} style={{ marginRight: 16 }} />
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
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={() => setReportModalVisible(true)}
              style={{ marginLeft: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Report user"
            >
              <Ionicons name="flag-outline" size={28} color={themeColors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Badges Section */}
        <View style={[styles.badgesSection, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.badgesHeader}>
            <View style={styles.badgesHeaderLeft}>
              <Ionicons name="trophy" size={20} color={themeColors.primary} />
              <Text style={[styles.badgesTitle, { color: themeColors.text }]}>
                {t('profile.badges.title', { defaultValue: 'Badges' })}
              </Text>
              {earnedUserBadges.length > 0 && (
                <View style={[styles.badgeCountPill, { backgroundColor: themeColors.primary }]}>
                  <Text style={[styles.badgeCountText, { color: themeColors.card }]}>
                    {earnedUserBadges.length}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setBadgeModalVisible(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('profile.badges.viewAll', { defaultValue: 'View all badges' })}
            >
              <Text style={[styles.viewAllText, { color: themeColors.primary }]}>
                {t('profile.badges.viewAll', { defaultValue: 'View All' })}
              </Text>
            </TouchableOpacity>
          </View>
          
          {badgesLoading ? (
            <ActivityIndicator color={themeColors.primary} style={{ marginVertical: 16 }} />
          ) : earnedUserBadges.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScrollContent}
            >
              {earnedUserBadges.slice(0, 5).map((userBadge) => (
                <BadgeComponent
                  key={userBadge.id}
                  badge={userBadge}
                  isEarned={true}
                  size="medium"
                  onPress={() => {
                    setSelectedBadge(userBadge);
                    setBadgeDetailModalVisible(true);
                  }}
                />
              ))}
              {earnedUserBadges.length > 5 && (
                <TouchableOpacity
                  onPress={() => setBadgeModalVisible(true)}
                  style={[styles.moreBadgesButton, { backgroundColor: themeColors.background }]}
                >
                  <Text style={[styles.moreBadgesText, { color: themeColors.primary }]}>
                    +{earnedUserBadges.length - 5}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <Text style={[styles.noBadgesText, { color: themeColors.textMuted }]}>
              {t('profile.badges.noBadgesYet', { defaultValue: 'No badges earned yet' })}
            </Text>
          )}
        </View>

        {/* Follow button and follower/following counts */}
        <View style={styles.followSection}>
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing ? themeColors.card : themeColors.primary,
                  borderColor: themeColors.primary,
                  borderWidth: isFollowing ? 1 : 0,
                },
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel={isFollowing ? 'Unfollow user' : 'Follow user'}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? themeColors.primary : themeColors.card} />
              ) : (
                <Text
                  style={[
                    styles.followButtonText,
                    { color: isFollowing ? themeColors.primary : themeColors.card },
                  ]}
                >
                  {isFollowing ? t('profile.unfollow', { defaultValue: 'Unfollow' }) : t('profile.follow', { defaultValue: 'Follow' })}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => setFollowersModalVisible(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${followersCount} followers`}
            >
              <Text style={[styles.statCount, { color: themeColors.text }]}>{followersCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                {t('profile.followers', { defaultValue: 'Followers' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statButton}
              onPress={() => setFollowingModalVisible(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`${followingCount} following`}
            >
              <Text style={[styles.statCount, { color: themeColors.text }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>
                {t('profile.following', { defaultValue: 'Following' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.tabSelectorContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'volunteer' ? themeColors.primary : 'transparent' }]}
            onPress={() => setSelectedTab('volunteer')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Show volunteer tasks"
            accessibilityState={{ selected: selectedTab === 'volunteer' }}
          >
            <Text style={[styles.tabButtonText, { color: selectedTab === 'volunteer' ? themeColors.card : themeColors.primary, fontWeight: selectedTab === 'volunteer' ? 'bold' : 'normal' }]}>
              {isOwnProfile ? t('profile.myVolunteerTasks') : t('profile.volunteerTasks')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, { backgroundColor: selectedTab === 'requester' ? themeColors.primary : 'transparent' }]}
            onPress={() => setSelectedTab('requester')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Show created tasks"
            accessibilityState={{ selected: selectedTab === 'requester' }}
          >
            <Text style={[styles.tabButtonText, { color: selectedTab === 'requester' ? themeColors.card : themeColors.primary, fontWeight: selectedTab === 'requester' ? 'bold' : 'normal' }]}>
              {isOwnProfile ? t('profile.myCreatedTasks') : t('profile.createdTasks')}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'volunteer' && (
          <>
            {renderTaskSection(
              isOwnProfile ? t('profile.activeVolunteerTasksMy') : t('profile.activeVolunteerTasksOther'),
              activeVolunteerTasks,
              t('profile.noActiveVolunteerTasks'),
              '/v-request-details'
            )}
            {renderTaskSection(
              isOwnProfile ? t('profile.pastVolunteerTasksMy') : t('profile.pastVolunteerTasksOther'),
              pastVolunteerTasks,
              t('profile.noPastVolunteerTasks'),
              '/v-request-details'
            )}
          </>
        )}

        {selectedTab === 'requester' && (
          <>
            {renderTaskSection(
              isOwnProfile ? t('profile.activeRequesterTasksMy') : t('profile.activeRequesterTasksOther'),
              activeRequesterTasks,
              isOwnProfile ? t('profile.noActiveRequesterTasksMy') : t('profile.noActiveRequesterTasksOther'),
              '/r-request-details'
            )}
            {renderTaskSection(
              isOwnProfile ? t('profile.pastRequesterTasksMy') : t('profile.pastRequesterTasksOther'),
              pastRequesterTasks,
              isOwnProfile ? t('profile.noPastRequesterTasksMy') : t('profile.noPastRequesterTasksOther'),
              '/r-request-details'
            )}
          </>
        )}

        <View style={[styles.reviewsSectionContainer, { borderColor: themeColors.border }]}>
          <View style={styles.reviewsHeaderRow}>
            <Ionicons name="star-outline" size={20} color={themeColors.pink} />
            <Text style={[styles.reviewsHeaderText, { color: themeColors.text }]}>{t('profile.reviewsFor', { name: profile ? profile.name : t('profile.defaultUser') })}</Text>
          </View>
          {reviewsLoading && <ActivityIndicator color={themeColors.primary} style={{ marginVertical: 16 }} />}
          {reviewsError && <Text style={[styles.errorText, { color: themeColors.error }]}>{reviewsError}</Text>}
          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <Text style={[styles.emptyListText, { color: themeColors.textMuted, marginTop: 8, marginBottom: 16 }]}>{t('profile.noReviews')}</Text>
          )}
          {!reviewsLoading && !reviewsError && reviews.map((review) => {
            const reviewerPhotoUrl = review.reviewer.profile_photo || review.reviewer.photo;
            const avatarUrl = reviewerPhotoUrl
              ? (reviewerPhotoUrl.startsWith('http') ? reviewerPhotoUrl : `${BACKEND_BASE_URL}${reviewerPhotoUrl}`)
              : null;
            return (
              <ReviewCard
                key={review.id}
                reviewerName={`${review.reviewer.name} ${review.reviewer.surname}`}
                rating={review.score}
                comment={review.comment}
                timestamp={new Date(review.timestamp).toLocaleDateString()}
                avatarUrl={avatarUrl}
                is_volunteer_to_requester={review.is_volunteer_to_requester}
                is_requester_to_volunteer={review.is_requester_to_volunteer}
                accuracy_of_request={review.accuracy_of_request}
                communication_volunteer_to_requester={review.communication_volunteer_to_requester}
                safety_and_preparedness={review.safety_and_preparedness}
                reliability={review.reliability}
                task_completion={review.task_completion}
                communication_requester_to_volunteer={review.communication_requester_to_volunteer}
                safety_and_respect={review.safety_and_respect}
              />
            );
          })}
        </View>

        <FollowListModal
          visible={followersModalVisible}
          onClose={() => setFollowersModalVisible(false)}
          users={followers}
          title={t('profile.followers', { defaultValue: 'Followers' })}
        />

        <FollowListModal
          visible={followingModalVisible}
          onClose={() => setFollowingModalVisible(false)}
          users={following}
          title={t('profile.following', { defaultValue: 'Following' })}
        />

        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          onSubmit={handleReportUser}
          targetName={profile ? `${profile.name} ${profile.surname}` : 'User'}
          isUserReport={true}
        />

        <BadgeModal
          visible={badgeModalVisible}
          onClose={() => setBadgeModalVisible(false)}
          earnedUserBadges={earnedUserBadges}
          allBadges={allBadges}
          loading={badgesLoading}
        />

        <BadgeDetailModal
          visible={badgeDetailModalVisible}
          onClose={() => {
            setBadgeDetailModalVisible(false);
            setSelectedBadge(null);
          }}
          badge={selectedBadge}
        />
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
  avatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
  },
  followSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
  },
  badgesSection: {
    marginTop: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  badgeCountPill: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgesScrollContent: {
    paddingVertical: 4,
    gap: 12,
  },
  moreBadgesButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginLeft: 4,
  },
  moreBadgesText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noBadgesText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 8,
  },
}); 
