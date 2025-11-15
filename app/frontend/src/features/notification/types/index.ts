// Notification types based on API documentation

export type NotificationType = 
  | 'VOLUNTEER_APPLIED'
  | 'VOLUNTEER_ACCEPTED'
  | 'VOLUNTEER_REJECTED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_CANCELLED'
  | 'COMMENT_ADDED'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM';

export interface NotificationUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  photo?: string | null;
}

export interface NotificationTask {
  id: number;
  title: string;
  description?: string;
  status?: string;
  category?: string;
}

export interface Notification {
  id: number;
  content: string;
  timestamp: string;
  type: NotificationType;
  type_display: string;
  is_read: boolean;
  user: NotificationUser;
  related_task?: NotificationTask | null;
}

export interface PaginationInfo {
  total_records: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    pagination: PaginationInfo;
    unread_count: number;
  };
}

export interface SingleNotificationResponse {
  status: string;
  message: string;
  data: Notification;
}

export interface MarkAllReadResponse {
  status: string;
  message: string;
}

export interface MarkNotificationReadPayload {
  is_read: boolean;
}

export interface FetchNotificationsParams {
  unread?: boolean;
  page?: number;
}

// Type guards
export const isNotification = (value: unknown): value is Notification => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.content === 'string' &&
    typeof candidate.timestamp === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.type_display === 'string' &&
    typeof candidate.is_read === 'boolean' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null
  );
};

export const isNotificationsResponse = (value: unknown): value is NotificationsResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.status === 'string' &&
    typeof candidate.data === 'object' &&
    candidate.data !== null
  );
};
