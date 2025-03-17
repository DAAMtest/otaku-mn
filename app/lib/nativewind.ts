/**
 * NativeWind configuration for the application
 * Provides utility functions for working with NativeWind
 */

// Define the color palette based on our tailwind config
export const colors = {
  background: '#131722',
  backgroundLight: '#1f2937',
  text: '#ffffff',
  textMuted: '#9ca3af',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  favorite: '#ef4444',
  accent: '#f59e0b',
};

/**
 * Get color by key from our color palette
 * @param key The color key to retrieve
 * @returns The color value
 */
export function getColor(key: keyof typeof colors): string {
  return colors[key];
}
