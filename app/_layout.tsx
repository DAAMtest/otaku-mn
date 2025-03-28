import React, { useEffect } from "react";
import { View, StatusBar, Platform, ActivityIndicator } from "react-native";
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
    // Use the statusBar style from the theme
    StatusBar.setBarStyle(colors.statusBar === 'light-content' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colors.background);
  }, [colors]);

  // Show loading indicator while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        // Add proper spacing for bottom navigation to avoid overlapping content
        paddingBottom: Platform.OS === 'ios' ? 90 : 70 
      }}>
        <Slot />
        {/* Only show bottom navigation on main screens */}
        {["/", "/search", "/notifications", "/library", "/favorites", "/profile", "/anime/[id]"].includes(pathname) && (
          <BottomNavigation 
            currentRoute={pathname} 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.card,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}
