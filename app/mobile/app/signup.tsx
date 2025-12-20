// app/signup.tsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { ThemeTokens } from '@/constants/Colors';

const validatePassword = (password: string) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough,
    errors: {
      length: !isLongEnough,
      uppercase: !hasUpperCase,
      lowercase: !hasLowerCase,
      number: !hasNumber,
      special: !hasSpecialChar
    }
  };
};

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const themeColors = colors as unknown as ThemeTokens;
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [agreeCommunityGuidelines, setAgreeCommunityGuidelines] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const checkTermsAgreement = async () => {
        try {
          const agreed = await AsyncStorage.getItem('termsAgreedV1');
          if (agreed === 'true') {
            setAgree(true);
            await AsyncStorage.removeItem('termsAgreedV1');
          }
        } catch (e) {
          console.error("Failed to read terms agreement from AsyncStorage", e);
        }
      };
      const checkCommunityGuidelinesAgreement = async () => {
        try {
          const agreed = await AsyncStorage.getItem('communityGuidelinesAgreedV1');
          if (agreed === 'true') {
            setAgreeCommunityGuidelines(true);
            await AsyncStorage.removeItem('communityGuidelinesAgreedV1');
          }
        } catch (e) {
          console.error("Failed to read community guidelines agreement from AsyncStorage", e);
        }
      };
      checkTermsAgreement();
      checkCommunityGuidelinesAgreement();
    }, [])
  );

  const handleSignUp = async () => {
    if (!fullName || !username || !phone || !email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (!agree || !agreeCommunityGuidelines) {
      Alert.alert(t('common.error'), t('auth.agreeTerms'));
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      let errorMessage = t('auth.passwordRequirements');
      // Keeping detailed error messages in English for now as they are complex to map, or could map generic error
      Alert.alert(t('common.error'), errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting registration with:', { email, username });
      const response = await register(email, password, fullName, username, phone);
      console.log('Registration successful:', response);
      Alert.alert(t('common.ok'), t('auth.registrationSuccess'), [
        {
          text: t('common.ok'),
          onPress: () => router.replace('/signin')
        }
      ]);
    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert(
        t('auth.registrationFailed'),
        error.response?.data?.message || error.message || t('common.error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          testID="signup-scroll-view"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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

          <Image source={require('../assets/images/logo.png')} style={styles.logo} />

          <Text style={[styles.title, { color: colors.primary }]}>{t('auth.createAccount')}</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {t('auth.signUpSubtitle')}
          </Text>

          {/* Full Name */}
          <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('auth.name')}
              placeholderTextColor={themeColors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              editable={!isLoading}
              returnKeyType="next"
              accessibilityLabel="Full name"
              testID="signup-fullname-input"
            />
          </View>

          {/* Username */}
          <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
            <Ionicons name="at-outline" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('auth.username')}
              placeholderTextColor={themeColors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
              accessibilityLabel="Username"
              testID="signup-username-input"
            />
          </View>

          {/* Phone */}
          <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
            <Ionicons name="call-outline" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('auth.phone')}
              placeholderTextColor={themeColors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
              returnKeyType="next"
              accessibilityLabel="Phone number"
              testID="signup-phone-input"
            />
          </View>

          {/* Email */}
          <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('auth.email')}
              placeholderTextColor={themeColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
              accessibilityLabel="Email address"
              testID="signup-email-input"
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
            <Ionicons name="key-outline" size={20} color={colors.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={t('auth.password')}
              placeholderTextColor={themeColors.textMuted}
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              textContentType="none"
              autoComplete="off"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              accessibilityLabel="Password"
              testID="signup-password-input"
            />
            <Pressable
              onPress={() => setShowPwd(v => !v)}
              accessible

              accessibilityRole="button"
              accessibilityLabel={showPwd ? 'Hide password' : 'Show password'}
              testID="signup-password-toggle"
            >
              <Ionicons
                name={showPwd ? 'eye' : 'eye-off'}
                size={20}
                color={colors.icon}
              />
            </Pressable>
          </View>

          <View style={styles.rememberWrapper}>
            <Pressable
              onPress={() => setAgree(a => !a)}
              hitSlop={8}
              disabled={isLoading}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agree, disabled: isLoading }}
              testID="signup-terms-checkbox"
            >
              <Ionicons
                name={agree ? 'checkbox' : 'square-outline'}
                size={20}
                color={agree ? colors.primary : colors.icon}
              />
            </Pressable>

            <Text style={[styles.rememberText, { color: colors.text }]}>
              {t('auth.agreeWith')}
            </Text>

            <Pressable
              onPress={() => router.push({ pathname: '/terms' })}
              hitSlop={8}
              disabled={isLoading}
              accessible

              accessibilityRole="button"
              accessibilityLabel="View terms and conditions"
            >
              <Text style={[styles.rememberText, styles.linkText, { color: colors.primary }]}>
                {t('auth.termsAndConditions')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.rememberWrapper}>
            <Pressable
              onPress={() => setAgreeCommunityGuidelines(a => !a)}
              hitSlop={8}
              disabled={isLoading}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeCommunityGuidelines, disabled: isLoading }}
              testID="signup-community-guidelines-checkbox"
            >
              <Ionicons
                name={agreeCommunityGuidelines ? 'checkbox' : 'square-outline'}
                size={20}
                color={agreeCommunityGuidelines ? colors.primary : themeColors.icon}
              />
            </Pressable>

            <Text style={[styles.rememberText, { color: colors.text }]}>
              {t('auth.agreeWith')}
            </Text>

            <Pressable
              onPress={() => router.push({ pathname: '/community-guidelines' })}
              hitSlop={8}
              disabled={isLoading}
              accessible
              accessibilityRole="button"
              accessibilityLabel="View community guidelines"
            >
              <Text style={[styles.rememberText, styles.linkText, { color: colors.primary }]}>
                {t('auth.communityGuidelines')}
              </Text>
            </Pressable>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (!agree || !agreeCommunityGuidelines || isLoading) && { opacity: 0.5 }
            ]}
            disabled={!agree || !agreeCommunityGuidelines || isLoading}
            onPress={handleSignUp}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Sign up"
            testID="signup-button"
            accessibilityState={{ disabled: !agree || isLoading }}
          >
            <Text style={[styles.buttonText, { color: themeColors.onPrimary }]}>
              {isLoading ? t('auth.signingUp') : t('auth.signUp')}
            </Text>
          </TouchableOpacity>

          {/* Have an account? Login */}
          <View style={styles.signupPrompt}>
            <Text style={[styles.promptText, { color: colors.text }]}>
              {t('auth.hasAccount')}
            </Text>
            <TouchableOpacity
              testID="signup-signin-link"
              onPress={() => router.replace('/signin')}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Go to login"
            >
              <Text style={[styles.promptLink, { color: colors.primary }]}>
                {' '}{t('auth.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  header: {
    marginBottom: 20, textAlign: 'auto'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    height: 40,
  },
  passwordRequirements: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 12,
    marginBottom: 4,
  },
  requirementError: {},
  rememberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 14,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  button: {
    padding: 14,
    borderRadius: 36, alignItems: 'center',
    marginBottom: 75
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 14,
  },
  promptLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
});
