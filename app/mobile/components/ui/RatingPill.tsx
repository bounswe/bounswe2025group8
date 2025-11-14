import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingPillProps {
  rating: number;
  reviewCount: number;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
}

const RatingPill: React.FC<RatingPillProps> = ({
  rating,
  reviewCount,
  backgroundColor = '#E573B7',
  textColor = '#fff',
  iconColor = '#fff',
}) => (
  <View style={[styles.ratingPill, { backgroundColor }]}>
    <Ionicons name="star-outline" size={16} color={iconColor} style={styles.icon} />
    <Text style={[styles.ratingPillText, { color: textColor }]}>
      {Number(rating || 0).toFixed(1)} ({reviewCount} reviews)
    </Text>
  </View>
);

const styles = StyleSheet.create({
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
    marginLeft: 4,
  },
  ratingPillText: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default RatingPill;
