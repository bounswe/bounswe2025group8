import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import type { ThemeTokens } from '../../constants/Colors';
import type { Notification } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useTranslation } from 'react-i18next';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_HEIGHT = 100;

interface NotificationToastProps {
    notification: Notification;
    onDismiss: () => void;
}

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    const { colors } = useTheme();
    const themeColors = colors as unknown as ThemeTokens;
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();

    const translateY = useRef(new Animated.Value(-TOAST_HEIGHT)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    // Slide in animation
    useEffect(() => {
        Animated.spring(translateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, []);

    // Pan responder for swipe to dismiss
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to significant horizontal movement
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                translateX.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                // If swiped more than 1/3 of screen width, dismiss
                if (Math.abs(gestureState.dx) > SCREEN_WIDTH / 3) {
                    handleDismiss();
                } else {
                    // Spring back to original position
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 50,
                        friction: 8,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -TOAST_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: SCREEN_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    const handlePress = () => {
        handleDismiss();

        // Navigate to related task if available
        if (notification.related_task) {
            const path =
                notification.related_task.creator?.id === user?.id
                    ? '/r-request-details'
                    : '/v-request-details';
            router.push({ pathname: path, params: { id: notification.related_task.id } });
        }
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'TASK_APPLIED':
            case 'VOLUNTEER_APPLIED':
                return 'person-add';
            case 'TASK_ASSIGNED':
                return 'checkmark-circle';
            case 'TASK_COMPLETED':
                return 'checkmark-done-circle';
            case 'TASK_CANCELLED':
                return 'close-circle';
            case 'REVIEW_RECEIVED':
                return 'star';
            default:
                return 'notifications';
        }
    };

    const getRelativeTime = (timestamp: string) => {
        const now = Date.now();
        const notificationTime = new Date(timestamp).getTime();
        const secondsAgo = Math.floor((now - notificationTime) / 1000);

        if (secondsAgo < 60) return t('common.time.justNow');
        if (secondsAgo < 3600) {
            const minutes = Math.floor(secondsAgo / 60);
            return t('common.time.minutesAgo', { count: minutes });
        }
        if (secondsAgo < 86400) {
            const hours = Math.floor(secondsAgo / 3600);
            return t('common.time.hoursAgo', { count: hours });
        }
        const days = Math.floor(secondsAgo / 86400);
        return t('common.time.daysAgo', { count: days });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.primary,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getNotificationIcon()}
                        size={24}
                        color={themeColors.primary}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
                        {t(`notifications.types.${notification.type.toUpperCase()}`, {
                            defaultValue: notification.type_display,
                        })}
                    </Text>
                    <Text style={[styles.message, { color: themeColors.text }]} numberOfLines={2}>
                        {notification.content}
                    </Text>
                    <Text style={[styles.time, { color: themeColors.textMuted }]}>
                        {getRelativeTime(notification.timestamp)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={20} color={themeColors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    message: {
        fontSize: 13,
        marginBottom: 4,
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});
