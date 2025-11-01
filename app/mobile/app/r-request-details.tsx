import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTaskDetails, getTaskApplicants, completeTask, cancelTask, createReview, getTaskReviews, type Task, type Volunteer, type Review } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { user } = useAuth();

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
  const [reviewText, setReviewText] = useState('');
  const [currentVolunteerIndex, setCurrentVolunteerIndex] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
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

  const handleStarPress = (star: number) => setRating(star);

  const handleOpenReviewModal = () => {
    if (assignedVolunteers.length === 0) {
      Alert.alert('No Volunteers', 'There are no volunteers to review.');
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
      setReviewText(existingReview.comment);
    } else {
      setRating(0);
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

  const hasReviewedAnyVolunteer = (): boolean => {
    if (assignedVolunteers.length === 0) return false;
    return assignedVolunteers.some((volunteer) => 
      existingReviews.some((review) => 
        review.reviewee.id === volunteer.user.id && review.reviewer.id === user?.id
      )
    );
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
    if (!id || !request || currentVolunteerIndex >= assignedVolunteers.length) {
      return;
    }

    const currentVolunteer = assignedVolunteers[currentVolunteerIndex];
    setSubmittingReview(true);

    try {
      await createReview({
        score: Number(rating), // Ensure it's a number
        comment: reviewText.trim(),
        reviewee_id: currentVolunteer.user.id,
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
          setReviewText(nextReview.comment);
        } else {
          setRating(0);
          setReviewText('');
        }
        
        Alert.alert('Success', `Review submitted for ${currentVolunteer.user.name}!`);
      } else {
        // All volunteers reviewed
        Alert.alert('Success', 'All reviews submitted successfully!');
        setModalVisible(false);
        setRating(0);
        setReviewText('');
        setCurrentVolunteerIndex(0);
        // Refresh task data to show updated reviews
        await fetchTaskData();
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to submit review. Please try again.';
      Alert.alert('Error', errorMessage);
      console.error('Review submission error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCloseReviewModal = () => {
    setModalVisible(false);
    setRating(0);
    setReviewText('');
    setCurrentVolunteerIndex(0);
  };

  const handleMarkAsComplete = () => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this request as completed? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Complete',
          style: 'destructive',
          onPress: async () => {
            if (!id || !request) return;
            
            setCompletingTask(true);
            try {
              const response = await completeTask(id);
              Alert.alert('Success', response.message || 'Request marked as completed successfully!');
              
              // Refresh task data to get updated status
              await fetchTaskData();
            } catch (err: any) {
              const errorMessage = err?.message || 'Failed to mark request as completed. Please try again.';
              Alert.alert('Error', errorMessage);
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
      'Delete Request',
      'Are you sure you want to delete this request? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id || !request) return;
            
            setCancellingTask(true);
            try {
              const response = await cancelTask(id);
              Alert.alert('Success', response.message || 'Request deleted successfully!');
              
              // Navigate back to feed
              router.back();
            } catch (err: any) {
              const errorMessage = err?.message || 'Failed to delete request. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
              setCancellingTask(false);
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
          {error || 'Request details could not be loaded.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10, padding: 10 }}>
          <Text style={{ color: themeColors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = request.title;
  const categoryDisplay = request.category_display || request.category || 'Unknown';
  const urgencyLevel = request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : 'Low';
  const statusDisplay = request.status_display || request.status;
  const imageUrl = request.photo || 'https://placehold.co/400x280';
  const requesterName = request.creator?.name || 'Unknown User';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70';
  const description = request.description || 'No description provided.';
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : 'Not specified';
  const locationDisplay = request.location || 'Not specified';
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || 'Not available';

  const isCreator = user?.id === request?.creator?.id;
  const numAssigned = assignedVolunteers.length;
  const canAssignMore = numAssigned < request.volunteer_number;
  const taskStatus = request?.status?.toUpperCase() || '';
  const isCompleted = taskStatus === 'COMPLETED';
  const canMarkComplete = isCreator && !isCompleted && (taskStatus === 'ASSIGNED' || taskStatus === 'IN_PROGRESS');

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
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1} ellipsizeMode="tail">
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
            {`${urgencyLevel} Urgency`}
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Requester</Text>
          <View style={styles.requesterRow}>
            <Image source={{ uri: requesterAvatar }} style={styles.requesterAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.requesterName, { color: themeColors.text }]}>{requesterName}</Text>
              <Text style={{ color: themeColors.textMuted }}>{phoneNumber}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Description</Text>
          <Text style={[styles.sectionText, { color: themeColors.text }]}>{description}</Text>
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Details</Text>
          <DetailRow label="Date & Time" value={datetime} themeColors={themeColors} />
          <DetailRow label="Location" value={locationDisplay} themeColors={themeColors} />
          <DetailRow label="People Needed" value={`${requiredPerson} volunteer(s)`} themeColors={themeColors} />
        </View>
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Assigned Volunteers</Text>
          {assigneesLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} />
          ) : assignedVolunteers.length === 0 ? (
            <Text style={[styles.sectionText, { color: themeColors.textMuted }]}>No volunteers assigned yet.</Text>
          ) : (
            assignedVolunteers.map((volunteer) => (
              <View key={volunteer.id} style={styles.volunteerRow}>
                <Image
                  source={
                    volunteer.user.photo ? { uri: volunteer.user.photo } : require('../assets/images/empty_profile_photo.png')
                  }
                  style={styles.volunteerAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: themeColors.text, fontWeight: '600' }}>
                    {volunteer.user.name} {volunteer.user.surname}
                  </Text>
                  <Text style={{ color: themeColors.textMuted }}>{volunteer.user.phone_number}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {isCreator && !isCompleted && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/select-volunteer', params: { id, requiredVolunteers: String(request.volunteer_number) } })}
          >
            <Text style={[styles.buttonText, { color: themeColors.card }]}>
              {requiredPerson === 1 ? 'Select Volunteer' : 'Select Volunteers'}
            </Text>
          </TouchableOpacity>
        )}

        {canMarkComplete && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={handleMarkAsComplete}
            disabled={completingTask}
          >
            {completingTask ? (
              <ActivityIndicator size="small" color={themeColors.card} />
            ) : (
              <Text style={[styles.buttonText, { color: themeColors.card }]}>Mark as Complete</Text>
            )}
          </TouchableOpacity>
        )}

        {isCreator && !isCompleted && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.halfButton, { borderColor: '#FF9800' }]}
              onPress={() => {
                setIsEdit(true);
                setModalVisible(true);
              }}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="pencil" size={18} color="#FF9800" style={{ marginRight: 6 }} />
                <Text style={[styles.buttonText, { color: '#FF9800' }]}>Edit Request</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.halfButton, { borderColor: themeColors.error, marginLeft: 12 }]}
              onPress={handleDeleteRequest}
              disabled={cancellingTask}
            >
              {cancellingTask ? (
                <ActivityIndicator size="small" color={themeColors.error} />
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="close" size={18} color={themeColors.error} style={{ marginRight: 6 }} />
                  <Text style={[styles.buttonText, { color: themeColors.error }]}>Delete Request</Text>
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
          >
            <Text style={[styles.buttonText, { color: themeColors.card }]}>Volunteer for this Request</Text>
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
            >
              <Text style={[styles.buttonText, { color: themeColors.card }]}>
                {hasReviewedAnyVolunteer() 
                  ? `Edit Rate & Review ${numAssigned === 1 ? 'Volunteer' : 'Volunteers'}`
                  : `Rate & Review ${numAssigned === 1 ? 'Volunteer' : 'Volunteers'}`
                }
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {isEdit 
                ? 'Edit Request' 
                : assignedVolunteers.length > 0 
                  ? (() => {
                      const currentVolunteer = assignedVolunteers[currentVolunteerIndex];
                      const existingReview = getExistingReviewForVolunteer(currentVolunteer?.user?.id);
                      return existingReview 
                        ? `Edit Rate & Review ${currentVolunteer?.user?.name || 'Volunteer'}`
                        : `Rate & Review ${currentVolunteer?.user?.name || 'Volunteer'}`;
                    })()
                  : 'Rate Request'
              }
            </Text>
            {!isEdit && assignedVolunteers.length > 1 && (
              <Text style={[styles.modalSubtitle, { color: themeColors.textMuted }]}>
                {currentVolunteerIndex + 1} of {assignedVolunteers.length}
              </Text>
            )}
            {!isEdit && (
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
              />
            )}
            {isEdit && (
              <TextInput
                style={[
                  styles.modalInput,
                  { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
                ]}
                placeholder="Update request details..."
                placeholderTextColor={themeColors.textMuted}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
            )}
            {!isEdit && (
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= rating ? themeColors.pink : themeColors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={isEdit ? () => setModalVisible(false) : handleCloseReviewModal}
                disabled={submittingReview}
              >
                <Text style={{ color: themeColors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isEdit ? themeColors.primary : themeColors.pink }]}
                onPress={isEdit ? () => {
                  // Handle edit request - placeholder for now
                  Alert.alert('Success', 'Request updated!');
                  setModalVisible(false);
                  setReviewText('');
                } : handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color={themeColors.card} />
                ) : (
                  <Text style={{ color: themeColors.card }}>
                    {isEdit ? 'Save' : currentVolunteerIndex < assignedVolunteers.length - 1 ? 'Next' : 'Submit'}
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

function DetailRow({ label, value, themeColors }: { label: string; value: string; themeColors: typeof Colors.light }) {
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
    backgroundColor: '#ccc',
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
    backgroundColor: '#ccc',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  statusText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 16,
  },
});
