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
import BottomNavigation from "./components/BottomNavigation";
import AuthModal from "./components/AuthModal";

interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  isFavorite: boolean;
  genres?: string[];
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sample anime data
  const allAnime: Anime[] = [
    {
      id: "1",
      title: "Attack on Titan",
      imageUrl:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
      rating: 4.8,
      isFavorite: true,
      genres: ["Action", "Drama", "Fantasy"],
    },
    {
      id: "2",
      title: "My Hero Academia",
      imageUrl:
        "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
      rating: 4.6,
      isFavorite: false,
      genres: ["Action", "Comedy", "Sci-Fi"],
    },
    {
      id: "3",
      title: "Demon Slayer",
      imageUrl:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      rating: 4.9,
      isFavorite: true,
      genres: ["Action", "Fantasy", "Horror"],
    },
    {
      id: "4",
      title: "One Piece",
      imageUrl:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      rating: 4.7,
      isFavorite: false,
      genres: ["Action", "Adventure", "Comedy"],
    },
    {
      id: "5",
      title: "Jujutsu Kaisen",
      imageUrl:
        "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
      rating: 4.8,
      isFavorite: false,
      genres: ["Action", "Fantasy", "Horror"],
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      imageUrl:
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
      rating: 4.5,
      isFavorite: true,
      genres: ["Action", "Adventure", "Fantasy"],
    },
    {
      id: "7",
      title: "Tokyo Ghoul",
      imageUrl:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
      rating: 4.3,
      isFavorite: false,
      genres: ["Action", "Drama", "Horror"],
    },
    {
      id: "8",
      title: "Fullmetal Alchemist: Brotherhood",
      imageUrl:
        "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
      rating: 4.9,
      isFavorite: true,
      genres: ["Action", "Adventure", "Drama"],
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
  const handleAnimePress = (id: string) => {
    console.log(`Anime pressed: ${id}`);
    // Navigate to anime details
    Alert.alert("Anime Details", `Viewing details for anime ID: ${id}`);
  };

  // Handle add to list
  const handleAddToList = (id: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    console.log(`Add to list: ${id}`);
    // Show list selection modal
    const anime = allAnime.find((item) => item.id === id);
    if (anime) {
      Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Watchlist",
          onPress: () => console.log(`Added ${id} to watchlist`),
        },
        {
          text: "Favorites",
          onPress: () => console.log(`Added ${id} to favorites`),
        },
        {
          text: "Currently Watching",
          onPress: () => console.log(`Added ${id} to currently watching`),
        },
      ]);
    }
  };

  // Handle favorite toggle
  const handleFavorite = (id: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    // This would update the favorite status in a real app
    console.log(`Toggle favorite: ${id}`);
    const anime = allAnime.find((item) => item.id === id);
    if (anime) {
      Alert.alert("Favorites", `"${anime.title}" added to favorites`);
    }
  };

  // Handle login
  const handleLogin = useCallback((email: string, password: string) => {
    // Simulate login
    console.log(`Login with ${email} and ${password}`);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    Alert.alert("Success", "You have successfully logged in!");
  }, []);

  // Handle register
  const handleRegister = useCallback(
    (email: string, password: string, username: string) => {
      // Simulate registration
      console.log(`Register with ${email}, ${password}, and ${username}`);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      Alert.alert("Success", "Your account has been created successfully!");
    },
    [],
  );

  // Handle social login
  const handleSocialLogin = useCallback((provider: string) => {
    // Simulate social login
    console.log(`Login with ${provider}`);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    Alert.alert("Success", `You have successfully logged in with ${provider}!`);
  }, []);

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
        <View className="flex-1 pb-[70px]">
          {searchQuery.trim() === "" ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400 text-lg">Search for anime</Text>
              <Text className="text-gray-500 text-sm mt-2">
                Enter a title to find anime
              </Text>
            </View>
          ) : (
            <AnimeGrid
              data={searchResults}
              isLoading={isLoading}
              onAnimePress={handleAnimePress}
              onAddToList={handleAddToList}
              onFavorite={handleFavorite}
            />
          )}
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
