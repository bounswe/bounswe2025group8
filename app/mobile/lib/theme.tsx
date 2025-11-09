import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark' | 'highContrast';
export type ThemeName = 'light' | 'dark' | 'highContrast';

interface ThemeContextValue {
  theme: ThemeName;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  ready: boolean;
}

const STORAGE_KEY = 'themePreference';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  preference: 'system',
  setPreference: () => {},
  ready: false,
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydratePreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'system' || stored === 'light' || stored === 'dark' || stored === 'highContrast') {
          setPreferenceState(stored);
        }
      } catch {
        // Ignore hydration errors and keep default preference
      } finally {
        setReady(true);
      }
    };

    hydratePreference();
  }, []);

  const resolvedTheme: ThemeName =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference === 'highContrast'
      ? 'highContrast'
      : preference;

  const setPreference = (value: ThemePreference) => {
    setPreferenceState(value);
    AsyncStorage.setItem(STORAGE_KEY, value).catch(() => {
      // Ignore persistence failures to avoid breaking the UI
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      preference,
      setPreference,
      ready,
    }),
    [preference, ready, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
