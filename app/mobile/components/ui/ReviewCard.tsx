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
          <Text style={[styles.reviewerName, { color: themeColors.text }]}>{reviewerName}</Text>
          <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>{timestamp}</Text>
        </View>
      </View>
      <Text style={[styles.comment, { color: themeColors.text }]}>{comment}</Text>
      <Text style={[styles.rating, { color: themeColors.primary }]}>{'★'.repeat(Math.round(rating))}</Text>
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
  reviewerName: {
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
  },
  comment: {
    fontSize: 14,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReviewCard;
