// app/signup.tsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
import { register } from '../lib/api';

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
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const [fullName, setFullName]   = useState('');
  const [username, setUsername]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [agree, setAgree]         = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  useEffect(() => {
    if (params.agreed === 'true') {
      setAgree(true);
      // Optionally clear the param
      router.setParams({ agreed: undefined });
    }
  }, [params.agreed]);

  const handleSignUp = async () => {
    if (!fullName || !username || !phone || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!agree) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      let errorMessage = 'Password must ';
      if (passwordValidation.errors.length) errorMessage += 'be at least 8 characters long';
      else if (passwordValidation.errors.uppercase) errorMessage += 'include an uppercase letter';
      else if (passwordValidation.errors.lowercase) errorMessage += 'include a lowercase letter';
      else if (passwordValidation.errors.number) errorMessage += 'include a number';
      else if (passwordValidation.errors.special) errorMessage += 'include a special character';
      Alert.alert('Error', errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Attempting registration with:', { email, username });
      const response = await register(email, password, fullName, username, phone);
      console.log('Registration successful:', response);
      Alert.alert('Success', 'Registration successful! Please log in.', [
        {
          text: 'OK',
          onPress: () => router.replace('/signin')
        }
      ]);
    } catch (error: any) {
      console.error('Registration failed:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || error.message || 'An error occurred during registration'
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>

          <Image source={require('../assets/images/logo.png')} style={styles.logo} />

          <Text style={[styles.title, { color: colors.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Enter your details to register{'\n'}for the app
          </Text>

          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          {/* Username */}
          <View style={styles.inputWrapper}>
            <Ionicons name="at-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#666" />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <Pressable onPress={() => setShowPwd(v => !v)}>
              <Ionicons
                name={showPwd ? 'eye' : 'eye-off'}
                size={20}
                color="#666"
              />
            </Pressable>
          </View>

          <View style={styles.rememberWrapper}>
            <Pressable 
              onPress={() => setAgree(a => !a)} 
              hitSlop={8}
              disabled={isLoading}
            >
              <Ionicons
                name={agree ? 'checkbox' : 'square-outline'}
                size={20}
                color="#666"
              />
            </Pressable>

            <Text style={[styles.rememberText, { color: colors.text }]}>
              I agree with{' '}
            </Text>

            <Pressable 
              onPress={() => router.push({ pathname: '/terms', params: { fromSignup: 'true' } })} 
              hitSlop={8}
              disabled={isLoading}
            >
              <Text style={[styles.rememberText, styles.linkText, { color: colors.primary }]}>
                Terms &amp; Conditions
              </Text>
            </Pressable>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: colors.primary },
              (!agree || isLoading) && { opacity: 0.5 }
            ]}
            disabled={!agree || isLoading}
            onPress={handleSignUp}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Have an account? Login */}
          <View style={styles.signupPrompt}>
            <Text style={[styles.promptText, { color: colors.text }]}>
              Have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace('/signin')}>
              <Text style={[styles.promptLink, { color: colors.primary }]}>
                {' '}Login
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
    color: '#6C63FF'
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
    color: '#666',
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
    borderColor: '#DDD',
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
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  requirementError: {
    color: '#ff4444',
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
  linkText: {
    textDecorationLine: 'underline',
  },
  button: {
    padding: 14,
    borderRadius: 36, alignItems: 'center',
    marginBottom: 75
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16
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
