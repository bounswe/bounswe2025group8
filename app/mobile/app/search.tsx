import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBarWithResults, { Category, Request, Profile, Location } from '../components/ui/SearchBarWithResults';
import { getTasks, searchUsers, type Task, type Category as ApiCategory, type UserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Filter out completed and cancelled tasks
  const filterActiveTasks = (tasksList: Task[]): Task[] => {
    return tasksList.filter(task => {
      const status = task.status?.toUpperCase() || '';
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksResponse = await getTasks();
        const fetchedTasks = tasksResponse.results || [];
        const activeTasks = filterActiveTasks(fetchedTasks);
        setAllTasks(activeTasks);
        setRequests(
          activeTasks.map((task) => ({
            id: String(task.id),
            title: task.title,
            urgency: task.urgency_level === 3 ? 'High' : task.urgency_level === 2 ? 'Medium' : 'Low',
            meta: `${task.location} • ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}`,
            category: task.category_display || task.category,
            image: require('../assets/images/help.png'),
          }))
        );

        if (activeTasks.length > 0) {
          const uniqueCategoriesMap = new Map<string, Category>();
          activeTasks.forEach((task) => {
            if (task.category && task.category_display) {
              if (!uniqueCategoriesMap.has(task.category)) {
                uniqueCategoriesMap.set(task.category, {
                  id: task.category,
                  title: task.category_display,
                  image: require('../assets/images/help.png'),
                  count: activeTasks.filter((t) => t.category === task.category).length,
                });
              }
            }
          });
          setCategories(Array.from(uniqueCategoriesMap.values()));

          const uniqueLocationsMap = new Map<string, Location>();
          activeTasks.forEach((task) => {
            if (task.location) {
              if (!uniqueLocationsMap.has(task.location)) {
                uniqueLocationsMap.set(task.location, {
                  id: task.location,
                  title: task.location,
                  image: require('../assets/images/help.png'),
                  count: activeTasks.filter((t) => t.location === task.location).length,
                });
              }
            }
          });
          setLocations(Array.from(uniqueLocationsMap.values()));
        } else {
          setCategories([]);
          setLocations([]);
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
        setLocations([]);
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
        locations={locations}
        onSelect={(item, type: string) => {
          let mappedType: 'category' | 'request' | 'profile' | 'location' = type as any;
          if (type === 'Categories') mappedType = 'category';
          else if (type === 'Requests') mappedType = 'request';
          else if (type === 'Profiles') mappedType = 'profile';
          else if (type === 'Locations') mappedType = 'location';
          if (mappedType === 'category') router.push(('/category/' + item.id) as any);
          else if (mappedType === 'request') {
            // Find the full task object to check if user is creator
            const task = allTasks.find(t => String(t.id) === String(item.id));
            if (task && task.creator && task.creator.id === user?.id) {
              router.push({ pathname: '/r-request-details', params: { id: item.id } });
            } else {
              router.push({ pathname: '/v-request-details', params: { id: item.id } });
            }
          }
          else if (mappedType === 'profile')
            router.push({ pathname: '/profile', params: { userId: item.id } });
          else if (mappedType === 'location') {
            // Navigate to requests page filtered by location
            router.push({ pathname: '/requests', params: { location: item.id } });
          }
        }}
      />
    </SafeAreaView>
  );
}
