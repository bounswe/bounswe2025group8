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
import { getTasks, getPopularTasks, getUserProfile, getTaskPhotos, BACKEND_BASE_URL, type Task, type UserProfile, type Category as ApiCategory, type Photo } from '../lib/api';
import type { ThemeTokens } from '@/constants/Colors';
import { useAuth } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Feed() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [popularTasks, setPopularTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskDerivedCategories, setTaskDerivedCategories] = useState<ApiCategory[]>([]);
  const [taskPhotos, setTaskPhotos] = useState<Map<number, Photo[]>>(new Map());
  const scrollRef = useRef<ScrollView>(null);
  const themeColors = colors as unknown as ThemeTokens;

  const formatUrgency = (level?: number) => {
    if (level === 3) return 'High';
    if (level === 2) return 'Medium';
    if (level === 1) return 'Low';
    return 'Medium';
  };

  const getUrgencyColors = (level?: number) => {
    if (level === 3) {
      return { background: themeColors.urgencyHighBackground, text: themeColors.urgencyHighText };
    }
    if (level === 1) {
      return { background: themeColors.urgencyLowBackground, text: themeColors.urgencyLowText };
    }
    return { background: themeColors.urgencyMediumBackground, text: themeColors.urgencyMediumText };
  };

  // Filter out completed and cancelled tasks
  const filterActiveTasks = (tasksList: Task[]): Task[] => {
    return tasksList.filter(task => {
      const status = task.status?.toUpperCase() || '';
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    });
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Fetch all tasks for categories
      const response = await getTasks();
      const fetchedTasks = response.results || [];
      const activeTasks = filterActiveTasks(fetchedTasks);

      // Fetch popular tasks separately
      const popular = await getPopularTasks(6);
      const activePopularTasks = filterActiveTasks(popular);

      setPopularTasks(activePopularTasks);

      // Fetch photos for popular tasks
      const photosMap = new Map<number, Photo[]>();
      await Promise.all(
        activePopularTasks.map(async (task) => {
          try {
            const photosResponse = await getTaskPhotos(task.id);
            if (photosResponse.status === 'success' && photosResponse.data.photos.length > 0) {
              photosMap.set(task.id, photosResponse.data.photos);
            }
          } catch (error) {
            // Silently fail for individual photo fetches
            console.warn(`Failed to fetch photos for task ${task.id}`);
          }
        })
      );
      setTaskPhotos(photosMap);

      if (activeTasks.length > 0) {
        const uniqueCategoriesMap = new Map<string, ApiCategory>();
        activeTasks.forEach(task => {
          if (task.category && task.category_display) {
            if (!uniqueCategoriesMap.has(task.category)) {
              uniqueCategoriesMap.set(task.category, {
                id: task.category,
                name: task.category_display,
                description: '',
                task_count: 0,
              });
            }
          }
        });
        setTaskDerivedCategories(Array.from(uniqueCategoriesMap.values()));
      } else {
        setTaskDerivedCategories([]);
      }

    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
      setTasks([]);
      setPopularTasks([]);
      setTaskDerivedCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

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
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 48, height: 48, marginRight: 12 }}
              accessibilityRole="image"
              accessibilityLabel="AccessEase logo"
            />
            <View>
              <Text style={[styles.welcomeText, { color: colors.text }]}>{user ? 'Welcome back' : 'Welcome Guest'}</Text>
            </View>
          </View>
          {/* Always show notifications and settings buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ marginRight: 12 }}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
                accessible={false}
                importantForAccessibility="no"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Open settings"
              testID="feed-settings-button"
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.text}
                accessible={false}
                importantForAccessibility="no"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* — Search bar — */}
        <TouchableOpacity
          style={[styles.searchWrapper, { borderColor: colors.border }]}
          onPress={() => router.push('/search')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Search requests and volunteers"
          testID="feed-search-bar"
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={themeColors.icon}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>What are you looking for?</Text>
        </TouchableOpacity>

        {/* — Categories — */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Popular Categories
        </Text>
        <View style={styles.categories}>
          {taskDerivedCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => router.push('/category/' + cat.id as any)}
              accessible

              accessibilityRole="button"
              accessibilityLabel={`View ${cat.name} category`}
              testID={`category-item-${cat.id}`}
            >
              <Image
                source={require('../assets/images/help.png')}
                style={styles.cardImage}
                accessibilityRole="image"
                accessibilityLabel={`${cat.name} category illustration`}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}> {cat.name} </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => router.push('/categories')}
          style={styles.seeAllLink}
          accessible

          accessibilityRole="button"
          accessibilityLabel="See all categories"
        >
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all categories</Text>
        </TouchableOpacity>

        {/* — Requests — */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Popular Requests
        </Text>
        {popularTasks.map((task) => {
          const photos = taskPhotos.get(task.id) || [];
          const primaryPhoto = photos.length > 0 ? photos[0] : null;
          const photoUrl = primaryPhoto ? (primaryPhoto.photo_url || primaryPhoto.url || primaryPhoto.image) : null;
          const absolutePhotoUrl = photoUrl && photoUrl.startsWith('http')
            ? photoUrl
            : photoUrl
              ? `${BACKEND_BASE_URL}${photoUrl}`
              : null;

          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.requestRow, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: (task.creator && task.creator.id === user?.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: task.id }
                })
              }
              accessible

              accessibilityRole="button"
              accessibilityLabel={`View details for ${task.title}`}
              testID={`request-item-${task.id}`}
            >
              <Image
                source={absolutePhotoUrl ? { uri: absolutePhotoUrl } : require('../assets/images/help.png')}
                style={styles.requestImage}
                accessibilityRole="image"
                accessibilityLabel={absolutePhotoUrl ? `Photo for ${task.title}` : `Default illustration for ${task.title}`}
              />
              <View style={styles.requestInfo}>
                <Text style={[styles.requestTitle, { color: colors.text }]}>
                  {task.title}
                </Text>
                <Text style={[styles.requestMeta, { color: colors.text }]}>
                  {task.location} • {new Date(task.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.requestCategoryRow}>
                  {(() => {
                    const urgencyLabel = formatUrgency(task.urgency_level);
                    const urgencyPalette = getUrgencyColors(task.urgency_level);
                    return (
                      <View
                        style={[
                          styles.urgencyBadge,
                          { backgroundColor: urgencyPalette.background, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.urgencyText, { color: urgencyPalette.text }]} numberOfLines={1} ellipsizeMode="tail">
                          {`${urgencyLabel} Urgency`}
                        </Text>
                      </View>
                    );
                  })()}
                  <View style={[styles.requestCategory, { borderColor: colors.border }]}>
                    <Text style={[styles.requestCategoryText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                      {task.category}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text}
                accessible={false}
                importantForAccessibility="no"
              />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => router.push('/requests')}
          style={styles.seeAllLink}
          accessible

          accessibilityRole="button"
          accessibilityLabel="See all requests"
        >
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all requests</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* — Bottom Navigation Bar — */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to top of feed"
          testID="tab-home"
        >
          <Ionicons
            name="home"
            size={24}
            color={colors.primary}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/categories')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Open categories"
          testID="tab-categories"
        >
          <Ionicons
            name="pricetag-outline"
            size={24}
            color={colors.text}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={[styles.tabLabel, { color: colors.text }]}>
            Categories
          </Text>
        </TouchableOpacity>

        {user ? (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => { router.push('/create_request'); }}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Create a new request"
            testID="tab-create"
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.text}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.tabItem, { opacity: 0.5 }]}
            disabled
            accessible

            accessibilityRole="button"
            accessibilityLabel="Create a new request (disabled when not signed in)"
            accessibilityState={{ disabled: true }}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.text}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/requests')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Open all requests"
          testID="tab-requests"
        >
          <Ionicons
            name="list-outline"
            size={24}
            color={colors.text}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/profile')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to profile"
          testID="tab-profile"
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={colors.text}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerContent: { flex: 1 },
  welcomeText: { fontSize: 14 },
  nameText: { fontSize: 18, fontWeight: '600' },
  usernameText: { fontSize: 12, fontWeight: '400' },
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
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 2 },

  seeAllLink: { alignSelf: 'flex-end', marginBottom: 16 },
  seeAllText: { fontSize: 13, fontWeight: '500' },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginRight: 4,
    borderWidth: 1,
  },
  urgencyText: { fontSize: 12, fontWeight: 'bold' },
  requestCategoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});
