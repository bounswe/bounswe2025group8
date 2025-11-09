import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as turkeyData from 'turkey-neighbourhoods';
import { createTask, uploadTaskPhoto } from '../lib/api';

interface TaskParams {
  title: string;
  description: string;
  category: string;
  urgency: string;
  people: number;
  deadline?: string;
}

const cityList = turkeyData.getCityNames();
const cityNamesByCode = turkeyData.cityNamesByCode as Record<string, string>;
const cityNameToCode: Record<string, string> = {};
Object.entries(cityNamesByCode).forEach(([code, name]) => {
  cityNameToCode[name] = code;
});

export default function CRAddress() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState<{
    visible: boolean;
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
  }>({ visible: false, options: [], selected: '', onSelect: () => {} });

  const getDistrictsForCity = (cityName: string) => {
    const cityCode = cityNameToCode[cityName];
    if (!cityCode) return [];
    const districts = turkeyData.getDistrictsByCityCode(cityCode);
    return districts || [];
  };

  const getNeighborhoodsForDistrict = (cityName: string, districtName: string) => {
    const cityCode = cityNameToCode[cityName];
    if (!cityCode) return [];
    const neighborhoods = turkeyData.getNeighbourhoodsByCityCodeAndDistrict(cityCode, districtName);
    return neighborhoods || [];
  };

  const openModal = (options: string[], selected: string, onSelect: (v: string) => void) => {
    setModal({ visible: true, options, selected, onSelect });
  };

  const closeModal = () => setModal((prev) => ({ ...prev, visible: false }));

  const handleCreateRequest = async () => {
    try {
      setUploading(true);
      
      const title = params.title as string;
      const taskDescription = params.description as string;
      const category = params.category as string;
      const urgency = params.urgency as string;
      const people = parseInt(params.people as string) || 1;
      const deadline =
        (params.deadline as string) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      if (!title || !taskDescription || !category) {
        Alert.alert('Error', 'Missing task data. Please go back and try again.');
        setUploading(false);
        return;
      }

      const location = `${buildingNo} ${doorNo}, ${district}, ${city}`;

      // Create the task first
      const createdTask = await createTask({
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

      // If photos were selected, upload them
      const photosParam = params.photos as string;
      console.log('Photos param received:', photosParam);
      
      if (photosParam && createdTask.id) {
        try {
          const photosData = JSON.parse(photosParam);
          console.log('Parsed photos data:', photosData);
          
          if (Array.isArray(photosData) && photosData.length > 0) {
            console.log(`Uploading ${photosData.length} photos for task ${createdTask.id}`);
            
            // Upload each photo
            const uploadPromises = photosData.map((photo: { uri: string; name: string }) => {
              console.log(`Preparing to upload photo: ${photo.name} from ${photo.uri}`);
              return uploadTaskPhoto(createdTask.id, photo.uri, photo.name);
            });
            
            const results = await Promise.all(uploadPromises);
            console.log('All photos uploaded successfully:', results);
          } else {
            console.log('Photos data is not an array or is empty:', photosData);
          }
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
          // Don't fail the entire task creation if photos fail
          Alert.alert(
            'Warning', 
            'Task created but some photos could not be uploaded.',
            [{ text: 'OK', onPress: () => router.replace('/requests') }]
          );
          return;
        }
      } else {
        console.log('No photos to upload. photosParam:', photosParam, 'createdTask.id:', createdTask.id);
      }

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => router.replace('/requests') },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setUploading(false);
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
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>City</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.card }]}
          onPress={() => openModal(cityList, city, (v) => {
            setCity(v);
            setDistrict('');
            setNeighborhood('');
          })}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{city || 'Select city'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>District</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.card }]}
          onPress={() =>
            openModal(
              getDistrictsForCity(city),
              district,
              (v) => {
                setDistrict(v);
                setNeighborhood('');
              }
            )
          }
          disabled={!city}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{district || 'Select district'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>Neighborhood</Text>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.card }]}
          onPress={() => openModal(getNeighborhoodsForDistrict(city, district), neighborhood, setNeighborhood)}
          disabled={!district}
        >
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{neighborhood || 'Select neighborhood'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>Street</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Street"
          placeholderTextColor={colors.border}
          value={street}
          onChangeText={setStreet}
        />

        <Text style={[styles.label, { color: colors.text }]}>Building No</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Building No"
          placeholderTextColor={colors.border}
          value={buildingNo}
          onChangeText={setBuildingNo}
        />

        <Text style={[styles.label, { color: colors.text }]}>Door No</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Door No"
          placeholderTextColor={colors.border}
          value={doorNo}
          onChangeText={setDoorNo}
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Input text"
          placeholderTextColor={colors.border}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary, opacity: uploading ? 0.6 : 1 }]} 
          onPress={handleCreateRequest}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={[styles.nextBtnText, { color: colors.onPrimary }]}>Create Request</Text>
          )}
        </TouchableOpacity>

        <Modal animationType="slide" transparent visible={modal.visible} onRequestClose={closeModal}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {modal.options.map((option) => {
                const isSelected = modal.selected === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      { borderBottomColor: colors.border },
                      isSelected && {
                        backgroundColor: colors.card,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      modal.onSelect(option);
                      closeModal();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: colors.text },
                        isSelected && { color: colors.primary, fontWeight: 'bold' },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Modal>
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    minHeight: 60,
    padding: 10,
    fontSize: 16,
  },
  nextBtn: {
    marginTop: 24,
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
