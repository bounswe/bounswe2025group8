import api from '../../../services/api';
import type { AxiosError } from 'axios';
import type {
  NotificationsResponse,
  SingleNotificationResponse,
  MarkAllReadResponse,
  MarkNotificationReadPayload,
  FetchNotificationsParams,
} from '../types';

/**
 * Fetch all notifications for the authenticated user
 * @param params - Optional query parameters (unread filter, pagination)
 * @returns Promise with notifications data
 */
export const getNotifications = async (
  params: FetchNotificationsParams = {}
): Promise<NotificationsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.unread !== undefined) {
      queryParams.append('unread', params.unread.toString());
    }
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }

    const url = `/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);

    if (!response.data) {
      throw new Error('No data received from notifications API');
    }

    return response.data as NotificationsResponse;
  } catch (err) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status;
    
    if (status === 404) {
      throw new Error('Notifications endpoint not found');
    }
    
    if (status === 401) {
      throw new Error('Authentication required to fetch notifications');
    }
    
    if (status === 500) {
      throw new Error('Server error while fetching notifications');
    }

    throw err;
  }
};

/**
 * Mark a specific notification as read or unread
 * @param notificationId - ID of the notification to update
 * @param payload - Object containing is_read boolean
 * @returns Promise with updated notification data
 */
export const markNotificationAsRead = async (
  notificationId: number,
  payload: MarkNotificationReadPayload = { is_read: true }
): Promise<SingleNotificationResponse> => {
  if (!notificationId || typeof notificationId !== 'number') {
    throw new Error('Valid notification ID is required');
  }

  try {
    const response = await api.patch(`/notifications/${notificationId}/`, payload);

    if (!response.data) {
      throw new Error('No data received from mark notification API');
    }

    return response.data as SingleNotificationResponse;
  } catch (err) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status;
    
    if (status === 404) {
      throw new Error('Notification not found');
    }
    
    if (status === 401) {
      throw new Error('Authentication required to update notification');
    }
    
    if (status === 403) {
      throw new Error('You do not have permission to update this notification');
    }

    throw err;
  }
};

/**
 * Mark all notifications as read for the authenticated user
 * @returns Promise with success message
 */
export const markAllNotificationsAsRead = async (): Promise<MarkAllReadResponse> => {
  try {
    const response = await api.post('/notifications/mark-all-read/');

    if (!response.data) {
      throw new Error('No data received from mark all read API');
    }

    return response.data as MarkAllReadResponse;
  } catch (err) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status;
    
    if (status === 401) {
      throw new Error('Authentication required to mark all notifications as read');
    }
    
    if (status === 500) {
      throw new Error('Server error while marking notifications as read');
    }

    throw err;
  }
};

/**
 * Get count of unread notifications
 * @returns Promise with unread count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await getNotifications({ unread: true });
    return response.data.unread_count;
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return 0;
  }
};
