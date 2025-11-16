import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchUnreadCountAsync } from '../store/notificationSlice';

interface UseUnreadCountOptions {
  autoFetch?: boolean;
  pollInterval?: number; // Poll interval in milliseconds
}

interface UseUnreadCountReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get and track unread notification count with optional polling
 */
export const useUnreadCount = (
  options: UseUnreadCountOptions = {}
): UseUnreadCountReturn => {
  const { autoFetch = true, pollInterval = 0 } = options;
  const dispatch = useAppDispatch();
  const { unreadCount, loading, error } = useAppSelector(
    (state) => state.notification
  );

  const refetch = useCallback(async () => {
    await dispatch(fetchUnreadCountAsync()).unwrap();
  }, [dispatch]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  // Polling mechanism
  useEffect(() => {
    if (pollInterval > 0) {
      const intervalId = setInterval(() => {
        refetch();
      }, pollInterval);

      return () => clearInterval(intervalId);
    }
  }, [pollInterval, refetch]);

  return {
    unreadCount,
    loading,
    error,
    refetch,
  };
};
