import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Terms() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/signup')}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>Terms &amp; Conditions</Text>
      <Text style={[styles.subtitle, { color: colors.text + '99' }]}>Last updated: 1 April 2025</Text>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. Acceptance of the Absurd</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>By using this app, you agree to laugh at least once a day. If you do not laugh, please try again tomorrow.</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. Obligatory Coffee Clause</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>You must consume at least one cup of coffee (or tea) while reading these terms. Decaf is acceptable, but not recommended.</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. Cat Picture Requirement</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>If you encounter a bug, you are required to send us a picture of a cat. This will not fix the bug, but it will make us happy.</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. The Infinite Scroll</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>By scrolling to the end of these terms, you acknowledge that you have reached the end.</Text>
      </View>
      <Text style={[styles.footer, { color: colors.text + '99' }]}>Thank you for reading. Now go enjoy the app!</Text>
      <TouchableOpacity
        style={{
          marginTop: 32,
          backgroundColor: colors.primary,
          borderRadius: 24,
          paddingVertical: 14,
          alignItems: 'center',
          alignSelf: 'stretch',
        }}
        onPress={() => {
          // Go back to signup and set agreed param
          router.replace({ pathname: '/signup', params: { agreed: 'true' } });
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>I agree</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    fontSize: 14,
    marginTop: 32,
    textAlign: 'center',
    alignSelf: 'center',
  },
});
