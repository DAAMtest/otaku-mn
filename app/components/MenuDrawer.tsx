import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  Easing,
} from "react-native";
import {
  X,
  Home,
  Search,
  BookmarkIcon,
  Settings,
  Info,
  LogOut,
  Bell,
  User,
  Film,
  TrendingUp,
  Calendar,
  Heart,
  ChevronRight,
} from "lucide-react-native";

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  onMenuItemPress: (item: string) => void;
  isAuthenticated: boolean;
  username?: string;
  avatarUrl?: string;
}

const { width, height } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.85;
const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

const MenuDrawer = ({
  visible,
  onClose,
  onMenuItemPress,
  isAuthenticated = false,
  username = "Guest",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
}: MenuDrawerProps) => {
  const translateX = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Provide haptic feedback when opening drawer
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, continue silently
      }

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic), // Add easing for smoother animation
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 250, // Slightly faster closing animation
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic), // Add easing for smoother animation
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, opacity]);

  if (!visible) return null;

  const mainMenuItems = [
    { key: "home", label: "Home", icon: Home },
    { key: "search", label: "Search", icon: Search },
    { key: "lists", label: "My Lists", icon: BookmarkIcon },
    { key: "profile", label: "Profile", icon: User },
  ];

  const discoverMenuItems = [
    { key: "trending", label: "Trending Now", icon: TrendingUp },
    { key: "new_releases", label: "New Releases", icon: Calendar },
    { key: "top_rated", label: "Top Rated", icon: Film },
    { key: "popular", label: "Most Popular", icon: Heart },
  ];

  const settingsMenuItems = [
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "about", label: "About", icon: Info },
  ];

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        opacity: opacity,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/60"
      />

      <Animated.View
        style={{
          transform: [{ translateX }],
          width: DRAWER_WIDTH,
          height: "100%",
          paddingTop: STATUS_BAR_HEIGHT,
        }}
        className="bg-gray-900 absolute top-0 left-0 bottom-0 shadow-xl"
      >
        {/* Header with user info */}
        <View className="p-6 border-b border-gray-800 bg-gray-800/50">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Image
                source={require("../../assets/images/icon.png")}
                className="w-8 h-8 rounded-md mr-2"
                resizeMode="contain"
              />
              <Text className="text-white text-xl font-bold">
                Otaku Mongolia
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 bg-gray-700/50 rounded-full"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-4">
            <Image
              source={{ uri: avatarUrl }}
              className="w-16 h-16 rounded-full border-2 border-purple-500"
              resizeMode="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-white text-lg font-semibold">
                {isAuthenticated ? username : "Guest"}
              </Text>
              {!isAuthenticated ? (
                <TouchableOpacity
                  onPress={() => onMenuItemPress("login")}
                  className="mt-1 bg-purple-600 py-1 px-3 rounded-full self-start"
                >
                  <Text className="text-white text-sm font-medium">
                    Sign in
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onMenuItemPress("profile")}
                  className="mt-1 flex-row items-center"
                >
                  <Text className="text-purple-400 text-sm mr-1">
                    View Profile
                  </Text>
                  <ChevronRight size={14} color="#C084FC" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Main Navigation */}
          <View className="px-4 py-3">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider px-2 mb-1">
              Main Navigation
            </Text>
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  className="flex-row items-center p-3 rounded-lg mb-1 hover:bg-gray-800 active:bg-gray-800"
                  onPress={() => onMenuItemPress(item.key)}
                >
                  <View className="w-8 h-8 bg-gray-800 rounded-lg items-center justify-center mr-3">
                    <IconComponent size={18} color="#C084FC" />
                  </View>
                  <Text className="text-white text-base font-medium">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Discover Section */}
          <View className="px-4 py-3 mt-2">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider px-2 mb-1">
              Discover
            </Text>
            {discoverMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  className="flex-row items-center p-3 rounded-lg mb-1 hover:bg-gray-800 active:bg-gray-800"
                  onPress={() => onMenuItemPress(item.key)}
                >
                  <View className="w-8 h-8 bg-gray-800 rounded-lg items-center justify-center mr-3">
                    <IconComponent size={18} color="#60A5FA" />
                  </View>
                  <Text className="text-white text-base font-medium">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Settings Section */}
          <View className="px-4 py-3 mt-2">
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-wider px-2 mb-1">
              Settings
            </Text>
            {settingsMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.key}
                  className="flex-row items-center p-3 rounded-lg mb-1 hover:bg-gray-800 active:bg-gray-800"
                  onPress={() => onMenuItemPress(item.key)}
                >
                  <View className="w-8 h-8 bg-gray-800 rounded-lg items-center justify-center mr-3">
                    <IconComponent size={18} color="#9CA3AF" />
                  </View>
                  <Text className="text-white text-base font-medium">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {isAuthenticated && (
          <View className="p-4 border-t border-gray-800 bg-gray-800/30">
            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg bg-red-900/20"
              onPress={() => onMenuItemPress("logout")}
            >
              <View className="w-8 h-8 bg-red-900/30 rounded-lg items-center justify-center mr-3">
                <LogOut size={18} color="#F87171" />
              </View>
              <Text className="text-red-400 text-base font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default MenuDrawer;
