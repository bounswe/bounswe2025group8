import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DeadlinePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  label?: string;
}

export function DeadlinePicker({ value, onChange, minimumDate = new Date(), label = 'Deadline' }: DeadlinePickerProps) {
  const { colors } = useTheme();
  const theme = useColorScheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isDarkLike = theme === 'dark' || theme === 'highContrast';
  const pickerTextColor = isDarkLike ? '#FFFFFF' : '#000000';
  const pickerThemeVariant = isDarkLike ? 'dark' : 'light';
  const pickerTextColorProps = Platform.OS === 'ios' ? { textColor: pickerTextColor } : {};

  const formattedDate = value
    ? value.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Select date';

  const formattedTime = value
    ? value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'Select time';

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (!selectedDate) {
      return;
    }
    const base = value ?? minimumDate;
    const updated = new Date(base);
    updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    onChange(updated);
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (!selectedTime) {
      return;
    }
    const base = value ?? minimumDate;
    const updated = new Date(base);
    updated.setHours(selectedTime.getHours());
    updated.setMinutes(selectedTime.getMinutes());
    onChange(updated);
  };

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.text }}>{formattedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card, marginLeft: 8 }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.text }}>{formattedTime}</Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={value ?? minimumDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          themeVariant={pickerThemeVariant}
          accentColor={colors.primary}
          {...pickerTextColorProps}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={value ?? minimumDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          themeVariant={pickerThemeVariant}
          accentColor={colors.primary}
          {...pickerTextColorProps}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});
