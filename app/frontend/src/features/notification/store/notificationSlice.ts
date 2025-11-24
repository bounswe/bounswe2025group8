import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadCount 
} from '../services/notificationService';
import type { 
  Notification, 
  NotificationsResponse,
  FetchNotificationsParams,
  PaginationInfo 
} from '../types';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pagination: null,
  loading: false,
  error: null,
  lastFetch: null,
};

// Async thunks
export const fetchNotificationsAsync = createAsyncThunk<
  NotificationsResponse,
  FetchNotificationsParams | undefined,
  { rejectValue: string }
>(
  'notification/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getNotifications(params);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      return rejectWithValue(errorMessage);
    }
  }
);

export const markNotificationReadAsync = createAsyncThunk<
  { notification: Notification },
  { notificationId: number; isRead: boolean },
  { rejectValue: string }
>(
  'notification/markNotificationRead',
  async ({ notificationId, isRead }, { rejectWithValue }) => {
    try {
      const response = await markNotificationAsRead(notificationId, { is_read: isRead });
      return { notification: response.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification';
      return rejectWithValue(errorMessage);
    }
  }
);

export const markAllNotificationsReadAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'notification/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUnreadCountAsync = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await getUnreadCount();
      return count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unread count';
      return rejectWithValue(errorMessage);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = null;
      state.error = null;
    },
    
    // Update a single notification in the state
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
        
        // Update unread count
        if (state.notifications[index].is_read !== action.payload.is_read) {
          state.unreadCount = action.payload.is_read 
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount + 1;
        }
      }
    },
    
    // Add a new notification (e.g., from WebSocket)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotificationsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data.notifications;
        state.unreadCount = action.payload.data.unread_count;
        state.pagination = action.payload.data.pagination;
        state.lastFetch = Date.now();
      })
      .addCase(fetchNotificationsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      
      // Mark notification as read
      .addCase(markNotificationReadAsync.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          n => n.id === action.payload.notification.id
        );
        if (index !== -1) {
          const wasUnread = !state.notifications[index].is_read;
          state.notifications[index] = action.payload.notification;
          
          // Update unread count
          if (wasUnread && action.payload.notification.is_read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else if (!wasUnread && !action.payload.notification.is_read) {
            state.unreadCount += 1;
          }
        }
      })
      .addCase(markNotificationReadAsync.rejected, (state, action) => {
        state.error = action.payload || 'Failed to mark notification';
      })
      
      // Mark all notifications as read
      .addCase(markAllNotificationsReadAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsReadAsync.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsReadAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCountAsync.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCountAsync.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch unread count';
      });
  },
});

export const { 
  clearNotifications, 
  updateNotification, 
  addNotification,
  clearError 
} = notificationSlice.actions;

export default notificationSlice.reducer;
