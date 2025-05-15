import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTasks, type Task } from '../lib/api';

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

  const id = params.id ? Number(params.id) : null;
  const [request, setRequest] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
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
  }, [id]);

  const handleStarPress = (star: number) => setRating(star);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 40 }} />;
  }
  if (error || !request) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 24 }}>{error || 'Request not found.'}</Text>;
  }

  // Map API fields to UI fields
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

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.gray }}>
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: themeColors.background, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}> 
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}> 
            {request.title}
          </Text>
        </View>
        <Text style={[styles.categoryLabel, { color: colors.primary, backgroundColor: themeColors.lightPurple }]}>{request.category_display || request.category}</Text>
        {/* Urgency Level Label */}
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

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Request Image */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.requestImage}
            resizeMode="cover"
          />
        )}

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
              <Text style={[styles.infoText, { color: colors.text }]}>{location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={25} color={colors.text} style={styles.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{requiredPerson} person required</Text>
            </View>
            {['Accepted', 'Completed'].includes(status) && phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={25} color={colors.text} style={styles.icon} />
                <Text style={[styles.infoText, { color: colors.text }]}>{phoneNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Show statusText always */}
        <Text style={[
          styles.statusText, 
          { color: status === 'Past' ? '#efb034' : borderColors[status] }
        ]}>{
          status === 'Past' 
            ? `☆ ${parseFloat(status).toFixed(1)}` 
            : status
        }</Text>

        {/* Button logic based on request status */}
        {status !== 'Rejected' && (
          status === 'Completed' ? (
            <TouchableOpacity
              style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]} 
              onPress={() => { setIsEdit(false); setModalVisible(true); }}
            >
              <Text style={styles.buttonText}>Rate & Review</Text>
            </TouchableOpacity>
          ) : status === 'Past' ? (
            <TouchableOpacity
              style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]} 
              onPress={() => { setIsEdit(true); setModalVisible(true); }}
            >
              <Text style={styles.buttonText}>Edit Rate & Review</Text>
            </TouchableOpacity>
          ) : ['Accepted', 'Pending'].includes(status) ? (
            <TouchableOpacity
              style={[styles.volunteerButton, { backgroundColor: '#de3b40' }]} 
              onPress={() => {/* TODO: Implement Cancel Volunteering logic */}}
            >
              <Text style={styles.buttonText}>Cancel Volunteering</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.volunteerButton, { backgroundColor: colors.primary }]} 
              onPress={() => {/* TODO: Implement Be Volunteer logic */}}
            >
              <Text style={styles.buttonText}>Be Volunteer</Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Place the popup just above the Rate & Review button by using absolute positioning and measuring the button's position */}
      {modalVisible && (
        <View style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          // Place the popup above the button
          bottom: 10, // Adjust as needed to be just above the button
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
                minHeight: 260,
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
              onPress={() => { setModalVisible(false); /* handle submit here */ }}
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
    // line space
    
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