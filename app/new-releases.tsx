import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AnimeGrid from "./components/AnimeGrid";
import BottomNavigation from "./components/BottomNavigation";
import FilterBar from "./components/FilterBar";
import useAnimeData from "./hooks/useAnimeData";
import { useAuth } from "./context/AuthContext";
import useAnimeLists from "./hooks/useAnimeLists";
import AuthModal from "./auth/components/AuthModal";
import { Anime } from "./hooks/useAnimeSearch";
import { ListType } from "./hooks/useAnimeLists";
import type { Database } from "@/lib/database.types";

// Define the Anime type to match AnimeGrid's expected type
type Tables = Database["public"]["Tables"];
type AnimeGridItem = Tables["anime"]["Row"] & {
  isFavorite?: boolean;
  genres?: string[];
  type?: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#171717",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

const NewReleasesScreen = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { newReleases, loading, error, fetchNewReleases } = useAnimeData();
  const { addToList, moveToList } = useAnimeLists(user?.id || null);

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnime = async () => {
    try {
      const data = await fetchNewReleases();

      if (Array.isArray(data) && data.length > 0) {
        const formattedAnime = data.map((item: Anime) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          rating: item.rating || 0,
          description: item.description,
          releaseDate: item.releaseDate,
          genres: item.genres || [],
          isFavorite: item.isFavorite,
        }));
        setAnimeList(formattedAnime);
      } else if (!Array.isArray(data)) {
        console.error("Error: fetchNewReleases returned a non-array value");
      } else if (data.length === 0) {
        console.log("No new releases found");
      }
    } catch (error) {
      console.error("Error loading anime:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddToList = async (anime: Anime) => {
    if (!user) return;

    try {
      await addToList(anime.id, "watchlist");

      Alert.alert("Success", `"${anime.title}" added to watchlist`);
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Error", "Failed to add anime to watchlist");
    }
  };

  const handleFavorite = async (anime: Anime) => {
    if (!user) return;

    try {
      const currentList = anime.isFavorite ? "favorites" : "watchlist";
      const targetList = anime.isFavorite ? "watchlist" : "favorites";
      
      await moveToList(anime.id, currentList, targetList);

      Alert.alert("Success", `"${anime.title}" added to favorites`);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add anime to favorites");
    }
  };

  useEffect(() => {
    loadAnime();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          New Releases
        </Text>
        <View style={{ width: 40 }} /> {/* Empty view for balance */}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {loading.newReleases ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <AnimeGrid
            anime={animeList}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={loadAnime}
            onPress={(anime) => {
              router.push({
                pathname: `/anime/${anime.id}`,
                params: { animeId: anime.id },
              });
            }}
            onAddToList={handleAddToList}
            onFavorite={handleFavorite}
            numColumns={2}
          />
        )}
      </View>

      {/* Bottom navigation */}
      <BottomNavigation
        currentRoute="/new-releases"
        activeTab="home"
        onTabChange={() => {}}
      />

      {/* Auth modal */}
      {isLoading && (
        <AuthModal
          visible={isLoading}
          onClose={() => {}}
        />
      )}
    </SafeAreaView>
  );
};

export default NewReleasesScreen;
