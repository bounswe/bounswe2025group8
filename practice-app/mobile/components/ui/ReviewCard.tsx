import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface ReviewCardProps {
  author: string;
  imageUrl: string;
  score: number;
  comment: string;
  date: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ author, imageUrl, score, comment, date }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  return (
    <View style={[styles.card, { backgroundColor: themeColors.background }]}>  
      <Image source={{ uri: imageUrl }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.author, { color: themeColors.text }]}>{author}</Text>
          <Text style={[styles.date, { color: themeColors.gray }]}>{date}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={themeColors.pink} />
          <Text style={[styles.score, { color: themeColors.pink }]}>{score.toFixed(1)}</Text>
        </View>
        <Text style={[styles.comment, { color: themeColors.text }]} numberOfLines={3}>{comment}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  author: {
    fontWeight: '500',
    fontSize: 15,
    flex: 1,
  },
  date: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  score: {
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  comment: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default ReviewCard; 