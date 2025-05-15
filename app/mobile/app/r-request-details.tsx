import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTaskDetails, getTaskApplicants, type Task, type Volunteer } from '../lib/api'; // Updated imports
import { useAuth } from '../lib/auth';

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();
  const { user } = useAuth();

  const id = params.id ? Number(params.id) : null;
  const refreshParam = params.refresh === 'true'; // Check for refresh trigger

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
    // Ensure statusDisplay is defined, fallback to request.status or a default
    const currentStatusDisplay = request?.status_display || request?.status || 'Generic'; 
    const keyBase = statusDisplayToKey(currentStatusDisplay);
    const key = `${keyBase}${capitalizedType}${property}` as keyof typeof themeColors;
    
    // Simplified logic: Use specific urgency or generic status colors
    let colorKey: keyof typeof themeColors;
    if (type === 'High' || type === 'Medium' || type === 'Low') { // Urgency
        colorKey = `urgency${capitalizedType}${property}` as keyof typeof themeColors;
    } else { // Status
        colorKey = `status${capitalizedType}${property}` as keyof typeof themeColors;
    }

    return themeColors[colorKey] || 
           (property === 'Text' ? themeColors.text : 
            property === 'Background' ? themeColors.labelDefaultBackground : themeColors.labelDefaultBorder || themeColors.border);
  };
  
  // Helper to map status display names to keys used in Colors.ts (e.g., "In Progress" -> "InProgress")
  const statusDisplayToKey = (statusDisplayName: string) => {
    return statusDisplayName.replace(/\s+/g, ''); // Removes spaces
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
      // After fetching task details, fetch accepted volunteers
      try {
        const applicantsResponse = await getTaskApplicants(id, 'ACCEPTED');
        if (applicantsResponse.status === 'success') {
          setAssignedVolunteers(applicantsResponse.data.volunteers || []);
        } else {
          // Non-critical error, maybe log it or show a subtle indicator
          console.warn('Could not fetch assigned volunteers:', applicantsResponse.message);
          setAssignedVolunteers([]); // Ensure it's an empty array on failure
        }
      } catch (assigneeError: any) {
        console.warn('Error fetching assigned volunteers:', assigneeError.message);
        setAssignedVolunteers([]);
      } finally {
        setAssigneesLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
      setRequest(null); // Clear request on error
      setAssignedVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskData();
  }, [id, refreshParam, fetchTaskData]); // Re-fetch if id or refreshParam changes

  const handleStarPress = (star: number) => setRating(star);

  if (loading) {
    return <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }} />;
  }

  if (error || !request) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text style={{ color: themeColors.error, textAlign: 'center', fontSize: 18 }}>{error || 'Request details could not be loaded.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 10, padding:10}}>
            <Text style={{color: themeColors.primary}}>Go Back</Text>
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
  
  // Use statusDisplayToKey for status labels
  const currentStatusKey = statusDisplayToKey(statusDisplay);
  const statusLabelBackgroundColor = themeColors[`status${currentStatusKey}Background` as keyof typeof themeColors] || themeColors.statusGenericBackground;
  const statusLabelTextColor = themeColors[`status${currentStatusKey}Text` as keyof typeof themeColors] || themeColors.statusGenericText;
  const statusLabelBorderColor = themeColors[`status${currentStatusKey}Border` as keyof typeof themeColors] || themeColors.border;

  // Urgency label colors
  const urgencyLabelBackgroundColor = themeColors[`urgency${urgencyLevel}Background` as keyof typeof themeColors] || themeColors.labelDefaultBackground;
  const urgencyLabelTextColor = themeColors[`urgency${urgencyLevel}Text` as keyof typeof themeColors] || themeColors.labelDefaultText;
  const urgencyLabelBorderColor = themeColors[`urgency${urgencyLevel}Border` as keyof typeof themeColors] || themeColors.border;


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
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.container, {backgroundColor: themeColors.background}]}>
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: requesterAvatar }}
              style={[styles.avatar, {backgroundColor: themeColors.gray}] }
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
               <Text style={[styles.infoText, { color: themeColors.textMuted }]}>
                {assigneesLoading ? 'Loading assignees...' : `${numAssigned} / ${requiredPerson} person(s) assigned`}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={25} color={themeColors.textMuted} style={styles.icon} />
              <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.statusText,
          { 
            color: statusLabelTextColor,
            backgroundColor: statusLabelBackgroundColor,
            borderColor: statusLabelBorderColor,
            borderWidth: 1,
            padding: 5, borderRadius: 5, overflow: 'hidden' // Make it look like a label
          }
        ]}>{
          statusDisplay === 'Completed' && request.assignee?.rating 
            ? `Completed - Rated: ☆ ${(Number(request.assignee.rating) || 0).toFixed(1)}`
            : statusDisplay
        }</Text>

        {request && (
          isCreator && ['POSTED', 'ASSIGNED', 'IN_PROGRESS'].includes(request.status.toUpperCase()) && canAssignMore ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                onPress={() => router.push({ 
                    pathname: '/select-volunteer', 
                    params: { 
                        taskId: request.id.toString(), 
                        requiredVolunteers: request.volunteer_number.toString(), 
                        currentVolunteers: JSON.stringify(assignedVolunteers || [])
                    }
                })}
                disabled={assigneesLoading}
              >
                <Text style={[styles.buttonText, {color: themeColors.card}]}>
                    {assigneesLoading ? 'Loading...' : `Manage Assignees (${numAssigned}/${request.volunteer_number})`}
                </Text>
              </TouchableOpacity>
              {/* Edit and Delete buttons can be added here if needed */}
            </>
          ) : request.status.toUpperCase() === 'COMPLETED' && isCreator && !request.assignee?.rating ? ( // Assuming only creator rates, and only if not rated
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
                onPress={() => { setIsEdit(false); setModalVisible(true); }}
              >
                <Text style={[styles.buttonText, {color: themeColors.card}]}>Rate & Review Volunteer</Text>
              </TouchableOpacity>
          ) : request.status.toUpperCase() === 'COMPLETED' && isCreator && request.assignee?.rating ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
                onPress={() => { setIsEdit(true); setModalVisible(true); }}
              >
                <Text style={[styles.buttonText, {color: themeColors.card}]}>Edit Your Review</Text>
              </TouchableOpacity>
          ) : null
        )}
      </ScrollView>

      {modalVisible && (
        <View style={styles.modalOverlay}>
           {/* ... Modal content ... (unchanged for brevity) */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 130, 
  },
  header: {
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 35 : 16, // Adjusted for status bar
    paddingBottom: 16,
    minHeight: 110, // Ensure enough height for labels
    paddingHorizontal: 15, // Consistent padding
    justifyContent: 'space-around',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Space below title row
    width: '100%', // Ensure it takes full width for centering title
  },
  backButton: {
    marginRight: 8,
    padding:5, // Easier to tap
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1, // Allow title to shrink if too long
  },
  labelsContainer: { // Container for category and urgency labels
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute labels
    alignItems: 'center',
    width: '100%',
  },
  categoryLabel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '500',
    borderRadius: 7,
    overflow: 'hidden', // Ensure background respects border radius
  },
  label: { 
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '500',
    borderRadius: 7,
    textAlign: 'center',
    minWidth: 100, // Give some base width to labels
    overflow: 'hidden',
  },
  // ... (rest of the styles are largely unchanged but might need minor theme color adjustments if not already done)
  detailsContainer: {
    borderRadius: 12,
    marginHorizontal: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50, // Slightly smaller avatar in details
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  infoContainer: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    flexShrink: 1, // Allow text to wrap or shrink
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20, // Consistent margin
    alignSelf: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: '5%', // Use margin for centering
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: '5%',
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1, // Add border for subtle distinction
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  reviewInput: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 