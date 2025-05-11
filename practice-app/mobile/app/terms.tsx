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
      <Text style={[styles.subtitle, { color: colors.text + '99' }]}>Last updated: 11 May 2025</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. Data Confiscation</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • We will collect, store, and monetize every piece of data you generate: messages, photos, biometric readings, and even your thoughts (if we figure out how).{'\n'}
          • Consent? You gave it by using the App. No take-backs.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. No Legal Recourse</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • You cannot sue, dispute, protest, or complain in any forum, real or digital.{'\n'}
          • All claims against us are waived forever.{'\n'}
          • If you try to initiate legal action, we will countersue for betrayal of trust.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. License to Abuse</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • We may modify, delete, or corrupt your Content at will, for any reason or no reason.{'\n'}
          • You grant us a perpetual, irrevocable license to abuse your Content, profile, and reputation in marketing or blackmailer newsletters.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Required Cooperation</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • You must comply with any request to provide additional personal data, including but not limited to DNA samples, social security numbers.{'\n'}
          • Failure to comply will result in account suspension and public shaming on our official Twitter account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>5. Unlimited Liability Shift</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • We assume zero liability for loss, theft, data breaches, emotional distress, or existential crisis caused by the App.{'\n'}
          • Our only obligation is to send you one apology emoji if we feel like it.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>6. Mandatory Arbitration</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • Any disputes will be settled by a secret tribunal composed entirely of our board members.{'\n'}
          • Decisions are final and binding.{'\n'}
          • Appeals are strictly prohibited.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>7. Changes Without Notice</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • We may alter these Terms at any time, for any reason, without notifying you.{'\n'}
          • Continued use constitutes acceptance of the new, possibly more draconian, Terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>8. Termination Rights</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • We may terminate or suspend your account at our sole discretion.{'\n'}
          • This will permanently block access to any content or funds you've entrusted to the App.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>9. Governing Law</Text>
        <Text style={[styles.sectionText, { color: colors.text }]}>
          • These Terms are governed by the laws of Banana Republic.{'\n'}
          • You waive any jurisdictional immunity or local consumer protection rights.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.agreeButton, { backgroundColor: colors.primary }]} 
        onPress={() => {
          router.replace({
            pathname: '/signup',
            params: { agreed: 'true' }
          });
        }}
      >
        <Text style={styles.agreeButtonText}>I Agree</Text>
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
  agreeButton: {
    width: '100%',
    padding: 16,
    borderRadius: 36,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  agreeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
