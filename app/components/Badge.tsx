import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label?: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

/**
 * Badge component for displaying status indicators, counts, or labels
 * Supports different variants, sizes, and can be used as a dot indicator
 */
export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
  textStyle,
  accessibilityLabel,
}: BadgeProps) {
  const { colors, isDarkMode } = useTheme();
  
  // Get badge background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }
  };
  
  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'default':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };
  
  // Get badge size based on size prop
  const getBadgeSize = () => {
    if (dot) {
      switch (size) {
        case 'sm': return { width: 8, height: 8 };
        case 'lg': return { width: 12, height: 12 };
        default: return { width: 10, height: 10 };
      }
    }
    
    switch (size) {
      case 'sm': return { 
        paddingHorizontal: 6, 
        paddingVertical: 2,
        minWidth: 16,
        height: 16,
        fontSize: 'caption',
      };
      case 'lg': return { 
        paddingHorizontal: 10, 
        paddingVertical: 4,
        minWidth: 24,
        height: 24,
        fontSize: 'bodySmall',
      };
      default: return { 
        paddingHorizontal: 8, 
        paddingVertical: 3,
        minWidth: 20,
        height: 20,
        fontSize: 'caption',
      };
    }
  };
  
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const badgeSize = getBadgeSize();
  
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          ...badgeSize,
        },
        dot && styles.dot,
        style,
      ]}
      accessible={true}
      accessibilityRole={'text' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel || (typeof label === 'string' ? label : `Badge ${label}`)}
    >
      {!dot && label !== undefined && (
        <Typography
          variant={badgeSize.fontSize as any}
          color={textColor}
          style={[styles.text, textStyle]}
          numberOfLines={1}
        >
          {label}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 100,
  },
  text: {
    textAlign: 'center',
  },
});
