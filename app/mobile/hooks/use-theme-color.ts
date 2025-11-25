/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ThemeName, type ThemeTokens } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeColorOverrides = Partial<Record<ThemeName, string>>;

export function useThemeColor(props: ThemeColorOverrides, colorName: keyof ThemeTokens) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}
