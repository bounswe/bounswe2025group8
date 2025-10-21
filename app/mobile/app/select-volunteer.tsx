import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { getTaskApplicants, Volunteer, updateVolunteerAssignmentStatus } from '../lib/api';

// Helper to parse currentVolunteers, assuming it's a JSON string of Volunteer[] or UserProfile[]
const parseCurrentVolunteers = (param: string | string[] | undefined): Volunteer[] => {
    if (typeof param === 'string') {
        try {
            const parsed = JSON.parse(param);
            // Basic validation if it's an array (further validation of items might be needed)
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse currentVolunteers:", e);
            return [];
        }
    }
    return [];
};


export default function SelectVolunteer() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme || 'light'];

    const taskIdParam = (params.taskId as string | undefined) ?? (params.id as string | undefined);
    const taskId = taskIdParam ? parseInt(taskIdParam, 10) : null;
    const requiredVolunteers = params.requiredVolunteers ? parseInt(params.requiredVolunteers as string, 10) : 1;
    
    // Assuming currentVolunteers is passed as a JSON string of Volunteer[]
    // For simplicity, we'll treat currentVolunteers as those already accepted.
    // Their user objects will be used to avoid re-listing them if they somehow appear in 'PENDING' list.
    const initiallyAssignedVolunteers: Volunteer[] = useMemo(() => parseCurrentVolunteers(params.currentVolunteers), [params.currentVolunteers]);

    const [applicants, setApplicants] = useState<Volunteer[]>([]);
    const [selectedApplicants, setSelectedApplicants] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    const maxSelectable = useMemo(() => {
        return Math.max(0, requiredVolunteers - initiallyAssignedVolunteers.length);
    }, [requiredVolunteers, initiallyAssignedVolunteers]);

    useEffect(() => {
        if (!taskId) {
            setError("Task ID is missing.");
            setIsLoading(false);
            return;
        }

        const fetchApplicants = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch PENDING applicants
                const response = await getTaskApplicants(taskId, 'PENDING', 1, 50); // Fetch up to 50 pending applicants
                if (response.status === 'success') {
                    // Filter out any users who might already be in initiallyAssignedVolunteers (by user ID)
                    const assignedUserIds = new Set(initiallyAssignedVolunteers.map(v => v.user.id));
                    const pendingApplicants = response.data.volunteers.filter(app => !assignedUserIds.has(app.user.id));
                    setApplicants(pendingApplicants);
                } else {
                    setError(response.message || "Failed to fetch applicants.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
                console.error("Fetch applicants error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicants();
    }, [taskId, initiallyAssignedVolunteers]);

    const toggleSelectApplicant = (applicant: Volunteer, forceSelect?: boolean) => {
        setSelectedApplicants(prevSelected => {
            if (forceSelect) {
                if (prevSelected.some(v => v.id === applicant.id)) {
                    return prevSelected;
                }
                if (prevSelected.length < maxSelectable) {
                    return [...prevSelected, applicant];
                }
                return prevSelected;
            }
            const isAlreadySelected = prevSelected.some(v => v.id === applicant.id);
            if (isAlreadySelected) {
                return prevSelected.filter(v => v.id !== applicant.id);
            } else {
                if (prevSelected.length < maxSelectable) {
                    return [...prevSelected, applicant];
                } else {
                    Alert.alert("Selection Limit", `You can select up to ${maxSelectable} new volunteer(s).`);
                    return prevSelected;
                }
            }
        });
    };
    
    const handleConfirmAssignment = async () => {
        if (selectedApplicants.length === 0) {
            Alert.alert("No Selection", "Please select at least one volunteer to assign.");
            return;
        }

        Alert.alert(
            "Confirm Assignment", 
            `Are you sure you want to assign ${selectedApplicants.length} volunteer(s) to this task?`, 
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: async () => {
                        if (!taskId) {
                            Alert.alert("Error", "Task ID is missing. Cannot assign volunteers.");
                            return;
                        }
                        setIsAssigning(true);
                        const assignmentPromises = selectedApplicants.map(applicant => 
                            updateVolunteerAssignmentStatus(taskId, applicant.id, 'accept')
                        );
                        try {
                            const results = await Promise.allSettled(assignmentPromises);
                            
                            const successfulAssignments = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
                            const failedAssignments = results.length - successfulAssignments;

                            let message = `Successfully assigned ${successfulAssignments} volunteer(s).`;
                            if (failedAssignments > 0) {
                                message += `\nFailed to assign ${failedAssignments} volunteer(s).`;
                                results.forEach(r => {
                                    if (r.status === 'rejected') {
                                        console.error("Assignment error:", r.reason);
                                    } else if (r.status === 'fulfilled' && r.value.status !== 'success') {
                                        console.error("Assignment API error:", r.value.message);
                                    }
                                });
                            }

                            Alert.alert("Assignment Complete", message, [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        // Navigate back to request details, potentially with a refresh param
                                        // router.replace({ pathname: '/r-request-details', params: { taskId: taskId.toString(), refresh: 'true' } });
                                        // For now, just go back. The refresh logic needs to be handled in r-request-details.
                                        if (router.canGoBack()) router.back();
                                        else router.replace(`/r-request-details?taskId=${taskId}`);
                                    }
                                }
                            ]);
                        } catch (e: any) {
                            // This catch is for Promise.allSettled itself, which shouldn't really happen
                            Alert.alert("Error", "An unexpected error occurred during assignment.");
                            console.error("Unexpected assignment error:", e);
                        } finally {
                            setIsAssigning(false);
                            setSelectedApplicants([]); // Clear selection
                        }
                    }
                }
            ]
        );
    };

    const renderApplicantItem = ({ item }: { item: Volunteer }) => {
        const isSelected = selectedApplicants.some(v => v.id === item.id);
        const canSelectMore = selectedApplicants.length < maxSelectable;

        return (
            <View style={styles.volunteerRow}>
                <TouchableOpacity
                    style={[styles.volunteerInfo, { backgroundColor: themeColors.card }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        router.push({ pathname: '/profile', params: { userId: String(item.user.id) } });
                    }}
                >
                    <Image
                        source={item.user.photo ? { uri: item.user.photo } : require('../assets/images/avatar.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.volunteerTextContainer}>
                        <Text style={[styles.volunteerName, { color: themeColors.text }]}>{item.user.name} {item.user.surname}</Text>
                        <Text style={[styles.volunteerUsername, { color: themeColors.textMuted }]}>@{item.user.username}</Text>
                        <Text style={[styles.volunteerRating, { color: themeColors.textMuted }]}>Rating: {item.user.rating ? Number(item.user.rating).toFixed(1) : 'N/A'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.checkButton,
                        { 
                            backgroundColor: isSelected ? themeColors.primary : themeColors.background,
                            borderColor: themeColors.primary 
                        }
                    ]}
                    onPress={() => toggleSelectApplicant(item)}
                    disabled={!isSelected && !canSelectMore && selectedApplicants.length >= maxSelectable}
                >
                    <Ionicons 
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                        size={28} 
                        color={isSelected ? themeColors.background : themeColors.primary} 
                    />
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={{ color: themeColors.text, marginTop: 10 }}>Loading applicants...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <Text style={{ color: themeColors.error, marginBottom: 10 }}>Error: {error}</Text>
                <TouchableOpacity onPress={() => router.back()} style={[styles.actionButton, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    const remainingSlots = maxSelectable - selectedApplicants.length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border, borderBottomWidth: 1 }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/feed')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Select Volunteers</Text>
                <View style={{width: 24}} />{/* Spacer */}
            </View>

            {initiallyAssignedVolunteers.length > 0 && (
                <View style={[styles.assignedSection, { backgroundColor: themeColors.card, margin:10, borderRadius: 8, padding: 10}]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Already Assigned ({initiallyAssignedVolunteers.length}):</Text>
                    {initiallyAssignedVolunteers.map(v => (
                        <View key={v.id} style={[styles.assignedVolunteerItem, { borderBottomColor: themeColors.border}]}>
                             <Image 
                                source={v.user.photo ? { uri: v.user.photo } : require('../assets/images/avatar.png')} 
                                style={styles.assignedAvatar} 
                            />
                            <Text style={{color: themeColors.textMuted}}>@{v.user.username} ({v.status_display})</Text>
                        </View>
                    ))}
                </View>
            )}
            
            <Text style={[styles.infoText, { color: themeColors.textMuted, marginHorizontal: 15, marginVertical: 5}]}>
                Required: {requiredVolunteers}, Assigned: {initiallyAssignedVolunteers.length}, Max New Selections: {maxSelectable}
            </Text>
            <Text style={[styles.infoText, { color: themeColors.primary, marginHorizontal: 15, marginBottom: 10}]}>
                {selectedApplicants.length > 0 ? `${selectedApplicants.length} selected. ${remainingSlots < 0 ? 0 : remainingSlots} slot(s) remaining.` : `Select up to ${maxSelectable} volunteer(s).`}
            </Text>


            {applicants.length === 0 && maxSelectable > 0 && (
                <Text style={[styles.centeredText, { color: themeColors.textMuted }]}>No pending applicants for this task.</Text>
            )}
             {applicants.length === 0 && maxSelectable <= 0 && (
                <Text style={[styles.centeredText, { color: themeColors.textMuted }]}>All volunteer slots are filled or no new selections possible.</Text>
            )}

            {maxSelectable > 0 && applicants.length > 0 && (
                <FlatList
                    data={applicants}
                    renderItem={renderApplicantItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    extraData={selectedApplicants} // Ensure re-render on selection change
                />
            )}

            {(maxSelectable > 0 || selectedApplicants.length > 0) && (
                 <TouchableOpacity
                    style={[
                        styles.confirmButton, 
                        { 
                            backgroundColor: selectedApplicants.length > 0 && !isAssigning ? themeColors.primary : themeColors.border 
                        }
                    ]}
                    onPress={handleConfirmAssignment}
                    disabled={selectedApplicants.length === 0 || isAssigning}
                >
                    {isAssigning ? (
                        <ActivityIndicator color={themeColors.card} />
                    ) : (
                        <Text style={[styles.buttonText, {color: selectedApplicants.length > 0 ? themeColors.card : themeColors.textMuted}]}>
                            Confirm {selectedApplicants.length > 0 ? `${selectedApplicants.length} Assignment(s)` : 'Assignments'}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    centeredText: {
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 10 : 5, // Reduced paddingTop
        paddingBottom: 10,
        paddingHorizontal: 15,
        minHeight: Platform.OS === 'android' ? 50 : 45, // Reduced minHeight
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 14,
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 80, // Space for the confirm button
    },
    volunteerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginHorizontal: 5,
        borderBottomWidth: 1,
        // borderBottomColor: fetched from themeColors.border dynamically inline
    },
    volunteerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow text to take available space
        padding: 10, // Padding inside the card-like view
        borderRadius: 8, // Rounded corners for the card
        marginRight: 10, // Space before the check button
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#e0e0e0', // Placeholder color
    },
    volunteerTextContainer: {
        flex: 1, // Allow text to wrap
    },
    volunteerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    volunteerUsername: {
        fontSize: 14,
    },
    volunteerRating: {
        fontSize: 12,
        marginTop: 2,
    },
    checkButton: {
        padding: 5,
        borderRadius: 20, // Make it circular
        borderWidth: 2,
    },
    confirmButton: {
        position: 'absolute',
        bottom: 20,
        left: '5%',
        right: '5%',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    actionButton: { // For general actions like "Go Back" on error screen
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    assignedSection: {
      // Styles for the section showing already assigned volunteers
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginLeft: 5,
    },
    assignedVolunteerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        // borderBottomColor set dynamically
    },
    assignedAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        backgroundColor: '#e0e0e0',
    }
}); 
