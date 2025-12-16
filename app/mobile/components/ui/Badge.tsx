import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { ThemeTokens } from '../../constants/Colors';
import type { Badge as BadgeType, UserBadge } from '../../lib/api';

// Import badge images
const badgeImages: Record<string, ImageSourcePropType> = {
  NEIGHBORHOOD_HERO: require('../../assets/images/badges/ten-neighbours.png'),
  JACK_OF_ALL_TRADES: require('../../assets/images/badges/helped-five-categories.png'),
  SELECTED_VOLUNTEER: require('../../assets/images/badges/selected-volunteer.png'),
  CARING_CONTRIBUTOR: require('../../assets/images/badges/caring-contributor.png'),
  HELP_AND_TRAVEL: require('../../assets/images/badges/safe-travel.png'),
  RAPID_RESPONDER: require('../../assets/images/badges/rapid-responder.png'),
  THE_UNSUNG_HERO: require('../../assets/images/badges/unsung-hero.png'),
  THE_LIFESAVER: require('../../assets/images/badges/lifesaver.png'),
  NIGHT_OWL: require('../../assets/images/badges/night-owl.png'),
  THE_HOLIDAY_HERO: require('../../assets/images/badges/holiday-hero.png'),
  JUST_PERFECT: require('../../assets/images/badges/just-perfect.png'),
  RISING_HELPER: require('../../assets/images/badges/rising-helper.png'),
  GENTLE_COMMUNICATOR: require('../../assets/images/badges/gentle-communicator.png'),
  MODEL_CITIZEN: require('../../assets/images/badges/model-citizen.png'),
  RELIABLE_NEIGHBOUR: require('../../assets/images/badges/reliable-neighbour.png'),
  PEOPLE_TRUST_YOU: require('../../assets/images/badges/people-trust-you.png'),
  PLATE_NOT_EMPTY: require('../../assets/images/badges/plate-not-empty.png'),
  FAR_SIGHTED: require('../../assets/images/badges/far-sighted.png'),
  FULL_GALLERY: require('../../assets/images/badges/full-galery.png'),
  THE_ICEBREAKER: require('../../assets/images/badges/icebreaker.png'),
};

interface BadgeProps {
  badge: BadgeType | UserBadge;
  isEarned?: boolean;
  earnedAt?: string;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const Badge: React.FC<BadgeProps> = ({ badge, isEarned = false, earnedAt, onPress, size = 'medium' }) => {
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
  const { t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);

  // Handle both Badge and UserBadge formats
  const actualBadge = 'badge' in badge ? badge.badge : badge;
  const badgeEarnedAt = 'earned_at' in badge ? badge.earned_at : earnedAt;
  const badgeIsEarned = isEarned || !!badgeEarnedAt;

  const sizeConfig = {
    small: { icon: 56, fontSize: 10, textHeight: 28 },
    medium: { icon: 80, fontSize: 11, textHeight: 32 },
    large: { icon: 100, fontSize: 12, textHeight: 36 },
  };

  const config = sizeConfig[size];

  // Get translation key from badge_type
  const badgeTypeKey = actualBadge.badge_type ? actualBadge.badge_type.toLowerCase() : null;
  
  // Try to get translated title and description
  const translatedTitle = badgeTypeKey ? t(`profile.badges.names.${badgeTypeKey}`, { defaultValue: null }) : null;
  const translatedDesc = badgeTypeKey ? t(`profile.badges.descriptions.${badgeTypeKey}`, { defaultValue: null }) : null;

  // Fallback to existing properties if translation returns the key or is missing
  const badgeName = (translatedTitle && translatedTitle !== `profile.badges.names.${badgeTypeKey}`)
    ? translatedTitle
    : (actualBadge.name || actualBadge.badge_type_display || '');
  const badgeDescription = (translatedDesc && translatedDesc !== `profile.badges.descriptions.${badgeTypeKey}`)
    ? translatedDesc
    : (actualBadge.description || '');
  const iconUrl = actualBadge.icon_url;
  const badgeType = actualBadge.badge_type?.toUpperCase();
  
  // Get local badge image if available
  const localBadgeImage = badgeType ? badgeImages[badgeType] : null;

  // Reset image error when badge changes
  React.useEffect(() => {
    setImageError(false);
  }, [badgeType, iconUrl]);

  // Determine opacity and filter based on earned status
  const opacity = badgeIsEarned ? 1 : 0.6;

  const BadgeContent = (
    <View style={[styles.container, { opacity }]}>
      <View style={styles.iconContainer}>
        {iconUrl && !imageError ? (
          <Image
            source={{ uri: iconUrl }}
            style={[
              styles.icon,
              { width: config.icon, height: config.icon },
              !badgeIsEarned && styles.grayscaleImage,
            ]}
            resizeMode="contain"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : localBadgeImage ? (
          <Image
            source={localBadgeImage}
            style={[
              styles.icon,
              { width: config.icon, height: config.icon },
              !badgeIsEarned && styles.grayscaleImage,
            ]}
            resizeMode="contain"
          />
        ) : (
          <Ionicons
            name="trophy"
            size={config.icon * 0.7}
            color={badgeIsEarned ? themeColors.primary : themeColors.textMuted}
          />
        )}
      </View>
      <View
        style={[
          styles.badgeNameContainer,
          {
            height: config.textHeight,
            marginTop: 4,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeName,
            {
              fontSize: config.fontSize,
              color: themeColors.text,
              fontWeight: badgeIsEarned ? '600' : '400',
            },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {badgeName}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {BadgeContent}
      </TouchableOpacity>
    );
  }

  return BadgeContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    // No border radius - badges have their own design
  },
  grayscaleImage: {
    opacity: 0.4, // Reduced opacity for unearned badges - makes them look faded/grayed
  },
  badgeNameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  badgeName: {
    textAlign: 'center',
    maxWidth: 80,
    lineHeight: 14, // Approximate line height for 2 lines
  },
});

export default Badge;

