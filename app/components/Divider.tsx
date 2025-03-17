import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, AccessibilityRole } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';

export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  thickness?: number;
  color?: string;
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Divider component for providing visual separation between content
 * Supports different variants, orientations, and optional labels
 */
export default function Divider({
  variant = 'solid',
  orientation = 'horizontal',
  thickness = 1,
  color,
  label,
  labelPosition = 'center',
  style,
}: DividerProps) {
  const { colors, isDarkMode } = useTheme();
  
  // Get divider color
  const dividerColor = color || (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');
  
  // Get border style based on variant
  const getBorderStyle = () => {
    switch (variant) {
      case 'dashed': return 'dashed';
      case 'dotted': return 'dotted';
      default: return 'solid';
    }
  };
  
  const borderStyle = getBorderStyle();
  
  // Render horizontal divider
  if (orientation === 'horizontal') {
    // If there's a label, render a divider with label
    if (label) {
      return (
        <View style={[styles.horizontalWithLabel, style]}>
          <View
            style={[
              styles.line,
              {
                flex: labelPosition === 'start' ? 0.2 : 1,
                borderBottomWidth: thickness,
                borderBottomColor: dividerColor,
                borderStyle: borderStyle as any,
              },
            ]}
          />
          <View style={[
            styles.labelContainer,
            {
              marginHorizontal: 16,
              alignSelf: 
                labelPosition === 'start' ? 'flex-start' :
                labelPosition === 'end' ? 'flex-end' : 'center',
            }
          ]}>
            <Typography
              variant="caption"
              color={colors.textSecondary}
            >
              {label}
            </Typography>
          </View>
          <View
            style={[
              styles.line,
              {
                flex: labelPosition === 'end' ? 0.2 : 1,
                borderBottomWidth: thickness,
                borderBottomColor: dividerColor,
                borderStyle: borderStyle as any,
              },
            ]}
          />
        </View>
      );
    }
    
    // Render simple horizontal divider
    return (
      <View
        style={[
          styles.horizontal,
          {
            borderBottomWidth: thickness,
            borderBottomColor: dividerColor,
            borderStyle: borderStyle as any,
          },
          style,
        ]}
        accessibilityRole={'separator' as AccessibilityRole}
      />
    );
  }
  
  // Render vertical divider
  return (
    <View
      style={[
        styles.vertical,
        {
          borderLeftWidth: thickness,
          borderLeftColor: dividerColor,
          borderStyle: borderStyle as any,
        },
        style,
      ]}
      accessibilityRole={'separator' as AccessibilityRole}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    marginVertical: 8,
  },
  vertical: {
    height: '100%',
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
  horizontalWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  line: {
    height: 0,
  },
  labelContainer: {
    paddingHorizontal: 8,
  },
});
