import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

export interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
  buttonStyle?: StyleProp<ViewStyle>;
  activeButtonStyle?: StyleProp<ViewStyle>;
  inactiveButtonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  inactiveTextStyle?: StyleProp<TextStyle>;
}

const TabButton: React.FC<TabButtonProps> = ({
  title,
  isActive,
  onPress,
  buttonStyle,
  activeButtonStyle,
  inactiveButtonStyle,
  textStyle,
  activeTextStyle,
  inactiveTextStyle,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        isActive ? activeButtonStyle : inactiveButtonStyle,
        isActive && { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          textStyle,
          isActive ? activeTextStyle : inactiveTextStyle,
          !isActive && { color: colors.primary },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default TabButton; 