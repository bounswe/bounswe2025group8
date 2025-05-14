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
  BackHandler
} from 'react-native';
import { api } from '../services/api';

export default function SignUp() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const [fullName, setFullName]   = useState('');
  const [username, setUsername]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree]         = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (params.agreed === 'true') {
      setAgree(true);
      router.setParams({ agreed: undefined });
    }
  }, [params.agreed]);

  const handleSignUp = async () => {
    if (!fullName || !username || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agree) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions');
      return;
    }

    try {
      setIsLoading(true);
      // Split full name into name and surname
      const nameParts = fullName.trim().split(/\s+/);
      const name = nameParts[0];
      const surname = nameParts.slice(1).join(' ') || name; // Use first name as surname if no surname provided

      await api.register({
        name,
        surname,
        username,
        email,
        phone_number: phone,
        password,
        confirm_password: confirmPassword,
      });
      // Show success message and navigate to login
      Alert.alert(
        'Success',
        'Registration successful! Please log in to continue.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/signin')
          }
        ]
      );
    } catch (error) {
      // Format error message for better readability
      const errorMessage = error instanceof Error 
        ? error.message
            .split('\n')
            .map(line => {
              // Convert field names to more readable format
              return line
                .replace('password:', 'Password:')
                .replace('phone_number:', 'Phone number:')
                .replace('email:', 'Email:')
                .replace('username:', 'Username:')
                .replace('name:', 'Name:')
                .replace('surname:', 'Surname:');
            })
            .join('\n')
        : 'Failed to sign up';
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, {color: colors.primary}]}>‹ Back</Text>
      </TouchableOpacity>

      {/* Logo aligned left*/}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, {color : colors.text}]}>Create an account</Text>
        <Text style={styles.subtitle}>Enter your details to register{'\n'}for the app
        </Text>
      </View>

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
        />
        <Pressable onPress={() => setShowPwd(v => !v)}>
          <Ionicons
            name={showPwd ? 'eye' : 'eye-off'}
            size={20}
            color="#666"
          />
        </Pressable>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <Ionicons name="key-outline" size={20} color="#666" />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPwd}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!isLoading}
        />
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
          onPress={() => router.replace({ pathname: '/terms', params: { fromSignup: 'true' } })} 
          hitSlop={8}
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
          (!agree || isLoading) && styles.buttonDisabled
        ]}
        disabled={!agree || isLoading}
        onPress={handleSignUp}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center'
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 1
  },
  backText: {
    fontSize: 16,
    color: '#6C63FF'
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
    alignSelf: 'flex-start',
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
  },
  header: {
    marginBottom: 20,
    textAlign: 'auto'
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
    borderRadius: 36,
    alignItems: 'center',
    marginBottom: 75
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
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
});
