import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AnimeGrid from "./components/AnimeGrid";
import BottomNavigation from "./components/BottomNavigation";
import FilterBar from "./components/FilterBar";
import useAnimeData from "./hooks/useAnimeData";
import { useAuth } from "./context/AuthContext";
import useAnimeLists from "./hooks/useAnimeLists";
import AuthModal from "./components/AuthModal";

export default function TrendingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { trendingAnime, loading, error, fetchTrendingAnime } = useAnimeData();
  const { addToList } = useAnimeLists(user?.id || null);

  const [activeTab, setActiveTab] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filteredAnime, setFilteredAnime] = useState(trendingAnime);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch trending anime on component mount
  useEffect(() => {
    fetchTrendingAnime();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (!trendingAnime) return;

    let result = [...trendingAnime];

    // Apply genre filters if any are selected
    if (selectedGenres.length > 0) {
      result = result.filter((anime) =>
        anime.genres?.some((genre) => selectedGenres.includes(genre)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.rating - b.rating;
      } else {
        return b.rating - a.rating;
      }
    });

    setFilteredAnime(result);
  }, [trendingAnime, selectedGenres, sortOrder]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle anime press
  const handleAnimePress = (id: string) => {
    Alert.alert("Anime Details", `Viewing details for anime ID: ${id}`);
    // Navigate to anime details in a real app
    // router.push(`/anime/${id}`);
  };

  // Handle add to list
  const handleAddToList = (id: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const anime = trendingAnime.find((item) => item.id === id);
    if (anime) {
      Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Watchlist",
          onPress: async () => {
            const { error } = await addToList(id, "watchlist");
            if (error) {
              Alert.alert(
                "Error",
                `Failed to add to watchlist: ${error.message}`,
              );
            } else {
              Alert.alert("Success", `Added ${anime.title} to watchlist`);
            }
          },
        },
        {
          text: "Currently Watching",
          onPress: async () => {
            const { error } = await addToList(id, "watching", 0);
            if (error) {
              Alert.alert(
                "Error",
                `Failed to add to watching: ${error.message}`,
              );
            } else {
              Alert.alert(
                "Success",
                `Added ${anime.title} to currently watching`,
              );
            }
          },
        },
        {
          text: "Favorites",
          onPress: async () => {
            const { error } = await addToList(id, "favorites");
            if (error) {
              Alert.alert(
                "Error",
                `Failed to add to favorites: ${error.message}`,
              );
            } else {
              Alert.alert("Success", `Added ${anime.title} to favorites`);
            }
          },
        },
      ]);
    }
  };

  // Handle favorite toggle
  const handleFavorite = async (id: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const anime = trendingAnime.find((item) => item.id === id);
    if (anime) {
      const { error } = await addToList(id, "favorites");
      if (error) {
        Alert.alert("Error", `Failed to add to favorites: ${error.message}`);
      } else {
        Alert.alert("Success", `Added ${anime.title} to favorites`);
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (filters: string[]) => {
    setSelectedGenres(filters);
  };

  // Handle sort change
  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    // This would use your auth hook in a real implementation
    setShowAuthModal(false);
    Alert.alert("Login", "Login functionality would be implemented here");
  };

  // Handle register
  const handleRegister = async (
    email: string,
    password: string,
    username: string,
  ) => {
    // This would use your auth hook in a real implementation
    setShowAuthModal(false);
    Alert.alert(
      "Register",
      "Registration functionality would be implemented here",
    );
  };

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    // This would use your auth hook in a real implementation
    setShowAuthModal(false);
    Alert.alert("Social Login", `${provider} login would be implemented here`);
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
          <Text className="text-white font-bold text-lg">Trending Now</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>

        <FilterBar
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />

        <View className="flex-1 pb-[70px]">
          <AnimeGrid
            data={filteredAnime}
            isLoading={loading.trending}
            onAnimePress={handleAnimePress}
            onAddToList={handleAddToList}
            onFavorite={handleFavorite}
          />
        </View>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onSocialLogin={handleSocialLogin}
        />
      </View>
    </SafeAreaView>
  );
}
