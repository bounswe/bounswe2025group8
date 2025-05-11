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
  View
} from 'react-native';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { colors } = useTheme();
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backText, {color : colors.primary}]}>‹ Back</Text>
      </TouchableOpacity>

      {/* Logo aligned left*/}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />

    <View style={styles.header}>
      <Text style={[styles.title, {color : colors.text}]}>Welcome back</Text>
      <Text style={styles.subtitle}>Enter your details to sign in{'\n'}to your account
      </Text>
    </View>

    {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPwd(v => !v)}>
            <Ionicons
              name={showPwd ? 'eye' : 'eye-off'}
              size={20}
              color="#666"
            />
          </Pressable>
        </View>

      
        {/* Remember Me */}
        <Pressable
          style={styles.rememberWrapper}
          onPress={() => setRemember(r => !r)}
        >
          <Ionicons
            name={remember ? 'checkbox' : 'square-outline'}
            size={20}
            color="#666"
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </Pressable>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => {
          // TODO: authenticate
          router.replace('/');
        }}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

         {/* Forgot Password */}
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={[styles.forgotText, { color: colors.primary }]}>
          Forgot my password
        </Text>
      </TouchableOpacity>

          {/* Sign‑Up Prompt */}
      <View style={styles.signupPrompt}>
        <Text style={[styles.promptText, { color: colors.text }]}>
          Don’t have an account?
        </Text>
        <TouchableOpacity onPress={() => router.replace('/signup')}>
          <Text style={[styles.promptLink, { color: colors.primary }]}>
            {' '}Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, justifyContent: 'center'
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
    zIndex: 1
  },
   logo: {
      width: 140,
      height: 140,
      resizeMode: 'contain',
      marginBottom: 12,
      alignSelf: 'flex-start', // aligns the logo to the left edge
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
});
