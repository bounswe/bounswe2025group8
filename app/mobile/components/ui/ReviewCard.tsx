import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { ThemeTokens } from '../../constants/Colors';

export interface ReviewCardProps {
  reviewerName: string;
  comment: string;
  rating: number; // Overall average score
  timestamp: string;
  avatarUrl?: string | null;

  // Helper flags to determine review type
  is_volunteer_to_requester?: boolean;
  is_requester_to_volunteer?: boolean;

  // Volunteer -> Requester ratings
  accuracy_of_request?: number;
  communication_volunteer_to_requester?: number;
  safety_and_preparedness?: number;

  // Requester -> Volunteer ratings
  reliability?: number;
  task_completion?: number;
  communication_requester_to_volunteer?: number;
  safety_and_respect?: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  comment,
  rating,
  timestamp,
  avatarUrl,
  is_volunteer_to_requester,
  is_requester_to_volunteer,
  accuracy_of_request,
  communication_volunteer_to_requester,
  safety_and_preparedness,
  reliability,
  task_completion,
  communication_requester_to_volunteer,
  safety_and_respect
}) => {
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;

  const renderStars = (value: number | undefined) => {
    const starValue = value || 0;
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.rating,
              { color: star <= Math.round(starValue) ? themeColors.pink : themeColors.border },
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderDetailedRatings = () => {
    if (is_volunteer_to_requester) {
      return (
        <View style={styles.detailedRatingsContainer}>
          {accuracy_of_request && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Accuracy of Request:</Text>
              {renderStars(accuracy_of_request)}
            </View>
          )}
          {communication_volunteer_to_requester && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Communication:</Text>
              {renderStars(communication_volunteer_to_requester)}
            </View>
          )}
          {safety_and_preparedness && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Safety & Preparedness:</Text>
              {renderStars(safety_and_preparedness)}
            </View>
          )}
        </View>
      );
    } else if (is_requester_to_volunteer) {
      return (
        <View style={styles.detailedRatingsContainer}>
          {reliability && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Reliability:</Text>
              {renderStars(reliability)}
            </View>
          )}
          {task_completion && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Task Completion:</Text>
              {renderStars(task_completion)}
            </View>
          )}
          {communication_requester_to_volunteer && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Communication:</Text>
              {renderStars(communication_requester_to_volunteer)}
            </View>
          )}
          {safety_and_respect && (
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingLabel, { color: themeColors.textMuted }]}>Safety & Respect:</Text>
              {renderStars(safety_and_respect)}
            </View>
          )}
        </View>
      );
    }

    return null;
  };

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
          <View style={styles.overallRatingRow}>
            <Text style={[styles.overallLabel, { color: themeColors.textMuted }]}>Overall:</Text>
            {renderStars(rating)}
          </View>
        </View>
      </View>

      {renderDetailedRatings()}

      {comment && <Text style={[styles.comment, { color: themeColors.text }]}>{comment}</Text>}
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
  overallRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  detailedRatingsContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 13,
    marginRight: 8,
    flex: 1,
  },
});

export default ReviewCard;
