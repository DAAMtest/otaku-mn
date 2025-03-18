import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AnimeGrid from "./components/AnimeGrid";
import FilterBar from "./components/FilterBar";
import useAnimeData from "./hooks/useAnimeData";
import { useAuth } from "./context/AuthContext";
import useAnimeLists from "./hooks/useAnimeLists";
import AuthModal from "./auth/components/AuthModal";
import type { Database } from "@/lib/database.types";

// Define the Anime type to match AnimeGrid's expected type
type Tables = Database["public"]["Tables"];
type AnimeGridItem = Tables["anime"]["Row"] & {
  is_favorite?: boolean;
  genres?: string[];
  type?: string;
};

export default function TrendingScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { trendingAnime, loading, error, fetchTrendingAnime } = useAnimeData();
  const { addToList } = useAnimeLists(user?.id || null);

  const [activeTab, setActiveTab] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<AnimeGridItem[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Fetch trending anime on component mount
  useEffect(() => {
    fetchTrendingAnime();
  }, [fetchTrendingAnime]);

  // Update filtered anime when trendingAnime, selectedGenres, or sortOrder changes
  useEffect(() => {
    // Convert trendingAnime to AnimeGridItem format
    const convertedAnime: AnimeGridItem[] = trendingAnime.map((anime) => ({
      id: anime.id,
      title: anime.title,
      image_url: anime.imageUrl,
      rating: anime.rating || null,
      description: anime.description || null,
      release_date: anime.releaseDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_favorite: anime.isFavorite,
      type: anime.type,
    }));

    let result = [...convertedAnime];

    // Apply genre filters if any are selected
    if (selectedGenres.length > 0) {
      result = result.filter((anime) =>
        anime.genres?.some((genre: string) => selectedGenres.includes(genre)),
      );
    }

    // Apply filters
    if (selectedFilters.length > 0) {
      result = result.filter(
        (anime) =>
          selectedFilters.includes("All") ||
          (anime.type && selectedFilters.includes(anime.type)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.rating || 0) - (b.rating || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });

    setFilteredAnime(result);
  }, [trendingAnime, selectedGenres, selectedFilters, sortOrder]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle filter change
  const handleFilterChange = (filters: string[]) => {
    setSelectedGenres(filters);
  };

  // Handle sort change
  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  // Handle anime press
  const handleAnimePress = (anime: AnimeGridItem) => {
    Alert.alert("Anime Details", `Viewing details for ${anime.title}`);
  };

  // Handle favorite toggle
  const handleFavorite = (anime: AnimeGridItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    Alert.alert(
      "Favorites",
      `${anime.is_favorite ? "Remove from" : "Add to"} favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            // Toggle favorite status
            console.log(`Toggled favorite status for ${anime.id}`);
          },
        },
      ],
    );
  };

  // Handle add to list
  const handleAddToList = (anime: AnimeGridItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Watchlist",
        onPress: () => addToList(anime.id, "watchlist"),
      },
      {
        text: "Currently Watching",
        onPress: () => addToList(anime.id, "watching"),
      },
      {
        text: "Completed",
        onPress: () => addToList(anime.id, "completed"),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171717" }}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#171717",
          }}
        >
          <TouchableOpacity
            onPress={handleBackPress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2A2A2A",
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              fontSize: 20,
              fontWeight: "bold",
              color: "#FFFFFF",
              marginLeft: 16,
              textAlign: "center",
            }}
          >
            Trending Anime
          </Text>
          <View style={{ width: 40 }} /> {/* Empty view for balance */}
        </View>

        <FilterBar
          filters={["All", "Today", "This Week", "This Month", "This Year"]}
          selectedFilters={selectedFilters}
          onFilterPress={(filter) => {
            // Toggle the filter in the selectedFilters array
            if (selectedFilters.includes(filter)) {
              setSelectedFilters(selectedFilters.filter((f) => f !== filter));
            } else {
              setSelectedFilters([...selectedFilters, filter]);
            }
          }}
          isLoading={loading.trending}
        />

        <View style={{ flex: 1, paddingBottom: 70 }}>
          <AnimeGrid
            data={filteredAnime}
            loading={loading.trending}
            refreshing={loading.trending}
            onRefresh={fetchTrendingAnime}
            onAnimePress={handleAnimePress}
            onAddToList={handleAddToList}
            onFavorite={handleFavorite}
            numColumns={2}
          />
        </View>

        {showAuthModal && (
          <AuthModal
            visible={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
