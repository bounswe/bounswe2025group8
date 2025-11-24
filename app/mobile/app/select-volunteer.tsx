import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { getTaskApplicants, Volunteer, batchAssignVolunteers } from '../lib/api';
import type { ThemeTokens } from '../constants/Colors';

export default function SelectVolunteer() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const themeColors = colors as ThemeTokens;

    const taskIdParam = (params.taskId as string | undefined) ?? (params.id as string | undefined);
    const taskId = taskIdParam ? parseInt(taskIdParam, 10) : null;
    const requiredVolunteers = params.requiredVolunteers ? parseInt(params.requiredVolunteers as string, 10) : 1;

    const [applicants, setApplicants] = useState<Volunteer[]>([]);
    const [assignedVolunteers, setAssignedVolunteers] = useState<Volunteer[]>([]);
    const [selectedApplicants, setSelectedApplicants] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        if (!taskId) {
            setError("Task ID is missing.");
            setIsLoading(false);
            return;
        }

        const fetchVolunteers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch both ACCEPTED and PENDING volunteers
                const [acceptedResponse, pendingResponse] = await Promise.all([
                    getTaskApplicants(taskId, 'ACCEPTED', 1, 50),
                    getTaskApplicants(taskId, 'PENDING', 1, 50)
                ]);

                if (acceptedResponse.status === 'success') {
                    setAssignedVolunteers(acceptedResponse.data.volunteers);
                    // Pre-select assigned volunteers
                    setSelectedApplicants(acceptedResponse.data.volunteers);
                }

                if (pendingResponse.status === 'success') {
                    // Filter out any users who are already assigned
                    const assignedUserIds = new Set(acceptedResponse.data.volunteers.map(v => v.user.id));
                    const pendingApplicants = pendingResponse.data.volunteers.filter(app => !assignedUserIds.has(app.user.id));
                    setApplicants(pendingApplicants);
                } else if (acceptedResponse.status !== 'success') {
                    setError(acceptedResponse.message || "Failed to fetch volunteers.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
                console.error("Fetch volunteers error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVolunteers();
    }, [taskId]);

    const toggleSelectApplicant = (applicant: Volunteer) => {
        setSelectedApplicants(prevSelected => {
            const isAlreadySelected = prevSelected.some(v => v.id === applicant.id);
            if (isAlreadySelected) {
                return prevSelected.filter(v => v.id !== applicant.id);
            } else {
                // Check if we exceed the required number
                if (prevSelected.length >= requiredVolunteers) {
                    Alert.alert("Selection Limit", `You can select up to ${requiredVolunteers} volunteer(s).`);
                    return prevSelected;
                }
                return [...prevSelected, applicant];
            }
        });
    };
    
    const handleConfirmAssignment = async () => {
        if (selectedApplicants.length === 0) {
            Alert.alert("No Selection", "Please select at least one volunteer to assign.");
            return;
        }

        const volunteerIds = selectedApplicants.map(v => v.id);
        const actionText = selectedApplicants.length === assignedVolunteers.length && 
                          selectedApplicants.every(sel => assignedVolunteers.some(assigned => assigned.id === sel.id))
                          ? "update assignments" 
                          : `assign ${selectedApplicants.length} volunteer(s)`;

        Alert.alert(
            "Confirm Assignment", 
            `Are you sure you want to ${actionText} to this task?`, 
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
                        try {
                            const response = await batchAssignVolunteers(taskId, volunteerIds);
                            
                            Alert.alert("Assignment Complete", response.message || `Successfully assigned ${response.data.total_assigned} volunteer(s).`, [
                                {
                                    text: "OK",
                                    onPress: () => {
                                        if (router.canGoBack()) router.back();
                                        else router.replace(`/r-request-details?id=${taskId}`);
                                    }
                                }
                            ]);
                        } catch (e: any) {
                            Alert.alert("Error", e.message || "An unexpected error occurred during assignment.");
                            console.error("Assignment error:", e);
                        } finally {
                            setIsAssigning(false);
                        }
                    }
                }
            ]
        );
    };

    const renderApplicantItem = ({ item }: { item: Volunteer }) => {
        const isSelected = selectedApplicants.some(v => v.id === item.id);
        const isAssigned = assignedVolunteers.some(v => v.id === item.id);
        const canSelectMore = selectedApplicants.length < requiredVolunteers;

        return (
            <View style={[styles.volunteerRow, { borderBottomColor: themeColors.border }]}>
                <TouchableOpacity
                    style={[styles.volunteerInfo, { backgroundColor: themeColors.card }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        router.push({ pathname: '/profile', params: { userId: String(item.user.id) } });
                    }}
                    accessible

                    accessibilityRole="button"
                    accessibilityLabel={`View profile for ${item.user.name} ${item.user.surname}`}
                >
                    <Image
                        source={item.user.photo ? { uri: item.user.photo } : require('../assets/images/avatar.png')}
                        style={[styles.avatar, { backgroundColor: themeColors.border }]}
                    />
                    <View style={styles.volunteerTextContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.volunteerName, { color: themeColors.text }]}>{item.user.name} {item.user.surname}</Text>
                            {isAssigned && (
                                <Text
                                    style={[
                                        styles.assignedBadge,
                                        { backgroundColor: themeColors.primary, color: themeColors.onPrimary },
                                    ]}
                                >
                                    {' '}
                                    Assigned
                                </Text>
                            )}
                        </View>
                        <Text style={[styles.volunteerUsername, { color: themeColors.textMuted }]}>@{item.user.username}</Text>
                        <Text style={[styles.volunteerRating, { color: themeColors.textMuted }]}>Rating: {item.user.rating ? Number(item.user.rating).toFixed(1) : 'N/A'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.checkButton,
                        {
                            backgroundColor: isSelected ? themeColors.primary : themeColors.card,
                            borderColor: themeColors.primary,
                        },
                    ]}
                    onPress={() => toggleSelectApplicant(item)}
                    disabled={!isSelected && !canSelectMore}
                    accessible

                    accessibilityRole="button"
                    accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${item.user.name}`}
                    accessibilityState={{ selected: isSelected, disabled: !isSelected && !canSelectMore }}
                >
                    <Ionicons 
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                        size={28} 
                        color={isSelected ? themeColors.onPrimary : themeColors.primary} 
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
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                    accessible

                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.buttonText, { color: themeColors.onPrimary }]}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border, borderBottomWidth: 1 }]}>
                <TouchableOpacity
                  onPress={() => router.canGoBack() ? router.back() : router.replace('/feed')}
                  style={styles.backButton}
                  accessible

                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                    <Ionicons name="arrow-back" size={24} color={themeColors.text}  accessible={false} importantForAccessibility="no"/>
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>Select Volunteers</Text>
                <View style={{width: 24}} />{/* Spacer */}
            </View>

            <Text style={[styles.infoText, { color: themeColors.textMuted, marginHorizontal: 15, marginVertical: 5}]}>
                Required: {requiredVolunteers}, Currently Selected: {selectedApplicants.length}
            </Text>
            <Text style={[styles.infoText, { color: themeColors.primary, marginHorizontal: 15, marginBottom: 10}]}>
                {selectedApplicants.length > 0 
                    ? `${selectedApplicants.length} selected. ${requiredVolunteers - selectedApplicants.length} slot(s) remaining.` 
                    : `Select up to ${requiredVolunteers} volunteer(s).`}
            </Text>

            {(assignedVolunteers.length > 0 || applicants.length > 0) && (
                <FlatList
                    data={[...assignedVolunteers, ...applicants]}
                    renderItem={renderApplicantItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    extraData={selectedApplicants} // Ensure re-render on selection change
                />
            )}

            {assignedVolunteers.length === 0 && applicants.length === 0 && (
                <Text style={[styles.centeredText, { color: themeColors.textMuted }]}>No volunteers available for this task.</Text>
            )}

            {selectedApplicants.length > 0 && (
                 <TouchableOpacity
                    style={[
                        styles.confirmButton, 
                        { 
                            backgroundColor: selectedApplicants.length > 0 && !isAssigning ? themeColors.primary : themeColors.border 
                        }
                    ]}
                    onPress={handleConfirmAssignment}
                    disabled={selectedApplicants.length === 0 || isAssigning}
                    accessible

                    accessibilityRole="button"
                    accessibilityLabel="Confirm volunteer assignment"
                    accessibilityState={{ disabled: selectedApplicants.length === 0 || isAssigning }}
                >
                    {isAssigning ? (
                        <ActivityIndicator color={themeColors.onPrimary} />
                    ) : (
                        <Text
                            style={[
                                styles.buttonText,
                                {
                                    color:
                                        selectedApplicants.length > 0 ? themeColors.onPrimary : themeColors.textMuted,
                                },
                            ]}
                        >
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
    assignedBadge: {
        fontSize: 11,
        fontWeight: '600',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
}); 
