import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import {
    useNotifications,
    useMarkNotificationRead,
    useMarkAllRead,
    formatNotificationTime,
    formatNotificationDate,
    groupNotificationsByDate,
    getNotificationStyle,
    getNotificationDeepLink,
    truncateNotificationContent,
} from '../features/notification';
import type { Notification } from '../features/notification';

const Notifications = () => {
    const { colors } = useTheme();
    const navigate = useNavigate();
    const [showUnreadOnly, setShowUnreadOnly] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        refetch,
        clearErrorMessage,
    } = useNotifications({
        autoFetch: true,
        fetchInterval: 60000, // Poll every minute
        unreadOnly: showUnreadOnly,
    });

    const { markAsRead, markAsUnread } = useMarkNotificationRead();
    const { markAllAsRead, loading: markingAll } = useMarkAllRead();

    const groupedNotifications = groupNotificationsByDate(notifications);

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if unread
        if (!notification.is_read) {
            try {
                await markAsRead(notification.id);
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }

        // Navigate to deep link
        const link = getNotificationDeepLink(notification);
        navigate(link);
    };

    const handleToggleRead = async (
        e: React.MouseEvent,
        notification: Notification
    ) => {
        e.stopPropagation();
        try {
            if (notification.is_read) {
                await markAsUnread(notification.id);
            } else {
                await markAsRead(notification.id);
            }
            // Refresh notifications to show updated state
            await refetch();
        } catch (err) {
            console.error('Failed to toggle read status:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            // Refresh notifications to show updated state
            await refetch();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleToggleExpand = (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation();
        setExpandedId(expandedId === notificationId ? null : notificationId);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
            }}
        >
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1
                        style={{
                            fontSize: '2.25rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: colors.text.primary,
                        }}
                    >
                        Notifications
                    </h1>
                    <p
                        style={{
                            fontSize: '1rem',
                            color: colors.text.secondary,
                        }}
                    >
                        Stay updated with your latest activity
                    </p>
                </div>

                {/* Stats and Actions Bar */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: colors.background.elevated,
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        border: `1px solid ${colors.border.primary}`,
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Unread Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: colors.background.secondary,
                                borderRadius: '0.5rem',
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🔔</span>
                            <span style={{ fontWeight: '600', color: colors.text.primary }}>
                                {unreadCount}
                            </span>
                            <span style={{ color: colors.text.secondary, fontSize: '0.875rem' }}>
                                unread
                            </span>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: showUnreadOnly
                                    ? colors.brand.primary
                                    : colors.background.secondary,
                                color: showUnreadOnly ? colors.text.inverse : colors.text.primary,
                                border: `1px solid ${colors.border.primary}`,
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                            }}
                            aria-pressed={showUnreadOnly}
                        >
                            {showUnreadOnly ? '📬 Unread Only' : '📭 All Notifications'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* Refresh Button */}
                        <button
                            onClick={() => refetch()}
                            disabled={loading}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: colors.background.secondary,
                                color: colors.text.primary,
                                border: `1px solid ${colors.border.primary}`,
                                borderRadius: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                opacity: loading ? 0.6 : 1,
                            }}
                            aria-label="Refresh notifications"
                        >
                            {loading ? '⏳ Loading...' : '🔄 Refresh'}
                        </button>

                        {/* Mark All Read Button */}
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={markingAll}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: colors.brand.primary,
                                    color: colors.text.inverse,
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: markingAll ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    opacity: markingAll ? 0.6 : 1,
                                }}
                                aria-label="Mark all notifications as read"
                            >
                                {markingAll ? '⏳ Marking...' : '✓ Mark All Read'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        style={{
                            padding: '1rem',
                            backgroundColor: colors.semantic.errorBg,
                            color: colors.semantic.error,
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: `1px solid ${colors.semantic.error}`,
                        }}
                    >
                        <span>⚠️ {error}</span>
                        <button
                            onClick={clearErrorMessage}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: colors.semantic.error,
                                cursor: 'pointer',
                                fontSize: '1.25rem',
                                padding: '0.25rem',
                            }}
                            aria-label="Dismiss error"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && notifications.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: colors.text.secondary,
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                        <p>Loading notifications...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && notifications.length === 0 && (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: colors.background.elevated,
                            borderRadius: '0.75rem',
                            border: `1px solid ${colors.border.primary}`,
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔕</div>
                        <h3
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: colors.text.primary,
                            }}
                        >
                            {showUnreadOnly ? 'No Unread Notifications' : 'No Notifications'}
                        </h3>
                        <p style={{ color: colors.text.secondary }}>
                            {showUnreadOnly
                                ? "You're all caught up! Check back later for updates."
                                : 'When you receive notifications, they will appear here.'}
                        </p>
                    </div>
                )}

                {/* Notifications List */}
                {!loading && notifications.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {Object.entries(groupedNotifications).map(([date, notifs]) => (
                            <div key={date}>
                                {/* Date Header */}
                                <h2
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: colors.text.secondary,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '0.75rem',
                                    }}
                                >
                                    {date}
                                </h2>

                                {/* Notifications in this group */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {notifs.map((notification) => {
                                        const { icon, color } = getNotificationStyle(notification.type);
                                        const timeAgo = formatNotificationTime(notification.timestamp);
                                        const fullDate = formatNotificationDate(notification.timestamp);
                                        const isExpanded = expandedId === notification.id;
                                        const shouldTruncate = notification.content.length > 100;

                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                style={{
                                                    padding: '1rem',
                                                    backgroundColor: notification.is_read
                                                        ? colors.background.elevated
                                                        : colors.background.secondary,
                                                    borderLeft: `4px solid ${color}`,
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    border: `1px solid ${colors.border.primary}`,
                                                    opacity: notification.is_read ? 0.7 : 1,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        colors.interactive.hover;
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = notification.is_read
                                                        ? colors.background.elevated
                                                        : colors.background.secondary;
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`Notification: ${notification.content}`}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '1rem',
                                                    }}
                                                >
                                                    {/* Icon */}
                                                    <div
                                                        style={{
                                                            fontSize: '1.5rem',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {icon}
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {/* Type Badge */}
                                                        <div
                                                            style={{
                                                                display: 'inline-block',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                color: color,
                                                                backgroundColor: color + '20',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '0.25rem',
                                                                marginBottom: '0.5rem',
                                                            }}
                                                        >
                                                            {notification.type_display}
                                                        </div>

                                                        {/* Notification Content */}
                                                        <p
                                                            style={{
                                                                color: colors.text.primary,
                                                                fontSize: '0.938rem',
                                                                lineHeight: '1.5',
                                                                marginBottom: '0.5rem',
                                                            }}
                                                        >
                                                            {isExpanded || !shouldTruncate
                                                                ? notification.content
                                                                : truncateNotificationContent(notification.content)}
                                                        </p>

                                                        {/* Expand/Collapse button */}
                                                        {shouldTruncate && (
                                                            <button
                                                                onClick={(e) => handleToggleExpand(e, notification.id)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: colors.brand.primary,
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.813rem',
                                                                    padding: '0.25rem 0',
                                                                    fontWeight: '500',
                                                                }}
                                                            >
                                                                {isExpanded ? '▲ Show less' : '▼ Show more'}
                                                            </button>
                                                        )}

                                                        {/* Metadata */}
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem',
                                                                fontSize: '0.813rem',
                                                                color: colors.text.secondary,
                                                                marginTop: '0.5rem',
                                                            }}
                                                        >
                                                            <span title={fullDate}>🕒 {timeAgo}</span>
                                                            {notification.related_task && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>📋 {notification.related_task.title}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.5rem',
                                                            alignItems: 'flex-end',
                                                        }}
                                                    >
                                                        {/* Read/Unread Toggle */}
                                                        <button
                                                            onClick={(e) => handleToggleRead(e, notification)}
                                                            style={{
                                                                background: 'none',
                                                                border: `1px solid ${colors.border.primary}`,
                                                                borderRadius: '0.25rem',
                                                                padding: '0.25rem 0.5rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.75rem',
                                                                color: colors.text.secondary,
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                            aria-label={
                                                                notification.is_read
                                                                    ? 'Mark as unread'
                                                                    : 'Mark as read'
                                                            }
                                                            title={
                                                                notification.is_read
                                                                    ? 'Mark as unread'
                                                                    : 'Mark as read'
                                                            }
                                                        >
                                                            {notification.is_read ? '📭 Unread' : '✓ Read'}
                                                        </button>

                                                        {/* Unread indicator */}
                                                        {!notification.is_read && (
                                                            <div
                                                                style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: colors.brand.primary,
                                                                }}
                                                                aria-label="Unread notification"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
