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
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
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
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const themedStyles = getThemedStyles(themeColors);

  const fetchNotifications = useCallback(async (page = 1, loadMore = false) => {
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
      const response = await getNotifications(page, 20, false); // Initially show all, or could be true for unreadOnly
      if (response.status === 'success') {
        setNotifications(prev =>
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
  }, [user]);

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
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => (prev > 0 ? prev - 1 : 0)); // Decrement unread count
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
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
        { borderColor: themeColors.border }
      ]}
      onPress={() => {
        if (!item.is_read) {
          handleMarkAsRead(item.id);
        }
        if (item.related_task) {
          // Assuming r-request-details for creator and v-request-details for volunteer/other
          // This logic might need refinement based on notification type or task role
          const path = item.related_task.creator?.id === user?.id ? '/r-request-details' : '/v-request-details';
          router.push({ pathname: path, params: { id: item.related_task.id } });
        } else {
          // Handle navigation for non-task related notifications if any
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 18 }}>Please sign in to view notifications.</Text>
      </View>
    );
  }

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', fontSize: 16 }}>Error: {error}</Text>
        <TouchableOpacity onPress={() => fetchNotifications(1)} style={styles.retryButton}>
          <Text style={{ color: colors.primary }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.headerBar, themedStyles.headerBar]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/feed')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllReadButton}>
            <Text style={{ color: colors.primary }}>Mark All Read ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 && !loading ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="notifications-off-outline" size={60} color={themeColors.textMuted} />
          <Text style={[styles.emptyStateText, { color: themeColors.textMuted }]}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} /> : null}
        />
      )}
    </View>
  );
}

const getThemedStyles = (themeColors: typeof Colors.light) => {
  return StyleSheet.create({
    headerBar: {
      borderBottomColor: themeColors.border,
    },
    unreadDot: {
      backgroundColor: themeColors.primary,
    }
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  markAllReadButton: {
    padding: 8,
  },
  listContentContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  notificationContent: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 15,
    padding: 10,
    borderRadius: 5,
  },
});
