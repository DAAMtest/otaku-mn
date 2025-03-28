import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search as SearchIcon,
  ArrowLeft,
  X,
  Filter,
} from "lucide-react-native";
import AnimeGrid from "./components/AnimeGrid";
import AuthModal from "./auth/components/AuthModal";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeProvider";
import FilterBar from "./components/FilterBar";
import { supabase } from "./lib/supabase";
import { Anime } from "./hooks/useAnimeSearch";
import { Database } from '@/types/database';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  // Animation for search bar
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(searchBarAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(searchBarAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Define filter options
  const filterOptions: FilterOption[] = [
    { id: "Action", label: "Action", icon: "tag" },
    { id: "Adventure", label: "Adventure", icon: "film" },
    { id: "Comedy", label: "Comedy", icon: "book" },
    { id: "Drama", label: "Drama", icon: "video" },
    { id: "Fantasy", label: "Fantasy", icon: "tv" },
    { id: "Horror", label: "Horror", icon: "tag" },
    { id: "Sci-Fi", label: "Sci-Fi", icon: "film" },
    { id: "Romance", label: "Romance", icon: "book" },
    { id: "Slice of Life", label: "Slice of Life", icon: "video" },
    { id: "Sports", label: "Sports", icon: "tv" },
  ];

  // Search functionality with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === "" && selectedFilters.length === 0) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Simulate API call with delay
      setTimeout(() => {
        let results = [...searchResults];

        // Filter by search query if provided
        if (query.trim() !== "") {
          results = results.filter((anime) =>
            anime.title.toLowerCase().includes(query.toLowerCase()),
          );
        }

        // Apply genre filters if any are selected
        if (selectedFilters.length > 0) {
          results = results.filter((anime) =>
            anime.genres?.some((genre) => selectedFilters.includes(genre)),
          );
        }

        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    }, 300),
    [searchResults, selectedFilters],
  );

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (query: string) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(query), wait);
    };
  }

  // Call debounced search when search query or selected genres change
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {};
  }, [searchQuery, selectedFilters, debouncedSearch]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle filter press
  const handleFilterPress = (option: FilterOption) => {
    setSelectedFilters((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id]
    );
  };

  // Handle advanced filter button press
  const handleAdvancedFilterPress = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    Alert.alert("Advanced Filters", "More filter options coming soon!", [
      { text: "OK", style: "default" },
    ]);
  };

  // Handle anime press
  const handleAnimePress = useCallback((anime: Anime) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    console.log(`Anime pressed: ${anime.id}`);
    // Navigate to anime details
    Alert.alert(
      anime.title,
      anime.description || `Viewing details for anime ID: ${anime.id}`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "View Details",
          onPress: () => console.log(`Navigating to details for ${anime.id}`),
        },
      ],
    );
  }, []);

  // Handle add to list
  const handleAddToList = useCallback(
    async (anime: Anime) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      try {
        const Haptics = require("expo-haptics");
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, continue silently
      }

      console.log(`Add to list: ${anime.id}`);
      // Show list selection modal
      Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Watchlist",
          onPress: async () => {
            console.log(`Added ${anime.id} to watchlist`);
            Alert.alert("Success", `Added "${anime.title}" to your watchlist`);
          },
        },
        {
          text: "Favorites",
          onPress: async () => {
            console.log(`Added ${anime.id} to favorites`);
            Alert.alert("Success", `Added "${anime.title}" to your favorites`);
          },
        },
        {
          text: "Currently Watching",
          onPress: async () => {
            console.log(`Added ${anime.id} to currently watching`);
            Alert.alert(
              "Success",
              `Added "${anime.title}" to currently watching`,
            );
          },
        },
      ]);
    },
    [user],
  );

  // Handle favorite toggle
  const handleFavorite = useCallback(
    async (anime: Anime) => {
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      try {
        const Haptics = require("expo-haptics");
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, continue silently
      }

      console.log(`Toggle favorite: ${anime.id}`);
      Alert.alert("Success", `"${anime.title}" added to favorites`);
    },
    [user],
  );

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres!inner(genres(name))
        `)
        .ilike("title", `%${query}%`)
        .order("rating", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedAnime = data.map((item: Database["public"]["Tables"]["anime"]["Row"]) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          rating: item.rating || 0,
          description: item.description,
          releaseDate: item.release_date,
          genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
          isFavorite: false,
        }));

        setSearchResults(formattedAnime);
      }
    } catch (error) {
      console.error("Error searching anime:", error);
      setError(error as Error);
    }
  };

  // Calculate search bar scale based on keyboard visibility
  const searchBarScale = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        {/* Search Header */}
        <Animated.View
          style={[
            styles.searchHeader,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              transform: [{ scale: searchBarScale }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBackPress}
            style={[styles.backButton, { backgroundColor: colors.cardHover }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
            <SearchIcon size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search anime..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                handleSearch(text);
              }}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.clearButton}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleAdvancedFilterPress}
            style={[styles.filterButton, { backgroundColor: colors.cardHover }]}
            activeOpacity={0.7}
          >
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Filter Bar */}
        <FilterBar
          options={filterOptions}
          selectedOptions={selectedFilters}
          onOptionPress={handleFilterPress}
          isLoading={isLoading}
        />

        {/* Search Results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim() === "" && selectedFilters.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <SearchIcon
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                Search for anime
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Enter a title or select genres to find anime
              </Text>
            </View>
          ) : searchResults.length === 0 && !isLoading ? (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No results found
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Try a different search term or filters
              </Text>
            </View>
          ) : (
            <AnimeGrid
              anime={searchResults}
              isLoading={isLoading}
              onPress={handleAnimePress}
              onAddToList={handleAddToList}
              onFavorite={handleFavorite}
              isRefreshing={isLoading}
              onRefresh={async () => await handleSearch(searchQuery)}
              numColumns={2}
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

const styles = StyleSheet.create({
  searchHeader: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    marginLeft: 8,
    paddingRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    paddingBottom: Platform.OS === "ios" ? 80 : 60,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
