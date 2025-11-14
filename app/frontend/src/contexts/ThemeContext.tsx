import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  ThemeMode,
  ThemeColors,
} from '../constants/themes';
import {
  getTheme,
  getSystemThemePreference,
  THEME_STORAGE_KEY,
  spacing,
  typography,
  borderRadius,
} from '../constants/themes';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'high-contrast')) {
      return stored as ThemeMode;
    }
    // Fall back to system preference
    return getSystemThemePreference();
  });

  const [colors, setColors] = useState<ThemeColors>(getTheme(mode));

  // Update theme colors when mode changes
  useEffect(() => {
    setColors(getTheme(mode));
    // Persist to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    
    // Update document root attributes for CSS access
    document.documentElement.setAttribute('data-theme', mode);
    
    // Apply background color to body to prevent flash
    document.body.style.backgroundColor = getTheme(mode).background.primary;
    document.body.style.color = getTheme(mode).text.primary;
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const toggleTheme = () => {
    setMode((prevMode) => {
      // Cycle through themes: light -> dark -> high-contrast -> light
      switch (prevMode) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'high-contrast';
        case 'high-contrast':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  const value: ThemeContextType = {
    mode,
    colors,
    spacing,
    typography,
    borderRadius,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
