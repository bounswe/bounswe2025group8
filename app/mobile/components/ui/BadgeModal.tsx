import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';
import Badge from './Badge';
import BadgeDetailModal from './BadgeDetailModal';
import type { Badge as BadgeType, UserBadge } from '../../lib/api';

interface BadgeModalProps {
  visible: boolean;
  onClose: () => void;
  earnedUserBadges: UserBadge[];
  allBadges: BadgeType[];
  loading?: boolean;
}

const BadgeModal: React.FC<BadgeModalProps> = ({
  visible,
  onClose,
  earnedUserBadges,
  allBadges,
  loading = false,
}) => {
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
  const { t } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | UserBadge | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const earnedBadges = earnedUserBadges.map(ub => ub.badge);
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.id));
  const inProgressBadges = allBadges.filter((badge) => !earnedBadgeIds.has(badge.id));

  const handleBadgePress = (badge: BadgeType | UserBadge) => {
    setSelectedBadge(badge);
    setDetailModalVisible(true);
  };

  const handleEarnedBadgePress = (userBadge: UserBadge) => {
    setSelectedBadge(userBadge);
    setDetailModalVisible(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              {t('profile.badges.title', { defaultValue: 'Badges' })}
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

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {/* Earned Badges Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trophy" size={20} color={themeColors.primary} />
                  <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                    {t('profile.badges.earnedAchievements', { defaultValue: 'Earned Achievements' })}
                  </Text>
                  <View style={[styles.badgeCount, { backgroundColor: themeColors.primary }]}>
                    <Text style={[styles.badgeCountText, { color: themeColors.card }]}>
                      {earnedUserBadges.length}
                    </Text>
                  </View>
                </View>
                {earnedUserBadges.length > 0 ? (
                  <View style={styles.badgeGrid}>
                    {earnedUserBadges.map((userBadge) => (
                      <Badge
                        key={userBadge.id}
                        badge={userBadge}
                        isEarned={true}
                        size="medium"
                        onPress={() => handleEarnedBadgePress(userBadge)}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                    {t('profile.badges.noBadgesYet', { defaultValue: 'No badges earned yet' })}
                  </Text>
                )}
              </View>

              {/* In Progress Badges Section */}
              {inProgressBadges.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="lock-closed" size={20} color={themeColors.textMuted} />
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                      {t('profile.badges.inProgress', { defaultValue: 'In Progress' })}
                    </Text>
                    <View style={[styles.badgeCount, { backgroundColor: themeColors.textMuted }]}>
                      <Text style={[styles.badgeCountText, { color: themeColors.card }]}>
                        {inProgressBadges.length}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badgeGrid}>
                    {inProgressBadges.map((badge) => (
                      <Badge
                        key={badge.id}
                        badge={badge}
                        isEarned={false}
                        size="medium"
                        onPress={() => handleBadgePress(badge)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      <BadgeDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
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
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  badgeCount: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default BadgeModal;

