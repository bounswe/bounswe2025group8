// app/feed.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category, Request, Profile } from '../components/ui/SearchBarWithResults';
import { getTasks, getUserProfile, type Task, type UserProfile } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Feed() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const fetchUserProfile = async () => {
    try {
      if (user?.id) {
        const response = await getUserProfile(user.id);
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.results || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUserProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
    fetchUserProfile();
  };

  // Get unique categories from tasks
  const categories = Array.from(new Set(tasks.map(task => task.category))).map((category, index) => ({
    id: String(index + 1),
    title: category,
    count: tasks.filter(task => task.category === category).length,
    image: require('../assets/images/help.png') // Default image for now
  }));

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: 36 }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* — Header — */}
        <View style={styles.header}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning!
            </Text>
            <Text style={[styles.username, { color: colors.text }]}>
              {userProfile ? `${userProfile.name} ${userProfile.surname}` : 'User'}
            </Text>
          </View>
          <Image source={require('../assets/images/empty_profile_photo.png')} style={styles.profileImage} />
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => {/* bell action */}}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* — Search bar — */}
        <TouchableOpacity style={[styles.searchWrapper, { borderColor: '#CCC' }]} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>What do you need help with</Text>
        </TouchableOpacity>

        {/* — Categories — */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Popular Categories
        </Text>
        <View style={styles.categories}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => router.push('/category/' + cat.id as any)}
            >
              <Image source={cat.image} style={styles.cardImage} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => router.push('/categories')} style={styles.seeAllLink}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all categories</Text>
        </TouchableOpacity>

        {/* — Requests — */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Popular Requests
        </Text>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.requestRow, { backgroundColor: colors.card }]}
            onPress={() => router.push('/request/' + task.id as any)}
          >
            <Image source={require('../assets/images/help.png')} style={styles.requestImage} />
            <View style={styles.requestInfo}>
              <Text style={[styles.requestTitle, { color: colors.text }]}>
                {task.title}
              </Text>
              <Text style={[styles.requestMeta, { color: colors.text }]}>
                {task.location} • {new Date(task.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.requestCategoryRow}>
                <View style={[styles.urgencyBadge, { backgroundColor: task.status === 'urgent' ? '#e74c3c' : task.status === 'medium' ? '#f1c40f' : '#2ecc71' }]}> 
                  <Text style={styles.urgencyText} numberOfLines={1} ellipsizeMode="tail">
                    {task.status}
                  </Text>
                </View>
                <View style={styles.requestCategory}>
                  <Text style={[styles.requestCategoryText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                    {task.category}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => router.push('/requests')} style={styles.seeAllLink}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all requests</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* — Bottom Navigation Bar — */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
        >
          <Ionicons name="home" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/categories')}
        >
          <Ionicons name="pricetag-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>
            Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {router.push('/create_request')}}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/requests')}
        >
          <Ionicons name="list-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 32, height: 32, marginRight: 8 },
  headerText: { flex: 1 },
  greeting: { fontSize: 14 },
  username: { fontSize: 18, fontWeight: '600' },
  profileImage: { width: 32, height: 32, borderRadius: 16, marginLeft: 8 },
  icons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 24,
  },
  searchInput: { flex: 1, marginLeft: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: { width: '100%', height: 100 },
  cardTitle: { padding: 8, fontSize: 14, fontWeight: '500' },

  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  requestImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  requestInfo: { flex: 1 },
  requestTitle: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  requestMeta: { fontSize: 12, marginBottom: 6 },
  requestCategory: { alignSelf: 'flex-start', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 2, marginLeft: 4 },
  requestCategoryText: { fontSize: 12, fontWeight: 'bold' },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 2 },

  seeAllLink: { alignSelf: 'flex-end', marginBottom: 16 },
  seeAllText: { fontSize: 13, fontWeight: '500' },
  urgencyBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 2, alignSelf: 'flex-start', marginRight: 4 },
  urgencyText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  requestCategoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});
