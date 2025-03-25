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
import BottomNavigation from "./components/BottomNavigation";
import FilterBar from "./components/FilterBar";
import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];
type UUID = string;
type Anime = Tables["anime"]["Row"] & {
  is_favorite?: boolean;
  genres?: string[];
  // Using UUID type for all IDs to match Supabase's UUID format
  id: UUID;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SearchScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

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
  const filterOptions = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Sci-Fi",
    "Romance",
    "Slice of Life",
    "Sports",
  ];

  // Sample anime data
  const allAnime: Anime[] = [
    {
      id: "1",
      title: "Attack on Titan",
      image_url:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
      rating: 4.8,
      is_favorite: true,
      description: "Humanity's last stand against man-eating giants",
      release_date: "2013-04-07",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Drama", "Fantasy"],
    },
    {
      id: "2",
      title: "My Hero Academia",
      image_url:
        "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
      rating: 4.6,
      is_favorite: false,
      description: "A quirkless boy's journey to become the greatest hero",
      release_date: "2016-04-03",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Comedy", "Sci-Fi"],
    },
    {
      id: "3",
      title: "Demon Slayer",
      image_url:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      rating: 4.9,
      is_favorite: true,
      description: "A young demon slayer avenges his family",
      release_date: "2019-04-06",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Fantasy", "Horror"],
    },
    {
      id: "4",
      title: "One Piece",
      image_url:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      rating: 4.7,
      is_favorite: false,
      description: "Pirates search for the ultimate treasure",
      release_date: "1999-10-20",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Adventure", "Comedy"],
    },
    {
      id: "5",
      title: "Jujutsu Kaisen",
      image_url:
        "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
      rating: 4.8,
      is_favorite: false,
      description:
        "A high school student joins a secret organization of Jujutsu Sorcerers",
      release_date: "2020-10-03",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Fantasy", "Horror"],
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      image_url:
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
      rating: 4.5,
      is_favorite: true,
      description: "A ninja's quest to become the leader of his village",
      release_date: "2007-02-15",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Adventure", "Fantasy"],
    },
    {
      id: "7",
      title: "Tokyo Ghoul",
      image_url:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
      rating: 4.3,
      is_favorite: false,
      description:
        "A college student becomes half-ghoul after a fatal encounter",
      release_date: "2014-07-04",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Drama", "Horror"],
    },
    {
      id: "8",
      title: "Fullmetal Alchemist: Brotherhood",
      image_url:
        "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
      rating: 4.9,
      is_favorite: true,
      description: "Two brothers seek the philosopher's stone",
      release_date: "2009-04-05",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Adventure", "Drama"],
    },
    {
      id: "9",
      title: "Your Lie in April",
      image_url:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&q=80",
      rating: 4.7,
      is_favorite: false,
      description:
        "A pianist finds his passion for music again through a violinist",
      release_date: "2014-10-09",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Drama", "Romance", "Slice of Life"],
    },
    {
      id: "10",
      title: "Haikyuu!!",
      image_url:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
      rating: 4.8,
      is_favorite: false,
      description: "A high school volleyball team's journey to nationals",
      release_date: "2014-04-06",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Comedy", "Drama", "Sports"],
    },
  ];

  // Search functionality with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === "" && selectedGenres.length === 0) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Simulate API call with delay
      setTimeout(() => {
        let results = [...allAnime];

        // Filter by search query if provided
        if (query.trim() !== "") {
          results = results.filter((anime) =>
            anime.title.toLowerCase().includes(query.toLowerCase()),
          );
        }

        // Apply genre filters if any are selected
        if (selectedGenres.length > 0) {
          results = results.filter((anime) =>
            anime.genres?.some((genre) => selectedGenres.includes(genre)),
          );
        }

        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    }, 300),
    [allAnime, selectedGenres],
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
  }, [searchQuery, selectedGenres, debouncedSearch]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle filter press
  const handleFilterPress = (filter: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(filter)) {
        return prev.filter((genre) => genre !== filter);
      } else {
        return [...prev, filter];
      }
    });
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
  const handleAnimePress = (anime: Anime) => {
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
  };

  // Handle add to list
  const handleAddToList = (anime: Anime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    console.log(`Add to list: ${anime.id}`);
    // Show list selection modal
    Alert.alert("Add to List", `Add "${anime.title}" to your list`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Watchlist",
        onPress: () => {
          console.log(`Added ${anime.id} to watchlist`);
          Alert.alert("Success", `Added "${anime.title}" to your watchlist`);
        },
      },
      {
        text: "Favorites",
        onPress: () => {
          console.log(`Added ${anime.id} to favorites`);
          Alert.alert("Success", `Added "${anime.title}" to your favorites`);
        },
      },
      {
        text: "Currently Watching",
        onPress: () => {
          console.log(`Added ${anime.id} to currently watching`);
          Alert.alert(
            "Success",
            `Added "${anime.title}" to currently watching`,
          );
        },
      },
    ]);
  };

  // Handle favorite toggle
  const handleFavorite = (anime: Anime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    // This would update the favorite status in a real app
    console.log(`Toggle favorite: ${anime.id}`);
    Alert.alert("Success", `"${anime.title}" added to favorites`);
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
              onChangeText={setSearchQuery}
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
          filters={filterOptions}
          selectedFilters={selectedGenres}
          onFilterPress={handleFilterPress}
          isLoading={isLoading}
        />

        {/* Search Results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim() === "" && selectedGenres.length === 0 ? (
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
              data={searchResults}
              loading={isLoading}
              onAnimePress={handleAnimePress}
              onAddToList={handleAddToList}
              onFavorite={handleFavorite}
              refreshing={isLoading}
              onRefresh={() => debouncedSearch(searchQuery)}
            />
          )}
        </View>

        <AuthModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        {!isKeyboardVisible && (
          <BottomNavigation
            currentRoute="/search"
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
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
