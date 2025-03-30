import React, { useEffect } from "react";
import { View, StatusBar, Platform, ActivityIndicator, StyleSheet, Text } from "react-native";
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
  const isLoading = useProtectedRoute(segments);

  // Set status bar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(colors.statusBar === 'light-content' ? 'light-content' : 'dark-content');
  }, [colors.statusBar]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Check if we should show bottom navigation
  const showBottomNavigation = !pathname.startsWith('/auth/') && 
    !pathname.startsWith('/anime/') && 
    !pathname.startsWith('/admin/') &&
    pathname !== '/';  // Hide on root path which is handled by home screen

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
    paddingBottom: Platform.OS === 'ios' ? 90 : 70,
  },
  contentWithoutBottomNav: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
