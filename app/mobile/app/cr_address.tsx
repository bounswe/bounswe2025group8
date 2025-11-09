import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { createTask, uploadTaskPhoto} from '../lib/api';
import { AddressFields } from '../components/forms/AddressFields';
import { AddressFieldsValue, emptyAddress, formatAddress } from '../utils/address';

interface TaskParams {
  title: string;
  description: string;
  category: string;
  urgency: string;
  people: number;
  deadline?: string;
}

export default function CRAddress() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [address, setAddress] = useState<AddressFieldsValue>(emptyAddress);
  const [description, setDescription] = useState('');

    const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState<{
    visible: boolean;
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
  }>({ visible: false, options: [], selected: '', onSelect: () => {} });

  const openModal = (options: string[], selected: string, onSelect: (v: string) => void) => {
    setModal({ visible: true, options, selected, onSelect });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, visible: false }));

  const handleCreateRequest = async () => {
    try {
      const title = params.title as string;
      const taskDescription = params.description as string;
      const category = params.category as string;
      const urgency = params.urgency as string;
      const people = parseInt(params.people as string) || 1;
      const deadline =
        (params.deadline as string) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      if (!title || !taskDescription || !category) {
        Alert.alert('Error', 'Missing task data. Please go back and try again.');
        return;
      }

      if (!address.city || !address.district) {
        Alert.alert('Error', 'Please select a city and district for the address.');
        return;
      }

      const location = formatAddress(address);

      await createTask({
        title,
        description: taskDescription,
        category,
        location,
        requirements: description,
        deadline,
        urgency_level: urgency === 'High' ? 3 : urgency === 'Medium' ? 2 : 1,
        volunteer_number: people,
        is_recurring: false,
      });

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => router.replace('/requests') },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}22` }]}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={{ marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Create Request</Text>
        </View>
        <Text style={[styles.pageSubtitle, { color: `${colors.text}99` }]}>Setup Address</Text>
        <View style={styles.tabBar}>
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
        </View>

        <AddressFields value={address} onChange={setAddress} />

        <Text style={[styles.label, { color: colors.text }]}>Address Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Additional address details"
          placeholderTextColor={colors.border}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={handleCreateRequest}>
          <Text style={styles.nextBtnText}>Create Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  backBtn: {
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  pageSubtitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 4,
  },
  activeTab: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginRight: 2,
  },
  inactiveTab: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginRight: 2,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  nextBtn: {
    backgroundColor: '#7C6AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
