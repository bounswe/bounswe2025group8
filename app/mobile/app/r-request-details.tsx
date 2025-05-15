import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTasks, type Task } from '../lib/api'; // Import getTasks and Task type


const backgroundColors: Record<string, string> = {
  High: '#de3b40',
  Medium: '#efb034',
  Low: '#1dd75b',
  Past: '#9095a0',
  Completed: '#379ae6',
  Accepted: '#636AE8',
  Pending: 'transparent',
  Rejected: 'transparent',
};

const textColors: Record<string, string> = {
  High: '#fff',
  Medium: '#5d4108',
  Low: '#0a4d20',
  Completed: '#fff',
  Accepted: '#fff',
  Pending: '#636AE8',
  Rejected: '#E8618C',
};

const borderColors: Record<string, string> = {
  High: '#de3b40',
  Medium: '#efb034',
  Low: '#1dd75b',
  Past: '#9095a0',
  Completed: '#379ae6',
  Accepted: '#636AE8',
  Pending: '#636AE8',
  Rejected: '#E8618C',
};

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();

  const id = params.id ? Number(params.id) : null; // Get ID from params
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Request ID not provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getTasks() // Fetch all tasks
      .then(res => {
        const found = res.results.find((t) => t.id === id); // Find the specific task by ID
        if (found) {
          setRequest(found);
        } else {
          setError('Request not found.');
        }
      })
      .catch(() => setError('Failed to load request details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStarPress = (star: number) => setRating(star);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.gray }} />;
  }

  if (error || !request) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.gray }}>
        <Text style={{ color: 'red', textAlign: 'center', fontSize: 18 }}>{error || 'Request details could not be loaded.'}</Text>
      </View>
    );
  }

  // Map API fields to UI fields for clarity, similar to v-request-details
  const title = request.title;
  const categoryDisplay = request.category_display || request.category || 'Unknown';
  const urgencyLevel = request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const statusDisplay = request.status_display || request.status;
  const imageUrl = request.photo || 'https://placehold.co/400x280'; // Default placeholder
  const requesterName = request.creator?.name || 'Unknown User';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70'; // Default placeholder
  const description = request.description || 'No description provided.';
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : 'Not specified';
  const locationDisplay = request.location || 'Not specified';
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || 'Not available';


  return (
    <View style={{ flex: 1, backgroundColor: themeColors.gray }}>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: themeColors.background, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            onPress={() => {
              console.log('Back button pressed on r-details');
              if (router.canGoBack()) {
                router.back();
              } else {
                console.log('Cannot go back from r-details, navigating to /feed as fallback.');
                router.replace('/feed'); // Fallback to feed screen
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.categoryLabel, { color: colors.primary, backgroundColor: themeColors.lightPurple }]}>
          {categoryDisplay}
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: textColors[urgencyLevel] || '#fff',
              backgroundColor: backgroundColors[urgencyLevel] || '#9095a0',
              borderColor: borderColors[urgencyLevel] || '#9095a0',
              borderWidth: 1,
            },
          ]}
        >
          {statusDisplay === 'Past' ? statusDisplay : `${urgencyLevel} Urgency`}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Request Image section removed */}

        {/* Request Details */}
        <View style={[styles.detailsContainer, { backgroundColor: themeColors.background }]}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: requesterAvatar }}
              style={styles.avatar}
            />
            <Text style={[styles.name, { color: colors.text }]}>{requesterName}</Text>
          </View>
          <Text style={[styles.descriptionText, { color: colors.text }]}>{description}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{datetime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{locationDisplay}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{requiredPerson} person required</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{phoneNumber}</Text>
            </View>
          </View>
        </View>

        <Text style={[
          styles.statusText,
          { color: statusDisplay === 'Past' ? '#efb034' : borderColors[statusDisplay] || textColors[statusDisplay] || colors.text }
        ]}>{
          statusDisplay === 'Past' && request.assignee?.rating // Assuming rating might be on assignee for past tasks
            ? `☆ ${parseFloat(request.assignee.rating).toFixed(1)}` // This part might need adjustment based on actual data structure for past task ratings
            : statusDisplay
        }</Text>

        {/* Button logic based on request status */}
        {request && ( // Check if request is not null
          ['Pending', 'Accepted'].includes(statusDisplay) ? (
            <>
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: colors.primary }]}
                // onPress={() => router.push({ pathname: '/select-volunteer', params: { id: request.id } })} // Pass ID
              >
                <Text style={styles.buttonText}>Select Volunteer</Text>
              </TouchableOpacity>
              <View style={styles.editRow}>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: '#fef9ee' }]} onPress={() => {/* TODO: Edit logic */}}>
                  <View style={styles.editButtonContent}>
                    <Ionicons name="create-outline" size={20} color="#98690c" style={{ marginRight: 6 }} />
                    <Text style={[styles.editButtonText, { color: '#98690c' }]}>Edit Request</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.editButton, { backgroundColor: '#fdf2f2' }]} onPress={() => {/* TODO: Delete logic */}}>
                  <View style={styles.editButtonContent}>
                    <Ionicons name="trash-outline" size={20} color="#de3b40" style={{ marginRight: 6 }} />
                    <Text style={[styles.editButtonText, { color: '#de3b40' }]}>Delete Request</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : statusDisplay === 'Completed' ? (
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]}
                onPress={() => { setIsEdit(false); setModalVisible(true); }}
              >
                <Text style={styles.buttonText}>Rate & Review</Text>
              </TouchableOpacity>
          ) : statusDisplay === 'Past' ? ( // Check for 'Past' status directly
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]}
                onPress={() => { setIsEdit(true); setModalVisible(true); }} // Set isEdit for 'Past'
              >
                <Text style={styles.buttonText}>Edit Rate & Review</Text>
              </TouchableOpacity>
          ) : null // For other statuses like Rejected, or if no button is applicable
        )}
      </ScrollView>

      {/* Modal for Rate & Review */}
      {modalVisible && (
        <View style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          bottom: 10,
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Rate & Review</Text>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Ionicons
                    name={rating >= star ? 'star' : 'star-outline'}
                    size={32}
                    color={themeColors.pink}
                    style={{ marginHorizontal: 2 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={{
                width: '100%',
                minHeight: 260, // Increased height
                borderColor: '#eee',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                marginBottom: 16,
                textAlignVertical: 'top',
              }}
              placeholder="Write your review..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity
              style={{ backgroundColor: themeColors.lightPink, padding: 12, borderRadius: 32, width: '100%', alignItems: 'center' }}
              onPress={() => { setModalVisible(false); /* TODO: handle submit review here */ }}
            >
              <Text style={{ color: themeColors.pink, fontWeight: 'bold', fontSize: 17 }}>Submit</Text>
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
    paddingTop: 130, // Ensure content starts below the sticky header
  },
  header: {
    flexDirection: 'column',
    paddingTop: 16, // Adjust as needed for status bar height if not using SafeAreaView at root
    paddingBottom: 16,
    height: 130,
    paddingHorizontal: 24,
    justifyContent: 'space-between', // Distributes title, category, urgency
    // backgroundColor will be set by themeColors.background
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
    fontWeight: '500',
    // color will be set by colors.text
  },
  categoryLabel: {
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '500',
    borderRadius: 7,
    // color and backgroundColor set by theme
    // marginTop: 4, // Add some space if needed
  },
  label: { // Urgency/Status Label
    textAlign: 'center',
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: '400',
    borderRadius: 7,
    width: 120, // Fixed width for consistency
    // marginRight: 8, // Only if multiple labels are side-by-side
    // color, backgroundColor, borderColor set dynamically
    // marginTop: 4, // Add some space if needed
  },
  requestImage: {
    width: '90%',
    alignSelf: 'center',
    height: 280,
    borderRadius: 12,
    marginTop: 16, // Space from header
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'column',
    borderRadius: 24,
    width: '90%',
    alignSelf: 'center',
    padding: 16,
    // backgroundColor will be set by themeColors.background
    // marginBottom: 16, // Add space before status text or buttons
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#f2f2fd', // Light placeholder color
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    // color will be set by colors.text
  },
  descriptionText: {
    // flexDirection: 'row', // Not needed for Text component
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 16,
    // color will be set by colors.text
  },
  infoContainer: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  icon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '300',
    // color will be set by colors.text
  },
  statusText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
    // color will be set dynamically
  },
  volunteerButton: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 32,
    marginBottom: 16, // Space below button
    // backgroundColor will be set dynamically
  },
  buttonText: {
    color: '#fff', // Assuming button text is usually white
    fontSize: 17,
    fontWeight: '500',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  editButton: {
    flex: 1, // Distribute space equally
    padding: 12,
    borderRadius: 24,
    marginHorizontal: 6, // Space between edit buttons
    alignItems: 'center',
    // backgroundColor will be set
  },
  editButtonText: {
    fontSize: 17,
    fontWeight: '500',
    // color will be set dynamically
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 