import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Settings,
  Film,
  Users,
  Tag,
  Bell,
  BarChart3,
  Shield,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  // Check if user has admin privileges
  // In a real app, this would check a role field in the user object
  const isAdmin = true; // For demo purposes, always true

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Navigate to specific admin section
  const navigateToSection = (section: string) => {
    if (section === "anime") {
      router.push("/admin/anime");
    } else if (section === "users") {
      router.push("/admin/users");
    } else if (section === "genres") {
      router.push("/admin/genres");
    } else if (section === "notifications") {
      router.push("/admin/notifications");
    } else if (section === "settings") {
      router.push("/admin/settings");
    } else {
      setActiveSection(section);
    }
  };

  // Admin sections
  const adminSections = [
    {
      id: "anime",
      title: "Anime Management",
      icon: Film,
      description: "Add, edit, or remove anime from the database",
      color: "#60A5FA",
    },
    {
      id: "users",
      title: "User Management",
      icon: Users,
      description: "Manage user accounts and permissions",
      color: "#34D399",
    },
    {
      id: "genres",
      title: "Genre Management",
      icon: Tag,
      description: "Create and manage anime genres",
      color: "#F59E0B",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      description: "Send notifications to users",
      color: "#A78BFA",
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      description: "View app usage statistics",
      color: "#EC4899",
    },
    {
      id: "settings",
      title: "Admin Settings",
      icon: Settings,
      description: "Configure app settings and preferences",
      color: "#9CA3AF",
    },
  ];

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <StatusBar barStyle="light-content" backgroundColor="#111827" />
        <View className="flex-1 items-center justify-center p-4">
          <Shield size={64} color="#EF4444" />
          <Text className="text-white text-xl font-bold mt-4 mb-2">
            Access Denied
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            You don't have permission to access the admin dashboard.
          </Text>
          <TouchableOpacity
            className="bg-gray-800 rounded-lg px-4 py-2"
            onPress={() => router.push("/")}
          >
            <Text className="text-white">Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Admin Dashboard</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>

        {/* Admin Dashboard Content */}
        <ScrollView className="flex-1 p-4">
          <View className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <Text className="text-white text-xl font-bold mb-2">
              Welcome, Admin
            </Text>
            <Text className="text-gray-300">
              Manage your anime application from this dashboard.
            </Text>
          </View>

          {/* Admin Sections */}
          <View className="flex-row flex-wrap justify-between">
            {adminSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <TouchableOpacity
                  key={section.id}
                  className="w-[48%] bg-gray-800 rounded-xl p-4 mb-4"
                  onPress={() => navigateToSection(section.id)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <IconComponent
                      size={24}
                      color={section.color}
                      strokeWidth={2}
                    />
                  </View>
                  <Text className="text-white font-bold text-base mb-1">
                    {section.title}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {section.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Stats */}
          <View className="bg-gray-800/50 rounded-xl p-4 mt-2">
            <Text className="text-white font-bold text-lg mb-3">
              Quick Stats
            </Text>
            <View className="flex-row justify-between mb-2">
              <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
                <Text className="text-blue-400 font-bold text-lg">42</Text>
                <Text className="text-gray-400 text-xs">Anime Titles</Text>
              </View>
              <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
                <Text className="text-green-400 font-bold text-lg">128</Text>
                <Text className="text-gray-400 text-xs">Users</Text>
              </View>
              <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
                <Text className="text-purple-400 font-bold text-lg">8</Text>
                <Text className="text-gray-400 text-xs">Genres</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
