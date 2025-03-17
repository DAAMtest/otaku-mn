import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  Bell,
  Menu as MenuIcon,
  Home,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
import { useToast } from "@/context/ToastContext";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMenu?: boolean;
  showHome?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onHomePress?: () => void;
  transparent?: boolean;
  scrollOffset?: Animated.Value;
  subtitle?: string;
  notificationCount?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Header component provides navigation and action buttons
 * with support for animations and accessibility
 */
const Header = ({
  title = "AnimeTempo",
  showBack = false,
  showSearch = false,
  showNotifications = false,
  showMenu = false,
  showHome = false,
  onMenuPress,
  onSearchPress,
  onNotificationsPress,
  onHomePress,
  transparent = false,
  scrollOffset,
  subtitle,
  notificationCount = 0,
}: HeaderProps) => {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { showToast } = useToast();
  const [opacity] = useState(new Animated.Value(transparent ? 0 : 1));
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  // Animation effect when component mounts
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle scroll-based header opacity
  useEffect(() => {
    if (scrollOffset && transparent) {
      scrollOffset.addListener(({ value }) => {
        const headerOpacity = Math.min(value / 100, 1);
        opacity.setValue(headerOpacity);
      });

      return () => {
        scrollOffset.removeAllListeners();
      };
    }
  }, [scrollOffset, transparent, opacity]);

  // Calculate dynamic header styles
  const headerBackgroundColor = transparent
    ? opacity.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(0,0,0,0)", colors.background],
      })
    : colors.background;

  const headerShadowOpacity = transparent
    ? opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
      })
    : 0.1;

  // Handle button press with haptic feedback
  const handleButtonPress = (action: () => void) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    action();
  };

  // Handle back button press
  const handleBackPress = () => {
    handleButtonPress(() => {
      router.back();
    });
  };

  // Handle home button press
  const handleHomePress = () => {
    handleButtonPress(() => {
      if (onHomePress) {
        onHomePress();
      } else {
        router.push("/");
      }
    });
  };

  // Handle search button press
  const handleSearchPress = () => {
    handleButtonPress(() => {
      if (onSearchPress) {
        onSearchPress();
      } else {
        router.push("/search");
      }
    });
  };

  // Handle notifications button press
  const handleNotificationsPress = () => {
    handleButtonPress(() => {
      if (onNotificationsPress) {
        onNotificationsPress();
      } else {
        router.push("/notifications");
      }
    });
  };

  // Handle menu button press
  const handleMenuPress = () => {
    handleButtonPress(() => {
      if (onMenuPress) {
        onMenuPress();
      }
    });
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={Platform.OS === "android"}
      />
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: headerBackgroundColor,
            shadowOpacity: headerShadowOpacity,
            borderBottomColor: colors.border,
            borderBottomWidth: transparent ? 0 : 1,
          },
        ]}
      >
        <SafeAreaView style={{ width: "100%" }}>
          <View style={styles.headerContent}>
            <View style={styles.leftContainer}>
              {showBack && (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleBackPress}
                    style={[
                      styles.iconButton,
                      { backgroundColor: colors.cardHover },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={20} color={colors.text} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {showHome && (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleHomePress}
                    style={[
                      styles.iconButton,
                      { backgroundColor: colors.cardHover },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go to home"
                    activeOpacity={0.7}
                  >
                    <Home size={20} color={colors.text} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              <View style={styles.titleContainer}>
                <Typography variant="h2" numberOfLines={1} style={styles.title}>
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    variant="bodySmall"
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {subtitle}
                  </Typography>
                )}
              </View>
            </View>

            <View style={styles.rightContainer}>
              {showSearch && (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleSearchPress}
                    style={[
                      styles.iconButton,
                      { backgroundColor: colors.cardHover },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Search"
                    activeOpacity={0.7}
                  >
                    <Search size={20} color={colors.text} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {showNotifications && (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleNotificationsPress}
                    style={[
                      styles.iconButton,
                      { backgroundColor: colors.cardHover },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                    activeOpacity={0.7}
                  >
                    <Bell size={20} color={colors.text} />
                    {notificationCount > 0 && (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.error },
                        ]}
                      >
                        <Typography
                          variant="caption"
                          style={styles.badgeText}
                          color="#FFFFFF"
                        >
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Typography>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}

              {showMenu && (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleMenuPress}
                    style={[
                      styles.iconButton,
                      { backgroundColor: colors.cardHover },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Menu"
                    activeOpacity={0.7}
                  >
                    <MenuIcon size={20} color={colors.text} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const STATUSBAR_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: Platform.OS === "android" ? STATUSBAR_HEIGHT : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Header;
