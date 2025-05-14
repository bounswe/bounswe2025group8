import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { MOCK_V_ACTIVE_REQUESTS, MOCK_V_PAST_REQUESTS, MOCK_R_ACTIVE_REQUESTS, MOCK_R_PAST_REQUESTS } from './profile';
import { Ionicons } from '@expo/vector-icons';

const MOCK_MAP: Record<string, any[]> = {
  MOCK_V_ACTIVE_REQUESTS,
  MOCK_V_PAST_REQUESTS,
  MOCK_R_ACTIVE_REQUESTS,
  MOCK_R_PAST_REQUESTS,
};

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

  const arrayName = params.arrayName as string;
  const index = typeof params.index === 'string' ? parseInt(params.index, 10) : Number(params.index);
  const requestsArray = MOCK_MAP[arrayName];
  const request = requestsArray && !isNaN(index) ? requestsArray[index] : null;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}>
      <View style={[styles.topContainer, { backgroundColor: themeColors.background }]}>

        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {request ? request.title : 'Request Details'}
          </Text>
        </View>

        <Text style={[styles.categoryLabel, { color: colors.primary, backgroundColor: themeColors.lightPurple }]}>{request.category}</Text>


        {/* Urgency Level Label */}
        <Text
          style={[
            styles.label,
            {
              color: textColors[request.urgencyLevel] || '#fff',
              backgroundColor: backgroundColors[request.urgencyLevel] || '#9095a0',
              borderColor: borderColors[request.urgencyLevel] || '#9095a0',
              borderWidth: 1,
            },
          ]}
        >
          {request.urgencyLevel === 'Past' ? request.urgencyLevel : `${request.urgencyLevel} Urgency`}
        </Text>

      </View>

      {/* Request Image */}
      {request?.imageUrl && (
        <Image
          source={{ uri: request.imageUrl }}
          style={styles.requestImage}
          resizeMode="cover"
        />
      )}

      {/* Request Details */}
      <View style={[styles.detailsContainer, { backgroundColor: themeColors.background }]}>
        <View style={styles.avatarRow}>
          <Image
            source={{ uri: request.requester.profileImageUrl }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: colors.text }]}>{request.requester.name}</Text>

        </View>
        <Text style={[styles.descriptionText, { color: colors.text }]}>{request.desc}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={25} color={colors.text} style={styles.icon} />
            <Text style={[styles.infoText, { color: colors.text }]}>{request.datetime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={25} color={colors.text} style={styles.icon} />
            <Text style={[styles.infoText, { color: colors.text }]}>{request.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={25} color={colors.text} style={styles.icon} />
            <Text style={[styles.infoText, { color: colors.text }]}>{request.requiredPerson} person required</Text>
          </View>
        </View>
      </View>

      {/* Show statusText always */}
      <Text style={[
        styles.statusText, 
        { color: request.urgencyLevel === 'Past' ? '#efb034' : borderColors[request.status] }
      ]}>{
        request.urgencyLevel === 'Past' 
          ? `☆ ${parseFloat(request.status).toFixed(1)}` 
          : request.status
      }</Text>

      {/* Button logic based on request status */}
      {request && request.status !== 'Rejected' && (
        request.status === 'Completed' ? (
          <TouchableOpacity
            style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]}
            onPress={() => {/* TODO: Implement Rate & Review navigation */}}
          >
            <Text style={styles.buttonText}>Rate & Review</Text>
          </TouchableOpacity>
        ) : request.urgencyLevel === 'Past' ? (
          <TouchableOpacity
            style={[styles.volunteerButton, { backgroundColor: themeColors.pink }]}
            onPress={() => {/* TODO: Implement Edit Rate & Review navigation */}}
          >
            <Text style={styles.buttonText}>Edit Rate & Review</Text>
          </TouchableOpacity>
        ) : ['Accepted', 'Pending'].includes(request.status) ? (
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

      {!request && (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 24 }}>Request not found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
  },
  topContainer: {
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
    lineHeight: 20,
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