import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export interface ReviewCardProps {
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

      <View style={styles.content}>
        <View style={styles.header}>

          <Image source={{ uri: imageUrl }} style={styles.avatar} />

          <View style={styles.headerContainer}>

            <View style={styles.authorAndRating}>
              <Text style={[styles.author, { color: themeColors.text }]}>{author}</Text>
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color={i < Math.round(score) ? themeColors.pink : '#dfe1e6'}
                    style={{ marginRight: i < 4 ? 2 : 0 }}
                  />
                ))}
              </View>
            </View>

            <Text style={[styles.date, { color: themeColors.text }]}>{date}</Text>

          </View>



        </View>

        <Text style={[styles.comment, { color: themeColors.text }]}>{comment}</Text>
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
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
    paddingVertical: 4,
    flexDirection: 'column',  // Stack children vertically
  },
  header: {
    flexDirection: 'row',
    //alignItems: 'flex-start',
    marginBottom: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  author: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 2,
    flex: 1,
  },
  authorAndRating: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    fontWeight: '100',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  comment: {
    fontSize: 12,
    fontWeight: '100',
    marginTop: 2,
    flexWrap: 'wrap',
    flex: 1,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
});

export default ReviewCard;