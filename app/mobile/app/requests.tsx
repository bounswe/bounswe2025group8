// app/requests.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTasks, getTaskPhotos, BACKEND_BASE_URL, type Task, type Photo } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useAppTheme } from '../theme/ThemeProvider';
import { locationMatches, normalizedLocationLabel } from '../utils/address';

export default function Requests() {
  const { colors } = useTheme();
  const { tokens: themeColors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskPhotos, setTaskPhotos] = useState<Map<number, Photo[]>>(new Map());
  
  const locationLabel = (Array.isArray(params.location) ? params.location[0]?.trim() : params.location)?.trim() || undefined;

  // Filter out completed and cancelled tasks
  const filterActiveTasks = (tasksList: Task[]): Task[] => {
    return tasksList.filter(task => {
      const status = task.status?.toUpperCase() || '';
      return status !== 'COMPLETED' && status !== 'CANCELLED';
    });
  };

  const fetchTasks = async () => {
    try {
      const response = await getTasks();
      const fetchedTasks = response.results || [];
      const activeTasks = filterActiveTasks(fetchedTasks);
      
      // Filter by location if location parameter is provided
      let filteredTasks = activeTasks;
      if (locationLabel) {
        filteredTasks = activeTasks.filter(task => normalizedLocationLabel(task.location) === locationLabel);
      }
      
      setTasks(filteredTasks);

      // Fetch photos for filtered tasks
      const photosMap = new Map<number, Photo[]>();
      await Promise.all(
        filteredTasks.map(async (task) => {
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
  }, [locationLabel]);

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

  const getStatusPalette = (status?: string) => {
    const normalized = (status || '').toLowerCase();

    if (normalized.includes('urgent') || normalized.includes('high')) {
      return { background: themeColors.urgencyHighBackground, text: themeColors.urgencyHighText };
    }
    if (normalized.includes('medium')) {
      return { background: themeColors.urgencyMediumBackground, text: themeColors.urgencyMediumText };
    }
    if (normalized.includes('low')) {
      return { background: themeColors.urgencyLowBackground, text: themeColors.urgencyLowText };
    }

    switch (normalized) {
      case 'posted':
        return { background: themeColors.statusPostedBackground, text: themeColors.statusPostedText };
      case 'assigned':
        return { background: themeColors.statusAssignedBackground, text: themeColors.statusAssignedText };
      case 'in_progress':
      case 'in progress':
        return { background: themeColors.statusInProgressBackground, text: themeColors.statusInProgressText };
      case 'completed':
        return { background: themeColors.statusCompletedBackground, text: themeColors.statusCompletedText };
      case 'cancelled':
        return { background: themeColors.statusCancelledBackground, text: themeColors.statusCancelledText };
      case 'expired':
        return { background: themeColors.statusExpiredBackground, text: themeColors.statusExpiredText };
      default:
        return { background: themeColors.statusGenericBackground, text: themeColors.statusGenericText };
    }
  };

  const formatStatusLabel = (status?: string, display?: string) => {
    const base = display || status || 'Status';
    return base
      .toLowerCase()
      .split(/[\s_]+/)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: 36 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text}  accessible={false} importantForAccessibility="no"/>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text}  accessible={false} importantForAccessibility="no"/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchWrapper, { borderColor: colors.border }]}
        onPress={() => router.push('/search')}
        accessible

        accessibilityRole="button"
        accessibilityLabel="Search requests"
      >
        <Ionicons name="search-outline" size={20} color={themeColors.icon} />
        <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>What do you need help with</Text>
      </TouchableOpacity>

      {/* Title + Sort/Filter */}
      <View style={styles.titleRow}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {locationLabel ? `Requests in ${locationLabel}` : 'All Requests'}
          </Text>
          {locationLabel && (
            <TouchableOpacity
              onPress={() => router.replace('/requests')}
              style={{ marginLeft: 8, padding: 4 }}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Clear location filter"
            >
              <Ionicons name="close-circle" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.controlIcons}>
          <TouchableOpacity
            style={styles.controlButton}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Sort requests"
          >
            <Ionicons name="swap-vertical-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Filter requests"
          >
            <Ionicons name="filter-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tasks.map((task) => {
          const statusPalette = getStatusPalette(task.status_display || task.status);
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
              style={[styles.card, { backgroundColor: colors.card, shadowColor: themeColors.overlay }]}
              onPress={() =>
                router.push({
                  pathname: (task.creator && task.creator.id === user?.id) ? '/r-request-details' : '/v-request-details',
                  params: { id: task.id },
                })
              }
              accessible

              accessibilityRole="button"
              accessibilityLabel={`View request ${task.title}`}
            >
              <Image 
                source={absolutePhotoUrl ? { uri: absolutePhotoUrl } : require('../assets/images/help.png')} 
                style={styles.cardImage}
                accessibilityRole="image"
                accessibilityLabel={absolutePhotoUrl ? `Photo for ${task.title}` : `Default illustration for ${task.title}`}
              />

              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{task.title}</Text>
                <Text style={[styles.cardMeta, { color: colors.text }]}>{`${normalizedLocationLabel(task.location)} • ${formatTimeAgo(task.created_at)}`}</Text>

                <View style={styles.pillRow}>
                  <View
                    style={[
                      styles.urgencyBadge,
                      { backgroundColor: statusPalette.background, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.urgencyText, { color: statusPalette.text }]} numberOfLines={1} ellipsizeMode="tail">
                      {formatStatusLabel(task.status, task.status_display)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.categoryPill,
                      { backgroundColor: themeColors.lightPurple, borderColor: themeColors.primary },
                    ]}
                  >
                    <Text style={[styles.categoryText, { color: themeColors.primary }]} numberOfLines={1} ellipsizeMode="tail">
                      {task.category_display || task.category}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace('/feed')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to home feed"
        >
          <Ionicons name="home" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/categories')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Browse categories"
        >
          <Ionicons name="pricetag-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Categories</Text>
        </TouchableOpacity>
        {user ? (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/create_request')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Create a new request"
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.tabItem, { opacity: 0.5 }]}
            disabled
            accessible

            accessibilityRole="button"
            accessibilityLabel="Create a new request (disabled when signed out)"
            accessibilityState={{ disabled: true }}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.tabItem}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Current tab requests"
          accessibilityState={{ selected: true }}
        >
          <Ionicons name="list-outline" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/profile')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to profile"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  logo: { width: 32, height: 32 },
  icons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    margin: 16,
    marginBottom: 8,
  },
  searchInput: { flex: 1, marginLeft: 8 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  controlIcons: { flexDirection: 'row' },
  controlButton: { marginLeft: 12 },

  list: { paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginRight: 8,
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryPill: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 2 },
});
