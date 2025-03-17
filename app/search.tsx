import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Search as SearchIcon, ArrowLeft, X } from "lucide-react-native";
import AnimeGrid from "./components/AnimeGrid";
import AuthModal from "./auth/components/AuthModal";
import { useAuth } from "./context/AuthContext";
import type { Database } from "@/lib/database.types";

// Define the Anime type to match the one used in AnimeGrid
type DatabaseAnime = {
  id: string;
  title: string;
  image_url: string;
  rating: number | null;
  description: string | null;
  release_date: string | null;
  created_at: string;
  updated_at: string;
};

// Local anime type for the search screen
interface LocalAnime extends DatabaseAnime {
  is_favorite?: boolean;
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LocalAnime[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  // Sample anime data
  const allAnime: LocalAnime[] = [
    {
      id: "1",
      title: "Attack on Titan",
      image_url:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
      rating: 4.8,
      is_favorite: true,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "My Hero Academia",
      image_url:
        "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
      rating: 4.6,
      is_favorite: false,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Demon Slayer",
      image_url:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      rating: 4.9,
      is_favorite: true,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "4",
      title: "One Piece",
      image_url:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      rating: 4.7,
      is_favorite: false,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Jujutsu Kaisen",
      image_url:
        "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
      rating: 4.8,
      is_favorite: false,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      image_url:
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
      rating: 4.5,
      is_favorite: true,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "7",
      title: "Tokyo Ghoul",
      image_url:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
      rating: 4.3,
      is_favorite: false,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "8",
      title: "Fullmetal Alchemist: Brotherhood",
      image_url:
        "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
      rating: 4.9,
      is_favorite: true,
      description: null,
      release_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Search functionality with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === "") {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Simulate API call
      const results = allAnime.filter((anime) =>
        anime.title.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(results);
      setIsLoading(false);
    }, 300),
    [allAnime],
  );

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (query: string) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(query), wait);
    };
  }

  // Call debounced search when search query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {};
  }, [searchQuery, debouncedSearch]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle anime press
  const handleAnimePress = (anime: LocalAnime) => {
    console.log(`Anime pressed: ${anime.id}`);
    // Navigate to anime details
    Alert.alert("Anime Details", `Viewing details for anime ID: ${anime.id}`);
  };

  // Handle add to list
  const handleAddToList = (anime: LocalAnime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    console.log(`Add to list: ${anime.id}`);
    // Show list selection modal
    Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Watchlist",
        onPress: () => console.log(`Added ${anime.id} to watchlist`),
      },
      {
        text: "Favorites",
        onPress: () => console.log(`Added ${anime.id} to favorites`),
      },
      {
        text: "Currently Watching",
        onPress: () => console.log(`Added ${anime.id} to currently watching`),
      },
    ]);
  };

  // Handle favorite toggle
  const handleFavorite = (anime: LocalAnime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // This would update the favorite status in a real app
    console.log(`Toggle favorite: ${anime.id}`);
    Alert.alert("Favorites", `"${anime.title}" added to favorites`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Search Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress} className="mr-2">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-800 rounded-full px-3 py-2">
            <SearchIcon size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search anime..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <View className="flex-1">
          {searchQuery.trim() === "" ? (
            <View className="flex-1 items-center justify-center pb-[80px]">
              <Text className="text-gray-400 text-lg">Search for anime</Text>
              <Text className="text-gray-500 text-sm mt-2">
                Enter a title to find anime
              </Text>
            </View>
          ) : (
            <AnimeGrid
              data={searchResults}
              loading={isLoading}
              onAnimePress={handleAnimePress}
              onAddToList={handleAddToList}
              onFavorite={handleFavorite}
            />
          )}
        </View>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </View>
    </SafeAreaView>
  );
}
