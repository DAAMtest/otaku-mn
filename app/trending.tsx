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
import BottomNavigation from "./components/BottomNavigation";
import FilterBar from "./components/FilterBar";
import useAnimeData from "./hooks/useAnimeData";
import { useAuth } from "./context/AuthContext";
import { Anime } from "./hooks/useAnimeSearch";
import { ListType, useAnimeLists } from "./hooks/useAnimeLists";
import AuthModal from "./auth/components/AuthModal";

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

const TrendingScreen = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { trendingAnime, loading, error, fetchTrendingAnime } = useAnimeData();
  const { addToList, moveToList } = useAnimeLists(user?.id || null);

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoadingState, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterOptions: FilterOption[] = [
    { id: "all", label: "All", icon: "tag" },
    { id: "today", label: "Today", icon: "calendar" },
    { id: "this-week", label: "This Week", icon: "calendar" },
    { id: "this-month", label: "This Month", icon: "calendar" },
    { id: "this-year", label: "This Year", icon: "calendar" },
  ];

  const handleFilterPress = (option: FilterOption) => {
    setSelectedFilters((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id]
    );
  };

  const loadAnime = async () => {
    try {
      const data = await fetchTrendingAnime();

      if (Array.isArray(data) && data.length > 0) {
        const formattedAnime = data.map((item: Anime) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          rating: item.rating || 0,
          description: item.description,
          releaseDate: item.releaseDate,
          genres: item.genres || [],
          isFavorite: item.isFavorite || false,
        }));

        setAnimeList(formattedAnime);
      } else if (!Array.isArray(data)) {
        console.error("Error: fetchTrendingAnime returned a non-array value");
      } else if (data.length === 0) {
        console.log("No trending anime found");
      }
    } catch (error) {
      console.error("Error loading anime:", error);
    } finally {
      setIsLoading(false);
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
            onPress={() => router.back()}
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
          options={filterOptions}
          selectedOptions={selectedFilters}
          onOptionPress={handleFilterPress}
          isLoading={loading.trending}
        />

        <View style={{ flex: 1, paddingBottom: 70 }}>
          <AnimeGrid
            anime={animeList}
            isLoading={isLoadingState}
            isRefreshing={isRefreshing}
            onRefresh={loadAnime}
            onPress={(anime: Anime) => {
              router.push({
                pathname: `/anime/${anime.id}`,
                params: { animeId: anime.id },
              });
            }}
            onAddToList={handleAddToList}
            onFavorite={handleFavorite}
            numColumns={2}
          />
        </View>

        <BottomNavigation
          currentRoute="/trending"
          activeTab="home"
          onTabChange={() => {}}
        />

        {false && (
          <AuthModal
            visible={false}
            onClose={() => {}}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default TrendingScreen;
