import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CRDeadline() {
  const { colors } = useTheme();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };
  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

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
        <Text style={[styles.pageSubtitle, { color: colors.text + '99' }]}>Determine Deadline</Text>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={styles.inactiveTab} />
        </View>
        {/* Select Date */}
        <Text style={[styles.label, { color: colors.text }]}>Select date</Text>
        <TouchableOpacity style={[styles.dateBox, { backgroundColor: colors.card }]} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.dateText, { color: colors.text }]}>{formattedDate}</Text>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}
        {/* Select Time */}
        <Text style={[styles.label, { color: colors.text }]}>Select time</Text>
        <TouchableOpacity style={[styles.timeBox, { borderColor: colors.primary }]} onPress={() => setShowTimePicker(true)}>
          <Text style={[styles.timeText, { color: colors.text }]}>{formattedTime}</Text>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}
        {/* Next Button */}
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/cr_address')}> 
          <Text style={styles.nextBtnText}>Next</Text>
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
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    marginTop: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 24,
    width: 180,
  },
  timeText: {
    fontSize: 16,
    marginRight: 8,
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
});
