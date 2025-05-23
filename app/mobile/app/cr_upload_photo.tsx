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
    setPhotos(photos.filter(photo => photo.name !== name));
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    // Ask for permission if not already granted
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      // result.assets is an array of selected images
      const newPhotos = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

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
        <Text style={[styles.pageSubtitle, { color: colors.text + '99' }]}>Upload Photos</Text>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <View style={styles.inactiveTab} />
          <View style={[styles.activeTab, { backgroundColor: colors.primary }]} />
          <View style={styles.inactiveTab} />
          <View style={styles.inactiveTab} />
        </View>

        {/* Browse Photos Button */}
        <TouchableOpacity
          style={[styles.browseBtn, { backgroundColor: colors.primary + '11', opacity: photos.length >= MAX_PHOTOS ? 0.5 : 1 }]}
          onPress={pickImage}
          disabled={photos.length >= MAX_PHOTOS}
        >
          <Text style={[styles.browseBtnText, { color: colors.primary }]}>+ Browse photos</Text>
        </TouchableOpacity>

        {/* Photo Previews */}
        {photos.map((photo, idx) => (
          <View key={photo.uri + photo.name} style={styles.photoBlock}>
            <View style={[styles.photoPreview, { backgroundColor: colors.card }]}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
            </View>
            <TouchableOpacity style={[styles.removeBtn, { borderColor: colors.primary + '66' }]} onPress={() => removePhoto(photo.name)}>
              <Text style={[styles.removeBtnText, { color: colors.primary }]}>× {photo.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            router.push({
              pathname: '/cr_deadline',
              params
            });
          }}
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
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
    backgroundColor: '#F3F0FF',
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
    color: '#222',
  },
  pageSubtitle: {
    color: '#B0B0B0',
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
    backgroundColor: '#7C6AED',
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
  browseBtn: {
    backgroundColor: '#F6F3FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  browseBtnText: {
    color: '#7C6AED',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoBlock: {
    marginBottom: 18,
  },
  photoPreview: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#BEB8F6',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  removeBtnText: {
    color: '#7C6AED',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextBtn: {
    backgroundColor: '#7C6AED',
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
