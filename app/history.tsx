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
import { Clock, Trash2 } from "lucide-react-native";

interface WatchHistoryItem {
  id: string;
  anime_id: string;
  episode_id: string;
  watched_at: string;
  progress: number;
  anime: {
    id: string;
    title: string;
    image_url: string;
  };
  episodes: {
    id: string;
    title: string;
    episode_number: number;
  };
}

const HistoryScreen = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("watch_history")
        .select(
          `
          id,
          anime_id,
          episode_id,
          watched_at,
          progress,
          anime:anime_id (id, title, image_url),
          episodes:episode_id (id, title, episode_number)
        `,
        )
        .eq("user_id", user?.id)
        .order("watched_at", { ascending: false });

      if (error) throw error;
      setHistory(data as WatchHistoryItem[]);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      Alert.alert("Error", "Failed to load watch history");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your watch history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("watch_history")
                .delete()
                .eq("user_id", user?.id);

              if (error) throw error;
              setHistory([]);
              Alert.alert("Success", "Watch history cleared successfully");
            } catch (error) {
              console.error("Error clearing watch history:", error);
              Alert.alert("Error", "Failed to clear watch history");
            }
          },
        },
      ],
    );
  };

  const handleItemPress = (item: WatchHistoryItem) => {
    router.push({
      pathname: `/anime/${item.anime_id}`,
      params: { animeId: item.anime_id },
    });
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("watch_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setHistory(history.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting history item:", error);
      Alert.alert("Error", "Failed to delete history item");
    }
  };

  const renderHistoryItem = ({ item }: { item: WatchHistoryItem }) => {
    const date = new Date(item.watched_at);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleItemPress(item)}
      >
        <Image
          source={{ uri: item.anime.image_url }}
          style={styles.animeImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.animeTitle}>{item.anime.title}</Text>
          <Text style={styles.episodeTitle}>
            Episode {item.episodes.episode_number}: {item.episodes.title}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.timeText}>
              {formattedDate} at {formattedTime}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Clock size={64} color="#6B7280" />
      <Text style={styles.emptyTitle}>No Watch History</Text>
      <Text style={styles.emptyText}>
        Your watch history will appear here once you start watching anime.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watch History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {!user && !authLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view your watch history.
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
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={loading ? null : renderEmptyState()}
        />
      )}

      <BottomNavigation
        currentRoute="/history"
        activeTab="history"
        onTabChange={(tab) => {
          switch (tab) {
            case "home":
              router.push("/");
              break;
            case "lists":
              router.push("/lists");
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
  clearText: {
    fontSize: 14,
    color: "#EF4444",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  historyItem: {
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
    marginBottom: 4,
  },
  episodeTitle: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  deleteButton: {
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

export default HistoryScreen;
