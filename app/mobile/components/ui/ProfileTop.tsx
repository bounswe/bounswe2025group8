import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import RatingPill from './RatingPill';
import { UserProfile } from '../../lib/api';
import { useRouter } from 'expo-router';
import type { ThemeTokens } from '../../constants/Colors';

type ProfileTopProps = {
  user: UserProfile & { profileImageUrl?: string };
};

export default function ProfileTop({ user }: ProfileTopProps) {
  const { colors } = useTheme();
  const themeColors = colors as ThemeTokens;
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.topRow}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={[styles.logoImage, { borderColor: themeColors.primary }]}
        />

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={25} color={themeColors.text} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={25} color={themeColors.text} style={styles.icon} />
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
          style={[styles.avatar, { backgroundColor: themeColors.card }]}
        />

        <View style={styles.infoColumn}>
          <Text style={[styles.name, { color: themeColors.text }]}>
            {user.name} {user.surname}
          </Text>

          <View style={styles.ratingRow}>
            <RatingPill
              rating={user.rating}
              label={`${user.completed_task_count} tasks`}
              backgroundColor={themeColors.pink}
              textColor={themeColors.onAccent}
              iconColor={themeColors.onAccent}
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
