import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function CommunityGuidelines() {
    const { colors } = useTheme();
    const router = useRouter();
    const { t } = useTranslation();

    const handleAgree = async () => {
        try {
            await AsyncStorage.setItem('communityGuidelinesAgreedV1', 'true');
            router.back();
        } catch (e) {
            console.error("Failed to save community guidelines agreement to AsyncStorage", e);
            router.back();
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Ionicons name="arrow-back" size={24} color={colors.primary} accessible={false} importantForAccessibility="no" />
                <Text style={[styles.backText, { color: colors.primary }]}>{t('common.back')}</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.text }]}>{t('communityGuidelines.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.text + '99' }]}>{t('communityGuidelines.lastUpdated')}</Text>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('communityGuidelines.intro.title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.intro.para1')}{'\n\n'}
                    {t('communityGuidelines.intro.para2')}{'\n\n'}
                    {t('communityGuidelines.intro.para3')}{'\n\n'}
                    {t('communityGuidelines.intro.para4')}{'\n\n'}
                    {t('communityGuidelines.intro.para5')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('communityGuidelines.corePrinciples.title')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p1Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p1Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p2Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p2Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p3Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p3Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p4Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p4Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p5Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p5Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p6Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p6Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.corePrinciples.p7Title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.corePrinciples.p7Text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('communityGuidelines.contentRules.title')}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.contentRules.allowedTitle')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.contentRules.allowedText')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>{t('communityGuidelines.contentRules.notAllowedTitle')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.contentRules.notAllowedText')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('communityGuidelines.responsibility.title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.responsibility.text')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('communityGuidelines.thankYou.title')}</Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>
                    {t('communityGuidelines.thankYou.text')}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.agreeButton, { backgroundColor: colors.primary }]}
                onPress={handleAgree}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Agree to community guidelines"
            >
                <Text style={styles.agreeButtonText}>{t('communityGuidelines.agreeButton')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        alignItems: 'flex-start',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backText: {
        marginLeft: 6,
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    agreeButton: {
        width: '100%',
        padding: 16,
        borderRadius: 36,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 24,
    },
    agreeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
