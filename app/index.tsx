import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, SafeAreaView, StatusBar, Alert, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import AnimeGrid from "@/components/AnimeGrid";
import AuthModal from "@/auth/components/AuthModal";
import MenuDrawer from "@/components/MenuDrawer";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/lib/database.types";
import BottomNavigation from "@/components/BottomNavigation";
import useAnimeData from "@/hooks/useAnimeData";
import { Anime } from "@/hooks/useAnimeSearch";

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">(
    "desc",
  );

  // Get anime data from the hook
  const {
    genres,
    trendingAnime,
    newReleases,
    loading: animeDataLoading,
    error: animeDataError,
    fetchGenres,
    fetchTrendingAnime,
    fetchNewReleases,
  } = useAnimeData();

  // Define filter options based on fetched genres
  const filterOptions = useMemo(
    () =>
      genres.map((genre) => ({
        id: genre.toLowerCase().replace(/\s+/g, "-"),
        label: genre,
        value: genre,
      })),
    [genres],
  );

  // Get current route for bottom navigation
  const currentRoute = useMemo(() => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/search")) return "/search";
    if (pathname.startsWith("/favorites")) return "/favorites";
    if (pathname.startsWith("/profile")) return "/profile";
    return "/";
  }, [pathname]);

  // Use the trending anime as the main anime list
  const [animeList, setAnimeList] = useState<Anime[]>([]);

  // Use useMemo for filtered and sorted anime list instead of state
  const filteredAnimeList = useMemo(() => {
    let result = [...animeList];

    // Apply genre filters if any are selected
    if (selectedGenres.length > 0) {
      result = result.filter((anime) =>
        anime.genres?.some((genre) => selectedGenres.includes(genre)),
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      if (currentSortOrder === "asc") {
        return (a.rating ?? 0) - (b.rating ?? 0);
      } else {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
    });
  }, [animeList, selectedGenres, currentSortOrder]);

  // Use the loading state from the hook
  const [isLoading, setIsLoading] = useState(true);

  // Handle user profile press
  const handleProfilePress = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      // Navigate to profile page
      router.push("/profile");
    }
  };

  // Handle menu press
  const handleMenuPress = () => {
    setShowMenuDrawer(true);
  };

  // Handle menu item press
  const handleMenuItemPress = (item: string) => {
    setShowMenuDrawer(false);

    switch (item) {
      case "home":
        router.push("/");
        break;
      case "search":
        router.push("/search");
        break;
      case "lists":
        if (isAuthenticated) {
          router.push("/lists");
        } else {
          setShowAuthModal(true);
        }
        break;
      case "profile":
        if (isAuthenticated) {
          router.push("/profile");
        } else {
          setShowAuthModal(true);
        }
        break;
      case "trending":
        router.push("/trending");
        break;
      case "new_releases":
        router.push("/new-releases");
        break;
      case "top_rated":
        Alert.alert("Top Rated", "Top rated anime page is coming soon");
        break;
      case "popular":
        Alert.alert("Most Popular", "Most popular anime page is coming soon");
        break;
      case "settings":
        Alert.alert("Settings", "Settings page is under construction");
        break;
      case "about":
        Alert.alert(
          "About",
          "Otaku Mongolia - Version 1.0.0\n\nA React Native Expo app for Mongolian anime enthusiasts.",
        );
        break;
      case "login":
        setShowAuthModal(true);
        break;
      case "logout":
        handleLogout();
        break;
      case "notifications":
        Alert.alert("Notifications", "You have no new notifications");
        break;
      default:
        break;
    }
  };

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would use the auth hook
      // const { data, error } = await signIn(email, password);
      // if (error) throw error;

      // Simulate login for now
      console.log(`Login with ${email} and ${password}`);
      setIsAuthenticated(true);
      setUsername(email.split("@")[0]); // Use part of email as username
      setShowAuthModal(false);
      Alert.alert("Success", "You have successfully logged in!");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Please check your credentials and try again",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register
  const handleRegister = (
    email: string,
    password: string,
    username: string,
  ) => {
    // Simulate registration
    console.log(`Register with ${email}, ${password}, and ${username}`);
    setIsAuthenticated(true);
    setUsername(username);
    setShowAuthModal(false);
    Alert.alert("Success", "Your account has been created successfully!");
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("Guest");
    Alert.alert("Logged Out", "You have been logged out successfully");
  };

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    console.log(`Login with ${provider}`);
    setIsAuthenticated(true);
    setUsername(`${provider}_user`);
    setShowAuthModal(false);
    Alert.alert("Success", `You have successfully logged in with ${provider}!`);
  };

  // Handle anime press
  const handleAnimePress = useCallback(
    (anime: Anime) => {
      console.log(`Anime pressed: ${anime.id}`);
      // Navigate to anime details page
      router.push(`/anime/${anime.id}`);
    },
    [router],
  );

  // Handle add to list
  const handleAddToList = useCallback(
    (anime: Anime) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

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
    },
    [isAuthenticated],
  );

  // Handle favorite toggle
  const handleFavorite = useCallback(
    (anime: Anime) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      setAnimeList((prevList) =>
        prevList.map((item) =>
          item.id === anime.id
            ? { ...item, is_favorite: !item.is_favorite }
            : item,
        ),
      );

      const action = anime.is_favorite ? "removed from" : "added to";
      Alert.alert("Favorites", `"${anime.title}" ${action} favorites`);
    },
    [isAuthenticated],
  );

  // Handle filter change
  const handleFilterChange = (filters: string[]) => {
    console.log("Filters changed:", filters);
    setSelectedGenres(filters);
  };

  // Handle sort change
  const handleSortChange = (sortOrder: "asc" | "desc") => {
    console.log("Sort order changed:", sortOrder);
    setCurrentSortOrder(sortOrder);
  };

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoading && filteredAnimeList.length >= 8) {
      setIsLoading(true);
      // Simulate loading more data
      setTimeout(() => {
        setIsLoading(false);
        // Don't show "End of List" alert
        // Add more anime to the list if needed
      }, 1500);
    }
  }, [isLoading, filteredAnimeList.length]);

  // Load data using the hook functions
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch genres first
      await fetchGenres();

      // Fetch trending anime
      await fetchTrendingAnime();

      // Fetch new releases
      await fetchNewReleases();
    } catch (error) {
      console.error("Error loading anime data:", error);
      Alert.alert(
        "Error",
        "Failed to load anime data. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchGenres, fetchTrendingAnime, fetchNewReleases]);

  // Update animeList when trendingAnime changes
  useEffect(() => {
    if (trendingAnime.length > 0) {
      // Convert the trending anime to the format expected by the UI
      const formattedData = trendingAnime.map((anime) => ({
        ...anime,
        id: anime.id,
        title: anime.title,
        image_url: anime.imageUrl,
        rating: anime.rating || 0,
        is_favorite: anime.isFavorite || false,
        description: anime.description || "",
        release_date: anime.releaseDate,
        genres: anime.genres || [],
      }));

      setAnimeList(formattedData);
    }
  }, [trendingAnime]);

  // Load anime data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle refresh with pull-to-refresh gesture
  const handleRefresh = useCallback(() => {
    console.log("Refreshing anime list");

    // Provide haptic feedback for refresh
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }

    // Fetch fresh data using our hook functions
    loadAllData();
  }, [loadAllData]);

  // Handle search press
  const handleSearchPress = () => {
    router.push("/search");
  };

  // Handle filter button press
  const handleFilterButtonPress = () => {
    Alert.alert("Advanced Filters", "Select filters to apply", [
      { text: "Cancel", style: "cancel" },
      { text: "Apply", onPress: () => console.log("Applied advanced filters") },
    ]);
  };

  const { user, isLoading: authLoading } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171717" }}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <View style={{ flex: 1 }}>
        <Header
          title="AnimeTempo"
          showBack={false}
          showSearch={false}
          showNotifications={true}
          showMenu={false}
          onNotificationsPress={() => handleMenuItemPress("notifications")}
          notificationCount={3} // Example notification count
        />
        <FilterBar
          filters={filterOptions.map((option) => option.value)}
          selectedFilters={selectedGenres}
          onFilterPress={(filter) => {
            // Toggle the filter in the selectedGenres array
            if (selectedGenres.includes(filter)) {
              handleFilterChange(
                selectedGenres.filter((genre) => genre !== filter),
              );
            } else {
              handleFilterChange([...selectedGenres, filter]);
            }
          }}
          isLoading={isLoading}
        />
        <View
          style={{ flex: 1, paddingBottom: Platform.OS === "ios" ? 80 : 60 }}
        >
          <AnimeGrid
            data={filteredAnimeList}
            loading={isLoading}
            refreshing={isLoading}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
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
        <MenuDrawer
          visible={showMenuDrawer}
          onClose={() => setShowMenuDrawer(false)}
          onMenuItemPress={handleMenuItemPress}
          isAuthenticated={isAuthenticated}
          username={username}
          avatarUrl={
            isAuthenticated
              ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
              : undefined
          }
        />
        <BottomNavigation currentRoute={currentRoute} />
      </View>
    </SafeAreaView>
  );
}
