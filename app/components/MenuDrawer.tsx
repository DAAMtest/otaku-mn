import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  X,
  Settings,
  Moon,
  Sun,
  LogOut,
  Info,
  Heart,
  BookmarkIcon,
  Home,
  Search,
  Bell,
  User,
  TrendingUp,
  Clock,
  Award,
  HelpCircle,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
import { useToast } from "@/context/ToastContext";

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  onMenuItemPress?: (route: string) => void;
  isAuthenticated?: boolean;
  username?: string;
  avatarUrl?: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  requiresAuth?: boolean;
  dividerAfter?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);

/**
 * MenuDrawer component provides a slide-in menu with navigation options
 * and user profile information with animations and accessibility features
 */
const MenuDrawer = ({
  visible,
  onClose,
  onMenuItemPress,
  isAuthenticated = false,
  username = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
}: MenuDrawerProps) => {
  const router = useRouter();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();

  // Animation values
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Track if drawer is fully hidden
  const [isFullyHidden, setIsFullyHidden] = useState(!visible);

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      icon: <Home size={22} color={colors.text} />,
      label: "Home",
      route: "home",
    },
    {
      icon: <Search size={22} color={colors.text} />,
      label: "Search",
      route: "search",
    },
    {
      icon: <BookmarkIcon size={22} color={colors.text} />,
      label: "My Library",
      route: "library",
      requiresAuth: true,
    },
    {
      icon: <Heart size={22} color={colors.text} />,
      label: "Favorites",
      route: "favorites",
      requiresAuth: true,
      dividerAfter: true,
    },
    {
      icon: <TrendingUp size={22} color={colors.text} />,
      label: "Trending",
      route: "trending",
    },
    {
      icon: <Clock size={22} color={colors.text} />,
      label: "New Releases",
      route: "new_releases",
    },
    {
      icon: <Award size={22} color={colors.text} />,
      label: "Top Rated",
      route: "top_rated",
      dividerAfter: true,
    },
    {
      icon: <Bell size={22} color={colors.text} />,
      label: "Notifications",
      route: "notifications",
      requiresAuth: true,
    },
    {
      icon: <User size={22} color={colors.text} />,
      label: "Profile",
      route: "profile",
      requiresAuth: true,
    },
    {
      icon: <Settings size={22} color={colors.text} />,
      label: "Settings",
      route: "settings",
    },
    {
      icon: <HelpCircle size={22} color={colors.text} />,
      label: "About",
      route: "about",
    },
  ];

  // Handle drawer animation
  useEffect(() => {
    if (visible) {
      setIsFullyHidden(false);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Add haptic feedback on open
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, continue silently
      }
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Set fully hidden after animation completes
        setIsFullyHidden(true);
      });
    }
  }, [visible, translateX, backdropOpacity, scaleAnim]);

  // Handle menu item press
  const handleMenuItemPress = (
    route: string,
    requiresAuth: boolean = false,
  ) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    if (requiresAuth && !isAuthenticated) {
      showToast("Please sign in to access this feature", "warning");
      onClose();
      return;
    }

    if (onMenuItemPress) {
      onMenuItemPress(route);
    } else {
      if (route === "home") {
        router.push("/");
      } else {
        router.push(`/${route}`);
      }
    }

    onClose();
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    toggleTheme();
    showToast(`Switched to ${isDarkMode ? "light" : "dark"} mode`, "info");
  };

  // Handle login
  const handleLogin = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    onClose();
    handleMenuItemPress("login");
  };

  // Handle logout
  const handleLogout = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }

    showToast("Logged out successfully", "success");
    onClose();
    handleMenuItemPress("logout");
  };

  // Don't render if fully hidden
  if (isFullyHidden) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <Pressable
          style={styles.backdropPressable}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          accessibilityHint="Closes the navigation menu"
        />
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.card,
            borderRightColor: colors.border,
            transform: [{ translateX: translateX }, { scale: scaleAnim }],
          },
        ]}
        accessibilityViewIsModal={true}
        accessibilityRole="menu"
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header with close button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.cardHover },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* User Profile Section */}
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() =>
              isAuthenticated
                ? handleMenuItemPress("profile", true)
                : handleLogin()
            }
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              accessibilityIgnoresInvertColors={true}
            />
            <View style={styles.profileInfo}>
              <Typography variant="h3" style={styles.username}>
                {username}
              </Typography>
              <Typography variant="bodySmall" color={colors.textSecondary}>
                {isAuthenticated ? "Tap to view profile" : "Tap to sign in"}
              </Typography>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Menu Items */}
          <View style={styles.menuItemsContainer}>
            {menuItems.map((item, index) => {
              // Skip login/logout items as they're handled separately
              if (item.route === "login" || item.route === "logout")
                return null;

              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[styles.menuItem, { borderRadius: 8 }]}
                    onPress={() =>
                      handleMenuItemPress(item.route, item.requiresAuth)
                    }
                    accessibilityRole="menuitem"
                    accessibilityLabel={item.label}
                    accessibilityHint={`Navigate to ${item.label}`}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemIcon}>{item.icon}</View>
                    <Typography variant="body" style={styles.menuItemText}>
                      {item.label}
                    </Typography>
                  </TouchableOpacity>

                  {item.dividerAfter && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: colors.border, marginVertical: 8 },
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Theme Toggle */}
            <TouchableOpacity
              style={[styles.menuItem, { borderRadius: 8 }]}
              onPress={handleThemeToggle}
              accessibilityRole="switch"
              accessibilityLabel={`Toggle ${isDarkMode ? "light" : "dark"} mode`}
              accessibilityState={{ checked: isDarkMode }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIcon}>
                {isDarkMode ? (
                  <Sun size={22} color={colors.warning} />
                ) : (
                  <Moon size={22} color={colors.primary} />
                )}
              </View>
              <Typography variant="body" style={styles.menuItemText}>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Login/Logout Button */}
          <View style={styles.authButtonContainer}>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            {isAuthenticated ? (
              <TouchableOpacity
                style={[
                  styles.authButton,
                  { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                ]}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Log out"
                activeOpacity={0.7}
              >
                <LogOut size={20} color={colors.error} />
                <Typography
                  variant="body"
                  color={colors.error}
                  style={{ marginLeft: 12, fontWeight: "500" }}
                >
                  Logout
                </Typography>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                activeOpacity={0.7}
              >
                <User size={20} color="#FFFFFF" />
                <Typography
                  variant="body"
                  color="#FFFFFF"
                  style={{ marginLeft: 12, fontWeight: "500" }}
                >
                  Sign In
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Typography
              variant="caption"
              color={colors.textSecondary}
              align="center"
            >
              AnimeTempo v1.0.0
            </Typography>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: SCREEN_HEIGHT,
    borderRightWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingVertical: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    marginBottom: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  menuItemsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  menuItemIcon: {
    width: 32,
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  authButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: "auto",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 16 : 16,
  },
});

export default MenuDrawer;
