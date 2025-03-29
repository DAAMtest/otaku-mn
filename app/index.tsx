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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Initialize filter options from genres
  const filterOptions = useMemo(() => {
    return genres.map(genre => ({
      id: genre,
      label: genre,
      icon: "tag"
    }));
  }, [genres]);

  // Fetch genres when component mounts
  useEffect(() => {
    fetchGenres();
  }, []); // Empty dependency array to prevent infinite loop

  // Handle filter option press
  const handleFilterPress = useCallback((option: FilterOption) => {
    const genreId = option.id;
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  }, []);

  // Load anime when filters change
  useEffect(() => {
    loadAnime();
  }, [selectedGenres, currentSortOrder]);

  // Search function
  const searchAnime = useCallback(
    async (query: string, selectedGenres: string[] = []) => {
      try {
        setIsLoading(true);
        
        let queryBuilder = supabase
          .from("anime")
          .select(`
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
            anime_genres!inner(genres(name))
          `);

        if (query.trim()) {
          queryBuilder = queryBuilder.ilike("title", `%${query}%`);
        }

        if (selectedGenres.length > 0) {
          queryBuilder = queryBuilder
            .in("anime_genres.genres.name", selectedGenres);
        }

        queryBuilder = queryBuilder
          .order("popularity", { ascending: false })
          .order("title", { ascending: true });

        const { data, error } = await queryBuilder;

        if (error) throw error;

        const formattedData = (data || []).map((item: {
          id: string;
          title: string;
          image_url: string;
          rating: number | null;
          description: string | null;
          release_date: string | null;
          cover_image_url: string | null;
          release_year: number | null;
          season: string | null;
          status: string | null;
          popularity: number | null;
          anime_genres: Array<{ genres: { name: string } | null } | null>;
        }) => ({
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
          genres: (item.anime_genres || []).map((ag) => 
            ag && ag.genres && ag.genres.name ? ag.genres.name : null
          ).filter((name): name is string => name !== null),
          isFavorite: false,
        }));

        setTopAnime(formattedData);
        return formattedData;
      } catch (error) {
        console.error("Error in searchAnime:", error);
        Alert.alert("Error", "Failed to search anime");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update anime list when search results change
  useEffect(() => {
    setAnimeList(topAnime);
  }, [topAnime]);

  // Initialize anime list on mount
  useEffect(() => {
    loadAnime();
  }, []);

  // Handle anime press
  const handleAnimePress = useCallback(
    (anime: Anime) => {
      console.log(`Anime pressed: ${anime.id}`);
      // Navigate to anime details page
      router.push(`/anime/${anime.id}`);
    },
    [router],
  );

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
  const handleMenuItemPress: MenuDrawerProps['onMenuItemPress'] = (item) => {
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
          anime_id: anime.id
        })
        .select();

      if (error) throw error;

      Alert.alert("Success", "Anime added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add anime to favorites");
    }
  };

  const loadAnime = async () => {
    try {
      setIsLoading(true);
      
      let queryBuilder = supabase
        .from("anime")
        .select(`
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
          anime_genres!inner(genres(name))
        `);

      // Apply genre filter if genres are selected
      if (selectedGenres.length > 0) {
        queryBuilder = queryBuilder
          .in("anime_genres.genres.name", selectedGenres);
      }

      // Apply sort order
      queryBuilder = queryBuilder
        .order("popularity", { ascending: currentSortOrder === "asc" })
        .order("title", { ascending: true });

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const formattedData = (data || []).map((item: {
        id: string;
        title: string;
        image_url: string;
        rating: number | null;
        description: string | null;
        release_date: string | null;
        cover_image_url: string | null;
        release_year: number | null;
        season: string | null;
        status: string | null;
        popularity: number | null;
        anime_genres: Array<{ genres: { name: string } | null } | null>;
      }) => ({
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
        genres: (item.anime_genres || []).map((ag) => 
          ag && ag.genres && ag.genres.name ? ag.genres.name : null
        ).filter((name): name is string => name !== null),
        isFavorite: false,
      }));

      setAnimeList(formattedData);
    } catch (error) {
      console.error("Error loading anime:", error);
      Alert.alert("Error", "Failed to load anime list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onSearchPress={() => router.push("/search")}
        onNotificationsPress={() => Alert.alert("Notifications", "You have no new notifications")}
      />
      
      <FilterBar
        options={filterOptions}
        selectedOptions={selectedGenres}
        onOptionPress={handleFilterPress}
        isLoading={Object.values(animeDataLoading).some(loading => loading)}
      />

      <AnimeGrid
        animeList={animeList}
        onAnimePress={handleAnimePress}
        onAddToList={(anime) => handleAddToList(anime, "watchlist")}
        onFavorite={handleFavorite}
        refreshing={isRefreshing}
        onRefresh={loadAnime}
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
        isAuthenticated={isAuthenticated}
        username={username}
        onMenuItemPress={handleMenuItemPress}
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
