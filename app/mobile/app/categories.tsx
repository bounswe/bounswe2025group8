// app/categories.tsx
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
import { getCategories, type Category as ApiCategory } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Categories() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.results || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
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
        <Text style={[styles.searchInput, { color: colors.text, flex: 1 }]}>Search a Category</Text>
      </TouchableOpacity>

      {/* Category list */}
      <ScrollView 
        style={styles.list} 
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={[styles.catRow, { backgroundColor: colors.card }]} 
            onPress={() => router.push('/category/' + cat.id as any)}
          >
            <Image source={require('../assets/images/help.png')} style={styles.catImage} />
            <View>
              <Text style={[styles.catTitle, { color: colors.text }]}>{cat.name}</Text>
              <Text style={[styles.catCount, { color: colors.text }]}>{`${cat.task_count} requests`}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom navigation bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: '#ddd' }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/feed')}>
          <Ionicons name="home" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Categories</Text>
        </TouchableOpacity>
        {user ? (
          <TouchableOpacity style={styles.tabItem} onPress={() => {router.push('/create_request')}}>
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.tabItem, { opacity: 0.5 }]}> 
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.tabLabel, { color: colors.text }]}>Create</Text>
          </View>
        )}
        <TouchableOpacity style={styles.tabItem} onPress={() => {router.push('/requests') }}>
          <Ionicons name="list-outline" size={24} color={colors.text} />
          <Text style={[styles.tabLabel, { color: colors.text }]}>Requests</Text>
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  catImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  catTitle: { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  catCount: { fontSize: 12 },

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
