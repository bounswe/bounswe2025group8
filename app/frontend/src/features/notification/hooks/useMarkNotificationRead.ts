import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { markNotificationReadAsync } from '../store/notificationSlice';

interface UseMarkNotificationReadReturn {
  markAsRead: (notificationId: number) => Promise<void>;
  markAsUnread: (notificationId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to mark individual notifications as read or unread
 */
export const useMarkNotificationRead = (): UseMarkNotificationReadReturn => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      setLoading(true);
      setError(null);
      try {
        await dispatch(
          markNotificationReadAsync({ notificationId, isRead: true })
        ).unwrap();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const markAsUnread = useCallback(
    async (notificationId: number) => {
      setLoading(true);
      setError(null);
      try {
        await dispatch(
          markNotificationReadAsync({ notificationId, isRead: false })
        ).unwrap();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark as unread';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  return {
    markAsRead,
    markAsUnread,
    loading,
    error,
  };
};
