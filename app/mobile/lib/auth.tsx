import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  email: string;
  // Add any other fields your user object might have, e.g., name, token
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>; // Make it async if not already
  logout: () => Promise<void>; // Add logout function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null); // Renamed to avoid conflict

  useEffect(() => {
    // Load user data from storage on mount
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUserState(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUser();
  }, []);

  const handleSetUser = async (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userProfile'); // Also clear userProfile on explicit nullification
    }
  };

  const handleLogout = async () => {
    await handleSetUser(null); // This will clear user and userProfile from storage
    await AsyncStorage.removeItem('token'); // Clear authentication token
    await AsyncStorage.removeItem('isAdmin'); // Clear admin status

    // Optional: Clear all volunteer state keys
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const volunteerKeys = allKeys.filter(key => key.startsWith('volunteerState_'));
      if (volunteerKeys.length > 0) {
        await AsyncStorage.multiRemove(volunteerKeys);
      }
    } catch (error) {
      console.error('Error clearing volunteer state:', error);
    }

    // Navigation will be handled by the component calling logout or a root navigator effect
    // For example, by using router.replace('/signin') or a similar mechanism.
  };

  const value = {
    user,
    setUser: handleSetUser,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 