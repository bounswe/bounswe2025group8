// app/index.tsx
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />

      {/* Main title */}
      <Text style={[styles.title, { color: colors.text }]}>
        Neighborhood Assistance Board
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
        >
          <Text style={styles.primaryText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.halfButton,
            styles.secondaryButton,
            { borderColor: colors.primary },
          ]}
          onPress={() => router.push('/signup')}
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* OR separator */}
      <Text style={[styles.orText, { color: colors.text }]}>OR</Text>

      {/* Continue as guest */}
      <TouchableOpacity onPress={() => router.push('/feed')}>
        <Text style={[styles.guestLink, { color: colors.primary }]}>
          Continue as a guest
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
    color: '#fff',
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
