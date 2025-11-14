import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  highContrastColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, highContrastColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor, highContrast: highContrastColor },
    'background'
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
