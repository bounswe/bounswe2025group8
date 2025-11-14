import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as turkeyData from 'turkey-neighbourhoods';
import { AddressFieldsValue } from '../../utils/address';

interface AddressFieldsProps {
  value: AddressFieldsValue;
  onChange: (next: AddressFieldsValue) => void;
  labelPrefix?: string;
}

const cityNamesByCode = turkeyData.cityNamesByCode as Record<string, string>;
const CITY_LIST = turkeyData.getCityNames();

const cityNameToCode: Record<string, string> = {};
Object.entries(cityNamesByCode).forEach(([code, name]) => {
  cityNameToCode[name] = code;
});

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
    onSelect: () => {},
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

  const getDistricts = useMemo(() => {
    const code = cityNameToCode[value.city];
    if (!code) return [];
    return turkeyData.getDistrictsByCityCode(code) ?? [];
  }, [value.city]);

  const getNeighborhoods = useMemo(() => {
    const cityCode = cityNameToCode[value.city];
    if (!cityCode || !value.district) return [];
    return turkeyData.getNeighbourhoodsByCityCodeAndDistrict(cityCode, value.district) ?? [];
  }, [value.city, value.district]);

  const updateField = (field: keyof AddressFieldsValue, fieldValue: string) => {
    const next: AddressFieldsValue = { ...value, [field]: fieldValue };
    if (field === 'city') {
      next.district = '';
      next.neighborhood = '';
    }
    if (field === 'district') {
      next.neighborhood = '';
    }
    onChange(next);
  };

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}City</Text>
      <TouchableOpacity
        style={[styles.selectorButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => openPicker('Select City', CITY_LIST, value.city, (val) => updateField('city', val))}
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{value.city || 'Select city'}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}District</Text>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: value.city ? 1 : 0.6 },
        ]}
        disabled={!value.city}
        onPress={() =>
          openPicker('Select District', getDistricts, value.district, (val) => updateField('district', val))
        }
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{value.district || 'Select district'}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>{labelPrefix}Neighborhood</Text>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: value.district ? 1 : 0.6 },
        ]}
        disabled={!value.district}
        onPress={() =>
          openPicker(
            'Select Neighborhood',
            getNeighborhoods,
            value.neighborhood,
            (val) => updateField('neighborhood', val),
          )
        }
      >
        <Text style={[styles.selectorText, { color: colors.text }]}>{value.neighborhood || 'Select neighborhood'}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.border} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>Street</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Street"
        placeholderTextColor={colors.border}
        value={value.street}
        onChangeText={(text) => updateField('street', text)}
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.label, { color: colors.text }]}>Building No</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
            placeholder="Building"
            placeholderTextColor={colors.border}
            value={value.buildingNo}
            onChangeText={(text) => updateField('buildingNo', text)}
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
          />
        </View>
      </View>

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
