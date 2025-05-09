// app/signup.tsx
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fullName, setFullName]   = useState('');
  const [username, setUsername]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [agree, setAgree]         = useState(false);
  const [showPwd, setShowPwd]     = useState(false);

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
      >
        <Ionicons
          name={agree ? 'checkbox' : 'square-outline'}
          size={20}
          color= "#666"
        />
      </Pressable>

      <Text style={[styles.rememberText, { color: colors.text }]}>
        I agree with{''}
      </Text>

      <Pressable 
        onPress={() => router.push('/')} 
        hitSlop={8}
      >
        <Text style={[styles.rememberText, styles.linkText, { color: colors.primary }]}>
          Terms &amp; Conditions
        </Text>
      </Pressable>
    </View>



        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          disabled={!agree}
          onPress={() => {
            // TODO: register
            router.replace('/');
          }}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

          {/* Have an account? Login */}
        <View style={styles.signupPrompt}>
          <Text style={[styles.promptText, { color: colors.text }]}>
            Have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push('/signin')}>
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
    flexGrow: 1, padding: 20, justifyContent: 'center'
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
    alignSelf: 'flex-start', // aligns the logo to the left edge
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
    borderRadius: 8, alignItems: 'center',
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
});
