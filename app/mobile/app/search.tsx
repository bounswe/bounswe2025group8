import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBarWithResults, { Category, Request, Profile } from '../components/ui/SearchBarWithResults';
import { getTasks, getCategories, getUserProfile, type Task, type Category as ApiCategory, type UserProfile } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksResponse = await getTasks();
        setRequests(tasksResponse.results.map(task => ({
          id: String(task.id),
          title: task.title,
          urgency: task.urgency_level === 3 ? 'High' : task.urgency_level === 2 ? 'Medium' : 'Low',
          meta: `${task.location} • ${task.deadline}`,
          category: task.category_display || task.category,
          image: require('../assets/images/help.png'),
        })));

        // Fetch categories
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse.results.map(cat => ({
          id: cat.id,
          title: cat.name,
          image: require('../assets/images/help.png'),
          count: cat.task_count,
        })));

        // Fetch current user profile from AsyncStorage (or API if needed)
        const profileData = await AsyncStorage.getItem('userProfile');
        if (profileData) {
          const userProfile: UserProfile = JSON.parse(profileData);
          setProfiles([{ id: String(userProfile.id), name: userProfile.name + ' ' + userProfile.surname }]);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
        Alert.alert('Error', 'Failed to load search data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: 36, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 36 }}>
      <SearchBarWithResults
        categories={categories}
        requests={requests}
        profiles={profiles}
        onSelect={(item, tab) => {
          if (tab === 'Categories') router.push('/category/' + item.id as any);
          else if (tab === 'Requests') router.push('/request/' + item.id as any);
          else if (tab === 'Profiles') router.push('/profile/' + item.id as any);
        }}
      />
    </SafeAreaView>
  );
} 