import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, Heart, User, Search, Bell } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  activeIcon?: typeof Home;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Library", href: "/library", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
];

interface BottomNavigationProps {
  currentRoute?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  style?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * BottomNavigation component provides app-wide navigation
 * with home, search, favorites and profile options
 *
 * @returns BottomNavigation component with active state indicators and animations
 */
const BottomNavigation = React.memo(function BottomNavigation({
  currentRoute,
  activeTab,
  onTabChange,
  style,
}: BottomNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); // Get user auth state

  // Use provided currentRoute or determine from pathname
  const activeRoute = currentRoute || pathname;

  // Animation references for tab indicators
  const tabAnimations = useRef(
    navItems.map(() => new Animated.Value(0)),
  ).current;

  // Animation for the entire bar
  const barAnimation = useRef(new Animated.Value(0)).current;

  // Animate the bar in when component mounts
  useEffect(() => {
    Animated.spring(barAnimation, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle tab press with animation and haptic feedback
  const handleTabPress = useCallback(
    (route: string, index: number) => {
      // Add haptic feedback
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, continue silently
      }

      // Animate pressed tab
      Animated.sequence([
        Animated.timing(tabAnimations[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tabAnimations[index], {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Navigate to the route
      router.push(route);
      onTabChange?.(route);
    },
    [router, onTabChange, tabAnimations],
  );

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.8)',
          borderTopWidth: 1,
          shadowColor: isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)",
          transform: [
            {
              translateY: barAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}
      accessibilityRole="tablist"
      accessibilityLabel="Bottom navigation"
    >
      <SafeAreaView style={styles.safeArea}> 
        <View style={styles.tabRow}>
          {navItems.map((item, index) => {
            // Conditionally skip rendering Library tab if user is not logged in
            if (item.name === 'Library' && !user) {
              return null;
            }

            const isActive = activeRoute === item.href;
            const Icon = item.icon;

            // Scale animation for the tab
            const scale = tabAnimations[index].interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.9, 1],
            });

            return (
              <Animated.View
                key={item.name}
                style={[
                  styles.tabContainer,
                  {
                    transform: [{ scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.tabButton}
                  onPress={() => handleTabPress(item.href, index)}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected: isActive }}
                  accessibilityHint={`Navigate to ${item.name}`}
                >
                  <View style={styles.tabContent}>
                    {isActive && (
                      <View
                        style={[
                          styles.activeIndicator,
                          { backgroundColor: colors.primary }
                        ]}
                      >
                        <Text style={{ color: 'transparent' }}>.</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.iconContainer,
                        isActive && { 
                          backgroundColor: isDarkMode 
                            ? 'rgba(99, 102, 241, 0.15)' 
                            : 'rgba(99, 102, 241, 0.1)' 
                        }
                      ]}
                    >
                      <Icon
                        size={22}
                        color={isActive ? colors.primary : colors.textSecondary}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </View>
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isActive ? colors.primary : colors.textSecondary,
                          fontWeight: isActive ? '600' : '400',
                        }
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0,
    borderTopWidth: 1,
    elevation: 8, 
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 100,
  },
  safeArea: { 
    backgroundColor: "transparent", 
  }, 
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  tabContainer: {
    flex: 1,
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    width: "100%",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  activeIndicator: {
    position: 'absolute',
    top: -14,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});

export default BottomNavigation;
