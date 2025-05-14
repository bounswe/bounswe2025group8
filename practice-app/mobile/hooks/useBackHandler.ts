import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

export const useBackHandler = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If we're at the feed page and logged in with reset param, prevent going back to guest state
      if (isLoggedIn && params.reset === 'true' && router.canGoBack()) {
        return true;
      }
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, [isLoggedIn, params.reset]);
}; 