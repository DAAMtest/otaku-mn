import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
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
  Eye,
  Download,
  Heart,
  TrendingUp,
  Flag,
  Search,
} from "lucide-react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useAdminStore } from "@/src/store/adminStore";
import { useAnimeStore } from "@/src/store/animeStore";
import { useGenreStore } from "@/src/store/genreStore";
import AdminNavigation from "@/components/AdminNavigation";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, session } = useAuthStore();
  const { stats, recentActivity, loading, fetchStats, fetchRecentActivity } =
    useAdminStore();
  const { genres, fetchGenres } = useGenreStore();
  const { trendingAnime, fetchTrendingAnime } = useAnimeStore();
  const { width } = Dimensions.get(Platform.OS === "web" ? "screen" : "window");
  const isTablet = width > 768;
  const isLoading = loading.stats || loading.activity;

  // Check authentication and fetch dashboard data
  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }

    // Fetch all required data for the dashboard
    const loadDashboardData = async () => {
      await Promise.all([
        fetchStats(),
        fetchRecentActivity(),
        fetchGenres(),
        fetchTrendingAnime(),
      ]);
    };

    loadDashboardData();
  }, [session, router]);

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
    } else if (section === "moderation") {
      router.push("/admin/moderation");
    } else if (section === "analytics") {
      router.push("/admin/analytics");
    } else if (section === "settings") {
      router.push("/admin/settings");
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
      id: "moderation",
      title: "Content Moderation",
      icon: Shield,
      description: "Review and moderate reported content",
      color: "#F87171",
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

  // Map activity types to icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_joined":
        return Users;
      case "content_reported":
        return Flag;
      case "anime_added":
        return Film;
      case "high_traffic":
        return TrendingUp;
      default:
        return Bell;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900">
        <StatusBar style="light" backgroundColor="#111827" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-400 mt-4">Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" backgroundColor="#111827" />
      <View className="flex-1 flex-row">
        {/* Sidebar for tablet/desktop */}
        {isTablet && <AdminNavigation variant="sidebar" />}

        <View className="flex-1">
          {/* Header */}
          <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
            <TouchableOpacity onPress={handleBackPress}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg">
              Admin Dashboard
            </Text>
            <TouchableOpacity>
              <Shield size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Admin Dashboard Content */}
          <ScrollView className="flex-1 p-4">
            <View className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-4 mb-6">
              <Text className="text-white text-xl font-bold mb-2">
                Welcome, {user?.email ? user.email.split("@")[0] : "Admin"}
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
            <Text className="text-white font-bold text-lg mb-3">
              Quick Stats
            </Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              <View className="bg-gray-800 rounded-lg p-3 w-[48%] mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-blue-400 font-bold text-lg">
                    {stats.animeCount}
                  </Text>
                  <Film size={20} color="#60A5FA" />
                </View>
                <Text className="text-gray-400 text-xs">Anime Titles</Text>
              </View>
              <View className="bg-gray-800 rounded-lg p-3 w-[48%] mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-green-400 font-bold text-lg">
                    {stats.userCount}
                  </Text>
                  <Users size={20} color="#34D399" />
                </View>
                <Text className="text-gray-400 text-xs">Users</Text>
              </View>
              <View className="bg-gray-800 rounded-lg p-3 w-[48%] mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-purple-400 font-bold text-lg">
                    {stats.genreCount}
                  </Text>
                  <Tag size={20} color="#A78BFA" />
                </View>
                <Text className="text-gray-400 text-xs">Genres</Text>
              </View>
              <View className="bg-gray-800 rounded-lg p-3 w-[48%] mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-amber-400 font-bold text-lg">
                    {stats.viewsToday.toLocaleString()}
                  </Text>
                  <Eye size={20} color="#F59E0B" />
                </View>
                <Text className="text-gray-400 text-xs">Views Today</Text>
              </View>
            </View>

            {/* Recent Activity */}
            <Text className="text-white font-bold text-lg mb-3">
              Recent Activity
            </Text>
            <View className="bg-gray-800 rounded-lg p-4 mb-6">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <View
                    key={activity.id}
                    className="flex-row items-center py-3 border-b border-gray-700 last:border-b-0"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${activity.color}20` }}
                    >
                      <IconComponent size={18} color={activity.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white">{activity.message}</Text>
                      <Text className="text-gray-400 text-xs">
                        {activity.timestamp}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Quick Actions */}
            <Text className="text-white font-bold text-lg mb-3">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between mb-6">
              <TouchableOpacity
                className="w-[48%] bg-indigo-600/30 rounded-lg p-4 mb-3 items-center"
                onPress={() => router.push("/admin/anime")}
              >
                <Film size={24} color="#818CF8" />
                <Text className="text-white mt-2">Add Anime</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-[48%] bg-green-600/30 rounded-lg p-4 mb-3 items-center"
                onPress={() => router.push("/admin/users")}
              >
                <Users size={24} color="#6EE7B7" />
                <Text className="text-white mt-2">Manage Users</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-[48%] bg-purple-600/30 rounded-lg p-4 mb-3 items-center"
                onPress={() => router.push("/admin/notifications")}
              >
                <Bell size={24} color="#C4B5FD" />
                <Text className="text-white mt-2">Send Notification</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-[48%] bg-red-600/30 rounded-lg p-4 mb-3 items-center"
                onPress={() => router.push("/admin/moderation")}
              >
                <Shield size={24} color="#FCA5A5" />
                <Text className="text-white mt-2">Moderate Content</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Navigation for mobile */}
          {!isTablet && <AdminNavigation variant="bottom" />}
        </View>
      </View>
    </SafeAreaView>
  );
}
