import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeTokens } from '../../constants/Colors';

interface DetailRowProps {
    label?: string;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    value: string;
    themeColors: ThemeTokens;
    testID?: string;
}

export function DetailRow({ label, icon, value, themeColors, testID }: DetailRowProps) {
    if (icon) {
        return (
            <View style={styles.infoRow} testID={testID}>
                <Ionicons name={icon} size={25} color={themeColors.textMuted} style={styles.icon} />
                <Text style={[styles.infoText, { color: themeColors.textMuted }]}>{value}</Text>
            </View>
        );
    }

    return (
        <View style={styles.detailRow} testID={testID}>
            <Text style={[styles.detailLabel, { color: themeColors.textMuted }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 12,
    },
    infoText: {
        fontSize: 14,
    },
});
