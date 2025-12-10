import React from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ThemeTokens } from '../../constants/Colors';
import { BACKEND_BASE_URL } from '../../lib/api';

export interface FollowUser {
    id: number;
    username: string;
    name: string;
    surname: string;
    profile_photo: string | null;
    followed_at?: string;
}

interface FollowListModalProps {
    visible: boolean;
    onClose: () => void;
    users: FollowUser[];
    title: string;
    loading?: boolean;
}

export default function FollowListModal({
    visible,
    onClose,
    users,
    title,
    loading = false,
}: FollowListModalProps) {
    const { colors } = useTheme();
    const themeColors = colors as unknown as ThemeTokens;
    const router = useRouter();

    const handleUserPress = (userId: number) => {
        onClose();
        router.push({ pathname: '/profile', params: { userId: userId.toString() } });
    };

    const renderUser = ({ item }: { item: FollowUser }) => {
        const photoUrl = item.profile_photo
            ? item.profile_photo.startsWith('http')
                ? item.profile_photo
                : `${BACKEND_BASE_URL}${item.profile_photo}`
            : null;

        return (
            <TouchableOpacity
                style={[styles.userItem, { borderBottomColor: themeColors.border }]}
                onPress={() => handleUserPress(item.id)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`View ${item.name} ${item.surname}'s profile`}
            >
                <Image
                    source={
                        photoUrl
                            ? { uri: photoUrl }
                            : require('../../assets/images/empty_profile_photo.png')
                    }
                    style={[styles.avatar, { backgroundColor: themeColors.card }]}
                />
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: themeColors.text }]}>
                        {item.name} {item.surname}
                    </Text>
                    <Text style={[styles.username, { color: themeColors.textMuted }]}>
                        @{item.username}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={themeColors.textMuted} />
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
                    <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                        >
                            <Ionicons name="close" size={28} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={themeColors.primary} />
                        </View>
                    ) : users.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: themeColors.textMuted }]}>
                                No users to show
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={users}
                            renderItem={renderUser}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    username: {
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
    },
});
