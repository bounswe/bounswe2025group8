import type { Notification, NotificationType } from '../types';

/**
 * Format a notification timestamp to a human-readable relative time string
 */
export const formatNotificationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format timestamp to a full date string
 */
export const formatNotificationDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Group notifications by date (today, yesterday, this week, older)
 */
export const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.timestamp);

    if (notificationDate >= today) {
      groups.Today.push(notification);
    } else if (notificationDate >= yesterday) {
      groups.Yesterday.push(notification);
    } else if (notificationDate >= weekAgo) {
      groups['This Week'].push(notification);
    } else if (notificationDate >= monthAgo) {
      groups['This Month'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
};

/**
 * Group notifications by type
 */
export const groupNotificationsByType = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  return notifications.reduce((acc, notification) => {
    const type = notification.type_display || notification.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);
};

/**
 * Filter unread notifications
 */
export const getUnreadNotifications = (notifications: Notification[]): Notification[] => {
  return notifications.filter((notification) => !notification.is_read);
};

/**
 * Get notification icon/color based on type
 */
export const getNotificationStyle = (
  type: NotificationType
): { icon: string; color: string } => {
  const styles: Record<NotificationType, { icon: string; color: string }> = {
    VOLUNTEER_APPLIED: { icon: '👋', color: '#3b82f6' },
    VOLUNTEER_ACCEPTED: { icon: '✅', color: '#10b981' },
    VOLUNTEER_REJECTED: { icon: '❌', color: '#ef4444' },
    TASK_UPDATED: { icon: '🔄', color: '#f59e0b' },
    TASK_COMPLETED: { icon: '🎉', color: '#10b981' },
    TASK_CANCELLED: { icon: '🚫', color: '#ef4444' },
    COMMENT_ADDED: { icon: '💬', color: '#8b5cf6' },
    REVIEW_RECEIVED: { icon: '⭐', color: '#f59e0b' },
    SYSTEM: { icon: '🔔', color: '#6b7280' },
  };

  return styles[type] || { icon: '🔔', color: '#6b7280' };
};

/**
 * Sort notifications by timestamp (newest first)
 */
export const sortNotificationsByTimestamp = (
  notifications: Notification[],
  ascending = false
): Notification[] => {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Check if a notification is recent (within last 24 hours)
 */
export const isRecentNotification = (timestamp: string): boolean => {
  const notificationDate = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
  return diffInHours <= 24;
};

/**
 * Get notification priority based on type
 */
export const getNotificationPriority = (type: NotificationType): number => {
  const priorities: Record<NotificationType, number> = {
    VOLUNTEER_APPLIED: 3,
    VOLUNTEER_ACCEPTED: 3,
    VOLUNTEER_REJECTED: 2,
    TASK_UPDATED: 2,
    TASK_COMPLETED: 3,
    TASK_CANCELLED: 3,
    COMMENT_ADDED: 1,
    REVIEW_RECEIVED: 2,
    SYSTEM: 1,
  };

  return priorities[type] || 1;
};

/**
 * Generate notification deep link URL based on notification type and related data
 */
export const getNotificationDeepLink = (notification: Notification): string => {
  const { type, related_task } = notification;

  // Task-related notifications
  if (related_task) {
    switch (type) {
      case 'VOLUNTEER_APPLIED':
      case 'VOLUNTEER_ACCEPTED':
      case 'VOLUNTEER_REJECTED':
      case 'TASK_UPDATED':
      case 'TASK_COMPLETED':
      case 'TASK_CANCELLED':
        return `/requests/${related_task.id}`;
      case 'COMMENT_ADDED':
        return `/requests/${related_task.id}#comments`;
      case 'REVIEW_RECEIVED':
        return `/requests/${related_task.id}#reviews`;
      default:
        return `/requests/${related_task.id}`;
    }
  }

  // Default to notifications page
  return '/notifications';
};

/**
 * Truncate notification content if too long
 */
export const truncateNotificationContent = (
  content: string,
  maxLength = 100
): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + '...';
};
