import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import AuthModal from "@/auth/components/AuthModal";
import { List, Trash2, Star, BookOpen } from "lucide-react-native";
import { getUserLists } from "@/lib/supabase";

interface AnimeListItem {
  id: string;
  animeId: string;
  listType: string;
  addedAt: string;
  updatedAt: string;
  anime: {
    id: string;
    title: string;
    imageUrl: string;
    rating: number;
    genres: string[];
  } | null;
}

const ListsScreen = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [lists, setLists] = useState<AnimeListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"watchlist" | "favorites">(
    "watchlist",
  );
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserLists(activeTab);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, activeTab]);

  const fetchUserLists = async (listType: "watchlist" | "favorites") => {
    try {
      setLoading(true);
      const data = await getUserLists(listType);
      setLists(data);
    } catch (error) {
      console.error(`Error fetching ${listType}:`, error);
      Alert.alert("Error", `Failed to load your ${listType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromList = async (item: AnimeListItem) => {
    Alert.alert(
      "Remove Anime",
      `Are you sure you want to remove "${item.anime?.title}" from your ${activeTab}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("user_anime_lists")
                .delete()
                .eq("id", item.id);

              if (error) throw error;
              setLists(lists.filter((listItem) => listItem.id !== item.id));
              Alert.alert("Success", "Anime removed from your list");
            } catch (error) {
              console.error("Error removing from list:", error);
              Alert.alert("Error", "Failed to remove anime from list");
            }
          },
        },
      ],
    );
  };

  const handleItemPress = (item: AnimeListItem) => {
    if (item.anime) {
      router.push({
        pathname: `/anime/${item.anime.id}`,
        params: { animeId: item.anime.id },
      });
    }
  };

  const renderListItem = ({ item }: { item: AnimeListItem }) => {
    if (!item.anime) return null;

    const date = new Date(item.addedAt);
    const formattedDate = date.toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleItemPress(item)}
      >
        <Image
          source={{ uri: item.anime.imageUrl }}
          style={styles.animeImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.animeTitle}>{item.anime.title}</Text>
          <View style={styles.genreContainer}>
            {item.anime.genres.slice(0, 3).map((genre, index) => (
              <View key={index} style={styles.genrePill}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.anime.rating.toFixed(1)}
            </Text>
            <Text style={styles.dateText}>Added on {formattedDate}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromList(item)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {activeTab === "watchlist" ? (
        <BookOpen size={64} color="#6B7280" />
      ) : (
        <Star size={64} color="#6B7280" />
      )}
      <Text style={styles.emptyTitle}>
        No Anime in Your {activeTab === "watchlist" ? "Watchlist" : "Favorites"}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === "watchlist"
          ? "Add anime to your watchlist to keep track of what you want to watch."
          : "Add your favorite anime here to easily find them later."}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.browseText}>Browse Anime</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lists</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "watchlist" && styles.activeTab]}
          onPress={() => setActiveTab("watchlist")}
        >
          <BookOpen
            size={18}
            color={activeTab === "watchlist" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "watchlist" && styles.activeTabText,
            ]}
          >
            Watchlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
          onPress={() => setActiveTab("favorites")}
        >
          <Star
            size={18}
            color={activeTab === "favorites" ? "#4F46E5" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "favorites" && styles.activeTabText,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {!user && !authLoading ? (
        <View style={styles.emptyContainer}>
          <List size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your anime lists.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={loading ? null : renderEmptyState()}
        />
      )}

      <BottomNavigation
        currentRoute="/lists"
        activeTab="lists"
        onTabChange={(tab) => {
          switch (tab) {
            case "home":
              router.push("/");
              break;
            case "history":
              router.push("/history");
              break;
            case "downloads":
              router.push("/downloads");
              break;
            case "profile":
              router.push("/profile");
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#171717",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#1F1F1F",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  animeImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  genrePill: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  genreText: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#F59E0B",
    marginLeft: 4,
    marginRight: 12,
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  removeButton: {
    justifyContent: "center",
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ListsScreen;
