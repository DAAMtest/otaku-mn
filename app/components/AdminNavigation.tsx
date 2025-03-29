import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
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
 * Uses Deku-inspired colors from My Hero Academia.
 */
const AdminNavigation = ({ variant = "sidebar" }: AdminNavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  // Deku-inspired colors
  const activeColor = colors.primary; // Deku's green
  const activeBgColor = "bg-green-900/30";
  const inactiveColor = "#9CA3AF";

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
              <IconComponent
                size={20}
                color={active ? activeColor : inactiveColor}
              />
              <Text
                className={`text-xs mt-1 ${active ? "text-green-400" : "text-gray-400"}`}
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
          <Shield size={24} color={activeColor} />
          <Typography
            variant="h3"
            color="#FFFFFF"
            weight="700"
            style={{ marginLeft: 8 }}
          >
            Admin Panel
          </Typography>
        </View>
      </View>

      <View className="flex-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center py-3 px-4 rounded-lg mb-1 ${active ? activeBgColor : ""}`}
              onPress={() => router.push(item.path)}
            >
              <IconComponent
                size={20}
                color={active ? activeColor : inactiveColor}
              />
              <Typography
                variant="body"
                color={active ? colors.primary : "#E5E7EB"}
                weight={active ? "600" : "400"}
                style={{ marginLeft: 12 }}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="border-t border-gray-700 pt-4 mt-4">
        <TouchableOpacity
          className="flex-row items-center py-3 px-4 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Home size={20} color={inactiveColor} />
          <Typography variant="body" color="#E5E7EB" style={{ marginLeft: 12 }}>
            Back to App
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AdminNavigation;
