import React from "react";
import { View, Text, TouchableOpacity, Image, Platform, Animated } from "react-native";
import { Search, User, Menu, Bell } from "lucide-react-native";

interface HeaderProps {
  title?: string;
  logoUrl?: string;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  isAuthenticated?: boolean;
  hasNotifications?: boolean;
}

const Header = React.memo(({
  title = "Otaku Mongolia",
  logoUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=otakumongolia",
  onSearchPress = () => {},
  onProfilePress = () => {},
  onMenuPress = () => {},
  onNotificationPress = () => {},
  isAuthenticated = false,
  hasNotifications = false,
}: HeaderProps) => {
  // Add animation for notification indicator
  const [notificationOpacity] = React.useState(() => new Animated.Value(1));
  
  React.useEffect(() => {
    if (hasNotifications) {
      // Create a blinking effect for the notification indicator
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(notificationOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(notificationOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [hasNotifications, notificationOpacity]);
  return (
    <View
      className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800"
      style={Platform.OS === "ios" ? { paddingTop: 0 } : {}}
    >
      {/* Left side - Logo and Title */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onMenuPress}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-800"
        >
          <Menu size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View className="flex-row items-center ml-2">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-8 h-8 rounded-md"
            resizeMode="contain"
          />
          <Text className="text-white font-bold text-lg ml-2">{title}</Text>
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center mr-1 rounded-full active:bg-gray-800"
          onPress={onSearchPress}
        >
          <Search size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {isAuthenticated && (
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center mr-1 rounded-full active:bg-gray-800"
            onPress={onNotificationPress}
          >
            <Bell size={22} color="#FFFFFF" />
            {hasNotifications && (
              <Animated.View 
                className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" 
                style={{ opacity: notificationOpacity }}
              />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-800"
          onPress={onProfilePress}
        >
          <User size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

});  // Close memo

export default Header;
