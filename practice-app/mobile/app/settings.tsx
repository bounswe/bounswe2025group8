import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.primary }]}>Settings</Text>
      <Text style={[styles.text, { color: colors.text }]}>You can't change your account settings here.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 60,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});
