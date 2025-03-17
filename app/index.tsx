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

type Tables = Database["public"]["Tables"];
type Anime = Tables["anime"]["Row"] & {
  is_favorite?: boolean;
  genres?: string[];
};

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">("desc");

  // Define filter options
  const filterOptions = useMemo(() => [
    { id: "action", label: "Action", value: "Action" },
    { id: "adventure", label: "Adventure", value: "Adventure" },
    { id: "comedy", label: "Comedy", value: "Comedy" },
    { id: "drama", label: "Drama", value: "Drama" },
    { id: "fantasy", label: "Fantasy", value: "Fantasy" },
    { id: "horror", label: "Horror", value: "Horror" },
    { id: "scifi", label: "Sci-Fi", value: "Sci-Fi" }
  ], []);

  // Get current route for bottom navigation
  const currentRoute = useMemo(() => {
    if (pathname === "/") return "/";
    if (pathname.startsWith("/search")) return "/search";
    if (pathname.startsWith("/favorites")) return "/favorites";
    if (pathname.startsWith("/profile")) return "/profile";
    return "/";
  }, [pathname]);

  const [animeList, setAnimeList] = useState<Anime[]>([
    {
      id: "1",
      title: "Attack on Titan",
      image_url: "https://images.unsplash.com/photo-1541562232579-512a21325720?w=400&q=80",
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
      image_url: "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
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
      image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
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
      image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
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
      image_url: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
      rating: 4.8,
      is_favorite: false,
      description: "A high school student joins a secret organization of Jujutsu Sorcerers",
      release_date: "2020-10-03",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Fantasy", "Horror"],
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      image_url: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
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
      image_url: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
      rating: 4.3,
      is_favorite: false,
      description: "A college student becomes half-ghoul after a fatal encounter",
      release_date: "2014-07-04",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Drama", "Horror"],
    },
    {
      id: "8",
      title: "Fullmetal Alchemist: Brotherhood",
      image_url: "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
      rating: 4.9,
      is_favorite: true,
      description: "Two brothers seek the philosopher's stone",
      release_date: "2009-04-05",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genres: ["Action", "Adventure", "Drama"],
    },
  ]);

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

  // Simulate loading state
  const [isLoading, setIsLoading] = useState(false);

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
  const handleAnimePress = useCallback((anime: Anime) => {
    console.log(`Anime pressed: ${anime.id}`);
    // Navigate to anime details
    Alert.alert("Anime Details", `Viewing details for anime: ${anime.title}`);
  }, []);

  // Handle add to list
  const handleAddToList = useCallback((anime: Anime) => {
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
  }, [isAuthenticated]);

  // Handle favorite toggle
  const handleFavorite = useCallback((anime: Anime) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setAnimeList((prevList) =>
      prevList.map((item) =>
        item.id === anime.id ? { ...item, is_favorite: !item.is_favorite } : item,
      ),
    );

    const action = anime.is_favorite ? "removed from" : "added to";
    Alert.alert("Favorites", `"${anime.title}" ${action} favorites`);
  }, [isAuthenticated]);

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

  // Handle refresh with pull-to-refresh gesture
  const handleRefresh = useCallback(() => {
    console.log("Refreshing anime list");
    setIsLoading(true);

    // Provide haptic feedback for refresh
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }

    // Simulate refresh with API call
    setTimeout(() => {
      // Shuffle the anime list to simulate new data
      setAnimeList((prev) => [...prev].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1500);
  }, []);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#171717' }}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <View style={{ flex: 1 }}>
        <Header 
          title="AnimeTempo"
          showBack={false}
          showSearch={true}
          showNotifications={true}
          showMenu={true}
          onSearchPress={handleSearchPress}
          onNotificationsPress={() => handleMenuItemPress("notifications")}
          onMenuPress={handleMenuPress}
        />
        <FilterBar
          filters={filterOptions.map(option => option.value)}
          selectedFilters={selectedGenres}
          onFilterPress={(filter) => {
            // Toggle the filter in the selectedGenres array
            if (selectedGenres.includes(filter)) {
              handleFilterChange(selectedGenres.filter(genre => genre !== filter));
            } else {
              handleFilterChange([...selectedGenres, filter]);
            }
          }}
          isLoading={isLoading}
        />
        <View style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? 80 : 60 }}>
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
      </View>
    </SafeAreaView>
  );
}
