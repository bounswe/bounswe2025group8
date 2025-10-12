import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RatingPill from './RatingPill';
import { UserProfile } from '../../lib/api';
import { useRouter } from 'expo-router';

type ProfileTopProps = {
  user: UserProfile & { profileImageUrl?: string };
};

export default function ProfileTop({ user }: ProfileTopProps) {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme || 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.topRow}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={[styles.logoImage, { borderColor: colors.primary }]}
        />

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={25} color={colors.text} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={25} color={colors.text} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.avatarRow}>
        <Image
          source={
            user.profileImageUrl
              ? { uri: user.profileImageUrl }
              : require('../../assets/images/empty_profile_photo.png')
          }
          style={styles.avatar}
        />

        <View style={styles.infoColumn}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user.name} {user.surname}
          </Text>

          <View style={styles.ratingRow}>
            <RatingPill
              rating={user.rating}
              label={`${user.completed_task_count} tasks`}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    resizeMode: 'cover',
  },
  icon: {
    marginRight: 6,
    marginLeft: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
    backgroundColor: '#f2f2fd',
  },
  infoColumn: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
});
