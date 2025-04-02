import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import AuthModal from "@/auth/components/AuthModal";
import {
  User,
  Settings,
  LogOut,
  Edit,
  BookOpen,
  Star,
  Clock,
  Download,
  ChevronRight,
} from "lucide-react-native";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  bio?: string;
}

interface ProfileStats {
  watchlist: number;
  favorites: number;
  history: number;
  downloads: number;
}

const ProfileScreen = () => {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    watchlist: 0,
    favorites: 0,
    history: 0,
    downloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Create a default profile if none exists
      if (user) {
        const defaultProfile = {
          id: user.id,
          username: user.email?.split("@")[0] || "User",
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          created_at: new Date().toISOString(),
        };
        setProfile(defaultProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch watchlist count
      const { data: watchlistData, error: watchlistError } = await supabase
        .from("user_anime_lists")
        .select("id", { count: "exact" })
        .eq("user_id", user?.id)
        .eq("list_type", "watchlist");

      // Fetch favorites count
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("user_anime_lists")
        .select("id", { count: "exact" })
        .eq("user_id", user?.id)
        .eq("list_type", "favorites");

      // Fetch history count
      const { data: historyData, error: historyError } = await supabase
        .from("watch_history")
        .select("id", { count: "exact" })
        .eq("user_id", user?.id);

      // Fetch downloads count (mock data for now)
      const downloadsCount = 2; // Mock value

      setStats({
        watchlist: watchlistData?.length || 0,
        favorites: favoritesData?.length || 0,
        history: historyData?.length || 0,
        downloads: downloadsCount,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            Alert.alert("Success", "You have been logged out");
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to log out");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const renderProfileContent = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri:
              profile?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=default`,
          }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{profile?.username || "User"}</Text>
        <Text style={styles.joinDate}>
          Joined{" "}
          {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Edit size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <BookOpen size={24} color="#4F46E5" />
          <Text style={styles.statValue}>{stats.watchlist}</Text>
          <Text style={styles.statLabel}>Watchlist</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.favorites}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats.history}</Text>
          <Text style={styles.statLabel}>History</Text>
        </View>
        <View style={styles.statItem}>
          <Download size={24} color="#6366F1" />
          <Text style={styles.statValue}>{stats.downloads}</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/lists")}
        >
          <View style={styles.menuItemLeft}>
            <BookOpen size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>My Lists</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/history")}
        >
          <View style={styles.menuItemLeft}>
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Watch History</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/downloads")}
        >
          <View style={styles.menuItemLeft}>
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Downloads</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings")}
        >
          <View style={styles.menuItemLeft}>
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAuthPrompt = () => (
    <View style={styles.authPromptContainer}>
      <User size={64} color="#6B7280" />
      <Text style={styles.authPromptTitle}>Sign In Required</Text>
      <Text style={styles.authPromptText}>
        Please sign in to view your profile and access your anime lists.
      </Text>
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => setShowAuthModal(true)}
      >
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {user ? renderProfileContent() : renderAuthPrompt()}

      <BottomNavigation
        currentRoute="/profile"
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          switch (tab) {
            case "home":
              router.push("/");
              break;
            case "history":
              router.push("/history");
              break;
            case "lists":
              router.push("/lists");
              break;
            case "downloads":
              router.push("/downloads");
              break;
          }
        }}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#171717",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2A2A2A",
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 16,
    fontWeight: "500",
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
