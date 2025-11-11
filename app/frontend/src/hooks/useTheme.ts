import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import type { ThemeMode, ThemeColors } from '../constants/themes';
import type { spacing, typography, borderRadius } from '../constants/themes';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
