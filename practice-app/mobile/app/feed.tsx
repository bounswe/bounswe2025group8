// app/feed.tsx
import React, { useRef, useState } from 'react';
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

export default function Feed() {
  const { colors } = useTheme();
  const router = useRouter();

  // ref for ScrollView
  const scrollRef = useRef<ScrollView>(null);

  // alphabetic categories
  const categories: Category[] = [
    { id: '1', title: 'House Cleaning', count: 21, image: require('../assets/images/house_cleaning.png') },
    { id: '2', title: 'Healthcare', count: 15, image: require('../assets/images/healthcare.png') },
    { id: '3', title: 'Tutoring', count: 12, image: require('../assets/images/tutoring.png') },
    { id: '4', title: 'Shopping', count: 9, image: require('../assets/images/shopping.png') },
  ];

  // simple request list
  const requests: Request[] = [
    { id: 'a', title: 'Help for my math exam', urgency: 'Medium', meta: '550 m • 10 hours ago', category: 'Tutoring', image: require('../assets/images/help.png') },
    { id: 'b', title: 'Help me see a doctor', urgency: 'High', meta: '2 km • 3 hours ago', category: 'Healthcare', image: require('../assets/images/help.png') },
    { id: 'c', title: 'I need to clean my house', urgency: 'Low', meta: '750 m • 22 hours ago', category: 'House Cleaning', image: require('../assets/images/help.png') },
  ];

  const profiles: Profile[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: 36 }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        {/* — Header — */}
        <View style={styles.header}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good morning!
            </Text>
            <Text style={[styles.username, { color: colors.text }]}>
              Batuhan Buber
            </Text>
          </View>
          <Image source={require('../assets/images/empty_profile_photo.png')} style={styles.profileImage} />
          <View style={styles.icons}>
            <TouchableOpacity onPress={() => {/* bell action */}}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {/* settings action */}}>
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
        {requests.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.requestRow, { backgroundColor: colors.card }]}
            onPress={() => router.push('/request/' + r.id as any)}
          >
            <Image source={typeof r.image === 'number' ? r.image : require('../assets/images/help.png')} style={styles.requestImage} />
            <View style={styles.requestInfo}>
              <Text style={[styles.requestTitle, { color: colors.text }]}>
                {r.title}
              </Text>
              <Text style={[styles.requestMeta, { color: colors.text }]}>
                {r.meta}
              </Text>
              <View style={styles.requestCategoryRow}>
                <View style={[styles.urgencyBadge, { backgroundColor: r.category === 'Healthcare' ? '#e74c3c' : r.category === 'Tutoring' ? '#f1c40f' : '#2ecc71' }]}> 
                  <Text style={styles.urgencyText} numberOfLines={1} ellipsizeMode="tail">
                    {r.category === 'Healthcare' ? 'High Urgency' : r.category === 'Tutoring' ? 'Medium Urgency' : 'Low Urgency'}
                  </Text>
                </View>
                <View style={styles.requestCategory}>
                  <Text style={[styles.requestCategoryText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                    {r.category}
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
            // scroll to top instead of re-navigating
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
          onPress={() => {/* TODO: router.push('/create') */}}
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
          onPress={() => {/* TODO: router.push('/profile') */}}
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
