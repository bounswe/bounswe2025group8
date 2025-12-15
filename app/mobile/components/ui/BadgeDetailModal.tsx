import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
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

interface BadgeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  badge: BadgeType | UserBadge | null;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ visible, onClose, badge }) => {
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
  const { t } = useTranslation();
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when badge changes
  React.useEffect(() => {
    setImageError(false);
  }, [badge]);

  if (!badge) return null;

  // Handle both Badge and UserBadge formats
  const actualBadge = 'badge' in badge ? badge.badge : badge;
  const badgeEarnedAt = 'earned_at' in badge ? badge.earned_at : null;
  const isEarned = !!badgeEarnedAt;

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
  const localBadgeImage = badgeType ? badgeImages[badgeType] : null;

  // Get current locale for date formatting from i18n
  const currentLanguage = i18n.language || 'en';
  const dateLocale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[styles.modalContent, { backgroundColor: themeColors.background }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              {badgeName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('common.close', { defaultValue: 'Close' })}
            >
              <Ionicons name="close" size={28} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Badge Icon */}
            <View style={styles.badgeIconContainer}>
              {localBadgeImage ? (
                <Image
                  source={localBadgeImage}
                  style={[styles.badgeIcon, { opacity: isEarned ? 1 : 0.4 }]}
                  resizeMode="contain"
                />
              ) : iconUrl && !imageError ? (
                <Image
                  source={{ uri: iconUrl }}
                  style={[styles.badgeIcon, { opacity: isEarned ? 1 : 0.4 }]}
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Ionicons
                  name="trophy"
                  size={120}
                  color={isEarned ? themeColors.primary : themeColors.textMuted}
                />
              )}
            </View>

            {/* Status Badge */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isEarned ? themeColors.primary : themeColors.card,
                    borderColor: isEarned ? themeColors.primary : themeColors.border,
                  },
                ]}
              >
                <Ionicons
                  name={isEarned ? 'checkmark-circle' : 'lock-closed'}
                  size={16}
                  color={isEarned ? themeColors.card : themeColors.textMuted}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isEarned ? themeColors.card : themeColors.textMuted,
                      marginLeft: 6,
                    },
                  ]}
                >
                  {isEarned
                    ? t('profile.badges.earned', { defaultValue: 'Earned' })
                    : t('profile.badges.notEarned', { defaultValue: 'Not Earned' })}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionLabel, { color: themeColors.textMuted }]}>
                {t('profile.badges.description', { defaultValue: 'Description' })}
              </Text>
              <Text style={[styles.descriptionText, { color: themeColors.text }]}>
                {badgeDescription || t('profile.badges.noDescription', { defaultValue: 'No description available.' })}
              </Text>
            </View>

            {/* Earned Date */}
            {isEarned && badgeEarnedAt && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color={themeColors.textMuted} />
                <Text style={[styles.dateText, { color: themeColors.textMuted }]}>
                  {t('profile.badges.earnedOn', { defaultValue: 'Earned on' })} {formatDate(badgeEarnedAt)}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  badgeIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    width: 120,
    height: 120,
  },
  statusContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default BadgeDetailModal;

