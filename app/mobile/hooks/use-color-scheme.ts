<<<<<<< HEAD
import { useAppTheme } from '@/theme/ThemeProvider';

export function useColorScheme() {
  const { resolvedTheme } = useAppTheme();
  return resolvedTheme;
=======
import { useAppTheme, type ThemeName } from '@/lib/theme';

export function useColorScheme(): ThemeName {
  const { theme } = useAppTheme();
  return theme;
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
}
