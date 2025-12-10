// app/index.tsx
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

import { ThemeTokens } from '@/constants/Colors';

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Language Toggle */}
      <TouchableOpacity
        onPress={() => {
          const newLang = i18n.language === 'en' ? 'tr' : 'en';
          i18n.changeLanguage(newLang);
        }}
        style={{ position: 'absolute', top: 50, right: 20, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, zIndex: 10 }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>
          {i18n.language === 'en' ? 'TR' : 'EN'}
        </Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />

      {/* Main title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {t('common.app')}
      </Text>

      {/* Buttons side by side */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.halfButton,
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => router.push('/signin')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Go to login"
          testID="landing-login-button"
        >
          <Text style={[styles.primaryText, { color: themeColors.onPrimary }]}>{t('auth.signIn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.halfButton,
            styles.secondaryButton,
            { borderColor: colors.primary },
          ]}
          onPress={() => router.push('/signup')}
          accessible

          accessibilityRole="button"
          accessibilityLabel="Register a new account"
          testID="landing-register-button"
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>
            {t('auth.signUp')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* OR separator */}
      <Text style={[styles.orText, { color: colors.text }]}>{t('common.or')}</Text>

      {/* Continue as guest */}
      <TouchableOpacity
        onPress={() => router.push('/feed')}
        accessible

        accessibilityRole="button"
        accessibilityLabel="Continue as guest"
      >
        <Text style={[styles.guestLink, { color: colors.primary }]}>
          {t('feed.guest')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  halfButton: {
    flex: 1,
    padding: 14,
    borderRadius: 36,
    alignItems: 'center',
  },
  primaryButton: {
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginLeft: 8,
  },
  primaryText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    marginVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  guestText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  guestLink: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
  },
});
