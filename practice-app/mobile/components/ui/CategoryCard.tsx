import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

interface CategoryCardProps {
  title: string;
  imageSource: any;
  badgeNumber: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imageSource, badgeNumber }) => {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];

  return (
    <View style={[styles.cardContainer, { backgroundColor: themeColors.background }]}>
      <View style={styles.contentWrapper}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Image source={imageSource} style={styles.cardImage} />
        <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{badgeNumber}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    margin: 10,
    width: 180,
    height: 210,
    elevation: 2,
  },
  contentWrapper: {
    alignItems: 'flex-start',
    width: '100%',
  },
  cardImage: {
    width: 150,
    height: 150,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  badgeContainer: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 12,
    right: -10,
    minWidth: 28,
    minHeight: 28,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CategoryCard; 