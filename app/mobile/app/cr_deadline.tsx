import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '@/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import NotificationIconWithBadge from '../components/ui/NotificationIconWithBadge';

export default function CRDeadline() {
  const { colors } = useTheme();
  const themeColors = colors as any;
  const { resolvedTheme } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onChangeTime = (_event: any, selectedTime?: Date) => {
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

  const pickerThemeVariant = resolvedTheme === 'light' ? 'light' : 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        testID="create-request-deadline-scroll-view"
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: `${colors.primary}22` }]}>
            <Image source={require('../assets/images/logo.png')} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ marginRight: 16 }}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Open notifications"
            >
              <NotificationIconWithBadge style={{ marginRight: 12 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              accessible

              accessibilityRole="button"
              accessibilityLabel="Open settings"
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} accessible={false} importantForAccessibility="no" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessible

            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} accessible={false} importantForAccessibility="no" />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>{t('createRequest.title')}</Text>
        </View>
        <Text style={[styles.pageSubtitle, { color: `${colors.text}99` }]}>{t('createRequest.determineDeadline')}</Text>
        <View style={styles.tabBar}>
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t('createRequest.selectDate')}</Text>
        <TouchableOpacity
          style={[styles.dateBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
          accessible

          accessibilityRole="button"
          accessibilityLabel={t('createRequest.selectDateA11y', { date: formattedDate })}
          testID="create-request-date-selector"
        >
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
            themeVariant={pickerThemeVariant}
            {...(Platform.OS === 'ios' ? { textColor: colors.text } : {})}
          />
        )}

        <Text style={[styles.label, { color: colors.text }]}>{t('createRequest.selectTime')}</Text>
        <TouchableOpacity
          style={[styles.timeBox, { backgroundColor: colors.card, borderColor: colors.primary }]}
          onPress={() => setShowTimePicker(true)}
          accessible

          accessibilityRole="button"
          accessibilityLabel={t('createRequest.selectTimeA11y', { time: formattedTime })}
          testID="create-request-time-selector"
        >
          <Text style={[styles.timeText, { color: colors.text }]}>{formattedTime}</Text>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
            themeVariant={pickerThemeVariant}
            {...(Platform.OS === 'ios' ? { textColor: colors.text } : {})}
          />
        )}

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/cr_address',
              params: { ...params, deadline: date.toISOString() },
            })
          }
          accessible

          accessibilityRole="button"
          accessibilityLabel="Next step set address"
          testID="create-request-deadline-next-button"
        >
          <Text style={[styles.nextBtnText, { color: themeColors.onPrimary }]}>{t('createRequest.next')}</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 16,
    flexShrink: 1,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  timeText: {
    fontSize: 16,
    flexShrink: 1,
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
  nextBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
