import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, SafeAreaView, StatusBar, Alert } from "react-native";
import { useRouter } from "expo-router";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import AnimeGrid from "./components/AnimeGrid";
import BottomNavigation from "./components/BottomNavigation";
import AuthModal from "./components/AuthModal";
import MenuDrawer from "./components/MenuDrawer";

interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  isFavorite: boolean;
  genres?: string[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [username, setUsername] = useState("Guest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentSortOrder, setCurrentSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [animeList, setAnimeList] = useState<Anime[]>([
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
        return a.rating - b.rating;
      } else {
        return b.rating - a.rating;
      }
    });
  }, [animeList, selectedGenres, currentSortOrder]);

  // Simulate loading state
  const [isLoading, setIsLoading] = useState(false);

  // No need for the useEffect since we're using useMemo now

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

    const anime = animeList.find((item) => item.id === id);
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

    setAnimeList((prevList) =>
      prevList.map((anime) =>
        anime.id === id ? { ...anime, isFavorite: !anime.isFavorite } : anime,
      ),
    );

    const anime = animeList.find((item) => item.id === id);
    if (anime) {
      const action = anime.isFavorite ? "removed from" : "added to";
      Alert.alert("Favorites", `"${anime.title}" ${action} favorites`);
    }
  };

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
  const handleLoadMore = () => {
    if (!isLoading) {
      setIsLoading(true);
      // Simulate loading more data
      setTimeout(() => {
        setIsLoading(false);
        // Add more anime to the list if needed
        Alert.alert("End of List", "No more anime to load");
      }, 1500);
    }
  };

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

      // Show a toast or some indication that refresh is complete
      Alert.alert(
        "Refreshed",
        "Content updated with latest anime",
        [{ text: "OK", onPress: () => {} }],
        { cancelable: true },
      );
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

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        <Header
          onProfilePress={handleProfilePress}
          onSearchPress={handleSearchPress}
          onMenuPress={handleMenuPress}
          onNotificationPress={() => handleMenuItemPress("notifications")}
          isAuthenticated={isAuthenticated}
          hasNotifications={false}
        />
        <FilterBar
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onFilterButtonPress={handleFilterButtonPress}
        />
        <View className="flex-1 pb-[70px]">
          <AnimeGrid
            data={filteredAnimeList}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            onAnimePress={handleAnimePress}
            onAddToList={handleAddToList}
            onFavorite={handleFavorite}
          />
        </View>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {showAuthModal && (
          <AuthModal
            visible={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onSocialLogin={handleSocialLogin}
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
