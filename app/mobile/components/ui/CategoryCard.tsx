import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
<<<<<<< HEAD
=======
import { useColorScheme } from '@/hooks/use-color-scheme';
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
import { useTheme } from '@react-navigation/native';
import type { ThemeTokens } from '../../constants/Colors';

interface CategoryCardProps {
  title: string;
  imageSource: any;
  badgeNumber: number;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, imageSource, badgeNumber, onPress }) => {
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.cardContainer, { backgroundColor: themeColors.card, shadowColor: themeColors.overlay }]}
    >
      <View style={styles.contentWrapper}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Image source={imageSource} style={styles.cardImage} />
        <View style={[styles.badgeContainer, { backgroundColor: themeColors.primary }]}>
          <Text style={[styles.badgeText, { color: themeColors.onPrimary }]}>{badgeNumber}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    top: 18,
    right: -10,
    minWidth: 28,
    minHeight: 28,
  },
  badgeText: {
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CategoryCard;
