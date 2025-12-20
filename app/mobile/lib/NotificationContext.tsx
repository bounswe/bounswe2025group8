import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getNotifications, type Notification } from './api';
import { useAuth } from './auth';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_STORED_NOTIFICATIONS = 20;

interface NotificationContextType {
    unreadCount: number;
    latestNotifications: Notification[];
    newNotification: Notification | null;
    isPolling: boolean;
    clearNewNotification: () => void;
    refreshNotifications: () => Promise<void>;
    markNotificationAsShown: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
    const [newNotification, setNewNotification] = useState<Notification | null>(null);
    const [isPolling, setIsPolling] = useState(false);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const lastSeenNotificationIdRef = useRef<number>(0);
    const shownNotificationIdsRef = useRef<Set<number>>(new Set());
    const consecutiveFailuresRef = useRef(0);

    const fetchUnreadNotifications = useCallback(async () => {
        if (!user) return;

        try {
            const response = await getNotifications(1, 10, true);

            if (response.status === 'success') {
                const notifications = response.data.notifications;
                const count = response.data.unread_count;

                setUnreadCount(count);
                setLatestNotifications(notifications.slice(0, MAX_STORED_NOTIFICATIONS));

                // Check for new notifications to show as toast
                if (notifications.length > 0) {
                    const newestNotification = notifications[0];

                    // Show toast if:
                    // 1. It's newer than the last seen notification
                    // 2. We haven't already shown this notification
                    // 3. It was created within the last 60 seconds (to avoid showing old notifications on first load)
                    const notificationAge = Date.now() - new Date(newestNotification.timestamp).getTime();
                    const isRecent = notificationAge < 60000; // 60 seconds

                    if (
                        newestNotification.id > lastSeenNotificationIdRef.current &&
                        !shownNotificationIdsRef.current.has(newestNotification.id) &&
                        isRecent
                    ) {
                        setNewNotification(newestNotification);
                        shownNotificationIdsRef.current.add(newestNotification.id);
                        lastSeenNotificationIdRef.current = newestNotification.id;
                    } else if (newestNotification.id > lastSeenNotificationIdRef.current) {
                        // Update last seen ID even if we don't show the toast
                        lastSeenNotificationIdRef.current = newestNotification.id;
                    }
                }

                // Reset failure counter on success
                consecutiveFailuresRef.current = 0;
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            consecutiveFailuresRef.current += 1;

            // Stop polling after 5 consecutive failures
            if (consecutiveFailuresRef.current >= 5) {
                console.warn('Stopping notification polling due to repeated failures');
                stopPolling();
            }
        }
    }, [user]);

    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) return; // Already polling

        setIsPolling(true);

        // Fetch immediately
        fetchUnreadNotifications();

        // Then poll every 10 seconds
        pollingIntervalRef.current = setInterval(() => {
            if (appStateRef.current === 'active') {
                fetchUnreadNotifications();
            }
        }, POLLING_INTERVAL);
    }, [fetchUnreadNotifications]);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const clearNewNotification = useCallback(() => {
        setNewNotification(null);
    }, []);

    const refreshNotifications = useCallback(async () => {
        await fetchUnreadNotifications();
    }, [fetchUnreadNotifications]);

    const markNotificationAsShown = useCallback((id: number) => {
        shownNotificationIdsRef.current.add(id);
    }, []);

    // Handle app state changes (pause/resume)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            const previousState = appStateRef.current;
            appStateRef.current = nextAppState;

            if (previousState.match(/inactive|background/) && nextAppState === 'active') {
                // App came to foreground - resume polling
                if (user && !pollingIntervalRef.current) {
                    startPolling();
                }
            } else if (nextAppState.match(/inactive|background/)) {
                // App went to background - polling will pause automatically via appStateRef check
                console.log('App backgrounded - polling paused');
            }
        });

        return () => {
            subscription.remove();
        };
    }, [user, startPolling]);

    // Start/stop polling based on authentication
    useEffect(() => {
        if (user) {
            startPolling();
        } else {
            stopPolling();
            setUnreadCount(0);
            setLatestNotifications([]);
            setNewNotification(null);
            shownNotificationIdsRef.current.clear();
            lastSeenNotificationIdRef.current = 0;
            consecutiveFailuresRef.current = 0;
        }

        return () => {
            stopPolling();
        };
    }, [user, startPolling, stopPolling]);

    const value: NotificationContextType = {
        unreadCount,
        latestNotifications,
        newNotification,
        isPolling,
        clearNewNotification,
        refreshNotifications,
        markNotificationAsShown,
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
