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
import { ArrowLeft, Bell, Home, Search } from "lucide-react-native";
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
  showSearch = true,
  showNotifications = true,
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
                <Typography
                  variant="h2"
                  numberOfLines={1}
                  style={[styles.title, { fontSize: 20, fontWeight: "bold" }]}
                >
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
              <Animated.View style={{ transform: [{ scale: scaleAnim }], marginRight: 12 }}>
                <TouchableOpacity
                  onPress={handleSearchPress}
                  style={[
                    styles.iconButton,
                    { 
                      backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : colors.cardHover,
                      elevation: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.5,
                    },
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                  activeOpacity={0.7}
                >
                  <Search size={20} color={colors.text} />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  onPress={handleNotificationsPress}
                  style={[
                    styles.iconButton,
                    { 
                      backgroundColor: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : colors.cardHover,
                      elevation: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.5,
                    },
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
    paddingTop: STATUSBAR_HEIGHT,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconButton: {
    marginLeft: 4,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#0F172A",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default Header;
