import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AnimeGrid from "@/components/AnimeGrid";
import useAnimeData from "@/hooks/useAnimeData";
import { useAuth } from "@/context/AuthContext";
import { Anime } from "@/hooks/useAnimeSearch";
import { useAnimeLists } from "@/hooks/useAnimeLists";

interface NewReleasesAnimeProps {
  numColumns?: number;
  showHeader?: boolean;
  maxItems?: number;
  onViewAllPress?: () => void;
}

const NewReleasesAnime = ({
  numColumns = 2,
  showHeader = true,
  maxItems,
  onViewAllPress,
}: NewReleasesAnimeProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { newReleases, loading, fetchNewReleases } = useAnimeData();
  const { addToList, moveToList } = useAnimeLists(user?.id || null);

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnime = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchNewReleases();

      // If maxItems is provided, limit the number of items
      const limitedAnime = maxItems
        ? newReleases.slice(0, maxItems)
        : newReleases;
      setAnimeList(limitedAnime);
    } catch (error) {
      console.error("Error loading new releases:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchNewReleases, newReleases, maxItems]);

  const handleAddToList = async (anime: Anime) => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to add anime to your list",
      );
      return;
    }

    try {
      await addToList(anime.id, "watchlist");
      Alert.alert("Success", `"${anime.title}" added to watchlist`);
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Error", "Failed to add anime to watchlist");
    }
  };

  const handleFavorite = async (anime: Anime) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to favorite anime");
      return;
    }

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
  }, [loadAnime]);

  const handleAnimePress = (anime: Anime) => {
    router.push({
      pathname: `/anime/${anime.id}`,
      params: { animeId: anime.id },
    });
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>New Releases</Text>
          {onViewAllPress && (
            <TouchableOpacity onPress={onViewAllPress}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <AnimeGrid
        animeList={animeList}
        onAnimePress={handleAnimePress}
        onAddToList={handleAddToList}
        onFavorite={handleFavorite}
        refreshing={isRefreshing}
        onRefresh={loadAnime}
        numColumns={numColumns}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  viewAllText: {
    fontSize: 14,
    color: "#4F46E5",
  },
});

export default NewReleasesAnime;
