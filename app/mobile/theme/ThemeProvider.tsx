import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, type AppearancePreferences, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, type Theme } from '@react-navigation/native';

import { Colors, type ThemeName, type ThemeTokens } from '@/constants/Colors';

type ThemePreference = ThemeName | 'system';

type ThemeContextValue = {
  isHydrated: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  resolvedTheme: ThemeName;
  tokens: ThemeTokens;
  navigationTheme: Theme & { name: ThemeName };
};

const STORAGE_KEY = 'app_theme_preference';

const ThemePreferenceContext = createContext<ThemeContextValue | null>(null);

const isThemePreference = (value: string | null): value is ThemePreference => {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'highContrast';
};

const buildNavigationTheme = (themeName: ThemeName): Theme & { name: ThemeName } => {
  const baseTheme = themeName === 'light' ? DefaultTheme : DarkTheme;
  const tokens = Colors[themeName];

  return {
    ...baseTheme,
    name: themeName,
    colors: {
      ...baseTheme.colors,
      ...tokens,
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.card,
      text: tokens.text,
      border: tokens.border,
      notification: tokens.accent,
    },
  };
};

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydratePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(STORAGE_KEY);
        if (isThemePreference(storedPreference)) {
          setPreferenceState(storedPreference);
        }
      } catch (error) {
        console.warn('Failed to load theme preference', error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydratePreference();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener((preferences: AppearancePreferences) => {
      setSystemScheme(preferences.colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const resolvedTheme: ThemeName = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const tokens = Colors[resolvedTheme];
  const navigationTheme = useMemo(() => buildNavigationTheme(resolvedTheme), [resolvedTheme]);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextPreference);
    } catch (error) {
      console.warn('Failed to persist theme preference', error);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isHydrated,
      preference,
      setPreference,
      resolvedTheme,
      tokens,
      navigationTheme,
    }),
    [isHydrated, preference, setPreference, resolvedTheme, tokens, navigationTheme]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemePreferenceContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
};

export type { ThemePreference };
