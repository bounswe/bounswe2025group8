import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function SelectVolunteer() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme || 'light'];

    // Get the request from params
    const arrayName = params.arrayName as string;
    const index = typeof params.index === 'string' ? parseInt(params.index, 10) : Number(params.index);
    // Import the mock data map
    const { MOCK_V_ACTIVE_REQUESTS, MOCK_V_PAST_REQUESTS, MOCK_R_ACTIVE_REQUESTS, MOCK_R_PAST_REQUESTS } = require('./profile');
    const MOCK_MAP: Record<string, any[]> = { MOCK_V_ACTIVE_REQUESTS, MOCK_V_PAST_REQUESTS, MOCK_R_ACTIVE_REQUESTS, MOCK_R_PAST_REQUESTS };
    const requestsArray = MOCK_MAP[arrayName];
    const request = requestsArray && !isNaN(index) ? requestsArray[index] : null;
    type Volunteer = { name: string; profileImageUrl: string };
    const volunteers: Volunteer[] = (request?.volunteers || []) as Volunteer[];

    // State to track which volunteers are selected
    const [selected, setSelected] = useState<boolean[]>(volunteers.map(() => false));

    const toggleSelect = (idx: number) => {
        setSelected(prev => {
            const updated = [...prev];
            updated[idx] = !updated[idx];
            return updated;
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: themeColors.gray }}>
            {/* Sticky Header */}
            <View style={[styles.header, { backgroundColor: themeColors.background }]}>
                <View style={styles.titleContainer}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.title, { color: colors.text }]}> {'Select Volunteer'} </Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.container}>
                {volunteers.length === 0 && (
                    <Text style={{ color: colors.text, textAlign: 'center', marginTop: 32 }}>No volunteers available.</Text>
                )}
                {volunteers.map((volunteer: Volunteer, idx: number) => (
                    <View key={idx} style={styles.volunteerRow}>
                        <View style={[styles.volunteerInfo, { backgroundColor: themeColors.background }]}>
                            <View style={styles.avatarAndNameContainer}>
                                <Image source={{ uri: volunteer.profileImageUrl }} style={styles.avatar} />
                                <Text style={[styles.volunteerName, { color: colors.text }]}>{volunteer.name}</Text>
                            </View>

                            <TouchableOpacity onPress={() => { }}>
                                <Ionicons name="chevron-forward-outline" size={25} color={colors.primary} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            style={[styles.checkButton, { backgroundColor: selected[idx] ? colors.primary : colors.background, borderColor: colors.primary }]} 
                            onPress={() => toggleSelect(idx)}
                        >
                            <Ionicons name="checkmark-outline" size={20} color={selected[idx] ? '#fff' : colors.primary} />
                        </TouchableOpacity>

                    </View>
                ))}
            </ScrollView>

            {/* Button at the bottom */}
            <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: colors.primary, position: 'absolute', bottom: 20, left: '5%', right: '5%' }]}
                onPress={() => router.push({ pathname: '/select-volunteer', params: { arrayName, index } })}
            >
                <Text style={styles.buttonText}>Select Volunteer</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: 16,
        height: 55,
        paddingHorizontal: 24,
        justifyContent: 'flex-start',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
    },
    volunteerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 12,
    },
    volunteerInfo: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        height: 90,
        marginRight: 48,
        justifyContent: 'space-between',
    },
    avatarAndNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        margin: 12,
        backgroundColor: '#f2f2fd',
    },
    volunteerName: {
        fontSize: 16,
        fontWeight: '500',
    },
    icon: {
        marginRight: 30,
    },
    checkButton: {
        padding: 8,
        borderWidth: 1,
        borderRadius: 20,
    },
    selectButton: {
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        padding: 12,
        borderRadius: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '500',
    },
}); 