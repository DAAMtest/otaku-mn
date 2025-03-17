import React from 'react';
import { Text, StyleSheet, TextProps, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'body' 
  | 'bodySmall' 
  | 'caption' 
  | 'button';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  italic?: boolean;
  numberOfLines?: number;
}

/**
 * Typography component for consistent text styling across the app
 * Provides various text styles based on the variant prop
 */
export default function Typography({
  variant = 'body',
  color,
  align = 'left',
  weight,
  italic = false,
  style,
  children,
  numberOfLines,
  ...props
}: TypographyProps) {
  const { colors } = useTheme();
  
  // Get the base style for the variant
  const variantStyle = styles[variant];
  
  // Get the font weight based on the variant or the weight prop
  const fontWeight = weight || (
    variant === 'h1' ? '700' :
    variant === 'h2' ? '600' :
    variant === 'h3' ? '600' :
    variant === 'button' ? '600' :
    '400'
  );
  
  // Combine all styles
  const combinedStyle = [
    variantStyle,
    {
      color: color || colors.text,
      textAlign: align,
      fontWeight,
      fontStyle: italic ? 'italic' as const : 'normal' as const,
    },
    style,
  ];
  
  return (
    <Text 
      style={combinedStyle} 
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
}

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Roboto';

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
    fontFamily,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.5,
    fontFamily,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontFamily,
  },
});
