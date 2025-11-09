<<<<<<< HEAD
export { useColorScheme } from './use-color-scheme';
=======
import { useAppTheme, type ThemeName } from '@/lib/theme';

export function useColorScheme(): ThemeName {
  const { theme } = useAppTheme();
  return theme;
}
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
