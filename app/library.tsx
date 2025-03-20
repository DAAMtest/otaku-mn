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
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Eye,
  BookmarkIcon,
  Heart,
  Award,
  Clock,
  MoreVertical,
  Star,
  Filter,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/context/AuthContext";

interface AnimeListItem {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  progress?: number; // For currently watching
  addedDate: string;
  genres?: string[];
}

export default function LibraryScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState("library");
  const [selectedList, setSelectedList] = useState(params.tab || "watching");
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<Record<string, AnimeListItem[]>>({});

  // Fetch lists on component mount
  useEffect(() => {
    fetchLists();
  }, []);

  // Update selected list when params change
  useEffect(() => {
    if (params.tab) {
      setSelectedList(params.tab);
    }
  }, [params.tab]);

  // Mock function to fetch lists
  const fetchLists = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockLists: Record<string, AnimeListItem[]> = {
        watching: [
          {
            id: "1",
            title: "Attack on Titan",
            imageUrl:
              "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
            rating: 4.8,
            progress: 75, // 75% complete
            addedDate: "2024-03-01",
            genres: ["Action", "Drama", "Fantasy"],
          },
          {
            id: "3",
            title: "Demon Slayer",
            imageUrl:
              "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
            rating: 4.9,
            progress: 40,
            addedDate: "2024-02-15",
            genres: ["Action", "Fantasy", "Horror"],
          },
          {
            id: "5",
            title: "Jujutsu Kaisen",
            imageUrl:
              "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
            rating: 4.8,
            progress: 90,
            addedDate: "2024-01-20",
            genres: ["Action", "Fantasy", "Horror"],
          },
        ],
        completed: [
          {
            id: "2",
            title: "My Hero Academia",
            imageUrl:
              "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
            rating: 4.6,
            addedDate: "2023-12-10",
            genres: ["Action", "Comedy", "Sci-Fi"],
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
        ],
        watchlist: [
          {
            id: "4",
            title: "One Piece",
            imageUrl:
              "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
            rating: 4.7,
            addedDate: "2024-02-28",
            genres: ["Action", "Adventure", "Comedy"],
          },
          {
            id: "7",
            title: "Tokyo Ghoul",
            imageUrl:
              "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
            rating: 4.3,
            addedDate: "2024-01-15",
            genres: ["Action", "Drama", "Horror"],
          },
        ],
        history: [
          {
            id: "2",
            title: "My Hero Academia",
            imageUrl:
              "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
            rating: 4.6,
            addedDate: "2024-03-10",
            genres: ["Action", "Comedy", "Sci-Fi"],
          },
          {
            id: "6",
            title: "Naruto Shippuden",
            imageUrl:
              "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
            rating: 4.5,
            addedDate: "2024-03-05",
            genres: ["Action", "Adventure", "Fantasy"],
          },
          {
            id: "1",
            title: "Attack on Titan",
            imageUrl:
              "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
            rating: 4.8,
            addedDate: "2024-03-01",
            genres: ["Action", "Drama", "Fantasy"],
          },
        ],
      };
      setLists(mockLists);
      setLoading(false);
    }, 1000);
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle list item press
  const handleListItemPress = (id: string) => {
    Alert.alert("Anime Details", `Viewing details for anime ID: ${id}`);
  };

  // Handle list item options
  const handleListItemOptions = (id: string, listType: string) => {
    const anime = lists[listType]?.find(
      (item) => item.id === id,
    ) as AnimeListItem;

    if (!anime) return;

    const options = [];

    if (listType === "watching") {
      options.push(
        {
          text: "Mark as Completed",
          onPress: () =>
            Alert.alert("Success", `${anime.title} marked as completed`),
        },
        {
          text: "Update Progress",
          onPress: () =>
            Alert.alert(
              "Update Progress",
              `Current progress: ${anime.progress ?? 0}%`,
            ),
        },
      );
    }

    if (listType === "watchlist") {
      options.push({
        text: "Start Watching",
        onPress: () =>
          Alert.alert("Success", `${anime.title} moved to Currently Watching`),
      });
    }

    options.push(
      {
        text: "Add to Favorites",
        onPress: () =>
          Alert.alert("Success", `${anime.title} added to favorites`),
      },
      {
        text: "Remove from List",
        onPress: () => {
          // Remove from list
          setLists({
            ...lists,
            [listType]: lists[listType].filter((item) => item.id !== id),
          });
          Alert.alert("Success", `${anime.title} removed from ${listType}`);
        },
        style: "destructive",
      },
    );

    Alert.alert(anime.title, "Select an option", [
      { text: "Cancel", style: "cancel" },
      ...options,
    ]);
  };

  // Render list item
  const renderListItem = ({ item }: { item: AnimeListItem }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
        onPress={() => handleListItemPress(item.id)}
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
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={{ color: colors.text, fontSize: 12, marginLeft: 4 }}>
                {item.rating}
              </Text>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
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

          {selectedList === "watching" && item.progress !== undefined && (
            <View style={{ marginTop: 8 }}>
              <View
                style={{
                  width: "100%",
                  height: 4,
                  backgroundColor: colors.cardHover,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: colors.primary,
                    borderRadius: 2,
                    width: `${item.progress}%`,
                  }}
                />
              </View>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                {item.progress}% complete
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={{ justifyContent: "center", padding: 8 }}
          onPress={() => handleListItemOptions(item.id, selectedList)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={20} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Get current list data
  const getCurrentListData = () => {
    return lists[selectedList] || [];
  };

  // Get list title
  const getListTitle = () => {
    switch (selectedList) {
      case "watching":
        return "Currently Watching";
      case "completed":
        return "Completed";
      case "watchlist":
        return "Watchlist";
      case "history":
        return "Watch History";
      default:
        return "My Lists";
    }
  };

  // Get list icon
  const getListIcon = () => {
    switch (selectedList) {
      case "watching":
        return <Eye size={20} color={colors.primary} />;
      case "completed":
        return <Award size={20} color={colors.success} />;
      case "watchlist":
        return <BookmarkIcon size={20} color={colors.warning} />;
      case "history":
        return <Clock size={20} color={colors.info} />;
      default:
        return <BookmarkIcon size={20} color={colors.primary} />;
    }
  };

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
            Loading anime...
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
          {getListIcon()}
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          No items in this list
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        >
          Start adding anime to your {selectedList} list
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
            My Library
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Filter", "Filter functionality coming soon")
            }
          >
            <Filter size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* List Type Tabs */}
        <View
          style={{
            width: "100%",
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
            style={{ paddingVertical: 8 }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  selectedList === "watching" ? colors.primary : colors.card,
              }}
              onPress={() => setSelectedList("watching")}
            >
              <Eye
                size={16}
                color={selectedList === "watching" ? "#FFFFFF" : colors.text}
              />
              <Text
                style={{
                  color: selectedList === "watching" ? "#FFFFFF" : colors.text,
                  marginLeft: 4,
                }}
              >
                Watching
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  selectedList === "completed" ? colors.success : colors.card,
              }}
              onPress={() => setSelectedList("completed")}
            >
              <Award
                size={16}
                color={selectedList === "completed" ? "#FFFFFF" : colors.text}
              />
              <Text
                style={{
                  color: selectedList === "completed" ? "#FFFFFF" : colors.text,
                  marginLeft: 4,
                }}
              >
                Completed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  selectedList === "watchlist" ? colors.warning : colors.card,
              }}
              onPress={() => setSelectedList("watchlist")}
            >
              <BookmarkIcon
                size={16}
                color={selectedList === "watchlist" ? "#FFFFFF" : colors.text}
              />
              <Text
                style={{
                  color: selectedList === "watchlist" ? "#FFFFFF" : colors.text,
                  marginLeft: 4,
                }}
              >
                Watchlist
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  selectedList === "history" ? colors.info : colors.card,
              }}
              onPress={() => setSelectedList("history")}
            >
              <Clock
                size={16}
                color={selectedList === "history" ? "#FFFFFF" : colors.text}
              />
              <Text
                style={{
                  color: selectedList === "history" ? "#FFFFFF" : colors.text,
                  marginLeft: 4,
                }}
              >
                History
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* List Content */}
        <View style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            {getListIcon()}
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 8,
              }}
            >
              {getListTitle()}
            </Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>
              ({getCurrentListData().length})
            </Text>
          </View>

          <FlatList
            data={getCurrentListData()}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={renderEmptyComponent}
            onRefresh={fetchLists}
            refreshing={loading}
          />
        </View>

        <BottomNavigation
          currentRoute="/library"
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>
    </SafeAreaView>
  );
}
