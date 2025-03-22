import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Trash2,
  Star,
  Info,
  BookmarkIcon,
  Eye,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/context/AuthContext";

type UUID = string;

interface AnimeItem {
  id: UUID;
  title: string;
  imageUrl: string;
  rating: number;
  addedDate: string;
  genres?: string[];
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Mock function to fetch favorites
  const fetchFavorites = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockFavorites: AnimeItem[] = [
        {
          id: "1",
          title: "Attack on Titan",
          imageUrl:
            "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
          rating: 4.8,
          addedDate: "2023-10-20",
          genres: ["Action", "Drama", "Fantasy"],
        },
        {
          id: "3",
          title: "Demon Slayer",
          imageUrl:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
          rating: 4.9,
          addedDate: "2023-09-15",
          genres: ["Action", "Fantasy", "Horror"],
        },
        {
          id: "6",
          title: "Naruto Shippuden",
          imageUrl:
            "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
          rating: 4.5,
          addedDate: "2023-11-05",
          genres: ["Action", "Adventure", "Fantasy"],
        },
        {
          id: "8",
          title: "Fullmetal Alchemist: Brotherhood",
          imageUrl:
            "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
          rating: 4.9,
          addedDate: "2023-08-10",
          genres: ["Action", "Adventure", "Drama"],
        },
      ];
      setFavorites(mockFavorites);
      setLoading(false);
    }, 1000);
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle anime press
  const handleAnimePress = (anime: AnimeItem) => {
    Alert.alert("Anime Details", `Viewing details for ${anime.title}`);
  };

  // Handle remove from favorites
  const handleRemoveFromFavorites = (anime: AnimeItem) => {
    Alert.alert(
      "Remove from Favorites",
      `Are you sure you want to remove "${anime.title}" from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            // Remove from favorites
            setFavorites(favorites.filter((item) => item.id !== anime.id));
            Alert.alert("Success", `"${anime.title}" removed from favorites`);
          },
          style: "destructive",
        },
      ],
    );
  };

  // Handle add to list
  const handleAddToList = (anime: AnimeItem, listType: string) => {
    Alert.alert("Success", `"${anime.title}" added to ${listType}`);
  };

  // Render anime item
  const renderAnimeItem = ({ item }: { item: AnimeItem }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
      onPress={() => handleAnimePress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: 80, height: 112, borderRadius: 6 }}
        resizeMode="cover"
      />

      <View
        style={{ flex: 1, marginLeft: 12, justifyContent: "space-between" }}
      >
        <View>
          <Text
            style={{ color: colors.text, fontWeight: "600" }}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={{ color: colors.text, fontSize: 12, marginLeft: 4 }}>
              {item.rating}
            </Text>
          </View>

          <Text
            style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
          >
            Added: {new Date(item.addedDate).toLocaleDateString()}
          </Text>

          {item.genres && item.genres.length > 0 && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}
            >
              {item.genres.slice(0, 2).map((genre) => (
                <View
                  key={genre}
                  style={{
                    backgroundColor: colors.cardHover,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginRight: 4,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                    {genre}
                  </Text>
                </View>
              ))}
              {item.genres.length > 2 && (
                <View
                  style={{
                    backgroundColor: colors.cardHover,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                    +{item.genres.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.cardHover,
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginRight: 8,
            }}
            onPress={() => handleAddToList(item, "Watchlist")}
          >
            <BookmarkIcon size={12} color={colors.warning} />
            <Text style={{ color: colors.text, fontSize: 10, marginLeft: 4 }}>
              Watchlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.cardHover,
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
            onPress={() => handleAddToList(item, "Watching")}
          >
            <Eye size={12} color={colors.primary} />
            <Text style={{ color: colors.text, fontSize: 10, marginLeft: 4 }}>
              Watch
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => handleRemoveFromFavorites(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 80,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
            Loading favorites...
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 80,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.cardHover,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Heart size={32} color={colors.error} />
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          No favorites yet
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        >
          Start adding anime to your favorites to see them here
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginTop: 16,
          }}
          onPress={() => router.push("/")}
        >
          <Text style={{ color: "#FFFFFF" }}>Browse Anime</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            width: "100%",
            height: 60,
            backgroundColor: colors.background,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
          >
            Favorites
          </Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Info", "These are your favorite anime")}
          >
            <Info size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Favorites List */}
        <FlatList
          data={favorites}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 80, // Add padding for bottom navigation
          }}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={fetchFavorites}
          refreshing={loading}
        />

        <BottomNavigation
          currentRoute="/favorites"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
    </SafeAreaView>
  );
}
