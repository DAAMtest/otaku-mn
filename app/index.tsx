import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, SafeAreaView, StatusBar, Alert, Platform, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import AnimeGrid from "@/components/AnimeGrid";
import AuthModal from "@/auth/components/AuthModal";
import MenuDrawer from "@/components/MenuDrawer";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/lib/database.types";
import useAnimeData from "@/hooks/useAnimeData";
import { Anime } from "@/hooks/useAnimeSearch";
import { supabase } from "@/lib/supabase";

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedOptions: string[];
  onOptionPress: (option: FilterOption) => void;
}

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => Promise<void>;
}

const HomeScreen = () => {
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
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const { user } = useAuth();

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
  const filterOptions = useMemo<FilterOption[]>(
    () =>
      genres.map((genre) => ({
        id: genre.toLowerCase().replace(/\s+/g, "-"),
        label: genre,
        icon: "tag",
      })),
    [genres]
  );

  // Handle search button press
  const handleSearchPress = () => {
    router.push("/search");
  };

  // Handle notifications button press
  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  // Get current route for bottom navigation
  const currentRoute = useMemo(() => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/search")) return "/search";
    if (pathname.startsWith("/favorites")) return "/favorites";
    if (pathname.startsWith("/profile")) return "/profile";
    return "/";
  }, [pathname]);

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
      const aRating = a.rating ?? 0;
      const bRating = b.rating ?? 0;
      if (currentSortOrder === "asc") {
        return aRating - bRating;
      } else {
        return bRating - aRating;
      }
    });
  }, [animeList, selectedGenres, currentSortOrder]);

  const loadAnime = async () => {
    try {
      const { data, error } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          description,
          image_url,
          cover_image_url,
          release_date,
          rating,
          anime_genres!inner(genres(name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: Anime[] = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          rating: item.rating || 0,
          description: item.description ?? "",
          releaseDate: item.release_date ?? "",
          genres: Array.isArray(item.anime_genres) 
            ? item.anime_genres.map((ag: any) => 
                ag.genres && typeof ag.genres === 'object' 
                  ? ag.genres.name 
                  : null
              ).filter(Boolean)
            : [],
          isFavorite: false // Default to false since is_favorite doesn't exist
        }));
        setAnimeList(formattedData);
      }
    } catch (error) {
      console.error("Error loading anime:", error);
      Alert.alert("Error", "Failed to load anime list");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Use useEffect to fetch genres when component mounts
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadAnime(),
          fetchGenres()
        ]);
        console.log("Genres loaded:", genres);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Add debug logging for filter options
  useEffect(() => {
    console.log("Filter options:", filterOptions);
    console.log("Selected genres:", selectedGenres);
  }, [filterOptions, selectedGenres]);

  const handleAddToList = async (anime: Anime, listType: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("user_anime_list")
        .insert({
          user_id: user.id,
          anime_id: anime.id,
          list_type: listType,
          progress: 0
        })
        .select();

      if (error) throw error;

      Alert.alert("Success", "Anime added to your list!");
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Error", "Failed to add anime to list");
    }
  };

  const handleFavorite = async (anime: Anime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("user_anime_list")
        .insert({
          user_id: user.id,
          anime_id: anime.id,
          list_type: "favorites",
          progress: 0
        })
        .select();

      if (error) throw error;

      Alert.alert("Success", "Anime added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add anime to favorites");
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Home"
        showSearch
        showNotifications
        onSearchPress={handleSearchPress}
        onNotificationsPress={handleNotificationsPress}
      />
      
      <FilterBar
        options={filterOptions}
        selectedOptions={selectedGenres}
        onOptionPress={(option: FilterOption) => {
          setSelectedGenres((prev) =>
            prev.includes(option.id)
              ? prev.filter((id) => id !== option.id)
              : [...prev, option.id]
          );
        }}
      />
      
      <AnimeGrid
        anime={filteredAnimeList}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={async () => {
          setIsRefreshing(true);
          await loadAnime();
          setIsRefreshing(false);
          return Promise.resolve();
        }}
        onPress={(anime) => {
          router.push({
            pathname: `/anime/${anime.id}`,
            params: { animeId: anime.id },
          });
        }}
        onAddToList={(anime) => handleAddToList(anime, "watchlist")}
        onFavorite={(anime) => handleFavorite(anime)}
        numColumns={2}
      />
      
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={async () => {
          setShowAuthModal(false);
          setIsAuthenticated(true);
          setUsername(user?.user_metadata?.username || "Guest");
          return Promise.resolve();
        }}
      />
      
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
});

export default HomeScreen;
