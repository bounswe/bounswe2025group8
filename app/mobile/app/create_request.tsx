import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../lib/auth';
import { CategoryPicker } from '../components/forms/CategoryPicker';

const urgencies = ['Low', 'Medium', 'High'];

export default function CreateRequest() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState(urgencies[0]);
  const [people, setPeople] = useState(1);
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
  const [category, setCategory] = useState('GROCERY_SHOPPING');


  useEffect(() => {
    if (!user) {
      Alert.alert('Authentication Required', 'You need to be logged in to create a request.', [
        { text: 'OK', onPress: () => router.replace('/signin') },
      ]);
    }
  }, [user, router]);

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 18 }}>Redirecting to login...</Text>
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
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
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
                    selectedValue === value && {
                      backgroundColor: colors.card,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => {
                    onSelect(value);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: colors.text },
                      selectedValue === value && { color: colors.primary, fontWeight: 'bold' },
                    ]}
                  >
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
        <Text style={[styles.pageSubtitle, { color: `${colors.text}99` }]}>General Information</Text>
        <View style={styles.tabBar}>
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
          <Ionicons name="pencil-outline" size={18} color={colors.border} style={{ marginLeft: 8 }} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Title of your request"
            placeholderTextColor={colors.border}
            value={title}
            onChangeText={setTitle}
            testID="create-request-title-input"
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
          testID="create-request-description-input"
        />

        <CategoryPicker value={category} onChange={setCategory} />

        <Text style={[styles.label, { color: colors.text }]}>Urgency</Text>
        <Pressable
          style={[styles.selectorBtn, { backgroundColor: colors.card }]}
          onPress={() => setShowUrgencyModal(true)}
          testID="create-request-urgency-selector"
        >
          <Text style={[styles.selectorText, { color: colors.text }]}>{urgency}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </Pressable>

        <Text style={[styles.label, { color: colors.text }]}>Number of People Needed</Text>
        <View style={styles.peopleRow}>
          <TouchableOpacity
            style={[styles.peopleBtn, { backgroundColor: colors.card }]}
            onPress={() => setPeople((p) => Math.max(1, p - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.peopleCount, { color: colors.text }]}>{people}</Text>
          <TouchableOpacity
            style={[styles.peopleBtn, { backgroundColor: colors.card }]}
            onPress={() => setPeople((p) => p + 1)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

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
                people,
              },
            });
          }}
          testID="create-request-next-button"
        >
          <Text style={[styles.nextBtnText, { color: colors.onPrimary }]}>Next</Text>
        </TouchableOpacity>

        {renderPickerModal(showUrgencyModal, setShowUrgencyModal, urgencies, urgency, setUrgency)}
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
    borderRadius: 2,
    marginRight: 2,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    height: 44,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  textArea: {
    borderRadius: 8,
    minHeight: 60,
    padding: 10,
    fontSize: 16,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 16,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  peopleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleCount: {
    marginHorizontal: 18,
    fontSize: 18,
    fontWeight: '600',
  },
  nextBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
