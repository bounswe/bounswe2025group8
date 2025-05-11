import React, { useState } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';
import ReviewCard from '../components/ui/ReviewCard';

// --- Mock Data ---
const MOCK_USER = {
  name: 'Ashley Robinson',
  profileImageUrl: 'https://i.pravatar.cc/400?img=32', // Placeholder image
  totalRating: 4.7,
  totalReviewCount: 12,
  volunteerRating: 4.9,
  volunteerReviewCount: 3,
  requesterRating: 4.0,
  requesterReviewCount: 3,
};

const MOCK_V_ACTIVE_REQUESTS = [
  {
    title: 'Help for my math exam',
    imageUrl: 'https://images.pexels.com/photos/8472944/pexels-photo-8472944.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Tutoring',
    urgencyLevel: 'Medium',
    status: 'Rejected',
  },
  {
    title: 'I need to clean my house',
    imageUrl: 'https://images.pexels.com/photos/3787027/pexels-photo-3787027.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'House Cleaning',
    urgencyLevel: 'Low',
    status: 'Pending',
  },
  {
    title: 'Help me to see a doctor',
    imageUrl: 'https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Healthcare',
    urgencyLevel: 'High',
    status: 'Accepted',
  },
];

const MOCK_V_PAST_REQUESTS = [
  {
    title: 'Grocery shopping',
    imageUrl: 'https://images.pexels.com/photos/6508357/pexels-photo-6508357.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Shopping',
    score: 4.0,
  },
];

const MOCK_V_REVIEWS = [
  {
    author: 'Matthew Brown',
    imageUrl: 'https://i.pravatar.cc/400?img=17',
    date: '13/05/2025',
    score: 5.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Ashley Gonzalez',
    imageUrl: 'https://i.pravatar.cc/400?img=13',
    date: '08/05/2025',
    score: 3.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Jennifer Edwards',
    imageUrl: 'https://i.pravatar.cc/400?img=59',
    date: '22/12/2024',
    score: 4.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
]

const MOCK_R_ACTIVE_REQUESTS = [
  {
    title: 'I need to clean my house',
    imageUrl: 'https://images.pexels.com/photos/3787027/pexels-photo-3787027.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'House Cleaning',
    urgencyLevel: 'Low',
    status: 'Pending',
  },
];

const MOCK_R_PAST_REQUESTS = [
  {
    title: 'Need help with yard work',
    imageUrl: 'https://images.pexels.com/photos/1023234/pexels-photo-1023234.jpeg?auto=compress&cs=tinysrgb&h=350',
    category: 'Uncategorized',
    score: 5.0,
  },
  {
    title: 'I need to wash my car',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMzM4Mzh8MHwxfHNlYXJjaHwxOXx8Y2FyfGVufDB8fHx8MTc0MjgxODM5OXww&ixlib=rb-4.0.3&q=80&w=400',
    category: 'Uncategorized',
    score: 4.5,
  },
];

const MOCK_R_REVIEWS = [
  {
    author: 'Matthew Brown',
    imageUrl: 'https://i.pravatar.cc/400?img=69',
    date: '13/05/2025',
    score: 3.5,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Ashley Gonzalez',
    imageUrl: 'https://i.pravatar.cc/400?img=65',
    date: '08/05/2025',
    score: 4.5,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
  {
    author: 'Jennifer Edwards',
    imageUrl: 'https://i.pravatar.cc/400?img=44',
    date: '22/12/2024',
    score: 5.0,
    comment: 'Ashley was very helpful and kind. I would definitely recommend her to others. She helped me with my math exam. I passed with flying colors!',
  },
]

export default function ProfileScreen() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>('volunteer');
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}>

      {/* Top Profile */}
      <ProfileTop
        MOCK_USER={MOCK_USER}
      />

      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <TabButton
          title="Volunteer"
          isActive={activeTab === 'volunteer'}
          onPress={() => setActiveTab('volunteer')}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: 'transparent' }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />

        <TabButton
          title="Requester"
          isActive={activeTab === 'requester'}
          onPress={() => setActiveTab('requester')}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: 'transparent' }}
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
                imageSource={{ uri: MOCK_V_ACTIVE_REQUESTS[MOCK_V_ACTIVE_REQUESTS.length - 1].imageUrl }}
                badgeNumber={MOCK_V_ACTIVE_REQUESTS.length}
              />
            )}
            {MOCK_V_PAST_REQUESTS.length > 0 && (
              <CategoryCard
                title="Past Requests"
                imageSource={{ uri: MOCK_V_PAST_REQUESTS[MOCK_V_PAST_REQUESTS.length - 1].imageUrl }}
                badgeNumber={MOCK_V_PAST_REQUESTS.length}
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
                imageSource={{ uri: MOCK_R_ACTIVE_REQUESTS[MOCK_R_ACTIVE_REQUESTS.length - 1].imageUrl }}
                badgeNumber={MOCK_R_ACTIVE_REQUESTS.length}
              />
            )}
            {MOCK_R_PAST_REQUESTS.length > 0 && (
              <CategoryCard
                title="Past Requests"
                imageSource={{ uri: MOCK_R_PAST_REQUESTS[MOCK_R_PAST_REQUESTS.length - 1].imageUrl }}
                badgeNumber={MOCK_R_PAST_REQUESTS.length}
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