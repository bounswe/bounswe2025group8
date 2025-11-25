// app/signin.tsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { login } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../lib/auth';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { colors } = useTheme();
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting login with:', { email });
      const response = await login(email, password);
      console.log('Login successful:', response);

      // The login function already fetches and stores the user profile
      // Just set the user in auth context and navigate
      if (response.data?.user_id) {
        await setUser({ id: response.data.user_id, email });
      }

      // Navigate to feed
      router.replace('/feed');
    } catch (error: any) {
      console.error('Login failed. Full error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || error.message || 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }
            }>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.primary}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>

          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            accessibilityRole="image"
            accessibilityLabel="AccessEase logo"
          />

          <Text style={[styles.title, { color: colors.primary }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Sign in to continue to your account
          </Text>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
                accessible={false}
                importantForAccessibility="no"
              />
              <View style={styles.inputField}>
                {!email && !emailFocused && (
                  <Text
                    style={[styles.customPlaceholder, { color: colors.text + '80' }]}
                    accessible={false}
                    importantForAccessibility="no"
                    pointerEvents="none"
                  >
                    Email
                  </Text>
                )}
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  accessibilityLabel="Email address input"
                  accessibilityValue={{ text: email || '' }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  testID="signin-email-input"
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
                style={styles.inputIcon}
                accessible={false}
                importantForAccessibility="no"
              />
              <View style={styles.inputField}>
                {!password && !passwordFocused && (
                  <Text
                    style={[styles.customPlaceholder, { color: colors.text + '80' }]}
                    accessible={false}
                    importantForAccessibility="no"
                    pointerEvents="none"
                  >
                    Password
                  </Text>
                )}
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  editable={!isLoading}
                  accessibilityLabel="Password input"
                  accessibilityValue={{
                    text: password
                      ? showPwd
                        ? password
                        : 'Password entered'
                      : '',
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  testID="signin-password-input"
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowPwd(!showPwd)}
                accessible

                accessibilityRole="button"
                accessibilityLabel={showPwd ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.text}
                  accessible={false}
                  importantForAccessibility="no"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Forgot Password"
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: isLoading }}
            testID="signin-button"
          >
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.text }]}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.replace('/signup')}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Go to Sign Up"
            >
              <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center'
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
  },
  header: {
    marginBottom: 20, textAlign: 'auto'
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 32,
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
  inputField: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  customPlaceholder: {
    position: 'absolute',
    left: 8,
    right: 0,
    fontSize: 14,
  },
  rememberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    padding: 14,
    borderRadius: 36, alignItems: 'center',
    marginBottom: 24
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 144,
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
  inputContainer: {
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
