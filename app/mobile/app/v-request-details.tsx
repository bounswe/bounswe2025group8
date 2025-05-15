import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTasks, type Task, volunteerForTask } from '../lib/api';
import { useAuth } from '../lib/auth';

const backgroundColors: Record<string, string> = {
  High: '#de3b40', // High Urhgency background color
  Medium: '#efb034', // Medium Urgency background color
  Low: '#1dd75b', // Low Urgency background color
  Past: '#9095a0', // Past background color
  Completed: '#379ae6', // Completed background color
  Accepted: '#636AE8', // Accepted background color
  Pending: 'transparent', // Pending background color
  Rejected: 'transparent', // Rejected background color
};

const textColors: Record<string, string> = {
  High: '#fff', // High Urgency text color
  Medium: '#5d4108', // Medium Urgency text color  
  Low: '#0a4d20', // Low Urgency text color
  Completed: '#fff', // Completed text color
  Accepted: '#fff', // Accepted text color
  Pending: '#636AE8', // Pending text color
  Rejected: '#E8618C', // Rejected text color
};

const borderColors: Record<string, string> = {
  High: '#de3b40', // High Urgency border color
  Medium: '#efb034', // Medium Urgency border color
  Low: '#1dd75b', // Low Urgency border color
  Past: '#9095a0', // Past border color
  Completed: '#379ae6', // Completed border color
  Accepted: '#636AE8', // Accepted border color
  Pending: '#636AE8', // Pending border color
  Rejected: '#E8618C', // Rejected border color
};

export default function RequestDetails() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
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
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 40 }} />;
  }
  if (error || !request) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 24 }}>{error || 'Request not found.'}</Text>;
  }

  const urgencyLevel = request.urgency_level === 3 ? 'High' : request.urgency_level === 2 ? 'Medium' : request.urgency_level === 1 ? 'Low' : 'Medium';
  const status = request.status_display || request.status;
  const imageUrl = request.photo || 'https://placehold.co/400x280';
  const requesterName = request.creator?.name || 'Unknown';
  const requesterAvatar = request.creator?.photo || 'https://placehold.co/70x70';
  const description = request.description;
  const datetime = request.deadline ? new Date(request.deadline).toLocaleString() : '';
  const location = request.location || 'N/A';
  const requiredPerson = request.volunteer_number || 1;
  const phoneNumber = request.creator?.phone_number || '';

  const isCreator = user && request.creator && user.id === request.creator.id;
  const canVolunteer = !isCreator && status === 'Posted';

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.gray }}>
      <View style={[styles.header, { backgroundColor: themeColors.background, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}> 
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Back button pressed');
              if (router.canGoBack()) {
                router.back();
              } else {
                console.log('Cannot go back, navigating to /feed as fallback.');
                router.replace('/feed'); // Fallback to feed screen
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}> 
            {request.title}
          </Text>
        </View>
        <Text style={[styles.categoryLabel, { color: colors.primary, backgroundColor: themeColors.lightPurple }]}>{request.category_display || request.category}</Text>
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
          {status === 'Past' ? status : `${urgencyLevel} Urgency`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
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
              <Text style={[styles.infoText, { color: colors.text }]}>{location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{requiredPerson} person required</Text>
            </View>
            {(status === 'Accepted' || status === 'Completed' || isCreator) && phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={25} color={colors.text} style={styles.icon} />
                <Text style={[styles.infoText, { color: colors.text }]}>{phoneNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[
          styles.statusText, 
          { color: status === 'Past' ? '#efb034' : borderColors[status] || colors.text }
        ]}>{
          status === 'Past' 
            ? `☆ ${parseFloat(request.assignee?.rating || '0').toFixed(1)}` 
            : status
        }</Text>

        {actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : (
          !isCreator && (
            status === 'Completed' ? (
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]} 
                onPress={() => { setIsEdit(false); setModalVisible(true); }}
              >
                <Text style={styles.buttonText}>Rate & Review Requester</Text>
              </TouchableOpacity>
            ) : status === 'Past' ? (
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]} 
                onPress={() => { setIsEdit(true); setModalVisible(true); }}
              >
                <Text style={styles.buttonText}>Edit Review</Text>
              </TouchableOpacity>
            ) : ['Accepted', 'Pending'].includes(status) ? (
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: '#de3b40' }]} 
                onPress={() => Alert.alert('Cancel Volunteering', 'Are you sure you want to cancel?')}
              >
                <Text style={styles.buttonText}>Cancel Volunteering</Text>
              </TouchableOpacity>
            ) : status === 'Posted' ? (
              <TouchableOpacity
                style={[styles.volunteerButton, { backgroundColor: colors.primary }]}
                onPress={handleBeVolunteer}
              >
                <Text style={styles.buttonText}>Be Volunteer</Text>
              </TouchableOpacity>
            ) : null
          )
        )}
      </ScrollView>

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
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>{isEdit ? 'Edit Review' : 'Rate & Review Requester'}</Text>
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
                minHeight: 150,
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
              onPress={() => { setModalVisible(false); /* TODO: handle submit review for requester */ }}
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
    paddingTop: 130,
  },
  header: {
    flexDirection: 'column',
    paddingTop: 16,
    paddingBottom: 16,
    height: 130,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
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
  },
  categoryLabel: {
    textAlign: 'center',
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: '500',
    borderRadius: 7,
  },
  label: {
    textAlign: 'center',
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: '400',
    borderRadius: 7,
    width: 120,
    marginRight: 8,
  },
  requestImage: {
    width: '90%',
    alignSelf: 'center',
    height: 280,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'column',
    borderRadius: 24,
    width: '90%',
    alignSelf: 'center',
    padding: 16,
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
    backgroundColor: '#f2f2fd',
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
  },
  descriptionText: {
    flexDirection: 'row',
    fontSize: 15,
    fontWeight: '300',
    marginBottom: 16,
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
  },
  statusText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  volunteerButton: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 32,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
}); 