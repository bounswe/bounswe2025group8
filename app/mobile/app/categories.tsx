// app/categories.tsx
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
import { useRouter } from 'expo-router';
import { getTasks, type Task, type Category as ApiCategory } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Categories() {
  const { colors } = useTheme();
  const themeColors = colors as any; // Cast to any to access custom theme properties
  const router = useRouter();
  const { user } = useAuth();
  const [derivedCategories, setDerivedCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasksAndDeriveCategories = async () => {
    setLoading(true);
    try {
      const response = await getTasks();
      const fetchedTasks = response.results || [];

      if (fetchedTasks.length > 0) {
        const uniqueCategoriesMap = new Map<string, ApiCategory>();
        fetchedTasks.forEach((task: Task) => {
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
        setDerivedCategories(Array.from(uniqueCategoriesMap.values()));
      } else {
        setDerivedCategories([]);
      }
    } catch (error) {
      console.error('Error fetching tasks for categories page:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
      setDerivedCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasksAndDeriveCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasksAndDeriveCategories();
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
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        {/* Always show notifications and settings buttons */}
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} accessible={false} importantForAccessibility="no" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} accessible={false} importantForAccessibility="no" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchWrapper, { borderColor: colors.border }]}
        onPress={() => router.push('/search')}
        accessible

        accessibilityRole="button"
        accessibilityLabel="Search categories"
        testID="categories-search-bar"
      >
        <Ionicons name="search-outline" size={20} color={themeColors.icon} />
        <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>Search a Category</Text>
      </TouchableOpacity>

      {/* Category list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {derivedCategories.length === 0 && !loading && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
            No categories found based on current tasks.
          </Text>
        )}
        {derivedCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catRow, { backgroundColor: colors.card, shadowColor: themeColors.overlay }]}
            onPress={() => router.push(('/category/' + cat.id) as any)}
            accessible

            accessibilityRole="button"
            accessibilityLabel={`Open category ${cat.name}`}
            testID={`category-item-${cat.id}`}
          >
            <Image source={require('../assets/images/help.png')} style={styles.catImage} />
            <View>
              <Text style={[styles.catTitle, { color: colors.text }]}>{cat.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom navigation bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/feed')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to home feed"
          testID="tab-home"
        >
          <Ionicons name="home" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Current tab categories"
          accessibilityState={{ selected: true }}
          testID="tab-categories"
        >
          <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Categories</Text>
        </TouchableOpacity>
        {user ? (
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/create_request')}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Create a new request"
            testID="tab-create"
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
            testID="tab-create-disabled"
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/requests')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="View all requests"
          testID="tab-requests"
        >
          <Ionicons name="list-outline" size={24} color={colors.text} />
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

  list: { paddingHorizontal: 16 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  catImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4 },
});
