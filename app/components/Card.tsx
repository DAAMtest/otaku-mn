import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Card component for displaying content in a contained, styled container
 * Supports different variants and can be interactive when onPress is provided
 */
export default function Card({
  children,
  variant = 'elevated',
  onPress,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors, isDarkMode } = useTheme();
  
  // Get card styles based on variant
  const getCardStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case 'filled':
        return {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderWidth: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };
  
  const cardStyles = getCardStyles();
  
  // Determine the component to render based on whether onPress is provided
  const CardComponent = onPress ? TouchableOpacity : View;
  
  // Get accessibility props based on whether the card is interactive
  const getAccessibilityProps = () => {
    if (onPress) {
      return {
        accessible: true,
        accessibilityRole: 'button' as AccessibilityRole,
        accessibilityLabel: accessibilityLabel,
        accessibilityHint: accessibilityHint || 'Activates this card',
      };
    }
    return {
      accessible: true,
      accessibilityRole: 'none' as AccessibilityRole,
      accessibilityLabel: accessibilityLabel,
    };
  };
  
  const accessibilityProps = getAccessibilityProps();
  
  return (
    <CardComponent
      style={[
        styles.card,
        cardStyles,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      {...accessibilityProps}
    >
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    marginVertical: 8,
    marginHorizontal: 0,
  },
  content: {
    padding: 16,
  },
});
