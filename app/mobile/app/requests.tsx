// app/requests.tsx
import React, { useState, useEffect } from 'react';
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
import { getTasks, type Task } from '../lib/api';

export default function Requests() {
  const { colors } = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getUrgencyColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'urgent':
        return '#e74c3c';
      case 'medium':
        return '#f1c40f';
      case 'low':
        return '#2ecc71';
      default:
        return '#f1c40f';
    }
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
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <TouchableOpacity style={[styles.searchWrapper, { borderColor: '#CCC' }]} onPress={() => router.push('/search')}>
        <Ionicons name="search-outline" size={20} color="#888" />
        <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>What do you need help with</Text>
      </TouchableOpacity>

      {/* Title + Sort/Filter */}
      <View style={styles.titleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Requests</Text>
        <View style={styles.controlIcons}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="swap-vertical-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="filter-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/request/' + task.id as any)}
          >
            <Image source={require('../assets/images/help.png')} style={styles.cardImage} />

            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{task.title}</Text>
              <Text style={[styles.cardMeta, { color: colors.text }]}>
                {task.location} • {formatTimeAgo(task.created_at)}
              </Text>

              {/* pills row */}
              <View style={styles.pillRow}>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(task.status) }]}>
                  <Text style={styles.urgencyText} numberOfLines={1} ellipsizeMode="tail">
                    {task.status}
                  </Text>
                </View>
                <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                  <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
                    {task.category}
                  </Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/feed')}>
          <Ionicons name="home" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/categories')}>
          <Ionicons name="pricetag-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => { router.push('/create_request') }}>
          <Ionicons name="add-circle-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => { /* already here */ }}>
          <Ionicons name="list-outline" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logo: { width: 32, height: 32 },
  icons: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  controlIcons: { flexDirection: 'row' },
  controlButton: { marginLeft: 12 },

  list: { flex: 1, marginHorizontal: 16 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  cardContent: {
    flex: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '500' },
  cardMeta: { fontSize: 12, marginTop: 4 },

  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginRight: 4,
  },
  urgencyText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

  categoryPill: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginLeft: 4,
    alignSelf: 'flex-start',
  },
  categoryText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

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
});
