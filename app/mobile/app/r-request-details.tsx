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
import { getTaskDetails, getTaskApplicants, type Task, type Volunteer } from '../lib/api';
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

  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
      setRequest(null);
      setAssignedVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

        {isCreator && (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/select-volunteer', params: { id, requiredVolunteers: String(request.volunteer_number) } })}
          >
            <Text style={[styles.buttonText, { color: themeColors.card }]}>
              {canAssignMore ? 'Select Volunteers' : 'Manage Volunteers'}
            </Text>
          </TouchableOpacity>
        )}

        {isCreator && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: themeColors.primary }]}
            onPress={() => {
              setIsEdit(true);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.buttonText, { color: themeColors.primary }]}>Edit Request</Text>
          </TouchableOpacity>
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

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: themeColors.primary }]}
          onPress={() => {
            setModalVisible(true);
            setIsEdit(false);
          }
        }>
          <Text style={[styles.buttonText, { color: themeColors.primary }]}>Leave a Review</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>{isEdit ? 'Edit Request' : 'Rate Request'}</Text>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor: themeColors.border, color: themeColors.text, backgroundColor: themeColors.background },
              ]}
              placeholder={isEdit ? 'Update request details...' : 'Leave your review...'}
              placeholderTextColor={themeColors.textMuted}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            {!isEdit && (
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={28}
                      color={star <= rating ? themeColors.primary : themeColors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: themeColors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  if (!reviewText.trim()) {
                    Alert.alert('Error', 'Review cannot be empty.');
                    return;
                  }
                  Alert.alert('Success', isEdit ? 'Request updated!' : 'Review submitted!');
                  setModalVisible(false);
                  setReviewText('');
                  setRating(0);
                }}
              >
                <Text style={{ color: themeColors.card }}>{isEdit ? 'Save' : 'Submit'}</Text>
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
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
