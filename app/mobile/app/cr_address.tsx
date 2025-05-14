import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as turkeyData from 'turkey-neighbourhoods';


const cityList = turkeyData.getCityNames();
// Build a cityNameToCode map
const cityNamesByCode = turkeyData.cityNamesByCode as Record<string, string>;
const cityNameToCode: Record<string, string> = {};
Object.entries(cityNamesByCode).forEach(([code, name]) => {
  cityNameToCode[name] = code;
});

export default function CRAddress() {
  const { colors } = useTheme();
  const router = useRouter();
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [description, setDescription] = useState('');
  const [modal, setModal] = useState<{ visible: boolean; options: string[]; selected: string; onSelect: (v: string) => void }>({ visible: false, options: [], selected: '', onSelect: () => {} });

  // Get districts for selected city
  const getDistrictsForCity = (cityName: string) => {
    const cityCode = cityNameToCode[cityName];
    if (!cityCode) return [];
    const districts = turkeyData.getDistrictsByCityCode(cityCode);
    return districts || [];
  };

  // Get neighborhoods for selected city and district
  const getNeighborhoodsForDistrict = (cityName: string, districtName: string) => {
    const cityCode = cityNameToCode[cityName];
    if (!cityCode) return [];
    const neighborhoods = turkeyData.getNeighbourhoodsByCityCodeAndDistrict(cityCode, districtName);
    return neighborhoods || [];
  };

  const openModal = (options: string[], selected: string, onSelect: (v: string) => void) => {
    setModal({ visible: true, options, selected, onSelect });
  };

  const closeModal = () => setModal({ ...modal, visible: false });

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
        <Text style={[styles.pageSubtitle, { color: colors.text + '99' }]}>Setup Address</Text>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
        </View>
        {/* Form */}
        <Text style={[styles.label, { color: colors.text }]}>City</Text>
        <TouchableOpacity style={[styles.pickerButton, { backgroundColor: colors.card }]} onPress={() => openModal(cityList, city, (v) => { setCity(v); setDistrict(''); setNeighborhood(''); })}>
          <Text style={[styles.pickerButtonText, { color: colors.text }]}>{city || 'Select city'}</Text>
          <Ionicons name="chevron-down" size={20} color={colors.border} />
        </TouchableOpacity>
        <Text style={[styles.label, { color: colors.text }]}>District</Text>
        <TouchableOpacity 
          style={[styles.pickerButton, { backgroundColor: colors.card }]} 
          onPress={() => openModal(getDistrictsForCity(city), district, (v) => { setDistrict(v); setNeighborhood(''); })}
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
        {/* Create Request Button */}
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/')}> 
          <Text style={styles.nextBtnText}>Create Request</Text>
        </TouchableOpacity>
        {/* Modal Picker */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modal.visible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select an option</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {modal.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      { borderBottomColor: colors.border },
                      modal.selected === option && { backgroundColor: colors.primary + '22' }
                    ]}
                    onPress={() => {
                      modal.onSelect(option);
                      closeModal();
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      { color: colors.text },
                      modal.selected === option && { color: colors.primary, fontWeight: 'bold' }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginRight: 2,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 15,
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
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    minHeight: 60,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  nextBtn: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
