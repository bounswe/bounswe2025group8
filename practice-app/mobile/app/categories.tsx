// app/categories.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Category, Request, Profile } from '../components/ui/SearchBarWithResults';
import { BottomBar } from '../components/ui/BottomBar';
import { useBackHandler } from '../hooks/useBackHandler';

export default function Categories() {
  const { colors } = useTheme();
  const router = useRouter();

  // Use the back handler hook
  useBackHandler();

  const categories: Category[] = [
    { id: '1', title: 'House Cleaning', image: require('../assets/images/house_cleaning.png'), count: 21 },
    { id: '2', title: 'Healthcare',     image: require('../assets/images/healthcare.png'), count: 15 },
    { id: '3', title: 'Tutoring',       image: require('../assets/images/tutoring.png'), count: 12 },
    { id: '4', title: 'Shopping',       image: require('../assets/images/shopping.png'), count: 9  },
    { id: '5', title: 'Car Driver',     image: require('../assets/images/car_driver.png'), count: 8  },
    { id: '6', title: 'Home Repair',    image: require('../assets/images/home_repair.png'), count: 5  },
    { id: '7', title: 'Car Repair',     image: require('../assets/images/car_repair.png'), count: 3  },
  ];
  const requests: Request[] = [];
  const profiles: Profile[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: 36 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <View style={styles.icons}>
          <TouchableOpacity><Ionicons name="notifications-outline" size={24} color={colors.text} /></TouchableOpacity>
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
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 80 }}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.catRow, { backgroundColor: colors.card }]} onPress={() => router.push('/category/' + cat.id as any)}>
            <Image source={cat.image} style={styles.catImage} />
            <View>
              <Text style={[styles.catTitle, { color: colors.text }]}>{cat.title}</Text>
              <Text style={[styles.catCount, { color: colors.text }]}>{`${cat.count} requests`}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomBar />
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
});
