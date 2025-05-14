// app/requests.tsx
import React from 'react';
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

export default function Requests() {
  const { colors } = useTheme();
  const router = useRouter();

  // Use the back handler hook
  useBackHandler();

  const requests: Request[] = [
    {
      id: '1',
      title: 'Help me to see a doctor',
      meta: '2 km away • 3 hours ago',
      category: 'Healthcare',
      urgency: 'High',
      color: '#e74c3c',
      image: require('../assets/images/help.png'),
    },
    {
      id: '2',
      title: 'I need to clean my house',
      meta: '750 m away • 22 hours ago',
      category: 'House Cleaning',
      urgency: 'Low',
      color: '#2ecc71',
      image: require('../assets/images/help.png'),
    },
    {
      id: '3',
      title: 'Help for my math exam',
      meta: '550 m away • 10 hours ago',
      category: 'Tutoring',
      urgency: 'Medium',
      color: '#f1c40f',
      image: require('../assets/images/help.png'),
    },
    {
      id: '4',
      title: 'Grocery shopping',
      meta: '900 m away • 18 hours ago',
      category: 'Shopping',
      urgency: 'Medium',
      color: '#f1c40f',
      image: require('../assets/images/help.png'),
    },
    {
      id: '5',
      title: 'Need help with yard work',
      meta: '2.5 km away • 1 day ago',
      category: 'Uncategorized',
      urgency: 'Medium',
      color: '#f1c40f',
      image: require('../assets/images/help.png'),
    },
    {
      id: '6',
      title: 'I need to wash my car',
      meta: '650 m away • 2 days ago',
      category: 'Uncategorized',
      urgency: 'Low',
      color: '#2ecc71',
      image: require('../assets/images/help.png'),
    },
  ];
  const categories: Category[] = [];
  const profiles: Profile[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: 36 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <View style={styles.icons}>
          <TouchableOpacity>
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
      >
        {requests.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => router.push('/request/' + r.id as any)}
          >
            <Image source={typeof r.image === 'number' ? r.image : require('../assets/images/help.png')} style={styles.cardImage} />

            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{r.title}</Text>
              <Text style={[styles.cardMeta, { color: colors.text }]}>{r.meta}</Text>

              {/* pills row */}
              <View style={styles.pillRow}>
                <View style={[styles.urgencyBadge, { backgroundColor: r.color }]}>
                  <Text style={styles.urgencyText} numberOfLines={1} ellipsizeMode="tail">{r.urgency}</Text>
                </View>
                <View style={[styles.categoryPill, { backgroundColor: colors.primary }]}>
                  <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">{r.category}</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={colors.text} />
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
    flexWrap: 'wrap',
    gap: 4,
  },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  urgencyText: { 
    fontSize: 11, 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  categoryText: { 
    fontSize: 11, 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
