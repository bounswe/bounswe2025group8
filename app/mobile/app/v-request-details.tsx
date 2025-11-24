import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTaskDetails, listVolunteers, type Task, type Volunteer, volunteerForTask, withdrawVolunteer, createReview, getTaskReviews, type Review, type UserProfile, getTaskPhotos, BACKEND_BASE_URL, type Photo } from '../lib/api';
import { useAuth } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeTokens } from '../constants/Colors';

export default function RequestDetailsVolunteer() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;
  const router = useRouter();
  const { user } = useAuth();

  const id = params.id ? Number(params.id) : null;
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [acceptedVolunteers, setAcceptedVolunteers] = useState<Volunteer[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewableParticipants, setReviewableParticipants] = useState<UserProfile[]>([]);
  const [hasVolunteered, setHasVolunteered] = useState(false);
  const [volunteerRecord, setVolunteerRecord] = useState<{ id: number; status?: string } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const storageKey = id && user?.id ? `volunteer-record-${id}-${user.id}` : null;
  const legacyStorageKey = id ? `volunteer-record-${id}` : null;
  const volunteerRecordRef = useRef<{ id: number; status?: string } | null>(null);

  useEffect(() => {
    volunteerRecordRef.current = volunteerRecord;
  }, [volunteerRecord]);

  const normalizeStatus = (status?: string | null) => (status || '').toUpperCase();
  const isActiveVolunteerStatus = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    return normalized === 'PENDING' || normalized === 'ACCEPTED';
  };

  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const baseKey = type === 'Past' ? 'statusPast' : `status${capitalizedType}`;
    const key = `${baseKey}${property}` as keyof typeof themeColors;

    return (
      themeColors[key] ||
      (property === 'Text'
        ? themeColors.text
        : property === 'Background'
        ? 'transparent'
        : themeColors.border)
    );
  };

  const fetchRequestDetails = useCallback(async () => {
    if (!id) {
      setError('Request not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const details = await getTaskDetails(id);
      setRequest(details);

      const isCreatorView = user?.id && details.creator?.id === user.id;
      const currentRecord = volunteerRecordRef.current;

      const taskVolunteers = await listVolunteers( {task:id,limit: 100 });

      const volunteers = taskVolunteers.filter((vol) => {
        const taskField = typeof (vol as any).task === 'number' ? (vol as any).task : (vol.task as any)?.id;
        return taskField === id;
      });

      const acceptedList = volunteers.filter((vol) => (vol.status || '').toUpperCase() === 'ACCEPTED');
      const pendingList = volunteers.filter((vol) => (vol.status || '').toUpperCase() === 'PENDING');
      setAcceptedVolunteers(acceptedList);

      const volunteerForUser = user
        ? volunteers.find((vol) => vol.user?.id === user.id)
        : null;

      const assignedToCurrentUser = user?.id && acceptedList.some((vol) => vol.user?.id === user.id);
      if (assignedToCurrentUser) {
        setHasVolunteered(true);
        setVolunteerRecord((prev) => {
          const base = prev ?? volunteerForUser ?? currentRecord ?? null;
          if (!base) {
            return volunteerForUser ?? prev;
          }
          const updated = { ...base, status: 'ACCEPTED' };
          if (storageKey && updated.id) {
            AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((storageError) => {
              console.warn('Failed to persist volunteer state:', storageError);
            });
            if (legacyStorageKey) {
              AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
            }
          }
          return updated;
        });
      } else if (volunteerForUser) {
        const normalizedStatus = normalizeStatus(volunteerForUser.status);
        setVolunteerRecord(volunteerForUser);
        const isActive = isActiveVolunteerStatus(normalizedStatus);
        setHasVolunteered(isActive);
        volunteerRecordRef.current = volunteerForUser;
        if (storageKey) {
          AsyncStorage.setItem(storageKey, JSON.stringify(volunteerForUser)).catch((storageError) => {
            console.warn('Failed to persist volunteer state:', storageError);
          });
          if (legacyStorageKey) {
            AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
          }
        }
      } else {
        setHasVolunteered(false);
        setVolunteerRecord(null);
        if (storageKey) {
          AsyncStorage.removeItem(storageKey).catch(() => {});
        }
      }

      // Fetch reviews if task is completed and user is an assigned volunteer
      if (details.status === 'COMPLETED' && user?.id && assignedToCurrentUser) {
        try {
          const reviewsResponse = await getTaskReviews(id);
          if (reviewsResponse.status === 'success') {
            setExistingReviews(reviewsResponse.data.reviews || []);
          }
          
          // Build list of reviewable participants (creator + other volunteers, excluding self)
          const participants: UserProfile[] = [];
          if (details.creator && details.creator.id !== user.id) {
            participants.push(details.creator);
          }
          // Add other volunteers (excluding self)
          acceptedList.forEach((vol) => {
            if (vol.user?.id && vol.user.id !== user.id && !participants.find(p => p.id === vol.user.id)) {
              participants.push(vol.user);
            }
          });
          setReviewableParticipants(participants);
        } catch (reviewError: any) {
          console.warn('Error fetching reviews:', reviewError.message);
          setExistingReviews([]);
          setReviewableParticipants([]);
        }
      } else {
        setExistingReviews([]);
        setReviewableParticipants([]);
      }

      // Fetch photos for the task
      try {
        setPhotosLoading(true);
        const photosResponse = await getTaskPhotos(id);
        if (photosResponse.status === 'success') {
          setPhotos(photosResponse.data.photos || []);
        }
      } catch (photoError: any) {
        console.warn('Error fetching photos:', photoError.message);
        setPhotos([]);
      } finally {
        setPhotosLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load request.';
      setError(message);
      setAcceptedVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, storageKey]);

useEffect(() => {
  fetchRequestDetails();
}, [fetchRequestDetails]);

useFocusEffect(
  useCallback(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails])
);

useEffect(() => {
  let isMounted = true;
  const hydrateVolunteerState = async () => {
    if (!storageKey) {
      if (isMounted) {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
      if (legacyStorageKey) {
        AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
      }
      return;
    }
    try {
      let value = await AsyncStorage.getItem(storageKey);
      if (!value && legacyStorageKey) {
        value = await AsyncStorage.getItem(legacyStorageKey);
        if (value) {
          await AsyncStorage.setItem(storageKey, value);
          await AsyncStorage.removeItem(legacyStorageKey);
        }
      }
      if (!isMounted) {
        return;
      }
      if (value) {
        try {
          const parsed = JSON.parse(value);
          setVolunteerRecord(parsed);
          setHasVolunteered(isActiveVolunteerStatus(parsed.status));
        } catch (parseError) {
          console.warn('Failed to parse stored volunteer record:', parseError);
          setVolunteerRecord(null);
          setHasVolunteered(false);
        }
      } else {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
    } catch (storageError) {
      console.warn('Failed to read volunteer state from storage:', storageError);
      if (isMounted) {
        setVolunteerRecord(null);
        setHasVolunteered(false);
      }
    }
  };

  hydrateVolunteerState();

  return () => {
    isMounted = false;
  };
}, [storageKey]);

  const handleStarPress = (star: number) => setRating(star);

  const getExistingReviewForParticipant = (participantId: number): Review | undefined => {
    if (!user?.id) return undefined;
    return existingReviews.find(
      (review) => review.reviewee.id === participantId && review.reviewer.id === user.id
    );
  };

  const hasReviewedAllParticipants = (): boolean => {
    if (reviewableParticipants.length === 0) return false;
    return reviewableParticipants.every((participant) => 
      existingReviews.some((review) => 
        review.reviewee.id === participant.id && review.reviewer.id === user?.id
      )
    );
  };

  const handleOpenReviewModal = () => {
    if (reviewableParticipants.length === 0) {
      Alert.alert('No Participants', 'There are no participants to review.');
      return;
    }
    setCurrentReviewIndex(0);
    const currentParticipant = reviewableParticipants[0];
    
    // Check if review already exists for this participant
    const existingReview = getExistingReviewForParticipant(currentParticipant.id);
    
    if (existingReview) {
      setRating(existingReview.score);
      setReviewText(existingReview.comment);
    } else {
      setRating(0);
      setReviewText('');
    }
    setModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Rating Required', 'Please select a rating from 1 to 5 stars.');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please write a review comment.');
      return;
    }
    if (!id || !request || currentReviewIndex >= reviewableParticipants.length) {
      Alert.alert('Error', 'Unable to submit review. Missing information.');
      return;
    }

    const currentParticipant = reviewableParticipants[currentReviewIndex];
    setSubmittingReview(true);

    try {
      await createReview({
        score: Number(rating), // Ensure it's a number
        comment: reviewText.trim(),
        reviewee_id: currentParticipant.id,
        task_id: id,
      });

      // Refresh reviews to get updated list
      let updatedReviews = existingReviews;
      try {
        const reviewsResponse = await getTaskReviews(id);
        if (reviewsResponse.status === 'success') {
          updatedReviews = reviewsResponse.data.reviews || [];
          setExistingReviews(updatedReviews);
        }
      } catch (reviewError) {
        console.warn('Error refreshing reviews:', reviewError);
      }

      // Move to next participant or close modal
      if (currentReviewIndex < reviewableParticipants.length - 1) {
        // Move to next participant
        const nextIndex = currentReviewIndex + 1;
        setCurrentReviewIndex(nextIndex);
        const nextParticipant = reviewableParticipants[nextIndex];
        
        // Load existing review for next participant if it exists
        const nextReview = updatedReviews.find(
          (review) => review.reviewee.id === nextParticipant.id && review.reviewer.id === user?.id
        );
        
        if (nextReview) {
          setRating(nextReview.score);
          setReviewText(nextReview.comment);
        } else {
          setRating(0);
          setReviewText('');
        }
        
        Alert.alert('Success', `Review submitted for ${currentParticipant.name}!`);
      } else {
        // All participants reviewed
        Alert.alert('Success', 'All reviews submitted successfully!');
        setModalVisible(false);
        setRating(0);
        setReviewText('');
        setCurrentReviewIndex(0);
        // Refresh task data to show updated reviews
        await fetchRequestDetails();
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to submit review. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Review submission error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBeVolunteer = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to volunteer for tasks.', [
        { text: 'OK', onPress: () => router.push('/signin') },
      ]);
      return;
    }
    if (!request) return;

    if (statusNormalized !== 'POSTED') {
      Alert.alert('Request Closed', 'This request is not accepting new volunteers right now.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await volunteerForTask(request.id);
      Alert.alert('Success', response.message || 'You have successfully volunteered for this task!');
      setHasVolunteered(true);

      const recordPayload = (response as any)?.data ?? response.data;
      if (recordPayload && recordPayload.id) {
        const normalizedStatus = typeof recordPayload.status === 'string' ? recordPayload.status.toUpperCase() : 'PENDING';
        const newRecord = { id: recordPayload.id, status: normalizedStatus };
        setVolunteerRecord(newRecord);
        volunteerRecordRef.current = newRecord;
        if (storageKey) {
          AsyncStorage.setItem(storageKey, JSON.stringify(newRecord)).catch((storageError) => {
            console.warn('Failed to persist volunteer state:', storageError);
          });
          if (legacyStorageKey) {
            AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
          }
        }
      }

      await fetchRequestDetails();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Could not volunteer for the task. Please try again.';
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        Alert.alert('Session expired', 'Please sign in again to continue.');
      } else if (errorMessage.toLowerCase().includes('not available')) {
        Alert.alert('Request Closed', 'This request is currently assigned. The creator must reopen it to accept new volunteers.');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!volunteerRecord?.id) {
      Alert.alert('Unable to withdraw', 'Could not determine your volunteer application.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await withdrawVolunteer(volunteerRecord.id);
      Alert.alert('Success', response.message || 'Volunteer request withdrawn successfully.');
      const updatedRecord = { id: volunteerRecord.id, status: 'WITHDRAWN' as const };
      setHasVolunteered(false);
      setVolunteerRecord(updatedRecord);
      volunteerRecordRef.current = updatedRecord;
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecord)).catch(() => {});
        if (legacyStorageKey) {
          AsyncStorage.removeItem(legacyStorageKey).catch(() => {});
        }
      }
      await fetchRequestDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not withdraw volunteer request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={themeColors.primary}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}
      />
    );
  }
  if (error || !request) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text style={{ color: themeColors.pink, textAlign: 'center', fontSize: 18 }}>{error || 'Request not found.'}</Text>
      </View>
    );
  }


  const urgencyLevelDisplay =
    request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const statusDisplay = request.status_display || request.status || '';
  const statusDisplayLower = statusDisplay.toLowerCase();
  const requesterName = request.creator?.name || 'Unknown';
  const requestTitleForA11y = request.title || 'this request';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70';
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : '';
  const locationDisplay = request.location || 'N/A';
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || '';
  const isCreatorView = user?.id === request.creator?.id;

  const isCreator = user && request.creator && user.id === request.creator.id;
  const acceptedIds = acceptedVolunteers
    .map((vol) => vol.user?.id)
    .filter((id): id is number => typeof id === 'number');
  const volunteerStatusLabel = normalizeStatus(volunteerRecord?.status).toLowerCase() || (hasVolunteered ? 'pending' : undefined);
  const userAssigned = user && (request.assignee?.id === user?.id);
  const isAssignedVolunteer = user && acceptedIds.includes(user.id);
  const isAlreadyVolunteered =
    hasVolunteered || userAssigned || (!!user && acceptedIds.includes(user.id));
  const acceptedCount = acceptedVolunteers.length;
  const hasCapacity = acceptedCount < request.volunteer_number;
  const statusNormalized = normalizeStatus(request.status);
  const isTaskOpen = statusNormalized === 'POSTED';
  const canVolunteer = !isCreator && isTaskOpen && !isAlreadyVolunteered && hasCapacity;


  const volunteerStatusMessage = !isCreatorView && (userAssigned || ['pending', 'accepted', 'rejected', 'withdrawn'].includes(volunteerStatusLabel ?? ''))
    ? (() => {
        if (userAssigned || volunteerStatusLabel === 'accepted') {
          console.log("userAssigned", userAssigned);
          console.log("volunteerStatusLabel", volunteerStatusLabel);
          console.log(request);
          console.log(user);
          return 'You have been assigned to this request.';
        }
        if (volunteerStatusLabel === 'rejected') {
          return 'Your volunteer request was declined.';
        }
        if (volunteerStatusLabel === 'withdrawn') {
          return 'You withdrew your volunteer request. Contact the requester if you wish to volunteer again.';
        }
        if (volunteerStatusLabel === 'pending') {
          return 'Your volunteer request is pending approval.';
        }
        return 'You have volunteered for this request.';
      })()
    : null;

  const showWithdrawButton =
    !isCreator &&
    volunteerRecord?.id &&
    isTaskOpen &&
    volunteerStatusLabel === 'pending';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View
        style={[
          styles.header,
          { backgroundColor: themeColors.card, borderBottomColor: themeColors.border, borderBottomWidth: 1 },
        ]}
      >
        <View style={styles.titleContainer}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/feed');
              }
            }}
            style={styles.backButton}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeColors.text}
              accessible={false}
              importantForAccessibility="no"
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>{request.title}</Text>
        </View>
        <Text style={[styles.categoryLabel, { color: themeColors.primary, backgroundColor: themeColors.lightPurple }]}>
          {request.category_display || request.category}
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: getLabelColors(urgencyLevelDisplay, 'Text'),
              backgroundColor: getLabelColors(urgencyLevelDisplay, 'Background'),
              borderColor: getLabelColors(urgencyLevelDisplay, 'Border'),
              borderWidth: 1,
            },
          ]}
        >
          {statusDisplayLower === 'past' ? statusDisplay : `${urgencyLevelDisplay} Urgency`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Show first photo as hero image if available */}
        {photos.length > 0 && !photosLoading && (
          <>
            {(() => {
              const firstPhoto = photos[0];
              const photoUrl = firstPhoto.photo_url || firstPhoto.url || firstPhoto.image || '';
              const absoluteUrl = photoUrl.startsWith('http') 
                ? photoUrl 
                : `${BACKEND_BASE_URL}${photoUrl}`;
              return (
                <Image
                  source={{ uri: absoluteUrl }}
                  style={styles.heroImage}
                  resizeMode="cover"
                  accessibilityRole="image"
                  accessibilityLabel={`Primary photo for ${requestTitleForA11y}`}
                />
              );
            })()}
            
            {/* Show remaining photos as thumbnails if there are more */}
            {photos.length > 1 && (
              <View style={[styles.thumbnailsContainer, { backgroundColor: themeColors.lightGray }]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailsScrollContent}
                >
                  {photos.slice(1).map((photo, index) => {
                    const photoUrl = photo.photo_url || photo.url || photo.image || '';
                    const absoluteUrl = photoUrl.startsWith('http') 
                      ? photoUrl 
                      : `${BACKEND_BASE_URL}${photoUrl}`;
                    
                    return (
                      <View
                        key={photo.id}
                        style={[styles.smallThumbnail, { borderColor: themeColors.card }]}
                        accessible={false}
                        importantForAccessibility="no"
                      >
                        <Image
                          source={{ uri: absoluteUrl }}
                          style={styles.smallThumbnailImage}
                          resizeMode="cover"
                          accessibilityRole="image"
                          accessibilityLabel={`Additional photo ${index + 2} for ${requestTitleForA11y}`}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        )}
        
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}>
          <TouchableOpacity
            style={styles.avatarRow}
            onPress={() => {
              if (request.creator?.id) {
                router.push({ pathname: '/profile', params: { userId: String(request.creator.id) } });
              }
            }}
            disabled={!request.creator?.id}
            activeOpacity={request.creator?.id ? 0.8 : 1}
            accessible

            accessibilityRole="button"
            accessibilityLabel={`View ${requesterName}'s profile`}
            accessibilityState={{ disabled: !request.creator?.id }}
          >
            <Image
              source={{ uri: requesterAvatar }}
              style={[styles.avatar, { backgroundColor: themeColors.gray }]}
              accessibilityRole="image"
              accessibilityLabel={`Profile photo of ${requesterName}`}
            />
            <Text style={[styles.name, { color: themeColors.text }]}>{requesterName}</Text>
          </TouchableOpacity>
          <Text style={[styles.descriptionText, { color: themeColors.text }]}>{request.description}</Text>
          <View style={styles.infoContainer}>
            <DetailRow icon="time-outline" value={datetime} themeColors={themeColors} />
            <DetailRow icon="location-outline" value={locationDisplay} themeColors={themeColors} />
            <DetailRow
              icon="people-circle-outline"
              value={`Volunteers needed: ${requiredPerson}`}
              themeColors={themeColors}
            />
            {!isTaskOpen && (
              <DetailRow
                icon="remove-circle-outline"
                value="This request is not accepting new volunteers at the moment."
                themeColors={themeColors}
              />
            )}
            {volunteerStatusMessage && (
              <DetailRow
                icon="checkmark-circle-outline"
                value={volunteerStatusMessage}
                themeColors={themeColors}
              />
            )}
            {(statusDisplayLower === 'completed' ||
              isCreator ||
              userAssigned ||
              isAssignedVolunteer
            ) &&
              phoneNumber && (
                <DetailRow icon="call-outline" value={phoneNumber} themeColors={themeColors} />
              )}
          </View>
        </View>

        <Text
          style={[
            styles.statusText,
            {
              color:
                statusDisplayLower === 'past'
                  ? themeColors.statusPastText
                  : getLabelColors(statusDisplay, 'Text'),
            },
          ]}
        >
          {statusDisplayLower === 'past' && request.assignee
            ? `☆ ${(Number((request.assignee as any)?.rating) || 0).toFixed(1)}`
            : statusDisplay}
        </Text>

        {actionLoading ? (
          <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 16 }} />
        ) : (
          user &&
          !isCreator &&
          (statusDisplayLower === 'completed' ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.pink }]}
              onPress={() => {
                if (!user) {
                  Alert.alert('Login Required', 'Please sign in to rate/review.', [
                    { text: 'OK', onPress: () => router.push('/signin') },
                  ]);
                  return;
                }
                handleOpenReviewModal();
              }}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Rate and review participants"
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>
                {hasReviewedAllParticipants() 
                  ? `Edit Rate & Review ${reviewableParticipants.length === 1 ? 'Participant' : 'Participants'}`
                  : `Rate & Review ${reviewableParticipants.length === 1 ? 'Participant' : 'Participants'}`
                }
              </Text>
            </TouchableOpacity>
          ) : canVolunteer ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
              onPress={handleBeVolunteer}
              disabled={actionLoading}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Volunteer for this request"
              accessibilityState={{ disabled: actionLoading }}
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>Be a Volunteer</Text>
            </TouchableOpacity>
          ) : null)
        )}

        {showWithdrawButton && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.error }]}
            onPress={handleWithdraw}
            disabled={actionLoading}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Withdraw volunteer request"
            accessibilityState={{ disabled: actionLoading }}
          >
            <Text style={[styles.buttonText, { color: themeColors.error }]}>Withdraw Volunteer Request</Text>
          </TouchableOpacity>
        )}

        {request.creator?.id && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/profile', params: { userId: String(request.creator?.id) } })}
            accessible

            accessibilityRole="button"
            accessibilityLabel="View requester profile"
          >
            <Text style={[styles.buttonText, { color: themeColors.primary }]}>View Requester Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={[styles.modalOverlay, { backgroundColor: themeColors.overlay }]}
          accessibilityViewIsModal
          importantForAccessibility="yes"
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]} accessible>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {reviewableParticipants.length > 0 
                ? (() => {
                    const currentParticipant = reviewableParticipants[currentReviewIndex];
                    const existingReview = getExistingReviewForParticipant(currentParticipant?.id);
                    return existingReview 
                      ? `Edit Rate & Review ${currentParticipant?.name || 'Participant'}`
                      : `Rate & Review ${currentParticipant?.name || 'Participant'}`;
                  })()
                : 'Rate & Review'
              }
            </Text>
            {reviewableParticipants.length > 1 && (
              <Text style={[styles.modalSubtitle, { color: themeColors.textMuted }]}>
                {currentReviewIndex + 1} of {reviewableParticipants.length}
              </Text>
            )}
            <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
                ]}
              placeholder="Leave your review..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
              accessibilityLabel="Review input"
            />
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  accessible

                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
                  accessibilityState={{ selected: rating >= star }}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= rating ? themeColors.pink : themeColors.border}
                    accessible={false}
                    importantForAccessibility="no"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setRating(0);
                  setReviewText('');
                  setCurrentReviewIndex(0);
                }}
                disabled={submittingReview}
                accessible

                accessibilityRole="button"
                accessibilityLabel="Cancel review"
                accessibilityState={{ disabled: submittingReview }}
              >
                <Text style={{ color: themeColors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.pink }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
                accessible

                accessibilityRole="button"
                accessibilityLabel={currentReviewIndex < reviewableParticipants.length - 1 ? 'Next participant' : 'Submit review'}
                accessibilityState={{ disabled: submittingReview }}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Text style={{ color: themeColors.card }}>
                    {currentReviewIndex < reviewableParticipants.length - 1 ? 'Next' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  value,
  themeColors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  themeColors: ThemeTokens;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={25}
        color={themeColors.textMuted}
        style={styles.icon}
        accessible={false}
        importantForAccessibility="no"
      />
      <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoryLabel: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  label: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoGallery: {
    marginTop: 8,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  thumbnailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnailsScrollContent: {
    paddingRight: 16,
  },
  smallThumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  smallThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
