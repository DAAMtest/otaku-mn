import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  Film,
  Users,
  Tag,
  Bell,
  Settings,
  BarChart3,
  Shield,
  FileText,
} from "lucide-react-native";

interface AdminNavigationProps {
  variant?: "sidebar" | "bottom";
}

/**
 * AdminNavigation component provides consistent navigation across admin pages
 * with visual indication of the current active page.
 */
const AdminNavigation = ({ variant = "sidebar" }: AdminNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
    { id: "anime", label: "Anime", icon: Film, path: "/admin/anime" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "genres", label: "Genres", icon: Tag, path: "/admin/genres" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      id: "content",
      label: "Moderation",
      icon: Shield,
      path: "/admin/moderation",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname.startsWith(path)) return true;
    return false;
  };

  if (variant === "bottom") {
    return (
      <View className="flex-row justify-around bg-gray-800 border-t border-gray-700 py-2">
        {navItems.slice(0, 5).map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.id}
              className="items-center px-2"
              onPress={() => router.push(item.path)}
            >
              <IconComponent size={20} color={active ? "#8B5CF6" : "#9CA3AF"} />
              <Text
                className={`text-xs mt-1 ${active ? "text-purple-400" : "text-gray-400"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View className="w-64 bg-gray-800 h-full p-4">
      <View className="mb-6 px-4">
        <View className="flex-row items-center">
          <Shield size={24} color="#8B5CF6" />
          <Text className="text-white font-bold text-lg ml-2">Admin Panel</Text>
        </View>
      </View>

      <View className="flex-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center py-3 px-4 rounded-lg mb-1 ${active ? "bg-purple-900/30" : ""}`}
              onPress={() => router.push(item.path)}
            >
              <IconComponent size={20} color={active ? "#8B5CF6" : "#9CA3AF"} />
              <Text
                className={`ml-3 ${active ? "text-purple-400 font-medium" : "text-gray-300"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="border-t border-gray-700 pt-4 mt-4">
        <TouchableOpacity
          className="flex-row items-center py-3 px-4 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Home size={20} color="#9CA3AF" />
          <Text className="ml-3 text-gray-300">Back to App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AdminNavigation;
