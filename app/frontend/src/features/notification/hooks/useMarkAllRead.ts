import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { markAllNotificationsReadAsync } from '../store/notificationSlice';

interface UseMarkAllReadReturn {
  markAllAsRead: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllRead = (): UseMarkAllReadReturn => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(markAllNotificationsReadAsync()).unwrap();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    markAllAsRead,
    loading,
    error,
  };
};
