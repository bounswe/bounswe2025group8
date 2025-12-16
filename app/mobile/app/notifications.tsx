import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  Button,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import type { ThemeTokens } from '../constants/Colors';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type PaginationInfo,
} from '../lib/api';
import { useAuth } from '../lib/auth';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;
  const { user } = useAuth();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const themedStyles = getThemedStyles(themeColors);

  const fetchNotifications = useCallback(
    async (page = 1, loadMore = false) => {
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        return;
      }
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await getNotifications(page, 20, false);
        if (response.status === 'success') {
          setNotifications((prev) =>
            page === 1 ? response.data.notifications : [...prev, ...response.data.notifications]
          );
          setPagination(response.data.pagination);
          setUnreadCount(response.data.unread_count);
        } else {
          setError(response.message || t('notifications.loadError'));
          Alert.alert(t('common.error'), response.message || t('notifications.loadError'));
        }
      } catch (e: any) {
        const errorMessage = e.message || t('notifications.unexpectedError');
        setError(errorMessage);
        Alert.alert(t('common.error'), errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (pagination && pagination.next && !loadingMore) {
      fetchNotifications(pagination.page + 1, true);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await markNotificationAsRead(notificationId);
      if (response.status === 'success' && response.data) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        Alert.alert(t('common.error'), response.message || t('notifications.markReadError'));
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('notifications.markReadError'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.status === 'success') {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        Alert.alert(t('common.success'), t('notifications.markAllReadSuccess'));
      } else {
        Alert.alert(t('common.error'), response.message || t('notifications.markAllReadError'));
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('notifications.markAllReadError'));
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.is_read ? themeColors.card : themeColors.cardUnread },
        { borderColor: themeColors.border },
      ]}
      onPress={() => {
        if (!item.is_read) {
          handleMarkAsRead(item.id);
        }
        if (item.related_task) {
          const path =
            item.related_task.creator?.id === user?.id ? '/r-request-details' : '/v-request-details';
          router.push({ pathname: path, params: { id: item.related_task.id } });
        }
      }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={item.is_read ? t('notifications.readNotificationA11y', { type: t(`notifications.types.${item.type.toUpperCase()}`, { defaultValue: item.type_display }), content: item.content }) : t('notifications.unreadNotificationA11y', { type: t(`notifications.types.${item.type.toUpperCase()}`, { defaultValue: item.type_display }), content: item.content })}
      accessibilityState={{ disabled: false }}
    >
      <View style={styles.notificationHeader}>
        <Text style={[styles.notificationType, { color: themeColors.text }]}>
          {t(`notifications.types.${item.type.toUpperCase()}`, { defaultValue: item.type_display })}
        </Text>
        {!item.is_read && <View style={[styles.unreadDot, themedStyles.unreadDot]} />}
      </View>
      <Text style={[styles.notificationContent, { color: themeColors.text }]}>
        {(() => {
          const content = item.content;

          // 1. Volunteer Applied
          // Pattern: "User has volunteered for your task: Task Name"
          const volunteerWithTaskMatch = content.match(/^(.*?) has volunteered for your task: (.*)$/);
          if (volunteerWithTaskMatch) {
            return t('notifications.patterns.volunteeredWithTask', { user: volunteerWithTaskMatch[1], task: volunteerWithTaskMatch[2] });
          }
          // Pattern: "User has volunteered for your task"
          const volunteerMatch = content.match(/^(.*?) has volunteered for your task$/);
          if (volunteerMatch) {
            return t('notifications.patterns.volunteered', { user: volunteerMatch[1] });
          }

          // 2. Task Assigned
          // Pattern: "You have been assigned to task: Task Name"
          const assignedWithTaskMatch = content.match(/^You have been assigned to task: (.*)$/);
          if (assignedWithTaskMatch) {
            return t('notifications.patterns.assignedWithTask', { task: assignedWithTaskMatch[1] });
          }
          // Pattern: "You have been assigned to a task"
          if (content === 'You have been assigned to a task') {
            return t('notifications.patterns.assigned');
          }

          // 3. Task Completed
          // Pattern: "Task 'Task Name' has been completed"
          const completedWithTaskMatch = content.match(/^Task '(.*?)' has been completed$/);
          if (completedWithTaskMatch) {
            return t('notifications.patterns.completedWithTask', { task: completedWithTaskMatch[1] });
          }
          // Pattern: "A task you are involved in has been completed"
          if (content === 'A task you are involved in has been completed') {
            return t('notifications.patterns.completed');
          }

          // 4. Task Cancelled
          // Pattern: "Task 'Task Name' has been cancelled"
          const cancelledWithTaskMatch = content.match(/^Task '(.*?)' has been cancelled$/);
          if (cancelledWithTaskMatch) {
            return t('notifications.patterns.cancelledWithTask', { task: cancelledWithTaskMatch[1] });
          }
          // Pattern: "A task you are involved in has been cancelled"
          if (content === 'A task you are involved in has been cancelled') {
            return t('notifications.patterns.cancelled');
          }

          // 5. Review Received
          // Pattern: "User has reviewed..." (Need to verify exact pattern, assuming "User has reviewed you" or similar)
          // Based on previous code: "User X has reviewed..."
          const reviewMatch = content.match(/^(.*?) has reviewed/);
          if (reviewMatch) {
            return t('notifications.patterns.reviewReceived', { user: reviewMatch[1] });
          }

          // Fallback: Use structured data if available and no regex matched (e.g. if content format changed but type is correct)
          if (item.type === 'TASK_APPLIED' && item.related_task) {
            // Try to extract user from content if possible, else generic
            const userMatch = content.match(/^(.*?) has /);
            const user = userMatch ? userMatch[1] : 'Someone';
            return t('notifications.patterns.volunteeredWithTask', { user, task: item.related_task.title });
          }

          return content;
        })()}
      </Text>
      <Text style={[styles.notificationTimestamp, { color: themeColors.textMuted }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background },
        ]}
      >
        <Text style={{ color: themeColors.text, fontSize: 18, marginBottom: 16 }}>
          {t('notifications.signInRequired')}
        </Text>
        <Button title={t('settings.goToHome')} onPress={() => router.replace('/')} />
      </View>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background },
        ]}
      >
        <Text style={{ color: themeColors.error, fontSize: 16 }}>{t('common.error')}: {error}</Text>
        <TouchableOpacity
          onPress={() => fetchNotifications(1)}
          style={[styles.retryButton, { borderColor: themeColors.primary }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('notifications.tryAgainA11y')}
        >
          <Text style={{ color: themeColors.primary }}>{t('notifications.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.headerBar, themedStyles.headerBar]}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/feed'))}
          style={styles.backButton}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeColors.text}
            accessible={false}
            importantForAccessibility="no"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllReadButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t('notifications.markAllReadA11y')}
          >
            <Text style={{ color: themeColors.primary }}>{t('notifications.markAllRead')} ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: themeColors.border }]} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={themeColors.primary} /> : null
        }
        ListEmptyComponent={
          !loading ? <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>{t('notifications.empty')}</Text> : null
        }
      />
    </SafeAreaView>
  );
}

const getThemedStyles = (themeColors: ThemeTokens) =>
  StyleSheet.create({
    headerBar: {
      backgroundColor: themeColors.card,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    unreadDot: {
      backgroundColor: themeColors.primary,
    },
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  markAllReadButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationType: {
    fontSize: 14,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notificationContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
  },
  separator: {
    height: 12,
    opacity: 0,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
});
