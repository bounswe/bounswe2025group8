// Types
export type {
  Notification,
  NotificationType,
  NotificationUser,
  NotificationTask,
  NotificationsResponse,
  SingleNotificationResponse,
  MarkAllReadResponse,
  MarkNotificationReadPayload,
  FetchNotificationsParams,
  PaginationInfo,
} from './types';

export { isNotification, isNotificationsResponse } from './types';

// Services
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from './services/notificationService';

// Hooks
export {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useUnreadCount,
} from './hooks';

// Store
export {
  fetchNotificationsAsync,
  markNotificationReadAsync,
  markAllNotificationsReadAsync,
  fetchUnreadCountAsync,
  clearNotifications,
  updateNotification,
  addNotification,
  clearError,
} from './store/notificationSlice';

export type { NotificationState } from './store/notificationSlice';

// Utils
export {
  formatNotificationTime,
  formatNotificationDate,
  groupNotificationsByDate,
  groupNotificationsByType,
  getUnreadNotifications,
  getNotificationStyle,
  sortNotificationsByTimestamp,
  isRecentNotification,
  getNotificationPriority,
  getNotificationDeepLink,
  truncateNotificationContent,
} from './utils';
