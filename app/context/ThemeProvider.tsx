import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import type { PropsWithChildren } from 'react';

// Define our theme colors
export const lightTheme = {
  // Deku-inspired color scheme with light mode variants
  primary: '#1A7852', // Emerald Green - Deku's jumpsuit
  primaryLight: '#2C9A6D', // Lighter green for hover states
  primaryDark: '#116141', // Darker green for pressed states
  secondary: '#E63946', // Bright Red - Deku's shoes and energy effects
  secondaryLight: '#F05D69', // Lighter red for hover states
  secondaryDark: '#C42836', // Darker red for pressed states
  background: '#F9FAFB', // Light background
  text: '#111827', // Dark text for light mode
  textSecondary: '#4B5563', // Secondary text
  border: '#E5E7EB', // Light border
  success: '#10B981', // Green
  error: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  card: '#FFFFFF', // Card background
  cardHover: '#F3F4F6', // Card hover state
  inactive: '#9CA3AF', // Inactive state
  skeleton: '#E5E7EB', // Skeleton loading state
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
};

export const darkTheme = {
  // Deku-inspired color scheme
  primary: '#2C9A6D', // Slightly lighter green for dark mode
  primaryLight: '#3DAC7F', // Even lighter green for hover states
  primaryDark: '#1A7852', // Original green for pressed states
  secondary: '#F05D69', // Slightly lighter red for dark mode
  secondaryLight: '#F47F89', // Even lighter red for hover states
  secondaryDark: '#E63946', // Original red for pressed states
  background: '#111827', // Dark background
  text: '#F9FAFB', // Light text for dark mode
  textSecondary: '#D1D5DB', // Secondary text
  border: '#374151', // Dark border
  success: '#34D399', // Lighter green for dark mode
  error: '#F87171', // Lighter red for dark mode
  warning: '#FBBF24', // Lighter amber for dark mode
  info: '#60A5FA', // Lighter blue for dark mode
  card: '#1F2937', // Card background
  cardHover: '#374151', // Card hover state
  inactive: '#6B7280', // Inactive state
  skeleton: '#374151', // Skeleton loading state
  overlay: 'rgba(0, 0, 0, 0.75)', // Modal overlay
};

type ThemeColors = typeof lightTheme;

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
  colors: darkTheme,
});

/**
 * ThemeProvider component that provides theme context for the application
 * Manages dark/light mode state and provides methods to toggle theme
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  // Get device color scheme
  const deviceColorScheme = useNativeColorScheme();
  // Default to dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme based on device preference, but default to dark
  useEffect(() => {
    // Always use dark mode for this app
    setIsDarkMode(true);
  }, [deviceColorScheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Select the appropriate theme based on mode
  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context
 * @returns The theme context with isDarkMode and toggleTheme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
