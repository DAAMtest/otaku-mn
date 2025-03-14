import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Home, Search, BookmarkIcon, User } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const BottomNavigation = React.memo(({
  activeTab = "home",
  onTabChange = () => {},
}: BottomNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      route: "/",
    },
    {
      key: "search",
      label: "Search",
      icon: Search,
      route: "/search",
    },
    {
      key: "lists",
      label: "My Lists",
      icon: BookmarkIcon,
      route: "/lists",
    },
    {
      key: "profile",
      label: "Profile",
      icon: User,
      route: "/profile",
    },
  ];

  const handleTabPress = (tab: string, route: string) => {
    // Don't navigate if we're already on this tab/route
    if (tab === activeTab || (tab === "home" && pathname === "/")) {
      return;
    }
    
    onTabChange(tab);
    router.push(route);
    
    // Provide haptic feedback if available
    try {
      const Haptics = require('expo-haptics');
      Haptics.selectionAsync();
    } catch (error) {
      // Haptics not available, continue silently
    }
  };

  return (
    <View className="w-full h-[70px] bg-gray-900 border-t border-gray-800 flex-row justify-around items-center px-2 absolute bottom-0">
      {tabs.map((tab) => {
        const isActive =
          tab.key === activeTab || (tab.key === "home" && pathname === "/");
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 items-center justify-center py-1 ${isActive ? "border-t-2 border-purple-500" : ""}`}
            onPress={() => handleTabPress(tab.key, tab.route)}
            accessibilityLabel={tab.label}
            accessibilityRole="button"
          >
            <IconComponent
              size={24}
              color={isActive ? "#A855F7" : "#9CA3AF"}
              strokeWidth={2}
            />
            <Text
              className={`text-xs mt-1 ${isActive ? "text-purple-500" : "text-gray-400"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

});  // Close memo

export default BottomNavigation;
