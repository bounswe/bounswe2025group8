/**
 * Unit Tests for Notification System
 * Tests notification filtering, formatting, and state management
 */

describe('Notification Types', () => {
    const NOTIFICATION_TYPES = {
        TASK_ASSIGNED: 'task_assigned',
        TASK_COMPLETED: 'task_completed',
        NEW_VOLUNTEER: 'new_volunteer',
        COMMENT_ADDED: 'comment_added',
        VOLUNTEER_ACCEPTED: 'volunteer_accepted',
        VOLUNTEER_REJECTED: 'volunteer_rejected',
    };

    test('defines all expected notification types', () => {
        expect(NOTIFICATION_TYPES.TASK_ASSIGNED).toBe('task_assigned');
        expect(NOTIFICATION_TYPES.TASK_COMPLETED).toBe('task_completed');
        expect(NOTIFICATION_TYPES.NEW_VOLUNTEER).toBe('new_volunteer');
        expect(NOTIFICATION_TYPES.COMMENT_ADDED).toBe('comment_added');
        expect(NOTIFICATION_TYPES.VOLUNTEER_ACCEPTED).toBe('volunteer_accepted');
        expect(NOTIFICATION_TYPES.VOLUNTEER_REJECTED).toBe('volunteer_rejected');
    });
});

describe('Notification Formatting', () => {
    const formatNotificationTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    test('formats recent notifications as just now', () => {
        const now = new Date().toISOString();
        expect(formatNotificationTime(now)).toBe('Just now');
    });

    test('formats minutes ago correctly', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
        expect(formatNotificationTime(fiveMinutesAgo)).toBe('5m ago');
    });

    test('formats hours ago correctly', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
        expect(formatNotificationTime(twoHoursAgo)).toBe('2h ago');
    });

    test('formats days ago correctly', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
        expect(formatNotificationTime(threeDaysAgo)).toBe('3d ago');
    });
});

describe('Notification Filtering', () => {
    const notifications = [
        { id: 1, type: 'task_assigned', is_read: false },
        { id: 2, type: 'comment_added', is_read: true },
        { id: 3, type: 'task_completed', is_read: false },
        { id: 4, type: 'new_volunteer', is_read: true },
    ];

    test('filters unread notifications', () => {
        const unread = notifications.filter(n => !n.is_read);
        expect(unread).toHaveLength(2);
        expect(unread.map(n => n.id)).toEqual([1, 3]);
    });

    test('filters by notification type', () => {
        const taskNotifications = notifications.filter(n =>
            n.type.startsWith('task_')
        );
        expect(taskNotifications).toHaveLength(2);
    });

    test('counts unread notifications', () => {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        expect(unreadCount).toBe(2);
    });
});

describe('Notification State Management', () => {
    interface Notification {
        id: number;
        is_read: boolean;
    }

    const markAsRead = (notifications: Notification[], id: number): Notification[] => {
        return notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        );
    };

    const markAllAsRead = (notifications: Notification[]): Notification[] => {
        return notifications.map(n => ({ ...n, is_read: true }));
    };

    test('marks single notification as read', () => {
        const notifications = [
            { id: 1, is_read: false },
            { id: 2, is_read: false },
        ];

        const updated = markAsRead(notifications, 1);

        expect(updated[0].is_read).toBe(true);
        expect(updated[1].is_read).toBe(false);
    });

    test('marks all notifications as read', () => {
        const notifications = [
            { id: 1, is_read: false },
            { id: 2, is_read: false },
            { id: 3, is_read: false },
        ];

        const updated = markAllAsRead(notifications);

        expect(updated.every(n => n.is_read)).toBe(true);
    });

    test('does not mutate original array', () => {
        const notifications = [{ id: 1, is_read: false }];
        const updated = markAsRead(notifications, 1);

        expect(notifications[0].is_read).toBe(false);
        expect(updated[0].is_read).toBe(true);
    });
});

describe('Notification Sorting', () => {
    const notifications = [
        { id: 1, created_at: '2024-01-01T10:00:00Z', is_read: false },
        { id: 2, created_at: '2024-01-03T10:00:00Z', is_read: true },
        { id: 3, created_at: '2024-01-02T10:00:00Z', is_read: false },
    ];

    test('sorts by date descending (newest first)', () => {
        const sorted = [...notifications].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(3);
        expect(sorted[2].id).toBe(1);
    });

    test('sorts unread first then by date', () => {
        const sorted = [...notifications].sort((a, b) => {
            if (a.is_read !== b.is_read) {
                return a.is_read ? 1 : -1; // Unread first
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        expect(sorted[0].id).toBe(3); // Unread, newer
        expect(sorted[1].id).toBe(1); // Unread, older
        expect(sorted[2].id).toBe(2); // Read
    });
});
