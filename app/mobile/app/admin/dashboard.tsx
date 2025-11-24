import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Modal, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    getAdminReports,
    getReportedUsers,
    getAllUsers,
    getAdminStatistics,
    updateReportStatus,
    banUser,
    unbanUser,
    adminDeleteTask,
    Report,
    ReportedUser,
    UserListItem,
    AdminStatistics,
    ReportStatus,
    ReportType
} from '../../lib/api';

export default function AdminDashboard() {
    const { colors } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'all-users' | 'statistics'>('reports');
    const [reportEntityFilter, setReportEntityFilter] = useState<'all' | 'task' | 'user'>('all');

    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<ReportedUser[]>([]);
    const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
    const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and filter for All Users tab
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'active' | 'banned'>('all');

    // Action Modal State
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedUser, setSelectedUser] = useState<ReportedUser | null>(null);
    const [selectedRegularUser, setSelectedRegularUser] = useState<UserListItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [banReason, setBanReason] = useState('');
    const [unbanReason, setUnbanReason] = useState('');

    interface ExtendedReport extends Report {
        entityType: 'task' | 'user';
    }

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await getAdminReports(reportEntityFilter);
            const taskReports = response.data.task_reports.reports.map(r => ({ ...r, entityType: 'task' as const }));
            const userReports = response.data.user_reports.reports.map(r => ({ ...r, entityType: 'user' as const }));

            const all = [...taskReports, ...userReports].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setReports(all);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'reports') {
                await fetchReports();
            } else if (activeTab === 'users') {
                const response = await getReportedUsers();
                setUsers(response.data.users);
            } else if (activeTab === 'all-users') {
                const response = await getAllUsers(1, 50, userSearch, userFilter);
                setAllUsers(response.data.users);
            } else if (activeTab === 'statistics') {
                const response = await getAdminStatistics();
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            Alert.alert('Error', 'Failed to load data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, reportEntityFilter, userSearch, userFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleStatusUpdate = async (report: ExtendedReport, newStatus: ReportStatus) => {
        try {
            await updateReportStatus(report.id, report.entityType, newStatus, adminNote);
            Alert.alert('Success', 'Report status updated');
            setModalVisible(false);
            fetchReports();
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleBanUser = async () => {
        if (!selectedUser || !banReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for banning.');
            return;
        }

        Alert.alert('Confirm Ban', `Are you sure you want to ban ${selectedUser.username}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Ban User',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await banUser(selectedUser.user_id, banReason);
                        Alert.alert('Success', 'User has been banned.');
                        setModalVisible(false);
                        fetchData();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to ban user.');
                    }
                }
            }
        ]);
    };

    const handleUnbanUser = async () => {
        if (!selectedUser || !unbanReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for unbanning.');
            return;
        }

        Alert.alert('Confirm Unban', `Are you sure you want to unban ${selectedUser.username}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Unban User',
                style: 'default',
                onPress: async () => {
                    try {
                        await unbanUser(selectedUser.user_id, unbanReason);
                        Alert.alert('Success', 'User has been unbanned.');
                        setModalVisible(false);
                        fetchData();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to unban user.');
                    }
                }
            }
        ]);
    };

    const renderReportItem = ({ item }: { item: ExtendedReport }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
                setSelectedReport(item);
                setAdminNote(item.admin_notes || '');
                setModalVisible(true);
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: item.entityType === 'task' ? colors.primary : colors.notification }]}>
                    <Text style={styles.badgeText}>{item.entityType.toUpperCase()}</Text>
                </View>
                <Text style={[styles.date, { color: colors.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>


            <Text style={[styles.reason, { color: colors.text }]}>{(item.report_type || item.type || 'Unknown').replace(/_/g, ' ')}</Text>
            <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>


            <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.text }]}>Status:</Text>
                <Text style={[
                    styles.statusValue,
                    { color: item.status === ReportStatus.PENDING ? colors.notification : colors.primary }
                ]}>
                    {item.status}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }: { item: ReportedUser }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
                setSelectedUser(item);
                setBanReason('');
                setUnbanReason('');
                setModalVisible(true);
            }}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
                <View style={[styles.badge, { backgroundColor: item.is_active ? colors.primary : colors.notification }]}>
                    <Text style={styles.badgeText}>{item.is_active ? 'ACTIVE' : 'BANNED'}</Text>
                </View>
            </View>

            <Text style={[styles.email, { color: colors.text }]}>{item.email}</Text>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.notification }]}>{item.report_count}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Total Reports</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{item.user_report_count}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>User Reports</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{item.task_report_count}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Task Reports</Text>
                </View>
            </View>
            <View style={[styles.statsRow, { marginTop: 8 }]}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text, fontSize: 12 }]}>
                        {item.last_reported_at ? new Date(item.last_reported_at).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Last Reported</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderAllUserItem = ({ item }: { item: UserListItem }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
                setSelectedRegularUser(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
                <View style={[styles.badge, { backgroundColor: item.is_active ? colors.primary : colors.notification }]}>
                    <Text style={styles.badgeText}>{item.is_active ? 'ACTIVE' : 'BANNED'}</Text>
                </View>
            </View>

            <Text style={[styles.email, { color: colors.text }]}>{item.email}</Text>
            <Text style={[styles.description, { color: colors.text }]}>{item.name} {item.surname}</Text>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{item.rating.toFixed(1)}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Rating</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>{item.completed_task_count}</Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Tasks</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {new Date(item.date_joined).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.text }]}>Joined</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderStatisticsView = () => {
        if (!statistics) return null;

        return (
            <ScrollView style={styles.statsContainer} contentContainerStyle={styles.statsContent}>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.statCardTitle, { color: colors.text }]}>Users</Text>
                    <Text style={[styles.statCardValue, { color: colors.primary }]}>{statistics.total_users}</Text>
                    <View style={styles.statCardRow}>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Active: {statistics.active_users}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Inactive: {statistics.inactive_users}</Text>
                    </View>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.statCardTitle, { color: colors.text }]}>Tasks</Text>
                    <Text style={[styles.statCardValue, { color: colors.primary }]}>{statistics.total_tasks}</Text>
                    <View style={styles.statCardColumn}>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Posted: {statistics.tasks_by_status.POSTED}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Assigned: {statistics.tasks_by_status.ASSIGNED}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Completed: {statistics.tasks_by_status.COMPLETED}</Text>
                    </View>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.statCardTitle, { color: colors.text }]}>Reports</Text>
                    <Text style={[styles.statCardValue, { color: colors.notification }]}>{statistics.total_reports}</Text>
                    <View style={styles.statCardColumn}>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Pending: {statistics.reports_by_status.PENDING}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Under Review: {statistics.reports_by_status.UNDER_REVIEW}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Resolved: {statistics.reports_by_status.RESOLVED}</Text>
                        <Text style={[styles.statCardLabel, { color: colors.text }]}>Dismissed: {statistics.reports_by_status.DISMISSED}</Text>
                    </View>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.statCardTitle, { color: colors.text }]}>Recent Activity</Text>
                    <Text style={[styles.statCardValue, { color: colors.primary }]}>{statistics.reports_last_7_days}</Text>
                    <Text style={[styles.statCardLabel, { color: colors.text }]}>Reports in last 7 days</Text>
                </View>
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reports' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('reports')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'reports' ? colors.primary : colors.text }]}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'users' ? colors.primary : colors.text }]}>Reported</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all-users' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('all-users')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'all-users' ? colors.primary : colors.text }]}>All Users</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'statistics' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setActiveTab('statistics')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'statistics' ? colors.primary : colors.text }]}>Stats</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'all-users' && (
                <View style={styles.searchBar}>
                    <TextInput
                        style={[styles.searchInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                        placeholder="Search users..."
                        placeholderTextColor={colors.border}
                        value={userSearch}
                        onChangeText={setUserSearch}
                        onSubmitEditing={() => fetchData()}
                    />
                    <View style={styles.filterChips}>
                        {(['all', 'active', 'banned'] as const).map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: userFilter === filter ? colors.primary : colors.card, borderColor: colors.border }
                                ]}
                                onPress={() => setUserFilter(filter)}
                            >
                                <Text style={[styles.filterChipText, { color: userFilter === filter ? 'white' : colors.text }]}>
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {activeTab === 'reports' && (
                <View style={styles.filterBar}>
                    {(['all', 'task', 'user'] as const).map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                { backgroundColor: reportEntityFilter === filter ? colors.primary : colors.card, borderColor: colors.border }
                            ]}
                            onPress={() => setReportEntityFilter(filter)}
                        >
                            <Text style={[styles.filterChipText, { color: reportEntityFilter === filter ? 'white' : colors.text }]}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : activeTab === 'statistics' ? (
                renderStatisticsView()
            ) : (
                <FlatList
                    data={activeTab === 'reports' ? reports : activeTab === 'users' ? users : allUsers}
                    renderItem={activeTab === 'reports' ? renderReportItem as any : activeTab === 'users' ? renderUserItem as any : renderAllUserItem as any}
                    keyExtractor={(item: any) => item.id?.toString() || item.user_id?.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.text }]}>No items found.</Text>
                    }
                />
            )}

            {/* Detail/Action Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {selectedReport ? 'Manage Report' : selectedUser ? 'Manage User' : 'User Details'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                setSelectedReport(null);
                                setSelectedUser(null);
                                setSelectedRegularUser(null);
                            }}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalBody}>
                            {selectedReport && (
                                <>
                                    <Text style={[styles.label, { color: colors.text }]}>Description:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedReport.description}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Admin Notes:</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                        value={adminNote}
                                        onChangeText={setAdminNote}
                                        placeholder="Add notes..."
                                        placeholderTextColor={colors.border}
                                        multiline
                                    />

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Update Status:</Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.notification }]}
                                            onPress={() => handleStatusUpdate(selectedReport as ExtendedReport, ReportStatus.DISMISSED)}
                                        >
                                            <Text style={styles.actionButtonText}>Dismiss</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleStatusUpdate(selectedReport as ExtendedReport, ReportStatus.RESOLVED)}
                                        >
                                            <Text style={styles.actionButtonText}>Resolve</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {selectedUser && (
                                <>
                                    <Text style={[styles.label, { color: colors.text }]}>User:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedUser.username} ({selectedUser.email})</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Report Count:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedUser.report_count}</Text>

                                    {selectedUser.is_active ? (
                                        <>
                                            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Ban Reason:</Text>
                                            <TextInput
                                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                                value={banReason}
                                                onChangeText={setBanReason}
                                                placeholder="Reason for banning..."
                                                placeholderTextColor={colors.border}
                                                multiline
                                            />
                                            <TouchableOpacity
                                                style={[styles.banButton, { backgroundColor: colors.notification }]}
                                                onPress={handleBanUser}
                                            >
                                                <Text style={styles.actionButtonText}>Ban User</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[styles.bannedText, { color: colors.notification, marginTop: 16 }]}>User is banned.</Text>
                                            <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Unban Reason:</Text>
                                            <TextInput
                                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                                value={unbanReason}
                                                onChangeText={setUnbanReason}
                                                placeholder="Reason for unbanning..."
                                                placeholderTextColor={colors.border}
                                                multiline
                                            />
                                            <TouchableOpacity
                                                style={[styles.banButton, { backgroundColor: colors.primary }]}
                                                onPress={handleUnbanUser}
                                            >
                                                <Text style={styles.actionButtonText}>Unban User</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}

                            {selectedRegularUser && (
                                <>
                                    <Text style={[styles.label, { color: colors.text }]}>Username:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.username}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Email:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.email}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Name:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.name} {selectedRegularUser.surname}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Location:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.location || 'Not specified'}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Rating:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.rating.toFixed(1)} / 5.0</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Completed Tasks:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{selectedRegularUser.completed_task_count}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Joined:</Text>
                                    <Text style={[styles.value, { color: colors.text }]}>{new Date(selectedRegularUser.date_joined).toLocaleDateString()}</Text>

                                    <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Status:</Text>
                                    <View style={[styles.badge, { backgroundColor: selectedRegularUser.is_active ? colors.primary : colors.notification, alignSelf: 'flex-start', marginTop: 8 }]}>
                                        <Text style={styles.badgeText}>{selectedRegularUser.is_active ? 'ACTIVE' : 'BANNED'}</Text>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchBar: {
        padding: 12,
    },
    searchInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    filterBar: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    filterChips: {
        flexDirection: 'row',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginTop: 20,
    },
    listContent: {
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        opacity: 0.7,
    },
    reason: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        marginRight: 4,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.8,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    statsContainer: {
        flex: 1,
    },
    statsContent: {
        padding: 16,
    },
    statCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 16,
    },
    statCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    statCardValue: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    statCardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCardColumn: {
        gap: 8,
    },
    statCardLabel: {
        fontSize: 14,
        opacity: 0.8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        paddingBottom: 40,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    banButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    bannedText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
