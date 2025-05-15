import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTasks, type Task, volunteerForTask } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { user } = useAuth();

  const id = params.id ? Number(params.id) : null;
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const getLabelColors = (type: string, property: 'Background' | 'Text' | 'Border') => {
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const baseKey = type === 'Past' ? 'statusPast' : `status${capitalizedType}`;
    const key = `${baseKey}${property}` as keyof typeof themeColors;

    return themeColors[key] || 
           (property === 'Text' ? themeColors.text : 
            property === 'Background' ? 'transparent' : themeColors.border);
  };

  const fetchRequestDetails = () => {
    if (!id) {
      setError('Request not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getTasks()
      .then(res => {
        const found = res.results.find((t) => t.id === id);
        if (found) setRequest(found);
        else setError('Request not found.');
      })
      .catch(() => setError('Failed to load request.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleStarPress = (star: number) => setRating(star);

  const handleBeVolunteer = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please sign in to volunteer for tasks.', [
        { text: 'OK', onPress: () => router.push('/signin') }
      ]);
      return;
    }
    if (!request) return;

    setActionLoading(true);
    try {
      const response = await volunteerForTask(request.id);
      Alert.alert('Success', response.message || 'You have successfully volunteered for this task!');
      fetchRequestDetails();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not volunteer for the task. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }} />;
  }
  if (error || !request) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
            <Text style={{ color: themeColors.pink, textAlign: 'center', fontSize: 18 }}>{error || 'Request not found.'}</Text>
        </View>
    );
  }

  const urgencyLevelDisplay = request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const statusDisplay = request.status_display || request.status;
  const imageUrl = request.photo || 'https://placehold.co/400x280';
  const requesterName = request.creator?.name || 'Unknown';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70';
  const description = request.description;
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : '';
  const locationDisplay = request.location || 'N/A';
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || '';

  const isCreator = user && request.creator && user.id === request.creator.id;
  const isAlreadyVolunteered = user && request.assignee && (Array.isArray(request.assignee) ? request.assignee.some(a => a.id === user.id) : request.assignee.id === user.id);
  const canVolunteer = !isCreator && statusDisplay === 'Posted' && !isAlreadyVolunteered;

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={[styles.header, { backgroundColor: themeColors.card, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomColor: themeColors.border, borderBottomWidth: 1 }]}> 
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
          <Text style={[styles.title, { color: themeColors.text }]}> 
            {request.title}
          </Text>
        </View>
        <Text style={[styles.categoryLabel, { color: themeColors.primary, backgroundColor: themeColors.lightPurple }]}>{request.category_display || request.category}</Text>
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
          {statusDisplay === 'Past' ? statusDisplay : `${urgencyLevelDisplay} Urgency`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}> 
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: requesterAvatar }}
              style={[styles.avatar, { backgroundColor: themeColors.gray }]}
            />
            <Text style={[styles.name, { color: themeColors.text }]}>{requesterName}</Text>
          </View>
          <Text style={[styles.descriptionText, { color: themeColors.text }]}>{description}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={25} color={themeColors.textMuted} style={styles.icon} />
              <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{datetime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={25} color={themeColors.textMuted} style={styles.icon} />
              <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{locationDisplay}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={25} color={themeColors.textMuted} style={styles.icon} />
              <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{requiredPerson} person required</Text>
            </View>
            {(statusDisplay === 'Accepted' || statusDisplay === 'Completed' || isCreator || isAlreadyVolunteered) && phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={25} color={themeColors.textMuted} style={styles.icon} />
                <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{phoneNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[
          styles.statusText, 
          { color: statusDisplay === 'Past' ? themeColors.statusPastText : getLabelColors(statusDisplay, 'Text') }
        ]}>{
          statusDisplay === 'Past' && request.assignee
            ? `☆ ${(Number(request.assignee?.rating) || 0).toFixed(1)}` 
            : statusDisplay
        }</Text>

        {actionLoading ? (
          <ActivityIndicator size="small" color={themeColors.primary} style={{ marginVertical: 16 }} />
        ) : (
          user && !isCreator && (
            statusDisplay === 'Completed' ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.pink }]} 
                onPress={() => { 
                    if (!user) {
                        Alert.alert('Login Required', 'Please sign in to rate/review.', [{ text: 'OK', onPress: () => router.push('/signin') }]);
                        return;
                    }
                    setIsEdit(false); setModalVisible(true); 
                }}
              >
                <Text style={[styles.buttonText, { color: themeColors.card }]}>Rate & Review Requester</Text>
              </TouchableOpacity>
            ) : statusDisplay === 'Past' ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.pink }]} 
                onPress={() => { 
                    if (!user) {
                        Alert.alert('Login Required', 'Please sign in to rate/review.', [{ text: 'OK', onPress: () => router.push('/signin') }]);
                        return;
                    }
                    setIsEdit(true); setModalVisible(true); 
                }}
              >
                <Text style={[styles.buttonText, { color: themeColors.card }]}>Edit Your Review</Text>
              </TouchableOpacity>
            ) : isAlreadyVolunteered && (statusDisplay === 'Accepted' || statusDisplay === 'Pending') ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: getLabelColors('High', 'Background') }]}
                onPress={() => Alert.alert('Cancel Volunteering', 'Are you sure you want to cancel?')}
              >
                <Text style={[styles.buttonText, { color: getLabelColors('High', 'Text') }]}>Cancel Volunteering</Text>
              </TouchableOpacity>
            ) : canVolunteer ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                onPress={handleBeVolunteer}
              >
                <Text style={[styles.buttonText, { color: themeColors.card }]}>Be Volunteer</Text>
              </TouchableOpacity>
            ) : null
          )
        )}
      </ScrollView>

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{isEdit ? 'Edit Your Review' : 'Rate & Review Requester'}</Text>
            <View style={styles.starsContainer}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons
                    name={rating >= star ? 'star' : 'star-outline'}
                    size={32}
                    color={themeColors.pink}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.reviewInput,
                { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background }
              ]}
              placeholder="Write your review..."
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: themeColors.primary }]}
              onPress={() => { setModalVisible(false); /* TODO: handle submit review */ }}
            >
              <Text style={[styles.submitButtonText, { color: themeColors.card }]}>Submit</Text>
            </TouchableOpacity>
             <TouchableOpacity
              style={[styles.cancelButton, { marginTop:10, backgroundColor: themeColors.gray }]} 
              onPress={() => setModalVisible(false) }
            >
              <Text style={[styles.submitButtonText, { color: themeColors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 105,
  },
  header: {
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 25 : 15,
    paddingBottom: 12,
    minHeight: 95,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    flexShrink: 1,
  },
  categoryLabel: {
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '500',
    borderRadius: 7,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '400',
    borderRadius: 7,
    width: 120,
    marginTop: 4,
  },
  detailsContainer: {
    flexDirection: 'column',
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 22,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '300',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 3,
  },
  reviewInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 