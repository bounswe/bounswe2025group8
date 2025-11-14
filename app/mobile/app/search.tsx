import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBarWithResults, { Category, Request, Profile } from '../components/ui/SearchBarWithResults';
import { getTasks, searchUsers, type Task, type Category as ApiCategory, type UserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await getTasks();
        const fetchedTasks = tasksResponse.results || [];
        setAllTasks(fetchedTasks);
        setRequests(
          fetchedTasks.map((task) => ({
            id: String(task.id),
            title: task.title,
            urgency: task.urgency_level === 3 ? 'High' : task.urgency_level === 2 ? 'Medium' : 'Low',
            meta: `${task.location} • ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}`,
            category: task.category_display || task.category,
            image: require('../assets/images/help.png'),
          }))
        );

        if (fetchedTasks.length > 0) {
          const uniqueCategoriesMap = new Map<string, Category>();
          fetchedTasks.forEach((task) => {
            if (task.category && task.category_display) {
              if (!uniqueCategoriesMap.has(task.category)) {
                uniqueCategoriesMap.set(task.category, {
                  id: task.category,
                  title: task.category_display,
                  image: require('../assets/images/help.png'),
                  count: fetchedTasks.filter((t) => t.category === task.category).length,
                });
              }
            }
          });
          setCategories(Array.from(uniqueCategoriesMap.values()));
        } else {
          setCategories([]);
        }

        if (user) {
          const usersResponse = await searchUsers();
          setProfiles(
            usersResponse.results.map((prof: UserProfile) => ({
              id: String(prof.id),
              name: `${prof.name} ${prof.surname}`,
              image: prof.photo ? { uri: prof.photo } : require('../assets/images/empty_profile_photo.png'),
            }))
          );
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error('Error loading search data:', error);
        Alert.alert('Error', 'Failed to load search data. Please try again.');
        setRequests([]);
        setCategories([]);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
        onSelect={(item, type: string) => {
          let mappedType: 'category' | 'request' | 'profile' = type as any;
          if (type === 'Categories') mappedType = 'category';
          else if (type === 'Requests') mappedType = 'request';
          else if (type === 'Profiles') mappedType = 'profile';
          if (mappedType === 'category') router.push(('/category/' + item.id) as any);
          else if (mappedType === 'request')
            router.push({ pathname: '/v-request-details', params: { id: item.id } });
          else if (mappedType === 'profile')
            router.push({ pathname: '/profile', params: { userId: item.id } });
        }}
      />
    </SafeAreaView>
  );
}
