import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useNotifications } from '../../lib/NotificationContext';
import type { ThemeTokens } from '../../constants/Colors';

interface NotificationIconWithBadgeProps {
    size?: number;
    style?: any;
}

export default function NotificationIconWithBadge({ size = 24, style }: NotificationIconWithBadgeProps) {
    const { colors } = useTheme();
    const themeColors = colors as unknown as ThemeTokens;
    const router = useRouter();
    const { unreadCount } = useNotifications();

    return (
        <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={[{ position: 'relative' }, style]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : "Open notifications"}
        >
            <Ionicons
                name="notifications-outline"
                size={size}
                color={colors.text}
                accessible={false}
                importantForAccessibility="no"
            />
            {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: themeColors.error }]}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
