import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
import BottomNavigation from "@/components/BottomNavigation";
import * as SecureStore from "expo-secure-store";

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
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, username: string) => void;
  onSocialLogin: (provider: string) => void;
}

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  username: string;
  onMenuItemPress: (item: string) => void;
}

const HomeScreen = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, session, isLoading: authLoading } = useAuth();

  // State hooks
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">("desc");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);

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

  // Format anime data
  const formatAnimeData = useCallback((data: any[]) => {
    return data.map(item => {
      const genres = item.anime_genres
        ? item.anime_genres.map((ag: { genres: { name: string } }) => ag.genres.name)
        : [];

      return {
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        description: item.description || "",
        releaseDate: item.release_date,
        coverImageUrl: item.cover_image_url,
        releaseYear: item.release_year,
        season: item.season,
        status: item.status,
        popularity: item.popularity,
        genres,
        isFavorite: false,
      };
    });
  }, []);

  // Load anime data
  const loadAnime = useCallback(async (shouldRefresh = false) => {
    if (isLoading && !shouldRefresh) return;
    
    try {
      setIsLoading(true);
      if (shouldRefresh) {
        setIsRefreshing(true);
      }

      let query = supabase.from("anime").select(`
        id,
        title,
        image_url,
        rating,
        description,
        release_date,
        cover_image_url,
        release_year,
        season,
        status,
        popularity,
        anime_genres!inner (
          genres!inner (
            name
          )
        )
      `);

      if (selectedGenres.length > 0) {
        query = query.in('anime_genres.genres.name', selectedGenres);
      }

      query = query.order("popularity", { ascending: currentSortOrder === "asc" })
        .order("title", { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = formatAnimeData(data || []);
      setAnimeList(formattedData);
    } catch (error) {
      console.error("Error loading anime:", error);
      Alert.alert("Error", "Failed to load anime list");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedGenres, currentSortOrder, formatAnimeData]);

  // Initial data load
  useEffect(() => {
    if (!authLoading) {
      fetchGenres();
      loadAnime();
    }
  }, [authLoading]); // Only run when auth loading changes

  // Handle filter changes
  const handleFilterPress = useCallback((option: FilterOption) => {
    if (isLoading) return; // Prevent multiple clicks while loading
    const genreId = option.id;
    setSelectedGenres(prev => {
      const newGenres = prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId];
      return newGenres;
    });
  }, [isLoading]);

  // Watch for filter changes and load data with debounce
  useEffect(() => {
    if (authLoading) return;

    const timeoutId = setTimeout(() => {
      loadAnime(true);
    }, 100); // Small delay to batch multiple filter changes

    return () => clearTimeout(timeoutId);
  }, [selectedGenres, currentSortOrder]); // Remove loadAnime and authLoading from dependencies

  // Handle sort order change
  const handleSortOrderChange = useCallback((order: "asc" | "desc") => {
    if (isLoading) return; // Prevent multiple clicks while loading
    setCurrentSortOrder(order);
  }, [isLoading]);

  // Memoized values
  const filterOptions = useMemo(() => {
    return genres.map((genre) => ({
      id: genre,
      label: genre,
      icon: "tag",
    }));
  }, [genres]);

  const handleAnimePress = useCallback(
    (anime: Anime) => {
      console.log(`Anime pressed: ${anime.id}`);
      router.push(`/anime/${anime.id}`);
    },
    [router],
  );

  // Check stored session only once on mount
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        const storedSession = await SecureStore.getItemAsync("supabase-session");
        if (storedSession) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession) {
            await SecureStore.deleteItemAsync("supabase-session");
          }
        }
      } catch (error) {
        console.error("Error checking stored session:", error);
      }
    };

    checkStoredSession();
  }, []);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  // Handle user profile press
  const handleProfilePress = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      router.push("/profile");
    }
  };

  // Handle menu press
  const handleMenuPress = () => {
    setShowMenuDrawer(true);
  };

  // Handle menu item press
  const handleMenuItemPress: MenuDrawerProps["onMenuItemPress"] = (item) => {
    setShowMenuDrawer(false);

    switch (item) {
      case "home":
        router.push("/");
        break;
      case "search":
        router.push("/search");
        break;
      case "lists":
        if (user) {
          router.push("/lists");
        } else {
          setShowAuthModal(true);
        }
        break;
      case "profile":
        if (user) {
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
        router.push("/top-rated");
        break;
      case "popular":
        router.push("/popular");
        break;
      case "settings":
        router.push("/settings");
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

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
    }
  };

  // Handle register
  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      setShowAuthModal(false);
      Alert.alert("Success", "Your account has been created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "An error occurred during registration"
      );
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      Alert.alert("Logged Out", "You have been logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    console.log(`Login with ${provider}`);
    setShowAuthModal(false);
    Alert.alert("Success", `You have successfully logged in with ${provider}!`);
  };

  // Handle add to list
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
          progress: 0,
        })
        .select();

      if (error) throw error;

      Alert.alert("Success", "Anime added to your list!");
    } catch (error) {
      console.error("Error adding to list:", error);
      Alert.alert("Error", "Failed to add anime to list");
    }
  };

  // Handle favorite
  const handleFavorite = async (anime: Anime) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("user_anime_favorites")
        .insert({
          user_id: user.id,
          anime_id: anime.id,
        })
        .select();

      if (error) throw error;

      Alert.alert("Success", "Anime added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add anime to favorites");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onSearchPress={() => router.push("/search")}
        onNotificationsPress={() =>
          Alert.alert("Notifications", "You have no new notifications")
        }
      />

      <FilterBar
        options={filterOptions}
        selectedOptions={selectedGenres}
        onOptionPress={handleFilterPress}
        isLoading={Object.values(animeDataLoading).some((loading) => loading)}
      />

      <AnimeGrid
        animeList={animeList}
        onAnimePress={handleAnimePress}
        onAddToList={(anime) => handleAddToList(anime, "watchlist")}
        onFavorite={handleFavorite}
        refreshing={isRefreshing}
        onRefresh={() => loadAnime(true)}
        numColumns={2}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSocialLogin={handleSocialLogin}
      />

      <MenuDrawer
        visible={showMenuDrawer}
        onClose={() => setShowMenuDrawer(false)}
        isAuthenticated={!!user}
        username={user?.email?.split('@')[0] || 'Guest'}
        onMenuItemPress={handleMenuItemPress}
      />

      <BottomNavigation
        currentRoute="/"
        activeTab="home"
        onTabChange={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
