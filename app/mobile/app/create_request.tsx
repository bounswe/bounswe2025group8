import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../lib/auth';

const categories = [
  { value: 'GROCERY_SHOPPING', label: 'Grocery Shopping' },
  { value: 'TUTORING', label: 'Tutoring' },
  { value: 'HOME_REPAIR', label: 'Home Repair' },
  { value: 'MOVING_HELP', label: 'Moving Help' },
  { value: 'HOUSE_CLEANING', label: 'House Cleaning' },
  { value: 'OTHER', label: 'Other' }
];
const urgencies = ['Low', 'Medium', 'High'];

export default function CreateRequest() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0].value);
  const [urgency, setUrgency] = useState(urgencies[0]);
  const [people, setPeople] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);

  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Authentication Required", 
        "You need to be logged in to create a request.",
        [
          { text: "OK", onPress: () => router.replace('/signin') }
        ]
      );
    }
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: colors.text, fontSize: 18}}>Redirecting to login...</Text>
      </SafeAreaView>
    );
  }

  const renderPickerModal = (
    visible: boolean,
    setVisible: (visible: boolean) => void,
    options: { value: string; label: string }[] | string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    const { colors } = useTheme();
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select an option</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {options.map((option) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.modalOption,
                    { borderBottomColor: colors.border },
                    selectedValue === value && { backgroundColor: colors.primary + '22' }
                  ]}
                  onPress={() => {
                    onSelect(value);
                    setVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    { color: colors.text },
                    selectedValue === value && { color: colors.primary, fontWeight: 'bold' }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '22' }]}>
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

        {/* Back and Title */}
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Create Request</Text>
        </View>
        <Text style={[styles.pageSubtitle, { color: colors.text + '99' }]}>General Information</Text>
        <View style={styles.tabBar}>
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
        </View>

        {/* Form */}
        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
          <Ionicons name="pencil-outline" size={18} color={colors.border} style={{ marginLeft: 8 }} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Title of your request"
            placeholderTextColor={colors.border}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Describe your request"
          placeholderTextColor={colors.border}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: colors.card }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>
            {categories.find(c => c.value === category)?.label || category}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>Urgency</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: colors.card }]}
          onPress={() => setShowUrgencyModal(true)}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{urgency}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>Required number of people</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: colors.primary + '22' }]}
            onPress={() => setPeople(Math.max(1, people - 1))}
          >
            <Text style={[styles.stepperBtnText, { color: colors.primary }]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.peopleCount, { color: colors.text }]}>{people}</Text>
          <TouchableOpacity
            style={[styles.stepperBtn, { backgroundColor: colors.primary + '22' }]}
            onPress={() => setPeople(Math.min(20, people + 1))}
          >
            <Text style={[styles.stepperBtnText, { color: colors.primary }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (!description) {
              Alert.alert('Error', 'Description cannot be empty.');
              return;
            }
            if (!title) {
              Alert.alert('Error', 'Please fill in all required fields');
              return;
            }
            router.push({
              pathname: '/cr_upload_photo',
              params: {
                title,
                description,
                category,
                urgency,
                people
              }
            });
          }}
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>

        {/* Modals */}
        {renderPickerModal(showCategoryModal, setShowCategoryModal, categories, category, setCategory)}
        {renderPickerModal(showUrgencyModal, setShowUrgencyModal, urgencies, urgency, setUrgency)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
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
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#222',
  },
  pageSubtitle: {
    color: '#B0B0B0',
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
    backgroundColor: '#7C6AED',
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
    marginTop: 12,
    marginBottom: 4,
    color: '#444',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    marginBottom: 8,
    height: 44,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  textArea: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    minHeight: 60,
    padding: 10,
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    marginBottom: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#222',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F3F0FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222',
  },
  modalOptionTextSelected: {
    color: '#7C6AED',
    fontWeight: 'bold',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    color: '#7C6AED',
    fontWeight: 'bold',
  },
  peopleCount: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  nextBtn: {
    backgroundColor: '#7C6AED',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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
});
