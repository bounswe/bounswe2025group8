import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import { Ionicons } from '@expo/vector-icons';
import RequestCard from '../components/ui/RequestCard';
import { useAuth } from '../lib/auth';
import { getUserProfile, getTasks, type UserProfile, type Task } from '../lib/api';

export default function VActiveRequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>('volunteer');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getUserProfile(user.id),
      getTasks()
    ])
      .then(([profileRes, tasksRes]) => {
        setProfile(profileRes.data);
        // Filter tasks where the current user is the assignee/volunteer and status is not completed/past
        const activeRequests = tasksRes.results.filter(
          (task) => task.assignee && task.assignee.id === user.id && task.status !== 'completed' && task.status !== 'past'
        );
        setRequests(activeRequests);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.gray, flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
        <Text style={{ color: colors.text, fontSize: 18 }}>Please sign in to view your active requests.</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}> 
      {/* Top Profile */}
      {profile && (
        <ProfileTop user={profile} />
      )}

      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <TabButton
          title="Volunteer"
          isActive={activeTab === 'volunteer'}
          onPress={() => setActiveTab('volunteer')}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />
        <TabButton
          title="Requester"
          isActive={activeTab === 'requester'}
          onPress={() => {
            router.replace({ pathname: '/profile', params: { tab: 'requester' } });
          }}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}> 
          <Ionicons name="chevron-back-outline" size={25} color={colors.text} style={styles.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Active Requests</Text>
      </View>

      <View style={styles.content}>
        {requests.length === 0 ? (
          <Text style={{ color: colors.text, marginTop: 24 }}>No active requests found.</Text>
        ) : (
          requests.map((req, idx) => (
            <RequestCard
              key={req.id}
              title={req.title}
              imageUrl={req.photo || 'https://placehold.co/80x80'}
              category={req.category_display || req.category}
              urgencyLevel={req.urgency_level === 3 ? 'High' : req.urgency_level === 2 ? 'Medium' : req.urgency_level === 1 ? 'Low' : 'Medium'}
              status={req.status_display || req.status}
              distance={req.location || 'N/A'}
              time={req.deadline ? new Date(req.deadline).toLocaleDateString() : ''}
              onPress={() => router.push({ pathname: './v-request-details', params: { id: req.id } })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 8,
    padding: 2,
    backgroundColor: 'red',
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  icon: {
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 