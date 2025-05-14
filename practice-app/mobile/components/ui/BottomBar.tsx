import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface BottomBarProps {
  scrollToTop?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ scrollToTop }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/feed' && pathname === '/') return true;
    return pathname === path;
  };

  return (
    <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={scrollToTop || (() => router.push('/feed'))}
      >
        <Ionicons 
          name="home" 
          size={28} 
          color={isActive('/feed') ? colors.primary : colors.text} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push('/categories')}
      >
        <Ionicons 
          name="pricetag-outline" 
          size={28} 
          color={isActive('/categories') ? colors.primary : colors.text} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push('/create_request')}
      >
        <Ionicons 
          name="add-circle-outline" 
          size={28} 
          color={isActive('/create_request') ? colors.primary : colors.text} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push('/requests')}
      >
        <Ionicons 
          name="list-outline" 
          size={28} 
          color={isActive('/requests') ? colors.primary : colors.text} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push('/profile')}
      >
        <Ionicons 
          name="person-outline" 
          size={28} 
          color={isActive('/profile') ? colors.primary : colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
}); 