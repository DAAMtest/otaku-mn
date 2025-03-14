import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Settings,
  Edit,
  Clock,
  Heart,
  BookmarkIcon,
  Eye,
  Award,
  LogOut,
} from "lucide-react-native";
import BottomNavigation from "./components/BottomNavigation";

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock user data
  const user = {
    username: "AnimeUser",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeUser",
    joinDate: "March 2024",
    watchedCount: 42,
    favoriteCount: 15,
    watchlistCount: 23,
    bio: "Anime enthusiast from Mongolia. I love shonen and slice of life anime!",
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => {
          // In a real app, this would clear auth state
          Alert.alert("Logged Out", "You have been logged out successfully");
          router.replace("/");
        },
        style: "destructive",
      },
    ]);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Edit profile functionality coming soon");
  };

  // Handle settings
  const handleSettings = () => {
    Alert.alert("Settings", "Settings functionality coming soon");
  };

  // Handle list navigation
  const handleListNavigation = (listType: string) => {
    Alert.alert(listType, `${listType} functionality coming soon`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Profile</Text>
          <TouchableOpacity onPress={handleSettings}>
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Header */}
          <View className="p-4 border-b border-gray-800">
            <View className="flex-row items-center">
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-20 h-20 rounded-full"
                resizeMode="cover"
              />
              <View className="ml-4 flex-1">
                <Text className="text-white text-xl font-bold">
                  {user.username}
                </Text>
                <Text className="text-gray-400 text-sm">
                  Member since {user.joinDate}
                </Text>
                <TouchableOpacity
                  className="bg-blue-600 rounded-full px-4 py-1 mt-2 self-start flex-row items-center"
                  onPress={handleEditProfile}
                >
                  <Edit size={14} color="#FFFFFF" />
                  <Text className="text-white text-xs ml-1">Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="text-gray-300 mt-4">{user.bio}</Text>

            {/* Stats */}
            <View className="flex-row justify-between mt-6">
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {user.watchedCount}
                </Text>
                <Text className="text-gray-400 text-xs">Watched</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {user.favoriteCount}
                </Text>
                <Text className="text-gray-400 text-xs">Favorites</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-lg font-bold">
                  {user.watchlistCount}
                </Text>
                <Text className="text-gray-400 text-xs">Watchlist</Text>
              </View>
            </View>
          </View>

          {/* Lists Section */}
          <View className="p-4">
            <Text className="text-white text-lg font-bold mb-4">My Lists</Text>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-gray-800 rounded-lg mb-3"
              onPress={() => handleListNavigation("Currently Watching")}
            >
              <Eye size={20} color="#6366F1" />
              <Text className="text-white ml-3 flex-1">Currently Watching</Text>
              <Text className="text-gray-400">5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-gray-800 rounded-lg mb-3"
              onPress={() => handleListNavigation("Completed")}
            >
              <Award size={20} color="#10B981" />
              <Text className="text-white ml-3 flex-1">Completed</Text>
              <Text className="text-gray-400">{user.watchedCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-gray-800 rounded-lg mb-3"
              onPress={() => handleListNavigation("Watchlist")}
            >
              <BookmarkIcon size={20} color="#F59E0B" />
              <Text className="text-white ml-3 flex-1">Watchlist</Text>
              <Text className="text-gray-400">{user.watchlistCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-gray-800 rounded-lg mb-3"
              onPress={() => handleListNavigation("Favorites")}
            >
              <Heart size={20} color="#EF4444" fill="#EF4444" />
              <Text className="text-white ml-3 flex-1">Favorites</Text>
              <Text className="text-gray-400">{user.favoriteCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-gray-800 rounded-lg"
              onPress={() => handleListNavigation("Watch History")}
            >
              <Clock size={20} color="#8B5CF6" />
              <Text className="text-white ml-3 flex-1">Watch History</Text>
              <Text className="text-gray-400">View</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View className="p-4 mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-center p-3 bg-red-900/30 rounded-lg"
              onPress={handleLogout}
            >
              <LogOut size={20} color="#EF4444" />
              <Text className="text-red-400 ml-2 font-medium">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding to ensure content is visible above the navigation bar */}
          <View className="h-20" />
        </ScrollView>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
