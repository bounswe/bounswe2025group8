import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Country, State, City } from 'country-state-city';
import { AddressFieldsValue } from '../../utils/address';

interface AddressFieldsProps {
  value: AddressFieldsValue;
  onChange: (next: AddressFieldsValue) => void;
  labelPrefix?: string;
}

// --- Data Preparation (Outside Component) ---
const all_countries = Country.getAllCountries();

const countryNameToCode: Record<string, string> = {};
all_countries.forEach(c => {
  countryNameToCode[c.name] = c.isoCode;
});

// List of all country names for the picker
const COUNTRY_LIST = all_countries.map(c => c.name).sort();


export function AddressFields({ value, onChange, labelPrefix = '' }: AddressFieldsProps) {
  const { colors } = useTheme();
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selected: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selected: '',
    onSelect: () => { },
  });

  const openPicker = (title: string, options: string[], selected: string, onSelect: (val: string) => void) => {
    setPickerModal({
      visible: true,
      title,
      options,
      selected,
      onSelect,
    });
  };

  const closePicker = () => setPickerModal((prev) => ({ ...prev, visible: false }));

  // 1. Get States
  const [statesList, stateNameToCode] = useMemo(() => {
    const countryCode = countryNameToCode[value.country];
    if (!countryCode) return [[], {}];

    const states = State.getStatesOfCountry(countryCode);
    const names = states.map(s => s.name).sort();

    const nameToCode: Record<string, string> = {};
    states.forEach(s => {
      nameToCode[s.name] = s.isoCode;
    });

    return [names, nameToCode];
  }, [value.country]);

  // 2. Get Cities (Simplified return value)
  const citiesList = useMemo(() => {
    const countryCode = countryNameToCode[value.country];

    const stateMap = stateNameToCode as Record<string, string>;

    const stateCode = stateMap[value.state]; // Use the asserted type

    if (!countryCode || !stateCode) return [];

    const cities = City.getCitiesOfState(countryCode, stateCode);
    const names = cities.map(c => c.name).sort();

    return names;
  }, [value.country, value.state, stateNameToCode]);

  // 3. Update Logic (Clear dependents only when parent selector changes)
  const updateField = (field: keyof AddressFieldsValue, fieldValue: string) => {
    const next: AddressFieldsValue = { ...value, [field]: fieldValue };

    if (field === 'country') {
      // Clear all dependent selection fields AND all free-text locality fields
      next.state = '';
      next.city = '';
      next.neighborhood = '';
      next.street = '';
    } else if (field === 'state') {
      // Clear city selection field
      next.city = '';
      // Do NOT clear free-text fields
    } else if (field === 'city') {
      // No fields cleared below city
    }

    onChange(next);
  };

  return (
    <View>
      {/* 1. Country Selector */}
      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}Country</Text>
      <TouchableOpacity
        style={[styles.selectorButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => openPicker('Select Country', COUNTRY_LIST, value.country, (val) => updateField('country', val))}
        testID="address-country-selector"
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{value.country || 'Select country'}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* 2. State/Region Selector */}
      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}State/Region</Text>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: value.country ? 1 : 0.6 },
        ]}
        disabled={!value.country || statesList.length === 0}
        onPress={() => openPicker('Select State/Region', statesList, value.state, (val) => updateField('state', val))}
        testID="address-state-selector"
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {value.state || (statesList.length > 0 ? 'Select state/region' : 'Select Country first')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* Fallback Input for State/Region if data is missing 
      {value.country && statesList.length === 0 && (
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text, marginTop: 8 }]}
            placeholder={`Enter State/Region for ${value.country}`}
            placeholderTextColor={colors.border}
            value={value.state}
            onChangeText={(text) => updateField('state', text)}
          />
        )}
      */}


      {/* 3. City Selector */}
      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}City</Text>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: value.state ? 1 : 0.6 },
        ]}
        disabled={!value.state || citiesList.length === 0}
        onPress={() => openPicker('Select City', citiesList, value.city, (val) => updateField('city', val))}
        testID="address-city-selector"
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {value.city || (citiesList.length > 0 ? 'Select city' : 'Select Country/State first')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* Fallback Input for City if data is missing
      {value.state && citiesList.length === 0 && (
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text, marginTop: 8 }]}
            placeholder={`Enter City`}
            placeholderTextColor={colors.border}
            value={value.city}
            onChangeText={(text) => updateField('city', text)}
          />
        )}
      */}



      {/* 5. Neighborhood (Free Text) */}
      <Text style={[styles.label, { color: colors.text }]}>Neighborhood</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Neighborhood"
        placeholderTextColor={colors.border}
        value={value.neighborhood}
        onChangeText={(text) => updateField('neighborhood', text)}
        testID="address-neighborhood-input"
      />

      {/* 6. Street Line 2 (Free Text) */}
      <Text style={[styles.label, { color: colors.text }]}>Street</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Street"
        placeholderTextColor={colors.border}
        value={value.street}
        onChangeText={(text) => updateField('street', text)}
        testID="address-street-input"
      />

      {/* Building and Door Numbers */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Building No</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            placeholder="Building"
            placeholderTextColor={colors.border}
            value={value.buildingNo}
            onChangeText={(text) => updateField('buildingNo', text)}
            testID="address-building-input"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Door No</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            placeholder="Door"
            placeholderTextColor={colors.border}
            value={value.doorNo}
            onChangeText={(text) => updateField('doorNo', text)}
            testID="address-door-input"
          />
        </View>
      </View>

      {/* Modal remains the same */}
      <Modal transparent visible={pickerModal.visible} animationType="fade" onRequestClose={closePicker}>
        <View style={styles.overlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{pickerModal.title}</Text>
              <TouchableOpacity onPress={closePicker}>
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {pickerModal.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    pickerModal.onSelect(option);
                    closePicker();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: pickerModal.selected === option ? colors.primary : colors.text,
                        fontWeight: pickerModal.selected === option ? '600' : '400',
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (styles are unchanged)
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  selectorButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '70%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
  },
});