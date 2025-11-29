import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../../constants/Colors';
import { BACKEND_BASE_URL } from '../../lib/api';

export interface CommentCardProps {
  userName: string;
  content: string;
  timestamp: string;
  avatarUrl?: string | null;
  isOwnComment?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  userId?: number;
  onProfilePress?: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  userName,
  content,
  timestamp,
  avatarUrl,
  isOwnComment = false,
  onEdit,
  onDelete,
  userId,
  onProfilePress,
}) => {
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return timestamp;
    }
  };

  const absoluteAvatarUrl = avatarUrl
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_BASE_URL}${avatarUrl}`)
    : null;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onProfilePress}
          disabled={!onProfilePress}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`View ${userName}'s profile`}
        >
          <Image
            source={
              absoluteAvatarUrl
                ? { uri: absoluteAvatarUrl }
                : require('../../assets/images/empty_profile_photo.png')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <TouchableOpacity
              onPress={onProfilePress}
              disabled={!onProfilePress}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`View ${userName}'s profile`}
            >
              <Text style={[styles.userName, { color: themeColors.text }]}>{userName}</Text>
            </TouchableOpacity>
            <View style={styles.rightSection}>
              <Text style={[styles.timestamp, { color: themeColors.textMuted }]}>
                {formatTimestamp(timestamp)}
              </Text>
              {isOwnComment && (
                <View style={styles.actionButtons}>
                  {onEdit && (
                    <TouchableOpacity
                      onPress={onEdit}
                      style={styles.iconButton}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel="Edit comment"
                    >
                      <Ionicons name="pencil" size={16} color={themeColors.primary} />
                    </TouchableOpacity>
                  )}
                  {onDelete && (
                    <TouchableOpacity
                      onPress={onDelete}
                      style={styles.iconButton}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel="Delete comment"
                    >
                      <Ionicons name="trash-outline" size={16} color={themeColors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      <Text style={[styles.content, { color: themeColors.text }]}>{content}</Text>
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
    width: '100%',
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CommentCard;

