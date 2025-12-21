/**
 * Unit Tests for Notification Utilities
 * Tests notification parsing, formatting, and filtering logic
 */

describe('Notification Utilities', () => {
    // Notification types from backend
    const NOTIFICATION_TYPES = {
        TASK_ASSIGNED: 'TASK_ASSIGNED',
        TASK_COMPLETED: 'TASK_COMPLETED',
        NEW_VOLUNTEER: 'NEW_VOLUNTEER',
        VOLUNTEER_ACCEPTED: 'VOLUNTEER_ACCEPTED',
        VOLUNTEER_REJECTED: 'VOLUNTEER_REJECTED',
        NEW_COMMENT: 'NEW_COMMENT',
        NEW_REVIEW: 'NEW_REVIEW',
        NEW_FOLLOWER: 'NEW_FOLLOWER',
        TASK_UPDATED: 'TASK_UPDATED',
        TASK_CANCELLED: 'TASK_CANCELLED',
    };

    describe('getNotificationIcon', () => {
        const getNotificationIcon = (type: string): string => {
            const icons: Record<string, string> = {
                'TASK_ASSIGNED': '✅',
                'TASK_COMPLETED': '🎉',
                'NEW_VOLUNTEER': '👋',
                'VOLUNTEER_ACCEPTED': '🤝',
                'VOLUNTEER_REJECTED': '❌',
                'NEW_COMMENT': '💬',
                'NEW_REVIEW': '⭐',
                'NEW_FOLLOWER': '👤',
                'TASK_UPDATED': '📝',
                'TASK_CANCELLED': '🚫',
            };
            return icons[type] || '🔔';
        };

        test('returns correct icon for task assigned', () => {
            expect(getNotificationIcon('TASK_ASSIGNED')).toBe('✅');
        });

        test('returns correct icon for new volunteer', () => {
            expect(getNotificationIcon('NEW_VOLUNTEER')).toBe('👋');
        });

        test('returns default bell for unknown type', () => {
            expect(getNotificationIcon('UNKNOWN')).toBe('🔔');
        });
    });

    describe('getNotificationPriority', () => {
        const getNotificationPriority = (type: string): 'high' | 'medium' | 'low' => {
            const highPriority = ['TASK_ASSIGNED', 'VOLUNTEER_ACCEPTED', 'TASK_CANCELLED'];
            const mediumPriority = ['NEW_VOLUNTEER', 'NEW_COMMENT', 'NEW_REVIEW'];

            if (highPriority.includes(type)) return 'high';
            if (mediumPriority.includes(type)) return 'medium';
            return 'low';
        };

        test('returns high for task assigned', () => {
            expect(getNotificationPriority('TASK_ASSIGNED')).toBe('high');
        });

        test('returns medium for new comment', () => {
            expect(getNotificationPriority('NEW_COMMENT')).toBe('medium');
        });

        test('returns low for follower notification', () => {
            expect(getNotificationPriority('NEW_FOLLOWER')).toBe('low');
        });
    });

    describe('filterUnreadNotifications', () => {
        const filterUnreadNotifications = (notifications: Array<{ is_read: boolean }>): Array<{ is_read: boolean }> => {
            return notifications.filter(n => !n.is_read);
        };

        const mockNotifications = [
            { is_read: false },
            { is_read: true },
            { is_read: false },
            { is_read: true },
        ];

        test('filters unread notifications', () => {
            const result = filterUnreadNotifications(mockNotifications);
            expect(result.length).toBe(2);
            expect(result.every(n => !n.is_read)).toBe(true);
        });

        test('returns empty for all read', () => {
            const allRead = [{ is_read: true }, { is_read: true }];
            expect(filterUnreadNotifications(allRead).length).toBe(0);
        });

        test('handles empty array', () => {
            expect(filterUnreadNotifications([])).toEqual([]);
        });
    });

    describe('groupNotificationsByDate', () => {
        const groupNotificationsByDate = (notifications: Array<{ timestamp: string }>): Record<string, Array<{ timestamp: string }>> => {
            return notifications.reduce((groups, notification) => {
                const date = notification.timestamp.split('T')[0];
                if (!groups[date]) {
                    groups[date] = [];
                }
                groups[date].push(notification);
                return groups;
            }, {} as Record<string, Array<{ timestamp: string }>>);
        };

        test('groups notifications by date', () => {
            const notifications = [
                { timestamp: '2024-12-20T10:00:00Z' },
                { timestamp: '2024-12-20T15:00:00Z' },
                { timestamp: '2024-12-19T10:00:00Z' },
            ];
            const grouped = groupNotificationsByDate(notifications);

            expect(Object.keys(grouped).length).toBe(2);
            expect(grouped['2024-12-20'].length).toBe(2);
            expect(grouped['2024-12-19'].length).toBe(1);
        });

        test('handles empty array', () => {
            expect(groupNotificationsByDate([])).toEqual({});
        });
    });

    describe('getUnreadCount', () => {
        const getUnreadCount = (notifications: Array<{ is_read: boolean }>): number => {
            return notifications.filter(n => !n.is_read).length;
        };

        test('counts unread notifications', () => {
            const notifications = [
                { is_read: false },
                { is_read: true },
                { is_read: false },
            ];
            expect(getUnreadCount(notifications)).toBe(2);
        });

        test('returns 0 for all read', () => {
            const notifications = [{ is_read: true }, { is_read: true }];
            expect(getUnreadCount(notifications)).toBe(0);
        });

        test('returns 0 for empty array', () => {
            expect(getUnreadCount([])).toBe(0);
        });
    });

    describe('formatNotificationBadge', () => {
        const formatNotificationBadge = (count: number): string => {
            if (count === 0) return '';
            if (count > 99) return '99+';
            return count.toString();
        };

        test('returns empty for 0', () => {
            expect(formatNotificationBadge(0)).toBe('');
        });

        test('returns number string for normal count', () => {
            expect(formatNotificationBadge(5)).toBe('5');
        });

        test('returns 99+ for high count', () => {
            expect(formatNotificationBadge(100)).toBe('99+');
            expect(formatNotificationBadge(500)).toBe('99+');
        });
    });

    describe('sortNotificationsByTimestamp', () => {
        const sortNotificationsByTimestamp = (notifications: Array<{ timestamp: string }>): Array<{ timestamp: string }> => {
            return [...notifications].sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
        };

        test('sorts newest first', () => {
            const notifications = [
                { timestamp: '2024-12-18T10:00:00Z' },
                { timestamp: '2024-12-20T10:00:00Z' },
                { timestamp: '2024-12-19T10:00:00Z' },
            ];
            const sorted = sortNotificationsByTimestamp(notifications);

            expect(sorted[0].timestamp).toContain('2024-12-20');
            expect(sorted[2].timestamp).toContain('2024-12-18');
        });

        test('handles empty array', () => {
            expect(sortNotificationsByTimestamp([])).toEqual([]);
        });
    });

    describe('shouldShowNotificationBanner', () => {
        const shouldShowNotificationBanner = (
            notification: { type: string; is_read: boolean },
            currentScreen: string
        ): boolean => {
            // Don't show if already read
            if (notification.is_read) return false;

            // Don't show task notifications on task screen
            if (notification.type.includes('TASK') && currentScreen === 'TaskDetail') return false;

            // Don't show comment notifications on comments screen
            if (notification.type === 'NEW_COMMENT' && currentScreen === 'Comments') return false;

            return true;
        };

        test('returns true for unread notification on different screen', () => {
            expect(shouldShowNotificationBanner(
                { type: 'NEW_VOLUNTEER', is_read: false },
                'Home'
            )).toBe(true);
        });

        test('returns false for read notification', () => {
            expect(shouldShowNotificationBanner(
                { type: 'NEW_VOLUNTEER', is_read: true },
                'Home'
            )).toBe(false);
        });

        test('returns false for task notification on task screen', () => {
            expect(shouldShowNotificationBanner(
                { type: 'TASK_ASSIGNED', is_read: false },
                'TaskDetail'
            )).toBe(false);
        });
    });
});

describe('Notification Content Parsing', () => {
    describe('extractTaskIdFromNotification', () => {
        const extractTaskIdFromNotification = (notification: {
            related_task?: { id: number } | null;
            content?: string;
        }): number | null => {
            if (notification.related_task?.id) {
                return notification.related_task.id;
            }
            // Try to extract from content (e.g., "Task #123 was updated")
            const match = notification.content?.match(/Task #(\d+)/);
            return match ? parseInt(match[1]) : null;
        };

        test('extracts from related_task', () => {
            const notification = { related_task: { id: 42 } };
            expect(extractTaskIdFromNotification(notification)).toBe(42);
        });

        test('extracts from content string', () => {
            const notification = { content: 'Task #123 was updated', related_task: null };
            expect(extractTaskIdFromNotification(notification)).toBe(123);
        });

        test('returns null when not found', () => {
            const notification = { content: 'You have a new follower', related_task: null };
            expect(extractTaskIdFromNotification(notification)).toBeNull();
        });
    });

    describe('getNotificationAction', () => {
        const getNotificationAction = (type: string): { screen: string; action?: string } => {
            switch (type) {
                case 'TASK_ASSIGNED':
                case 'TASK_UPDATED':
                case 'TASK_COMPLETED':
                    return { screen: 'TaskDetail' };
                case 'NEW_VOLUNTEER':
                    return { screen: 'TaskApplicants' };
                case 'NEW_COMMENT':
                    return { screen: 'Comments' };
                case 'NEW_REVIEW':
                    return { screen: 'Reviews' };
                case 'NEW_FOLLOWER':
                    return { screen: 'Profile' };
                default:
                    return { screen: 'Notifications' };
            }
        };

        test('returns TaskDetail for task notifications', () => {
            expect(getNotificationAction('TASK_ASSIGNED').screen).toBe('TaskDetail');
        });

        test('returns TaskApplicants for volunteer notification', () => {
            expect(getNotificationAction('NEW_VOLUNTEER').screen).toBe('TaskApplicants');
        });

        test('returns Notifications for unknown type', () => {
            expect(getNotificationAction('UNKNOWN').screen).toBe('Notifications');
        });
    });
});
