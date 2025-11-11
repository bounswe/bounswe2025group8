import { useAppTheme } from '@/theme/ThemeProvider';

export function useColorScheme() {
  const { resolvedTheme } = useAppTheme();
  return resolvedTheme;
}
