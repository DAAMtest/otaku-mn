import React, { useEffect } from "react";
import { View, StatusBar, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { Slot, usePathname, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "@/context/ThemeProvider";
import { ToastProvider } from "@/context/ToastContext";
import AuthProvider from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import BottomNavigation from "@/components/BottomNavigation";
import { QueryClient, QueryClientProvider } from "react-query";
import { useProtectedRoute } from "./middleware";

// Create a client
const queryClient = new QueryClient();

/**
 * Root layout component that wraps the entire application
 * with necessary providers and configuration
 */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <RootLayoutContent />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * Content component for the root layout that applies theme
 * and renders the main application content
 */
function RootLayoutContent() {
  const { colors } = useTheme();
  const pathname = usePathname();
  const segments = useSegments();
  
  // Apply middleware for route protection
  const isCheckingAuth = useProtectedRoute(segments);

  // Set status bar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(colors.statusBar === 'light-content' ? 'light-content' : 'dark-content');
  }, [colors.statusBar]);

  // Show loading indicator while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Check if we should show bottom navigation
  const showBottomNavigation = !pathname.startsWith('/anime/') && !pathname.startsWith('/auth/');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={showBottomNavigation ? styles.contentWithBottomNav : styles.contentWithoutBottomNav}>
          <Slot />
        </View>
        {showBottomNavigation && <BottomNavigation />}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWithBottomNav: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Adjusted padding for different platforms
  },
  contentWithoutBottomNav: {
    flex: 1,
  },
});
