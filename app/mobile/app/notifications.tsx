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

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;
  const { user } = useAuth();

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
          setError(response.message || 'Failed to load notifications.');
          Alert.alert('Error', response.message || 'Failed to load notifications.');
        }
      } catch (e: any) {
        const errorMessage = e.message || 'An unexpected error occurred.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
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
        Alert.alert('Error', response.message || 'Could not mark as read.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.status === 'success') {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        Alert.alert('Success', response.message || 'All notifications marked as read.');
      } else {
        Alert.alert('Error', response.message || 'Could not mark all as read.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not mark all as read.');
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
    >
      <View style={styles.notificationHeader}>
        <Text style={[styles.notificationType, { color: themeColors.text }]}>{item.type_display}</Text>
        {!item.is_read && <View style={[styles.unreadDot, themedStyles.unreadDot]} />}
      </View>
      <Text style={[styles.notificationContent, { color: themeColors.text }]}>{item.content}</Text>
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
          Please sign in to view notifications.
        </Text>
        <Button title="Go to Home" onPress={() => router.replace('/')} />
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
        <Text style={{ color: themeColors.error, fontSize: 16 }}>Error: {error}</Text>
        <TouchableOpacity
          onPress={() => fetchNotifications(1)}
          style={[styles.retryButton, { borderColor: themeColors.primary }]}
        >
          <Text style={{ color: themeColors.primary }}>Try Again</Text>
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
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllReadButton}>
            <Text style={{ color: themeColors.primary }}>Mark All Read ({unreadCount})</Text>
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
          !loading ? <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>No notifications yet.</Text> : null
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
