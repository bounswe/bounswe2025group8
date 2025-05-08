// app/signup.tsx
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function SignUp() {
  const router = useRouter();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      {/* Logo aligned left*/}
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />
          
      <Text style={styles.header}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => {
          // TODO: handle registration
          router.replace('/');
        }}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
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
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 24,
    alignSelf: 'flex-start', // aligns the logo to the left edge
  },
  header: {
    fontSize: 24, fontWeight: '600',
    marginBottom: 20, textAlign: 'center'
  },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, padding: 12, marginBottom: 16
  },
  button: {
    backgroundColor: '#6C63FF', padding: 14,
    borderRadius: 8, alignItems: 'center'
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold', fontSize: 16
  }
});
