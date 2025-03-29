import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";
import type { PropsWithChildren } from "react";

// Define our theme colors
interface Theme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  yellow: string;
  red: string;
  white: string;
  card: string;
  cardHover: string;
  inactive: string;
  skeleton: string;
  placeholder?: string;
  statusBar?: string;
}

export const lightTheme: Theme = {
  primary: "#37B24D", // Deku's green
  primaryLight: "#69DB7C",
  primaryDark: "#2B9348",
  secondary: "#FF5252", // Accent red
  secondaryLight: "#FF7B7B",
  secondaryDark: "#D32F2F",
  background: "#F9FAFB", // Lighter background for better contrast
  text: "#111827", // Darker text for better readability
  textSecondary: "#4B5563", // Darker secondary text
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  info: "#3B82F6",
  overlay: "rgba(0, 0, 0, 0.5)",
  yellow: "#F59E0B", // More consistent yellow
  red: "#EF4444", // More consistent red
  white: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F3F4F6",
  inactive: "#9CA3AF",
  skeleton: "#E5E7EB",
  placeholder: "#9CA3AF", // Added placeholder color
  statusBar: "dark-content", // Added status bar style
};

export const darkTheme: Theme = {
  primary: "#40C057", // Deku's green (brighter for dark mode)
  primaryLight: "#69DB7C",
  primaryDark: "#2B9348",
  secondary: "#FF5252", // Accent red
  secondaryLight: "#FF7B7B",
  secondaryDark: "#D32F2F",
  background: "#0A1929", // Darker blue background inspired by MHA night scenes
  text: "#F9FAFB", // Brighter text for better readability
  textSecondary: "#9CA3AF",
  border: "#374151",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  info: "#60A5FA",
  overlay: "rgba(0, 0, 0, 0.8)",
  yellow: "#FBBF24", // More consistent yellow
  red: "#FF5252", // More consistent red
  white: "#FFFFFF",
  card: "#132F4C", // Slightly lighter card background with blue tint
  cardHover: "#173A5E", // Darker hover state with blue tint
  inactive: "#6B7280",
  skeleton: "#374151",
  placeholder: "#6B7280", // Added placeholder color
  statusBar: "light-content", // Added status bar style
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: Theme;
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
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
