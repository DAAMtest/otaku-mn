/**
 * NativeWind v4 utility functions
 * This file contains utility functions for working with NativeWind v4
 */

import { useTheme } from '@/context/ThemeProvider';
import { useColorScheme } from 'react-native';

/**
 * Hook to get the current theme class for NativeWind v4
 * @returns An object with the theme class and isDarkMode flag
 */
export function useNativeWindTheme() {
  const { isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  
  return {
    themeClass: isDarkMode ? 'dark' : '',
    isDarkMode,
    systemColorScheme
  };
}
