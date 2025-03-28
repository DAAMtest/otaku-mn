import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
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
  Mail,
  User,
  Facebook,
  Github,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthModal from "@/auth/components/AuthModal";

// Define interfaces for type safety
interface UserListItem {
  list_type: string;
}

interface UserProfileData {
  username: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, signOut } = useSupabaseAuth();
  
  const [listsLoading, setListsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: "",
    avatarUrl: "",
    joinDate: "",
    bio: "",
  });
  
  const [stats, setStats] = useState({
    watchedCount: 0,
    favoriteCount: 0,
    watchlistCount: 0,
    watchingCount: 0,
  });
  
  // Auth modal state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || user.email?.split('@')[0] || "User",
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`,
        joinDate: user.joinDate || "Recent member",
        bio: user.bio || "No bio provided yet.",
      });
      
      // Fetch user anime lists
      if (user.id) {
        fetchUserLists(user.id);
      }
    }
  }, [user]);
  
  // Fetch user anime lists
  const fetchUserLists = async (userId: string) => {
    try {
      setListsLoading(true);
      
      const { data, error } = await supabase
        .from("user_anime_lists")
        .select("list_type")
        .eq("user_id", userId);
        
      if (error) throw error;
      
      // Count items in each list
      const counts = {
        watchedCount: data.filter((item: UserListItem) => item.list_type === "completed").length,
        favoriteCount: data.filter((item: UserListItem) => item.list_type === "favorites").length,
        watchlistCount: data.filter((item: UserListItem) => item.list_type === "watchlist").length,
        watchingCount: data.filter((item: UserListItem) => item.list_type === "watching").length,
      };
      
      setStats(counts);
    } catch (error) {
      console.error("Error fetching user lists:", error);
      // Set default values on error to avoid showing zeros
      setStats({
        watchedCount: 0,
        favoriteCount: 0,
        watchlistCount: 0,
        watchingCount: 0,
      });
    } finally {
      setListsLoading(false);
    }
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
        onPress: async () => {
          try {
            const { error } = await signOut();
            if (error) throw error;
            
            Alert.alert("Logged Out", "You have been logged out successfully");
            router.replace("/(tabs)");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out");
          }
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
  
  // Handle auth modal
  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalVisible(true);
  };
  
  const handleCloseAuthModal = () => {
    setAuthModalVisible(false);
  };
  
  const handleLoginSuccess = async () => {
    // Refresh the page after successful login
    console.log("Login successful");
  };

  // Show a minimal loading state that doesn't block the whole screen
  const renderLoadingOverlay = () => {
    if (listsLoading) {
      return (
        <View 
          style={{
            position: 'absolute',
            top: 60, // Below the header
            left: 0,
            right: 0,
            height: 30,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={{ color: colors.text, marginLeft: 8, fontSize: 12 }}>Loading data...</Text>
        </View>
      );
    }
    return null;
  };

  // Render the sign-in options screen when user is not authenticated
  const renderAuthOptions = () => {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />
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
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={{ flex: 1 }}>
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Image
              source={require('../assets/images/icon.png')}
              style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }}
              resizeMode="contain"
            />
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
              Welcome to AnimetempO
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 32 }}>
              Sign in to track your anime, create watchlists, and more!
            </Text>
            
            {/* Sign In and Sign Up Buttons */}
            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 16, justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  flex: 1,
                  alignItems: 'center',
                  marginRight: 8,
                }}
                onPress={() => handleOpenAuthModal('login')}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>
                  Sign In
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.primary,
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  flex: 1,
                  alignItems: 'center',
                  marginLeft: 8,
                }}
                onPress={() => handleOpenAuthModal('register')}
              >
                <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 16 }}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: colors.textSecondary, marginVertical: 16 }}>
              Or continue with
            </Text>
            
            {/* Social Sign In Options */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 8,
                }}
                onPress={() => Alert.alert("Coming Soon", "Google sign-in will be available soon!")}
              >
                {/* Google icon */}
                <View style={{ 
                  width: 24, 
                  height: 24, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <View style={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: 10, 
                    backgroundColor: '#FFFFFF',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{ 
                      color: '#4285F4', 
                      fontWeight: 'bold', 
                      fontSize: 16,
                      lineHeight: 20
                    }}>G</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.card,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 8,
                }}
                onPress={() => Alert.alert("Coming Soon", "Facebook sign-in will be available soon!")}
              >
                <Facebook size={24} color="#1877F2" />
              </TouchableOpacity>
            </View>
            
            {/* Features Preview */}
            <View style={{ width: '100%', marginTop: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                Why Sign In?
              </Text>
              
              <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: 'rgba(99, 102, 241, 0.2)', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <BookmarkIcon size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>
                    Create Watchlists
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Keep track of anime you want to watch later
                  </Text>
                </View>
              </View>
              
              <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Heart size={20} color={colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>
                    Save Favorites
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Mark your favorite anime and access them easily
                  </Text>
                </View>
              </View>
              
              <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Clock size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 4 }}>
                    Track Progress
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Keep track of episodes you've watched
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Bottom padding */}
          <View style={{ height: 80 }} />
        </ScrollView>
        
        {/* Auth Modal */}
        <AuthModal 
          visible={authModalVisible} 
          onClose={handleCloseAuthModal}
          onLogin={handleLoginSuccess}
          initialMode={authModalMode}
        />
      </SafeAreaView>
    );
  };

  if (!user) {
    return renderAuthOptions();
  }

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

        {renderLoadingOverlay()}

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
                source={{ uri: profileData.avatarUrl }}
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
                  {profileData.username}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Member since {profileData.joinDate}
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
              {profileData.bio}
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
                  {listsLoading ? "-" : stats.watchedCount}
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
                  {listsLoading ? "-" : stats.favoriteCount}
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
                  {listsLoading ? "-" : stats.watchlistCount}
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
              <Text style={{ color: colors.textSecondary }}>{listsLoading ? "-" : stats.watchingCount}</Text>
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
                {listsLoading ? "-" : stats.watchedCount}
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
                {listsLoading ? "-" : stats.watchlistCount}
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
                {listsLoading ? "-" : stats.favoriteCount}
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
      </View>
    </SafeAreaView>
  );
}
