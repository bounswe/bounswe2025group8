import React, { useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';
import { useRouter, useLocalSearchParams } from 'expo-router';

// --- Mock Data ---
export const MOCK_USER = {
  name: 'Ashley Robinson',
  profileImageUrl: 'https://cdn.visily.ai/app/avatars/v1/big-size/F.png', // Placeholder image
  totalRating: 4.7,
  totalReviewCount: 12,
  volunteerRating: 4.9,
  volunteerReviewCount: 3,
  requesterRating: 4.0,
  requesterReviewCount: 3,
};

export const MOCK_V_ACTIVE_REQUESTS = [
  {
    requester: MOCK_USER,
    title: 'Help me to open a bank account',
    desc: 'I need help to open a bank account. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '1 km away',
    time: '1 day ago',
    imageUrl: 'https://images.pexels.com/photos/2988232/pexels-photo-2988232.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Healthcare',
    urgencyLevel: 'High',
    status: 'Completed',
  },
  {
    requester: MOCK_USER,
    title: 'Help me to see a doctor',
    desc: 'I need help to see a doctor. I have a headache and I need someone to take me to the hospital.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '2 km away',
    time: '3 hours ago',
    imageUrl: 'https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Healthcare',
    urgencyLevel: 'High',
    status: 'Accepted',
  },
  {
    requester: MOCK_USER,
    title: 'I need to clean my house',
    desc: 'I need help to clean my house. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '750 m away',
    time: '22 hours ago',
    imageUrl: 'https://images.pexels.com/photos/3787027/pexels-photo-3787027.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'House Cleaning',
    urgencyLevel: 'Low',
    status: 'Pending',
  },
  {
    requester: MOCK_USER,
    title: 'Help for my math exam',
    desc: 'I need help for my math exam. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '550 m away',
    time: '10 hours ago',
    imageUrl: 'https://images.pexels.com/photos/8472944/pexels-photo-8472944.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Tutoring',
    urgencyLevel: 'Medium',
    status: 'Rejected',
  },
];

export const MOCK_V_PAST_REQUESTS = [
  {
    requester: MOCK_USER,
    title: 'Grocery shopping',
    desc: 'I need help with grocery shopping. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '900 m away',
    time: '18 hours ago',
    imageUrl: 'https://images.pexels.com/photos/6508357/pexels-photo-6508357.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Shopping',
    urgencyLevel: 'Past',
    status: 4.0,
  },
];

const MOCK_V_REVIEWS = [
  {
    author: 'Matthew Brown',
    imageUrl: 'https://i.pravatar.cc/400?img=17',
    date: '13/05/2025',
    score: 5.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Ashley Gonzalez',
    imageUrl: 'https://i.pravatar.cc/400?img=13',
    date: '08/05/2025',
    score: 3.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors! Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Jennifer Edwards',
    imageUrl: 'https://i.pravatar.cc/400?img=59',
    date: '22/12/2024',
    score: 4.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors! Ashley was very helpful and kind. I would definitely recommend her to other.',
  },
]

export const MOCK_R_ACTIVE_REQUESTS = [
  {
    requester: MOCK_USER,
    title: 'Help for my science course',
    desc: 'I need help for my science course. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '850 m away',
    time: '1 day ago',
    imageUrl: 'https://images.pexels.com/photos/8472944/pexels-photo-8472944.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Tutoring',
    urgencyLevel: 'Medium',
    status: 'Completed',
  },
  {
    requester: MOCK_USER,
    title: 'I need to clean my house',
    desc: 'I need help to clean my house. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '750 m away',
    time: '22 hours ago',
    imageUrl: 'https://images.pexels.com/photos/3787027/pexels-photo-3787027.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'House Cleaning',
    urgencyLevel: 'Low',
    status: 'Pending',
  },
];

export const MOCK_R_PAST_REQUESTS = [
  {
    requester: MOCK_USER,
    title: 'Need help with yard work',
    desc: 'I need help with yard work. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '2.5 km away',
    time: '1 day ago',
    imageUrl: 'https://images.pexels.com/photos/1023234/pexels-photo-1023234.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Uncategorized',
    urgencyLevel: 'Past',
    status: 5.0,
  },
  {
    requester: MOCK_USER,
    title: 'I need to wash my car',
    desc: 'I need help to wash my car. I have a lot of things to do and I need someone to help me.',
    datetime: 'May 16, 2025 - 16.30 PM',
    location: '848 King Street, Denver, CO 80204',
    requiredPerson: 1,
    distance: '650 m away',
    time: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMzM4Mzh8MHwxfHNlYXJjaHwxOXx8Y2FyfGVufDB8fHx8MTc0MjgxODM5OXww&ixlib=rb-4.0.3&q=80&w=400',
    category: 'Uncategorized',
    urgencyLevel: 'Past',
    status: 4.5,
  },
];

const MOCK_R_REVIEWS = [
  {
    author: 'Matthew Brown',
    imageUrl: 'https://i.pravatar.cc/400?img=69',
    date: '13/05/2025',
    score: 3.5,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors! Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Ashley Gonzalez',
    imageUrl: 'https://i.pravatar.cc/400?img=65',
    date: '08/05/2025',
    score: 4.5,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors! Ashley was very helpful and kind. I would definitely recommend her to other.',
  },
  {
    author: 'Jennifer Edwards',
    imageUrl: 'https://i.pravatar.cc/400?img=44',
    date: '22/12/2024',
    score: 5.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to other. She helped me with my math exam. I passed with flying colors!',
  },
]

export default function ProfileScreen() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const params = useLocalSearchParams();
  const initialTab = params.tab === 'requester' ? 'requester' : 'volunteer';
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>(initialTab);
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}>

      {/* Top Profile */}
      <ProfileTop MOCK_USER={MOCK_USER}/>

      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <TabButton
          title="Volunteer"
          isActive={activeTab === 'volunteer'}
          onPress={() => {
            router.replace({ pathname: '/profile', params: { tab: 'volunteer' } });
          }}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />

        <TabButton
          title="Requester"
          isActive={activeTab === 'requester'}
          onPress={() => {
            router.replace({ pathname: '/profile', params: { tab: 'requester' } });
          }}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />
      </View>

      {/* Category Cards */}
      {activeTab === 'volunteer' ? (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.cardContainer}>
            {MOCK_V_ACTIVE_REQUESTS.length > 0 && (
              <CategoryCard
                title="Active Requests"
                imageSource={{ uri: MOCK_V_ACTIVE_REQUESTS[0].imageUrl }}
                badgeNumber={MOCK_V_ACTIVE_REQUESTS.length}
                onPress={() => router.push('/v-active-requests')}
              />
            )}
            {MOCK_V_PAST_REQUESTS.length > 0 && (
              <CategoryCard
                title="Past Requests"
                imageSource={{ uri: MOCK_V_PAST_REQUESTS[0].imageUrl }}
                badgeNumber={MOCK_V_PAST_REQUESTS.length}
                onPress={() => router.push('/v-past-requests')}
              />
            )}
          </View>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <View style={styles.cardContainer}>
            {MOCK_R_ACTIVE_REQUESTS.length > 0 && (
              <CategoryCard
                title="Active Requests"
                imageSource={{ uri: MOCK_R_ACTIVE_REQUESTS[0].imageUrl }}
                badgeNumber={MOCK_R_ACTIVE_REQUESTS.length}
                onPress={() => router.push('/r-active-requests')}
              />
            )}
            {MOCK_R_PAST_REQUESTS.length > 0 && (
              <CategoryCard
                title="Past Requests"
                imageSource={{ uri: MOCK_R_PAST_REQUESTS[0].imageUrl }}
                badgeNumber={MOCK_R_PAST_REQUESTS.length}
                onPress={() => router.push('/r-past-requests')}
              />
            )}
          </View>
        </View>
      )}

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={[styles.reviewsTitle, { color: colors.text }]}>Reviews</Text>
        <RatingPill
          rating={activeTab === 'volunteer' ? MOCK_USER.volunteerRating : MOCK_USER.requesterRating}
          reviewCount={activeTab === 'volunteer' ? MOCK_USER.volunteerReviewCount : MOCK_USER.requesterReviewCount}
          backgroundColor={themeColors.lightPink}
          textColor={themeColors.pink}
          iconColor={themeColors.pink}
        />
      </View>

      {/* Review Cards */}
      <View>
        {(activeTab === 'volunteer' ? MOCK_V_REVIEWS : MOCK_R_REVIEWS).map((review, idx) => (
          <ReviewCard
            key={idx}
            author={review.author}
            imageUrl={review.imageUrl}
            score={review.score}
            comment={review.comment}
            date={review.date}
          />
        ))}
        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 8, marginBottom: 16 }}
          onPress={() => { /* TODO: Implement navigation to all reviews */ }}
        >
          <Text style={{ color: colors.primary, fontWeight: '500', fontSize: 15, textAlign: 'center', marginBottom: 16 }}>
            See all reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add more content here if needed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  reviewsSection: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
  },
  reviewsTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 10,
  },
}); 