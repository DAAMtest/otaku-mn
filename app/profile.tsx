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
import { useTheme } from "@/context/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const { colors, isDarkMode } = useTheme();

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
    router.push("/edit-profile");
  };

  // Handle settings
  const handleSettings = () => {
    router.push("/settings");
  };

  // Handle list navigation
  const handleListNavigation = (listType: string) => {
    switch (listType) {
      case "Currently Watching":
        router.push("/library?tab=watching");
        break;
      case "Completed":
        router.push("/library?tab=completed");
        break;
      case "Watchlist":
        router.push("/library?tab=watchlist");
        break;
      case "Favorites":
        router.push("/favorites");
        break;
      case "Watch History":
        router.push("/library?tab=history");
        break;
      default:
        Alert.alert(listType, `${listType} functionality coming soon`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            width: "100%",
            height: 60,
            backgroundColor: colors.background,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
          >
            Profile
          </Text>
          <TouchableOpacity onPress={handleSettings}>
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {/* Profile Header */}
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
              />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {user.username}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Member since {user.joinDate}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    marginTop: 8,
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={handleEditProfile}
                >
                  <Edit size={14} color="#FFFFFF" />
                  <Text
                    style={{ color: "#FFFFFF", fontSize: 12, marginLeft: 4 }}
                  >
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
              {user.bio}
            </Text>

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {user.watchedCount}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Watched
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {user.favoriteCount}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Favorites
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {user.watchlistCount}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Watchlist
                </Text>
              </View>
            </View>
          </View>

          {/* Lists Section */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              My Lists
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={() => handleListNavigation("Currently Watching")}
            >
              <Eye size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Currently Watching
              </Text>
              <Text style={{ color: colors.textSecondary }}>5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={() => handleListNavigation("Completed")}
            >
              <Award size={20} color={colors.success} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Completed
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {user.watchedCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={() => handleListNavigation("Watchlist")}
            >
              <BookmarkIcon size={20} color={colors.warning} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Watchlist
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {user.watchlistCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
                marginBottom: 12,
              }}
              onPress={() => handleListNavigation("Favorites")}
            >
              <Heart size={20} color={colors.error} fill={colors.error} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Favorites
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {user.favoriteCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 8,
              }}
              onPress={() => handleListNavigation("Watch History")}
            >
              <Clock size={20} color={colors.info} />
              <Text style={{ color: colors.text, marginLeft: 12, flex: 1 }}>
                Watch History
              </Text>
              <Text style={{ color: colors.textSecondary }}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={{ padding: 16, marginTop: 16 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 12,
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                borderRadius: 8,
              }}
              onPress={handleLogout}
            >
              <LogOut size={20} color={colors.error} />
              <Text
                style={{
                  color: colors.error,
                  marginLeft: 8,
                  fontWeight: "500",
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding to ensure content is visible above the navigation bar */}
          <View style={{ height: 80 }} />
        </ScrollView>

        <BottomNavigation
          currentRoute="/profile"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
    </SafeAreaView>
  );
}
