/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

<<<<<<< HEAD
import { Colors, type ThemeName, type ThemeTokens } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeColorOverrides = Partial<Record<ThemeName, string>>;

export function useThemeColor(props: ThemeColorOverrides, colorName: keyof ThemeTokens) {
  const theme = useColorScheme() ?? 'light';
=======
import { Colors, type ThemeColors, type ThemeName } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeOverrides = Partial<Record<ThemeName, string | undefined>>;

export function useThemeColor(props: ThemeOverrides, colorName: keyof ThemeColors) {
  const theme = useColorScheme();
>>>>>>> 7bdd68a (Add dark mode and high-contrast feature)
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}
