import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Switch,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTaskDetails, getTaskApplicants, completeTask, cancelTask, createReview, getTaskReviews, getTaskPhotos, BACKEND_BASE_URL, updateTask, getTaskComments, createTaskComment, updateComment, deleteComment, type Task, type Volunteer, type Review, type Photo, type UpdateTaskPayload, type Comment } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAppTheme } from '../theme/ThemeProvider';
import type { ThemeTokens } from '../constants/Colors';
import { CategoryPicker } from '../components/forms/CategoryPicker';
import { DeadlinePicker } from '../components/forms/DeadlinePicker';
import { AddressFields } from '../components/forms/AddressFields';
import { AddressFieldsValue, emptyAddress, parseAddressString, formatAddress } from '../utils/address';
import { useTranslation } from 'react-i18next';
import CommentCard from '../components/ui/CommentCard';

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const { tokens: themeColors } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const id = params.id ? Number(params.id) : null;

  const [request, setRequest] = useState<Task | null>(null);
  const [assignedVolunteers, setAssignedVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigneesLoading, setAssigneesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState(false);
  const [cancellingTask, setCancellingTask] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rating, setRating] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [taskCompletion, setTaskCompletion] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [safetyAndRespect, setSafetyAndRespect] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [currentVolunteerIndex, setCurrentVolunteerIndex] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editForm, setEditForm] = useState<UpdateTaskPayload>({});
  const [updatingRequest, setUpdatingRequest] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [addressFields, setAddressFields] = useState<AddressFieldsValue>(emptyAddress);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const currentStatusDisplay = request?.status_display || request?.status || 'Generic';
    const keyBase = statusDisplayToKey(currentStatusDisplay);
    const key = `${keyBase}${capitalizedType}${property}` as keyof typeof themeColors;

    let colorKey: keyof typeof themeColors;
    if (type === 'High' || type === 'Medium' || type === 'Low') {
      colorKey = `urgency${capitalizedType}${property}` as keyof typeof themeColors;
    } else {
      colorKey = `status${capitalizedType}${property}` as keyof typeof themeColors;
    }

    return (
      themeColors[colorKey] ||
      (property === 'Text'
        ? themeColors.text
        : property === 'Background'
          ? themeColors.labelDefaultBackground
          : themeColors.labelDefaultBorder || themeColors.border)
    );
  };

  const statusDisplayToKey = (statusDisplayName: string) => {
    return statusDisplayName.replace(/\s+/g, '');
  };

  const fetchTaskData = useCallback(async () => {
    if (!id) {
      setError('Request ID not provided.');
      setLoading(false);
      setAssigneesLoading(false);
      return;
    }
    setLoading(true);
    setAssigneesLoading(true);
    setError(null);

    try {
      const taskDetails = await getTaskDetails(id);
      setRequest(taskDetails);
      try {
        const applicantsResponse = await getTaskApplicants(id, 'ACCEPTED');
        if (applicantsResponse.status === 'success') {
          setAssignedVolunteers(applicantsResponse.data.volunteers || []);
        } else {
          setAssignedVolunteers([]);
        }
      } catch (assigneeError: any) {
        console.warn('Error fetching assigned volunteers:', assigneeError.message);
        setAssignedVolunteers([]);
      } finally {
        setAssigneesLoading(false);
      }

      // Fetch reviews if task is completed and user is creator
      if (taskDetails.status === 'COMPLETED' && user?.id === taskDetails.creator?.id) {
        try {
          setReviewsLoading(true);
          const reviewsResponse = await getTaskReviews(id);
          if (reviewsResponse.status === 'success') {
            setExistingReviews(reviewsResponse.data.reviews || []);
          }
        } catch (reviewError: any) {
          console.warn('Error fetching reviews:', reviewError.message);
          setExistingReviews([]);
        } finally {
          setReviewsLoading(false);
        }
      } else {
        setExistingReviews([]);
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
    } catch (err: any) {
      setError(err.message || t('requestDetails.loadError'));
      setRequest(null);
      setAssignedVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchTaskData();
    }
  }, [id, fetchTaskData]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchTaskData();
      }
    }, [id, fetchTaskData])
  );

  const handleStarPress = (category: 'reliability' | 'taskCompletion' | 'communication' | 'safetyAndRespect', star: number) => {
    switch (category) {
      case 'reliability': setReliability(star); break;
      case 'taskCompletion': setTaskCompletion(star); break;
      case 'communication': setCommunication(star); break;
      case 'safetyAndRespect': setSafetyAndRespect(star); break;
    }
  };

  const handleOpenReviewModal = () => {
    if (assignedVolunteers.length === 0) {
      Alert.alert(t('requestDetails.noVolunteersTitle'), t('requestDetails.noVolunteersMessage'));
      return;
    }
    setCurrentVolunteerIndex(0);
    const currentVolunteer = assignedVolunteers[0];

    // Check if review already exists for this volunteer
    const existingReview = existingReviews.find(
      (review) => review.reviewee.id === currentVolunteer.user.id && review.reviewer.id === user?.id
    );

    if (existingReview) {
      setRating(existingReview.score);
      setReliability(existingReview.reliability || 0);
      setTaskCompletion(existingReview.task_completion || 0);
      setCommunication(existingReview.communication_requester_to_volunteer || 0);
      setSafetyAndRespect(existingReview.safety_and_respect || 0);
      setReviewText(existingReview.comment);
    } else {
      setRating(0);
      setReliability(0);
      setTaskCompletion(0);
      setCommunication(0);
      setSafetyAndRespect(0);
      setReviewText('');
    }

    setModalVisible(true);
    setIsEdit(false);
  };

  const getExistingReviewForVolunteer = (volunteerId: number): Review | undefined => {
    return existingReviews.find(
      (review) => review.reviewee.id === volunteerId && review.reviewer.id === user?.id
    );
  };

  const hasReviewedAllVolunteers = (): boolean => {
    if (assignedVolunteers.length === 0) return false;
    return assignedVolunteers.every((volunteer) =>
      existingReviews.some((review) =>
        review.reviewee.id === volunteer.user.id && review.reviewer.id === user?.id
      )
    );
  };

  const openEditModal = () => {
    if (!request) {
      return;
    }
    const initialDeadline = request.deadline ? new Date(request.deadline) : null;
    setEditForm({
      title: request.title,
      description: request.description,
      category: request.category,
      location: request.location,
      deadline: request.deadline,
      requirements: request.requirements,
      urgency_level: request.urgency_level,
      volunteer_number: request.volunteer_number,
      is_recurring: request.is_recurring,
    });
    setDeadlineDate(initialDeadline);
    setIsEdit(true);
    setModalVisible(true);
    setRating(0);
    setReliability(0);
    setTaskCompletion(0);
    setCommunication(0);
    setSafetyAndRespect(0);
    setReviewText('');
    setAddressFields(parseAddressString(request.location));
  };

  const handleEditInputChange = <K extends keyof UpdateTaskPayload>(field: K, value: UpdateTaskPayload[K]) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeadlineChange = (date: Date) => {
    setDeadlineDate(date);
    handleEditInputChange('deadline', date.toISOString());
  };

  const handleSubmitReview = async () => {
    if (!reliability || !taskCompletion || !communication || !safetyAndRespect) {
      Alert.alert(t('requestDetails.ratingsRequiredTitle'), t('requestDetails.ratingsRequiredMessage'));
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert(t('requestDetails.reviewRequiredTitle'), t('requestDetails.reviewRequiredMessage'));
      return;
    }
    if (!id || !request || currentVolunteerIndex >= assignedVolunteers.length) {
      return;
    }

    const currentVolunteer = assignedVolunteers[currentVolunteerIndex];
    setSubmittingReview(true);

    try {
      await createReview({
        comment: reviewText.trim(),
        reviewee_id: currentVolunteer.user.id,
        task_id: id,
        reliability,
        task_completion: taskCompletion,
        communication_requester_to_volunteer: communication,
        safety_and_respect: safetyAndRespect,
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

      // Move to next volunteer or close modal
      if (currentVolunteerIndex < assignedVolunteers.length - 1) {
        // Move to next volunteer
        const nextIndex = currentVolunteerIndex + 1;
        setCurrentVolunteerIndex(nextIndex);
        const nextVolunteer = assignedVolunteers[nextIndex];

        // Load existing review for next volunteer if it exists
        const nextReview = updatedReviews.find(
          (review) => review.reviewee.id === nextVolunteer.user.id && review.reviewer.id === user?.id
        );

        if (nextReview) {
          setRating(nextReview.score);
          setReliability(nextReview.reliability || 0);
          setTaskCompletion(nextReview.task_completion || 0);
          setCommunication(nextReview.communication_requester_to_volunteer || 0);
          setSafetyAndRespect(nextReview.safety_and_respect || 0);
          setReviewText(nextReview.comment);
        } else {
          setRating(0);
          setReliability(0);
          setTaskCompletion(0);
          setCommunication(0);
          setSafetyAndRespect(0);
          setReviewText('');
        }

        Alert.alert(t('common.success'), t('requestDetails.reviewSubmitted', { name: currentVolunteer.user.name }));
      } else {
        // All volunteers reviewed
        Alert.alert(t('common.success'), t('requestDetails.allReviewsSubmitted'));
        setModalVisible(false);
        setRating(0);
        setReliability(0);
        setTaskCompletion(0);
        setCommunication(0);
        setSafetyAndRespect(0);
        setReviewText('');
        setCurrentVolunteerIndex(0);
        // Refresh task data to show updated reviews
        await fetchTaskData();
      }
    } catch (err: any) {
      const errorMessage = err?.message || t('requestDetails.reviewError');
      Alert.alert(t('common.error'), errorMessage);
      console.error('Review submission error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!id || !request) {
      return;
    }

    if (!editForm.title?.trim()) {
      Alert.alert(t('requestDetails.validationError'), t('requestDetails.titleRequired'));
      return;
    }

    if (editForm.volunteer_number !== undefined && editForm.volunteer_number <= 0) {
      Alert.alert(t('requestDetails.validationError'), t('requestDetails.volunteerNumberError'));
      return;
    }

    if (!editForm.category) {
      Alert.alert(t('requestDetails.validationError'), t('requestDetails.categoryRequired'));
      return;
    }

    if (!addressFields.city.trim() || !addressFields.state.trim()) {
      Alert.alert(t('requestDetails.validationError'), t('requestDetails.addressRequired'));
      return;
    }

    setUpdatingRequest(true);
    try {
      const composedLocation = formatAddress(addressFields);
      const payload: UpdateTaskPayload = {
        ...editForm,
        title: editForm.title?.trim(),
        description: editForm.description?.trim(),
        location: composedLocation || editForm.location?.trim(),
        requirements: editForm.requirements?.trim(),
        deadline: deadlineDate ? deadlineDate.toISOString() : editForm.deadline,
      };

      const updatedTask = await updateTask(id, payload);
      setRequest(updatedTask);
      Alert.alert(t('common.success'), t('requestDetails.updateSuccess'));
      setModalVisible(false);
      setIsEdit(false);
      setEditForm({});
      await fetchTaskData();
    } catch (err: any) {
      const errorMessage = err?.message || t('requestDetails.updateError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setUpdatingRequest(false);
    }
  };

  const handleCloseReviewModal = () => {
    setModalVisible(false);
    setRating(0);
    setReliability(0);
    setTaskCompletion(0);
    setCommunication(0);
    setSafetyAndRespect(0);
    setReviewText('');
    setCurrentVolunteerIndex(0);
  };

  const handleCloseModal = () => {
    if (isEdit) {
      setModalVisible(false);
      setIsEdit(false);
      setEditForm({});
      setDeadlineDate(null);
      setAddressFields(emptyAddress);
      return;
    }
    handleCloseReviewModal();
  };

  const handleMarkAsComplete = () => {
    Alert.alert(
      t('requestDetails.markCompleteTitle'),
      t('requestDetails.markCompleteMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('requestDetails.markAsComplete'),
          style: 'destructive',
          onPress: async () => {
            if (!id || !request) return;

            setCompletingTask(true);
            try {
              const response = await completeTask(id);
              Alert.alert(t('common.success'), response.message || t('requestDetails.markCompleteSuccess'));

              // Refresh task data to get updated status
              await fetchTaskData();
            } catch (err: any) {
              const errorMessage = err?.message || t('requestDetails.markCompleteError');
              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setCompletingTask(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteRequest = () => {
    Alert.alert(
      t('requestDetails.deleteRequestTitle'),
      t('requestDetails.deleteRequestMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!id || !request) return;

            setCancellingTask(true);
            try {
              const response = await cancelTask(id);
              Alert.alert(t('common.success'), response.message || t('requestDetails.deleteRequestSuccess'));

              // Navigate back to feed
              router.back();
            } catch (err: any) {
              const errorMessage = err?.message || t('requestDetails.deleteRequestError');
              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setCancellingTask(false);
            }
          },
        },
      ]
    );
  };

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert(t('requestDetails.commentRequiredTitle'), t('requestDetails.commentRequiredMessage'));
      return;
    }

    if (!id || !user) {
      Alert.alert(t('common.error'), t('requestDetails.signInRequired'));
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
      t('requestDetails.deleteCommentMessage'),
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
              const errorMessage = err?.message || t('requestDetails.commentError', { action: 'delete' });
              Alert.alert(t('common.error'), errorMessage);
            }
          },
        },
      ]
    );
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
        <Text style={{ color: themeColors.error, textAlign: 'center', fontSize: 18 }}>
          {error || t('requestDetails.loadError')}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 10, padding: 10 }}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={{ color: themeColors.primary }}>{t('requestDetails.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = request.title;
  const categoryDisplay = request.category_display || request.category || t('requestDetails.unknown');
  const urgencyLevel = request.urgency_level === 3 ? t('common.high') : request.urgency_level === 2 ? t('common.medium') : t('common.low');
  const statusDisplay = request.status_display || request.status;
  const imageUrl = request.photo || 'https://placehold.co/400x280';
  const requesterName = request.creator?.name || t('requestDetails.unknownUser');
  const requesterPhotoUrl = request.creator?.profile_photo || request.creator?.photo;
  const description = request.description || t('requestDetails.noDescription');
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : t('requestDetails.notSpecified');
  const locationDisplay = request.location || t('requestDetails.notSpecified');
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || t('requestDetails.notAvailable');

  const isCreator = user?.id === request?.creator?.id;
  const numAssigned = assignedVolunteers.length;
  const canAssignMore = numAssigned < request.volunteer_number;
  const taskStatus = request?.status?.toUpperCase() || '';
  const isCompleted = taskStatus === 'COMPLETED';
  const isCancelled = taskStatus === 'CANCELLED';
  const isTaskActive = !isCompleted && !isCancelled;
  const canMarkComplete = isCreator && isTaskActive && numAssigned >= 1;

  const currentStatusKey = statusDisplayToKey(statusDisplay);
  const statusLabelBackgroundColor =
    themeColors[`status${currentStatusKey}Background` as keyof typeof themeColors] || themeColors.statusGenericBackground;
  const statusLabelTextColor =
    themeColors[`status${currentStatusKey}Text` as keyof typeof themeColors] || themeColors.statusGenericText;
  const statusLabelBorderColor =
    themeColors[`status${currentStatusKey}Border` as keyof typeof themeColors] || themeColors.border;

  const urgencyLabelBackgroundColor =
    themeColors[`urgency${urgencyLevel}Background` as keyof typeof themeColors] || themeColors.labelDefaultBackground;
  const urgencyLabelTextColor =
    themeColors[`urgency${urgencyLevel}Text` as keyof typeof themeColors] || themeColors.labelDefaultText;
  const urgencyLabelBorderColor =
    themeColors[`urgency${urgencyLevel}Border` as keyof typeof themeColors] || themeColors.border;

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
            <Ionicons name="arrow-back" size={24} color={themeColors.text} accessible={false} importantForAccessibility="no" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1} ellipsizeMode="tail" testID="screen-title">
            {title}
          </Text>
        </View>
        <View style={styles.labelsContainer}>
          <Text style={[styles.categoryLabel, { color: themeColors.primary, backgroundColor: themeColors.lightPurple }]}>
            {categoryDisplay}
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: urgencyLabelTextColor,
                backgroundColor: urgencyLabelBackgroundColor,
                borderColor: urgencyLabelBorderColor,
                borderWidth: 1,
              },
            ]}
          >
            {`${urgencyLevel} ${t('requestDetails.urgency')}`}
          </Text>
          <Text
            style={[
              styles.label,
              {
                color: statusLabelTextColor,
                backgroundColor: statusLabelBackgroundColor,
                borderColor: statusLabelBorderColor,
                borderWidth: 1,
              },
            ]}
          >
            {statusDisplay}
          </Text>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        testID="request-details-scroll-view"
        contentContainerStyle={{ paddingBottom: user ? 100 : 40 }}
      >
        {/* Show first photo as hero image if available, otherwise show default */}
        {photos.length > 0 && !photosLoading ? (
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
                  {photos.slice(1).map((photo) => {
                    const photoUrl = photo.photo_url || photo.url || photo.image || '';
                    const absoluteUrl = photoUrl.startsWith('http')
                      ? photoUrl
                      : `${BACKEND_BASE_URL}${photoUrl}`;

                    return (
                      <TouchableOpacity
                        key={photo.id}
                        style={[styles.smallThumbnail, { borderColor: themeColors.card }]}
                        accessible={false}
                        importantForAccessibility="no"
                      >
                        <Image
                          source={{ uri: absoluteUrl }}
                          style={styles.smallThumbnailImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        )}

        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.requester')}</Text>
          <View style={styles.requesterRow}>
            <Image
              source={
                requesterPhotoUrl
                  ? { uri: requesterPhotoUrl }
                  : require('../assets/images/empty_profile_photo.png')
              }
              style={[styles.requesterAvatar, { backgroundColor: themeColors.border }]}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.requesterName, { color: themeColors.text }]}>{requesterName}</Text>
              <Text style={{ color: themeColors.textMuted }}>{phoneNumber}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.description')}</Text>
          <Text style={[styles.sectionText, { color: themeColors.text }]}>{description}</Text>
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.details')}</Text>
          <DetailRow label={t('requestDetails.deadline')} value={datetime} themeColors={themeColors} />
          <DetailRow label={t('requestDetails.location')} value={locationDisplay} themeColors={themeColors} />
          <DetailRow label={t('requestDetails.peopleNeeded')} value={`${requiredPerson} ${t('requestDetails.volunteerSuffix', { count: requiredPerson })}`} themeColors={themeColors} />
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.assignedVolunteers')}</Text>
          {assigneesLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} />
          ) : assignedVolunteers.length === 0 ? (
            <Text style={[styles.sectionText, { color: themeColors.textMuted }]}>{t('requestDetails.noVolunteersAssigned')}</Text>
          ) : (
            assignedVolunteers.map((volunteer) => (
              <TouchableOpacity
                key={volunteer.id}
                style={styles.volunteerRow}
                onPress={() => {
                  if (volunteer.user?.id) {
                    router.push({ pathname: '/profile', params: { userId: String(volunteer.user.id) } });
                  }
                }}
                disabled={!volunteer.user?.id}
                activeOpacity={volunteer.user?.id ? 0.8 : 1}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`View ${volunteer.user.name} ${volunteer.user.surname}'s profile`}
                accessibilityState={{ disabled: !volunteer.user?.id }}
              >
                <Image
                  source={
                    (volunteer.user.profile_photo || volunteer.user.photo)
                      ? {
                        uri: (volunteer.user.profile_photo || volunteer.user.photo)?.startsWith('http')
                          ? volunteer.user.profile_photo || volunteer.user.photo
                          : `${BACKEND_BASE_URL}${volunteer.user.profile_photo || volunteer.user.photo}`
                      }
                      : require('../assets/images/empty_profile_photo.png')
                  }
                  style={[styles.volunteerAvatar, { backgroundColor: themeColors.border }]}
                  accessibilityRole="image"
                  accessibilityLabel={`Profile photo of ${volunteer.user.name} ${volunteer.user.surname}`}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: themeColors.text, fontWeight: '600' }}>
                    {volunteer.user.name} {volunteer.user.surname}
                  </Text>
                  <Text style={{ color: themeColors.textMuted }}>{volunteer.user.phone_number}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {isCreator && isTaskActive && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/select-volunteer', params: { id, requiredVolunteers: String(request.volunteer_number) } })}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Select volunteers"
          >
            <Text style={[styles.buttonText, { color: themeColors.card }]}>
              {requiredPerson === 1 ? t('requestDetails.selectVolunteer') : t('requestDetails.selectVolunteers')}
            </Text>
          </TouchableOpacity>
        )}

        {canMarkComplete && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={handleMarkAsComplete}
            disabled={completingTask}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Mark request as complete"
            accessibilityState={{ disabled: completingTask }}
            testID="request-details-complete-button"
          >
            {completingTask ? (
              <ActivityIndicator size="small" color={themeColors.card} />
            ) : (
              <Text style={[styles.buttonText, { color: themeColors.card }]}>{t('requestDetails.markAsComplete')}</Text>
            )}
          </TouchableOpacity>
        )}

        {isCreator && isTaskActive && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.halfButton, { borderColor: themeColors.secondary }]}
              onPress={openEditModal}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Edit request"
              testID="request-details-edit-button"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="pencil" size={18} color={themeColors.secondary} style={{ marginRight: 6 }} />
                <Text style={[styles.buttonText, { color: themeColors.secondary }]}>{t('requestDetails.editRequest')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.halfButton, { borderColor: themeColors.error, marginLeft: 12 }]}
              onPress={handleDeleteRequest}
              disabled={cancellingTask}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Delete request"
              accessibilityState={{ disabled: cancellingTask }}
              testID="request-details-delete-button"
            >
              {cancellingTask ? (
                <ActivityIndicator size="small" color={themeColors.error} />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="close" size={18} color={themeColors.error} style={{ marginRight: 6 }} />
                  <Text style={[styles.buttonText, { color: themeColors.error }]}>{t('requestDetails.deleteRequest')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!isCreator && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={() =>
              router.push({
                pathname: '/select-volunteer',
                params: { id },
              })
            }
            accessible

            accessibilityRole="button"
            accessibilityLabel="Volunteer for this request"
            testID="request-details-volunteer-button"
          >
            <Text style={[styles.buttonText, { color: themeColors.card }]}>{t('requestDetails.volunteerForRequest')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && isCompleted && (
          <>
            <Text
              style={[
                styles.statusText,
                {
                  color: getLabelColors(statusDisplay, 'Text'),
                },
              ]}
            >
              {statusDisplay}
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: themeColors.pink }]}
              onPress={handleOpenReviewModal}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Rate and review volunteers"
              testID="request-details-review-button"
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>
                {hasReviewedAllVolunteers()
                  ? t('requestDetails.editRateReview', { count: numAssigned })
                  : t('requestDetails.rateReview', { count: numAssigned })
                }
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Comments Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('requestDetails.comments')}</Text>
          {commentsLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 16 }} />
          ) : comments.length === 0 ? (
            <Text style={[styles.sectionText, { color: themeColors.textMuted }]}>{t('requestDetails.noCommentsYet')}</Text>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={styles.commentInputContainer}
      >
        {editingCommentId && (
          <View style={[styles.editingBanner, { backgroundColor: themeColors.lightPurple }]}>
            <Text style={[styles.editingText, { color: themeColors.primary }]}>{t('requestDetails.editingComment')}</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={20} color={themeColors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.inputRow, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
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
                backgroundColor: submittingComment || !commentText.trim() ? themeColors.border : themeColors.primary,
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
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={[styles.modalOverlay, { backgroundColor: themeColors.overlay }]}
          accessibilityViewIsModal
          importantForAccessibility="yes"
        >
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]} accessible>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {isEdit
                ? t('requestDetails.editRequest')
                : assignedVolunteers.length > 0
                  ? (() => {
                    const currentVolunteer = assignedVolunteers[currentVolunteerIndex];
                    const existingReview = getExistingReviewForVolunteer(currentVolunteer?.user?.id);
                    return existingReview
                      ? t('requestDetails.editRateReview', { count: 1 })
                      : t('requestDetails.rateReview', { count: 1 });
                  })()
                  : t('requestDetails.rateRequest')
              }
            </Text>
            {isEdit ? (
              <ScrollView style={styles.editFormContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: themeColors.textMuted }]}>{t('requestDetails.title')}</Text>
                  <TextInput
                    style={[
                      styles.editInput,
                      { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
                    ]}
                    placeholder={t('requestDetails.titlePlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    value={editForm.title ?? ''}
                    onChangeText={(text) => handleEditInputChange('title', text)}
                    accessibilityLabel={t('requestDetails.title')}
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: themeColors.textMuted }]}>{t('requestDetails.description')}</Text>
                  <TextInput
                    style={[
                      styles.editInput,
                      { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background, minHeight: 80, textAlignVertical: 'top' },
                    ]}
                    placeholder={t('requestDetails.descriptionPlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    multiline
                    value={editForm.description ?? ''}
                    onChangeText={(text) => handleEditInputChange('description', text)}
                    accessibilityLabel={t('requestDetails.description')}
                  />
                </View>
                <CategoryPicker value={editForm.category} onChange={(val) => handleEditInputChange('category', val)} />
                <DeadlinePicker value={deadlineDate} onChange={handleDeadlineChange} />
                <AddressFields value={addressFields} onChange={setAddressFields} />
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: themeColors.textMuted }]}>{t('requestDetails.addressDescription')}</Text>
                  <TextInput
                    style={[
                      styles.editInput,
                      { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background, minHeight: 80, textAlignVertical: 'top' },
                    ]}
                    placeholder={t('requestDetails.addressDescriptionPlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    multiline
                    value={editForm.requirements ?? ''}
                    onChangeText={(text) => handleEditInputChange('requirements', text)}
                    accessibilityLabel={t('requestDetails.addressDescription')}
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: themeColors.textMuted }]}>{t('requestDetails.urgency')}</Text>
                  <TextInput
                    style={[
                      styles.editInput,
                      { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
                    ]}
                    keyboardType="numeric"
                    placeholder={t('requestDetails.urgencyPlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    value={editForm.urgency_level !== undefined ? String(editForm.urgency_level) : ''}
                    onChangeText={(text) => {
                      const cleaned = text.trim();
                      if (!cleaned) {
                        handleEditInputChange('urgency_level', undefined);
                        return;
                      }
                      const parsed = Number(cleaned);
                      handleEditInputChange('urgency_level', Number.isNaN(parsed) ? undefined : parsed);
                    }}
                    accessibilityLabel={t('requestDetails.urgency')}
                  />
                </View>
                <View style={styles.editField}>
                  <Text style={[styles.editLabel, { color: themeColors.textMuted }]}>{t('requestDetails.peopleNeeded')}</Text>
                  <TextInput
                    style={[
                      styles.editInput,
                      { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
                    ]}
                    keyboardType="numeric"
                    placeholder={t('requestDetails.peopleNeededPlaceholder')}
                    placeholderTextColor={themeColors.textMuted}
                    value={editForm.volunteer_number !== undefined ? String(editForm.volunteer_number) : ''}
                    onChangeText={(text) => {
                      const cleaned = text.trim();
                      if (!cleaned) {
                        handleEditInputChange('volunteer_number', undefined);
                        return;
                      }
                      const parsed = Number(cleaned);
                      handleEditInputChange('volunteer_number', Number.isNaN(parsed) ? undefined : parsed);
                    }}
                    accessibilityLabel={t('requestDetails.peopleNeeded')}
                  />
                </View>
                <View style={[styles.editField, styles.editSwitchRow]}>
                  <Text style={[styles.editLabel, { color: themeColors.text }]}>{t('requestDetails.recurringTask')}</Text>
                  <Switch
                    value={Boolean(editForm.is_recurring)}
                    onValueChange={(value) => handleEditInputChange('is_recurring', value)}
                    trackColor={{ false: themeColors.border, true: themeColors.primary }}
                    thumbColor={themeColors.card}
                  />
                </View>
              </ScrollView>
            ) : (
              <>
                {assignedVolunteers.length > 1 && (
                  <Text style={[styles.modalSubtitle, { color: themeColors.textMuted }]}>
                    {t('requestDetails.reviewProgress', { current: currentVolunteerIndex + 1, total: assignedVolunteers.length })}
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
                  <Text style={[styles.editLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.reliability')}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={`rel-${star}`}
                        onPress={() => handleStarPress('reliability', star)}
                      >
                        <Ionicons
                          name={star <= reliability ? 'star' : 'star-outline'}
                          size={28}
                          color={star <= reliability ? themeColors.pink : themeColors.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.starRow}>
                  <Text style={[styles.editLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.taskCompletion')}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={`comp-${star}`}
                        onPress={() => handleStarPress('taskCompletion', star)}
                      >
                        <Ionicons
                          name={star <= taskCompletion ? 'star' : 'star-outline'}
                          size={28}
                          color={star <= taskCompletion ? themeColors.pink : themeColors.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.starRow}>
                  <Text style={[styles.editLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.communication')}</Text>
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
                  <Text style={[styles.editLabel, { color: themeColors.text, marginBottom: 4 }]}>{t('requestDetails.safetyAndRespect')}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={`safe-${star}`}
                        onPress={() => handleStarPress('safetyAndRespect', star)}
                      >
                        <Ionicons
                          name={star <= safetyAndRespect ? 'star' : 'star-outline'}
                          size={28}
                          color={star <= safetyAndRespect ? themeColors.pink : themeColors.border}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={handleCloseModal}
                disabled={isEdit ? updatingRequest : submittingReview}
                accessible
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                accessibilityState={{ disabled: isEdit ? updatingRequest : submittingReview }}
              >
                <Text style={{ color: themeColors.text }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isEdit ? themeColors.primary : themeColors.pink }]}
                onPress={isEdit ? handleUpdateRequest : handleSubmitReview}
                disabled={isEdit ? updatingRequest : submittingReview}
                accessible
                accessibilityRole="button"
                accessibilityLabel={isEdit ? t('requestDetails.saveChanges') : t('requestDetails.submitReview')}
                accessibilityState={{ disabled: isEdit ? updatingRequest : submittingReview }}
              >
                {isEdit ? (
                  updatingRequest ? (
                    <ActivityIndicator size="small" color={themeColors.card} />
                  ) : (
                    <Text style={{ color: themeColors.card }}>{t('common.save')}</Text>
                  )
                ) : submittingReview ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Text style={{ color: themeColors.card }}>
                    {currentVolunteerIndex < assignedVolunteers.length - 1 ? t('common.next') : t('requestDetails.submit')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}

function DetailRow({ label, value, themeColors }: { label: string; value: string; themeColors: ThemeTokens }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: themeColors.text }]}>{value}</Text>
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
  labelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  label: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  heroImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requesterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  volunteerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  primaryButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  editFormContainer: {
    maxHeight: 420,
  },
  editField: {
    marginBottom: 12,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 16,
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
