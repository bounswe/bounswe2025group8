import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const handleAgree = async () => {
    try {
      await AsyncStorage.setItem('termsAgreedV1', 'true');
      router.back();
    } catch (e) {
      // saving error
      console.error("Failed to save agreement to AsyncStorage", e);
      // Optionally, still try to go back or show an error to the user
      router.back(); // Or router.replace('/signup') as a fallback if AsyncStorage fails critically
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

      <Text style={[styles.title, { color: colors.text }]}>{t('terms.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.text + '99' }]}>{t('terms.lastUpdated')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section1.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section1.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section2.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section2.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section3.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section3.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section4.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section4.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section5.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section5.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section6.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section6.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section7.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section7.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section8.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section8.text')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('terms.section9.title')}</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          {t('terms.section9.text')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.agreeButton, { backgroundColor: colors.primary }]}
        onPress={handleAgree}
        accessible

        accessibilityRole="button"
        accessibilityLabel="Agree to terms"
      >
        <Text style={styles.agreeButtonText}>{t('terms.agreeButton')}</Text>
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
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    marginTop: 32,
    textAlign: 'center',
    alignSelf: 'center',
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
