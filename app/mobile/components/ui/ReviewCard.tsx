import React from 'react';
import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export interface ReviewCardProps {
  reviewerName: string;
  comment: string;
  rating: number;
  timestamp: string;
  avatarUrl?: string | null;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ reviewerName, comment, rating, timestamp, avatarUrl }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.header}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : require('../../assets/images/empty_profile_photo.png')}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.reviewerName, { color: themeColors.text }]}>{reviewerName}</Text>
            <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>{timestamp}</Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[
                  styles.rating,
                  { color: star <= Math.round(rating) ? themeColors.pink : themeColors.border },
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.comment, { color: themeColors.text }]}>{comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  comment: {
    fontSize: 14,
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
});

export default ReviewCard;
