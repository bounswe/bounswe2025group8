import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@react-navigation/native';

export default function CRUploadPhoto() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<{ uri: string; name: string }[]>([]);
  const MAX_PHOTOS = 5;

  const removePhoto = (name: string) => {
    setPhotos((current) => current.filter((photo) => photo.name !== name));
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
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
        <Text style={[styles.pageSubtitle, { color: `${colors.text}99` }]}>Upload Photos</Text>

        <View style={styles.tabBar}>
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
          <View style={[styles.inactiveTab, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[
            styles.browseBtn,
            { backgroundColor: `${colors.primary}11`, opacity: photos.length >= MAX_PHOTOS ? 0.5 : 1 },
          ]}
          onPress={pickImage}
          disabled={photos.length >= MAX_PHOTOS}
        >
          <Text style={[styles.browseBtnText, { color: colors.primary }]}>+ Browse photos</Text>
        </TouchableOpacity>

        {photos.map((photo) => (
          <View key={`${photo.uri}-${photo.name}`} style={styles.photoBlock}>
            <View style={[styles.photoPreview, { backgroundColor: colors.card }]}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
            </View>
            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: `${colors.primary}66` }]}
              onPress={() => removePhoto(photo.name)}
            >
              <Text style={[styles.removeBtnText, { color: colors.primary }]}>× {photo.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            // Serialize photos as JSON string to pass through route params
            const photosData = JSON.stringify(photos);
            router.push({
              pathname: '/cr_deadline',
              params: {
                ...params,
                photos: photosData,
              },
            });
          }}
          testID="upload-photo-next-button"
        >
          <Text style={[styles.nextBtnText, { color: colors.onPrimary }]}>Next</Text>
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
    borderRadius: 2,
    marginRight: 2,
  },
  browseBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  browseBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoBlock: {
    marginBottom: 18,
  },
  photoPreview: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  removeBtnText: {
    fontSize: 14,
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
});
