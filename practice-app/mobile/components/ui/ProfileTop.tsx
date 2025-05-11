import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import TabButton from './TabButton';
import RatingPill from './RatingPill';

type ProfileTopProps = {
    MOCK_USER: {
        name: string;
        profileImageUrl: string;
        totalRating: number;
        totalReviewCount: number;
        volunteerRating: number;
        volunteerReviewCount: number;
        requesterRating: number;
        requesterReviewCount: number;
    };
};

export default function ProfileTop({ MOCK_USER }: ProfileTopProps) {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme || 'light']; 
    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>


            {/* Top row with logo, bell and settings icons */}
            <View style={styles.topRow}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={[styles.logoImage, { borderColor: colors.primary }]}
                />

                <View style={{ flexDirection: 'row' }}>
                    <Ionicons name="notifications-outline" size={25} color={colors.text} style={styles.icon} />
                    <Ionicons name="settings-outline" size={25} color={colors.text} style={styles.icon} />
                </View>
            </View>


            {/* Main image placeholder */}
            {/* <View style={styles.mainImage} /> */}


            {/* Avatar and Info Column */}
            <View style={styles.avatarRow}>

                {/* Avatar */}

                <Image
                    source={{uri: MOCK_USER.profileImageUrl}}
                    style={styles.avatar}
                />

                {/* Info column */}
                <View style={styles.infoColumn}>

                    {/* Name */}
                    <Text style={[styles.name, { color: colors.text }]}> {MOCK_USER.name} </Text>

                    {/* Rating row */}
                    <View style={styles.ratingRow}>

                        {/* Rating pill */}
                        <RatingPill
                          rating={MOCK_USER.totalRating}
                          reviewCount={MOCK_USER.totalReviewCount}
                          backgroundColor={themeColors.pink}
                          textColor="#fff"
                          iconColor="#fff"
                        />

                        {/* Edit button */}
                        <TouchableOpacity style={[styles.editButton, { borderColor: colors.text }]}>
                            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    logoImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        resizeMode: 'cover',
    },
    icon: {
        marginRight: 6,
        marginLeft: 4,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 16,
    },
    infoColumn: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    editButton: {
        borderRadius: 6,
        borderWidth: 1,
        backgroundColor: 'transparent',
        paddingVertical: 3,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '400',
    },
}); 