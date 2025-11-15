import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  fetchNotificationsAsync,
  fetchUnreadCountAsync,
  clearNotifications,
  clearError 
} from '../store/notificationSlice';
import type { FetchNotificationsParams, Notification, PaginationInfo } from '../types';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  fetchInterval?: number; // Auto-refresh interval in milliseconds
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: FetchNotificationsParams) => Promise<void>;
  clear: () => void;
  clearErrorMessage: () => void;
}

/**
 * Hook to manage notifications with auto-fetching and polling capabilities
 */
export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsReturn => {
  const { 
    autoFetch = true, 
    fetchInterval = 0,
    unreadOnly = false 
  } = options;

  const dispatch = useAppDispatch();
  const { notifications, unreadCount, pagination, loading, error } = useAppSelector(
    (state) => state.notification
  );

  const refetch = useCallback(
    async (params?: FetchNotificationsParams) => {
      const fetchParams = params || { unread: unreadOnly };
      await dispatch(fetchNotificationsAsync(fetchParams)).unwrap();
    },
    [dispatch, unreadOnly]
  );

  const clear = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  // Polling mechanism
  useEffect(() => {
    if (fetchInterval > 0) {
      const intervalId = setInterval(() => {
        refetch();
        dispatch(fetchUnreadCountAsync());
      }, fetchInterval);

      return () => clearInterval(intervalId);
    }
  }, [fetchInterval, refetch, dispatch]);

  return {
    notifications,
    unreadCount,
    pagination,
    loading,
    error,
    refetch,
    clear,
    clearErrorMessage,
  };
};
