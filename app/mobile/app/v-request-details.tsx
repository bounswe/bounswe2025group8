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
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeProvider';
import { getTaskDetails, listVolunteers, type Task, type Volunteer, volunteerForTask, withdrawVolunteer, createReview, getTaskReviews, type Review, type UserProfile, getTaskPhotos, BACKEND_BASE_URL, type Photo, getTaskComments, createTaskComment, updateComment, deleteComment, submitReport, type Comment } from '../lib/api';
import { ReportModal } from '../components/ReportModal';
import { useAuth } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeTokens } from '../constants/Colors';
import CommentCard from '../components/ui/CommentCard';
import { useTranslation } from 'react-i18next';

export default function RequestDetailsVolunteer() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const { tokens: themeColors } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const id = params.id ? Number(params.id) : null;
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [accuracyOfRequest, setAccuracyOfRequest] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [safetyAndPreparedness, setSafetyAndPreparedness] = useState(0);
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
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
      setError(t('requestDetails.notFound'));
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

      const taskVolunteers = await listVolunteers({ task: id, limit: 100, volunteer_status: 'all' });

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
              AsyncStorage.removeItem(legacyStorageKey).catch(() => { });
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
            AsyncStorage.removeItem(legacyStorageKey).catch(() => { });
          }
        }
      } else {
        setHasVolunteered(false);
        setVolunteerRecord(null);
        if (storageKey) {
          AsyncStorage.removeItem(storageKey).catch(() => { });
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

      // Fetch comments for the task
      try {
        setCommentsLoading(true);
        const commentsResponse = await getTaskComments(id);
        if (commentsResponse.status === 'success') {
          setComments(commentsResponse.data.comments || []);
        }
      } catch (commentError: any) {
        console.warn('Error fetching comments:', commentError.message);
        setComments([]);
      } finally {
        setCommentsLoading(false);
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
          AsyncStorage.removeItem(legacyStorageKey).catch(() => { });
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

  const handleStarPress = (category: 'accuracyOfRequest' | 'communication' | 'safetyAndPreparedness', star: number) => {
    switch (category) {
      case 'accuracyOfRequest': setAccuracyOfRequest(star); break;
      case 'communication': setCommunication(star); break;
      case 'safetyAndPreparedness': setSafetyAndPreparedness(star); break;
    }
  };

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
      Alert.alert(t('common.error'), t('requestDetails.noParticipants'));
      return;
    }
    setCurrentReviewIndex(0);
    const currentParticipant = reviewableParticipants[0];

    // Check if review already exists for this participant
    const existingReview = getExistingReviewForParticipant(currentParticipant.id);

    if (existingReview) {
      setRating(existingReview.score);
      setAccuracyOfRequest(existingReview.accuracy_of_request || 0);
      setCommunication(existingReview.communication_volunteer_to_requester || 0);
      setSafetyAndPreparedness(existingReview.safety_and_preparedness || 0);
      setReviewText(existingReview.comment);
    } else {
      setRating(0);
      setAccuracyOfRequest(0);
      setCommunication(0);
      setSafetyAndPreparedness(0);
      setReviewText('');
    }
    setModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!accuracyOfRequest || !communication || !safetyAndPreparedness) {
      Alert.alert(t('requestDetails.ratingsRequired'), t('requestDetails.ratingsRequiredMsg'));
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert(t('requestDetails.reviewRequired'), t('requestDetails.reviewRequiredMsg'));
      return;
    }
    if (!id || !request || currentReviewIndex >= reviewableParticipants.length) {
      Alert.alert(t('common.error'), t('requestDetails.submitReviewError'));
      return;
    }

    const currentParticipant = reviewableParticipants[currentReviewIndex];
    setSubmittingReview(true);

    try {
      await createReview({
        comment: reviewText.trim(),
        reviewee_id: currentParticipant.id,
        task_id: id,
        accuracy_of_request: accuracyOfRequest,
        communication_volunteer_to_requester: communication,
        safety_and_preparedness: safetyAndPreparedness,
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
          setAccuracyOfRequest(nextReview.accuracy_of_request || 0);
          setCommunication(nextReview.communication_volunteer_to_requester || 0);
          setSafetyAndPreparedness(nextReview.safety_and_preparedness || 0);
          setReviewText(nextReview.comment);
        } else {
          setRating(0);
          setAccuracyOfRequest(0);
          setCommunication(0);
          setSafetyAndPreparedness(0);
          setReviewText('');
        }

        Alert.alert(t('common.success'), t('requestDetails.reviewSubmittedFor', { name: currentParticipant.name }));
      } else {
        // All participants reviewed
        Alert.alert(t('common.success'), t('requestDetails.allReviewsSubmitted'));
        setModalVisible(false);
        setRating(0);
        setAccuracyOfRequest(0);
        setCommunication(0);
        setSafetyAndPreparedness(0);
        setReviewText('');
        setCurrentReviewIndex(0);
        // Refresh task data to show updated reviews
        await fetchRequestDetails();
      }
    } catch (err: any) {
      const errorMessage = err?.message || t('requestDetails.submitReviewErrorMsg');
      Alert.alert(t('common.error'), errorMessage);
      console.error('Review submission error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBeVolunteer = async () => {
    if (!user) {
      Alert.alert(t('requestDetails.loginRequired'), t('requestDetails.loginRequiredMsg'), [
        { text: t('common.ok'), onPress: () => router.push('/signin') },
      ]);
      return;
    }
    if (!request) return;

    if (statusNormalized !== 'POSTED') {
      Alert.alert(t('requestDetails.requestClosed'), t('requestDetails.requestClosedMsg'));
      return;
    }

    setActionLoading(true);
    try {
      const response = await volunteerForTask(request.id);
      Alert.alert(t('common.success'), t('requestDetails.volunteerSuccess'));
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
            AsyncStorage.removeItem(legacyStorageKey).catch(() => { });
          }
        }
      }

      await fetchRequestDetails();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || t('requestDetails.volunteerError');
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        Alert.alert(t('requestDetails.sessionExpired'), t('requestDetails.sessionExpiredMsg'));
      } else if (errorMessage.toLowerCase().includes('not available')) {
        Alert.alert(t('requestDetails.requestClosed'), t('requestDetails.requestAssignedMsg'));
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!volunteerRecord?.id) {
      Alert.alert(t('requestDetails.withdrawError'), t('requestDetails.withdrawErrorMsg'));
      return;
    }

    setActionLoading(true);
    try {
      const response = await withdrawVolunteer(volunteerRecord.id);
      Alert.alert(t('common.success'), t('requestDetails.withdrawSuccess'));
      const updatedRecord = { id: volunteerRecord.id, status: 'WITHDRAWN' as const };
      setHasVolunteered(false);
      setVolunteerRecord(updatedRecord);
      volunteerRecordRef.current = updatedRecord;
      if (storageKey) {
        AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecord)).catch(() => { });
        if (legacyStorageKey) {
          AsyncStorage.removeItem(legacyStorageKey).catch(() => { });
        }
      }
      await fetchRequestDetails();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('requestDetails.withdrawFail'));
    } finally {
      setActionLoading(false);
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert(t('requestDetails.commentRequired'), t('requestDetails.commentRequiredMsg'));
      return;
    }

    if (!id || !user) {
      Alert.alert(t('common.error'), t('requestDetails.submitCommentError'));
      return;
    }

    setSubmittingComment(true);
    try {
      if (editingCommentId) {
        // Update existing comment
        const response = await updateComment(editingCommentId, commentText);

        // Update the comment in the list
        setComments((prev) =>
          prev.map((c) => (c.id === editingCommentId ? response.data : c))
        );

        // Clear editing state
        setEditingCommentId(null);
      } else {
        // Create new comment
        const response = await createTaskComment(id, commentText);

        // Add the new comment to the end of the list (oldest to newest order)
        setComments((prev) => [...prev, response.data]);

        // Scroll to bottom to show the new comment
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      // Clear the input
      setCommentText('');

      // Dismiss keyboard
      Keyboard.dismiss();
    } catch (err: any) {
      const errorMessage = err?.message || t('requestDetails.commentError', { action: editingCommentId ? 'update' : 'submit' });
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setCommentText(comment.content);
    setEditingCommentId(comment.id);
    // Scroll to bottom to show the input field
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCancelEdit = () => {
    setCommentText('');
    setEditingCommentId(null);
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      t('requestDetails.deleteCommentTitle'),
      t('requestDetails.deleteCommentMsg'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);

              // Remove the comment from the list
              setComments((prev) => prev.filter((c) => c.id !== commentId));

              // Clear editing state if deleting the comment being edited
              if (editingCommentId === commentId) {
                setCommentText('');
                setEditingCommentId(null);
              }
            } catch (err: any) {
              const errorMessage = err?.message || t('requestDetails.deleteCommentError');
              Alert.alert(t('common.error'), errorMessage);
            }
          },
        },
      ]
    );
  };



  const handleReportTask = async (reportType: string, description: string) => {
    if (!id) return;
    try {
      await submitReport(id, reportType, description);
      Alert.alert(t('common.success'), t('requestDetails.reportSuccess'));
      setReportModalVisible(false);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('requestDetails.reportError'));
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
        <Text style={{ color: themeColors.pink, textAlign: 'center', fontSize: 18 }}>{error || t('requestDetails.notFound')}</Text>
      </View>
    );
  }


  const urgencyLevelDisplay =
    request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const statusDisplay = request.status_display || request.status || '';
  const statusDisplayLower = statusDisplay.toLowerCase();
  const requesterName = request.creator?.name || t('requestDetails.unknown');
  const requestTitleForA11y = request.title || t('requestDetails.thisRequest');
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : '';
  const locationDisplay = request.location || t('requestDetails.na');
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
        return t('requestDetails.statusAssigned');
      }
      if (volunteerStatusLabel === 'rejected') {
        return t('requestDetails.statusRejected');
      }
      if (volunteerStatusLabel === 'withdrawn') {
        return t('requestDetails.statusWithdrawn');
      }
      if (volunteerStatusLabel === 'pending') {
        return t('requestDetails.statusPending');
      }
      return t('requestDetails.statusVolunteered');
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
          {request.category === 'Other' || request.category === 'OTHER' ? t('categories.OTHER') : (request.category_display || request.category)}
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
          {statusDisplayLower === 'past' ? statusDisplay : `${t('urgency.' + urgencyLevelDisplay.toLowerCase())} ${t('requestDetails.urgencySuffix')}`}
        </Text>
      </View>

      <View style={{ position: 'absolute', top: 56, right: 16, zIndex: 10 }}>
        {!isCreator && (
          <TouchableOpacity
            onPress={() => setReportModalVisible(true)}
            style={{
              backgroundColor: themeColors.card,
              padding: 8,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="flag-outline" size={20} color={themeColors.error} />
          </TouchableOpacity>
        )}
      </View>
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportTask}
        targetName={request?.title || 'Task'}
        isUserReport={false}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.container, { backgroundColor: themeColors.background, paddingBottom: user ? 100 : 40 }]}
      >
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
                          accessibilityLabel={t('requestDetails.additionalPhotoA11y', { index: index + 2, title: requestTitleForA11y })}
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
            accessibilityLabel={t('requestDetails.viewProfile', { name: requesterName })}
            accessibilityState={{ disabled: !request.creator?.id }}
          >
            {(() => {
              const photoUrl = request.creator?.profile_photo || request.creator?.photo;
              const absolutePhotoUrl = photoUrl
                ? (photoUrl.startsWith('http') ? photoUrl : `${BACKEND_BASE_URL}${photoUrl}`)
                : null;
              return (
                <Image
                  source={
                    absolutePhotoUrl
                      ? { uri: absolutePhotoUrl }
                      : require('../assets/images/empty_profile_photo.png')
                  }
                  style={[styles.avatar, { backgroundColor: themeColors.gray }]}
                  accessibilityRole="image"
                  accessibilityLabel={t('requestDetails.profilePhotoOf', { name: requesterName })}
                />
              );
            })()}

            <Text style={[styles.name, { color: themeColors.text }]}>{requesterName}</Text>
          </TouchableOpacity>
          <Text style={[styles.descriptionText, { color: themeColors.text }]}>{request.description}</Text>
          <View style={styles.infoContainer}>
            <DetailRow icon="time-outline" value={datetime} themeColors={themeColors} />
            <DetailRow icon="location-outline" value={locationDisplay} themeColors={themeColors} />
            <DetailRow
              icon="people-circle-outline"
              value={t('requestDetails.volunteersNeeded', { count: requiredPerson })}
              themeColors={themeColors}
            />
            {!isTaskOpen && (
              <DetailRow
                icon="remove-circle-outline"
                value={t('requestDetails.requestClosedMsg')}
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
            : t('requestDetails.status.' + statusDisplayLower, { defaultValue: statusDisplay })}
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
                  Alert.alert(t('requestDetails.loginRequired'), t('requestDetails.loginRequiredRate'), [
                    { text: t('common.ok'), onPress: () => router.push('/signin') },
                  ]);
                  return;
                }
                handleOpenReviewModal();
              }}
              accessible

              accessibilityRole="button"
              accessibilityLabel={t('requestDetails.rateAndReviewA11y')}
              testID="volunteer-review-button"
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>
                {hasReviewedAllParticipants()
                  ? t('requestDetails.editRateReview', { count: reviewableParticipants.length })
                  : t('requestDetails.rateReview', { count: reviewableParticipants.length })
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
              accessibilityLabel={t('requestDetails.volunteerA11y')}
              accessibilityState={{ disabled: actionLoading }}
              testID="volunteer-button"
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>{t('requestDetails.beVolunteer')}</Text>
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
            accessibilityLabel={t('requestDetails.withdrawA11y')}
            accessibilityState={{ disabled: actionLoading }}
            testID="volunteer-withdraw-button"
          >
            <Text style={[styles.buttonText, { color: themeColors.error }]}>{t('requestDetails.withdrawVolunteerRequest')}</Text>
          </TouchableOpacity>
        )}

        {request.creator?.id && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/profile', params: { userId: String(request.creator?.id) } })}
            accessible

            accessibilityRole="button"
            accessibilityLabel={t('requestDetails.viewRequesterProfileA11y')}
          >
            <Text style={[styles.buttonText, { color: themeColors.primary }]}>{t('requestDetails.viewRequesterProfile')}</Text>
          </TouchableOpacity>
        )}

        {/* Comments Section */}
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.comments')}</Text>
          {commentsLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 16 }} />
          ) : comments.length === 0 ? (
            <Text style={[styles.descriptionText, { color: themeColors.textMuted }]}>{t('requestDetails.noComments')}</Text>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                userName={`${comment.user.name} ${comment.user.surname}`}
                content={comment.content}
                timestamp={comment.timestamp}
                avatarUrl={comment.user.profile_photo || comment.user.photo}
                isOwnComment={comment.user.id === user?.id}
                onEdit={() => handleEditComment(comment)}
                onDelete={() => handleDeleteComment(comment.id)}
                userId={comment.user.id}
                onProfilePress={() => router.push({
                  pathname: '/profile',
                  params: { userId: comment.user.id }
                })}
                userRating={comment.user.rating}
                isRequester={comment.user.id === request?.creator?.id}
                completedTaskCount={comment.user.completed_task_count}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment Input Section - Fixed at Bottom */}
      {user && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[styles.commentInputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
            {editingCommentId && (
              <View style={[styles.editingBanner, { backgroundColor: themeColors.lightPurple }]}>
                <Text style={[styles.editingText, { color: themeColors.primary }]}>{t('requestDetails.editingComment')}</Text>
                <TouchableOpacity onPress={handleCancelEdit}>
                  <Ionicons name="close" size={20} color={themeColors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    backgroundColor: themeColors.background,
                  },
                ]}
                placeholder={t('requestDetails.addComment')}
                placeholderTextColor={themeColors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                editable={!submittingComment}
                accessibilityLabel={t('requestDetails.commentInputA11y')}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: submittingComment ? themeColors.border : themeColors.primary,
                  },
                ]}
                onPress={handleSubmitComment}
                disabled={submittingComment || !commentText.trim()}
                accessible
                accessibilityRole="button"
                accessibilityLabel={editingCommentId ? t('requestDetails.updateCommentA11y') : t('requestDetails.sendCommentA11y')}
                accessibilityState={{ disabled: submittingComment || !commentText.trim() }}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Ionicons name={editingCommentId ? "checkmark" : "send"} size={20} color={themeColors.card} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

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
                    ? t('requestDetails.editRateReviewParticipant', { name: currentParticipant?.name || t('requestDetails.participant') })
                    : t('requestDetails.rateReviewParticipant', { name: currentParticipant?.name || t('requestDetails.participant') });
                })()
                : t('requestDetails.rateAndReview')
              }
            </Text>
            {reviewableParticipants.length > 1 && (
              <Text style={[styles.modalSubtitle, { color: themeColors.textMuted }]}>
                {t('requestDetails.reviewProgress', { current: currentReviewIndex + 1, total: reviewableParticipants.length })}
              </Text>
            )}
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
              ]}
              placeholder={t('requestDetails.writeReview')}
              placeholderTextColor={themeColors.textMuted}
              multiline
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              value={reviewText}
              onChangeText={setReviewText}
              accessibilityLabel={t('requestDetails.reviewInputA11y')}
            />
            <View style={styles.starRow}>
              <Text style={[styles.categoryLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.accuracyOfRequest')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`acc-${star}`}
                    onPress={() => handleStarPress('accuracyOfRequest', star)}
                  >
                    <Ionicons
                      name={star <= accuracyOfRequest ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= accuracyOfRequest ? themeColors.pink : themeColors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.starRow}>
              <Text style={[styles.categoryLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.communication')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`comm-${star}`}
                    onPress={() => handleStarPress('communication', star)}
                  >
                    <Ionicons
                      name={star <= communication ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= communication ? themeColors.pink : themeColors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.starRow}>
              <Text style={[styles.categoryLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.safetyAndPreparedness')}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`safe-${star}`}
                    onPress={() => handleStarPress('safetyAndPreparedness', star)}
                  >
                    <Ionicons
                      name={star <= safetyAndPreparedness ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= safetyAndPreparedness ? themeColors.pink : themeColors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setRating(0);
                  setAccuracyOfRequest(0);
                  setCommunication(0);
                  setSafetyAndPreparedness(0);
                  setReviewText('');
                  setCurrentReviewIndex(0);
                }}
                disabled={submittingReview}
                accessible

                accessibilityRole="button"
                accessibilityLabel={t('requestDetails.cancelReviewA11y')}
                accessibilityState={{ disabled: submittingReview }}
              >
                <Text style={{ color: themeColors.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.pink }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
                accessible

                accessibilityRole="button"
                accessibilityLabel={currentReviewIndex < reviewableParticipants.length - 1 ? t('requestDetails.nextParticipantA11y') : t('requestDetails.submitReviewA11y')}
                accessibilityState={{ disabled: submittingReview }}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Text style={{ color: themeColors.card }}>
                    {currentReviewIndex < reviewableParticipants.length - 1 ? t('common.next') : t('requestDetails.submit')}
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
  commentInputContainer: {
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
