import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import ProfileTop from '../components/ui/ProfileTop';
import TabButton from '../components/ui/TabButton';
import { MOCK_USER } from './profile';
import { Ionicons } from '@expo/vector-icons';
import RequestCard, { RequestCardProps } from '../components/ui/RequestCard';
import { MOCK_V_PAST_REQUESTS } from './profile';

export default function VPastRequestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const [activeTab, setActiveTab] = useState<'volunteer' | 'requester'>('volunteer');

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.gray }]}> 
      {/* Top Profile */}
      <ProfileTop MOCK_USER={MOCK_USER} />

      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <TabButton
          title="Volunteer"
          isActive={activeTab === 'volunteer'}
          onPress={() => setActiveTab('volunteer')}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />
        <TabButton
          title="Requester"
          isActive={activeTab === 'requester'}
          onPress={() => {
            router.replace({ pathname: '/profile', params: { tab: 'requester' } });
          }}
          buttonStyle={[styles.tabButton, { borderColor: colors.text }]}
          activeButtonStyle={{ backgroundColor: colors.primary }}
          inactiveButtonStyle={{ backgroundColor: themeColors.background }}
          textStyle={{ fontSize: 16, fontWeight: '400', color: colors.text }}
          activeTextStyle={{ fontWeight: '500', color: '#fff' }}
          inactiveTextStyle={{ color: colors.text }}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.background }]}> 
          <Ionicons name="chevron-back-outline" size={25} color={colors.text} style={styles.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>{'Past Requests'}</Text>
      </View>

      <View style={styles.content}>
        {MOCK_V_PAST_REQUESTS.map((req, idx) => (
          <RequestCard
            key={idx}
            {...req}
            status={req.status.toString()}
            onPress={() => router.push({ pathname: './request-details', params: { arrayName: 'MOCK_V_PAST_REQUESTS', index: idx } })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 8,
    padding: 2,
    backgroundColor: 'red',
    borderRadius: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  icon: {
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 