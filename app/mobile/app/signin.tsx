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
import { login, getUserProfile } from '../lib/api';
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
      
      // Fetch user profile after successful login
      if (response.data?.user_id) {
        const profileResponse = await getUserProfile(response.data.user_id);
        console.log('User profile:', profileResponse);
        // Store user profile data only if defined
        if (profileResponse && profileResponse.data) {
          await AsyncStorage.setItem('userProfile', JSON.stringify(profileResponse.data));
        } else {
          await AsyncStorage.removeItem('userProfile');
        }
        // Store user object for useAuth context
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>

          <Image source={require('../assets/images/logo.png')} style={styles.logo} />

          <Text style={[styles.title, { color: colors.primary }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Sign in to continue to your account
          </Text>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.text + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.text + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.text }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
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
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#DDD',
    marginBottom: 16,
    paddingBottom: 4,
  },
    input: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    color: '#333',
  },
    rememberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
    rememberText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  button: {
    padding: 14,
    borderRadius: 36, alignItems: 'center',
    marginBottom: 24
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16
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
