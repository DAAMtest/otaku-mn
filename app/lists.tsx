import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Eye,
  BookmarkIcon,
  Heart,
  Award,
  Clock,
  MoreVertical,
  Star,
} from "lucide-react-native";
import BottomNavigation from "./components/BottomNavigation";

interface AnimeListItem {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  progress?: number; // For currently watching
  addedDate: string;
}

export default function ListsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("lists");
  const [selectedList, setSelectedList] = useState("watching");

  // Mock data for different lists
  const lists = {
    watching: [
      {
        id: "1",
        title: "Attack on Titan",
        imageUrl:
          "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
        rating: 4.8,
        progress: 75, // 75% complete
        addedDate: "2024-03-01",
      },
      {
        id: "3",
        title: "Demon Slayer",
        imageUrl:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        rating: 4.9,
        progress: 40,
        addedDate: "2024-02-15",
      },
      {
        id: "5",
        title: "Jujutsu Kaisen",
        imageUrl:
          "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
        rating: 4.8,
        progress: 90,
        addedDate: "2024-01-20",
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
      },
      {
        id: "6",
        title: "Naruto Shippuden",
        imageUrl:
          "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
        rating: 4.5,
        addedDate: "2023-11-05",
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
      },
      {
        id: "7",
        title: "Tokyo Ghoul",
        imageUrl:
          "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
        rating: 4.3,
        addedDate: "2024-01-15",
      },
    ],
    favorites: [
      {
        id: "1",
        title: "Attack on Titan",
        imageUrl:
          "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
        rating: 4.8,
        addedDate: "2023-10-20",
      },
      {
        id: "3",
        title: "Demon Slayer",
        imageUrl:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        rating: 4.9,
        addedDate: "2023-09-15",
      },
      {
        id: "8",
        title: "Fullmetal Alchemist: Brotherhood",
        imageUrl:
          "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
        rating: 4.9,
        addedDate: "2023-08-10",
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
      },
      {
        id: "6",
        title: "Naruto Shippuden",
        imageUrl:
          "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
        rating: 4.5,
        addedDate: "2024-03-05",
      },
      {
        id: "1",
        title: "Attack on Titan",
        imageUrl:
          "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
        rating: 4.8,
        addedDate: "2024-03-01",
      },
    ],
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
    const anime = lists[listType as keyof typeof lists].find(
      (item) => item.id === id,
    );

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
              `Current progress: ${anime.progress}%`,
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
        text:
          listType === "favorites"
            ? "Remove from Favorites"
            : "Add to Favorites",
        onPress: () =>
          Alert.alert(
            "Success",
            `${anime.title} ${listType === "favorites" ? "removed from" : "added to"} favorites`,
          ),
      },
      {
        text: "Remove from List",
        onPress: () =>
          Alert.alert("Success", `${anime.title} removed from ${listType}`),
      },
    );

    Alert.alert(anime.title, "Select an option", [
      { text: "Cancel", style: "cancel" },
      ...options,
    ]);
  };

  // Render list item
  const renderListItem = ({
    item,
    index,
  }: {
    item: AnimeListItem;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        className="flex-row bg-gray-800 rounded-lg p-3 mb-3"
        onPress={() => handleListItemPress(item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-28 rounded-md"
          resizeMode="cover"
        />

        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="text-white font-semibold" numberOfLines={2}>
              {item.title}
            </Text>

            <View className="flex-row items-center mt-1">
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text className="text-white text-xs ml-1">{item.rating}</Text>
            </View>

            <Text className="text-gray-400 text-xs mt-1">
              Added: {new Date(item.addedDate).toLocaleDateString()}
            </Text>
          </View>

          {selectedList === "watching" && item.progress !== undefined && (
            <View className="mt-2">
              <View className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </View>
              <Text className="text-gray-400 text-xs mt-1">
                {item.progress}% complete
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="justify-center p-2"
          onPress={() => handleListItemOptions(item.id, selectedList)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Get current list data
  const getCurrentListData = () => {
    return lists[selectedList as keyof typeof lists] || [];
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
      case "favorites":
        return "Favorites";
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
        return Eye;
      case "completed":
        return Award;
      case "watchlist":
        return BookmarkIcon;
      case "favorites":
        return Heart;
      case "history":
        return Clock;
      default:
        return BookmarkIcon;
    }
  };

  const ListIcon = getListIcon();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">My Lists</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>

        {/* List Type Tabs */}
        <View className="w-full bg-gray-900 border-b border-gray-800">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
            className="py-2"
          >
            <TouchableOpacity
              className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${selectedList === "watching" ? "bg-blue-600" : "bg-gray-800"}`}
              onPress={() => setSelectedList("watching")}
            >
              <Eye size={16} color="#FFFFFF" />
              <Text className="text-white ml-1">Watching</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${selectedList === "completed" ? "bg-green-600" : "bg-gray-800"}`}
              onPress={() => setSelectedList("completed")}
            >
              <Award size={16} color="#FFFFFF" />
              <Text className="text-white ml-1">Completed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${selectedList === "watchlist" ? "bg-yellow-600" : "bg-gray-800"}`}
              onPress={() => setSelectedList("watchlist")}
            >
              <BookmarkIcon size={16} color="#FFFFFF" />
              <Text className="text-white ml-1">Watchlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${selectedList === "favorites" ? "bg-red-600" : "bg-gray-800"}`}
              onPress={() => setSelectedList("favorites")}
            >
              <Heart size={16} color="#FFFFFF" />
              <Text className="text-white ml-1">Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-4 py-2 mx-1 rounded-full flex-row items-center ${selectedList === "history" ? "bg-purple-600" : "bg-gray-800"}`}
              onPress={() => setSelectedList("history")}
            >
              <Clock size={16} color="#FFFFFF" />
              <Text className="text-white ml-1">History</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* List Content */}
        <View className="flex-1 p-4 pb-[70px]">
          <View className="flex-row items-center mb-4">
            <ListIcon size={20} color="#FFFFFF" />
            <Text className="text-white text-lg font-bold ml-2">
              {getListTitle()}
            </Text>
            <Text className="text-gray-400 ml-2">
              ({getCurrentListData().length})
            </Text>
          </View>

          {getCurrentListData().length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400 text-lg">
                No items in this list
              </Text>
              <TouchableOpacity
                className="mt-4 bg-blue-600 px-4 py-2 rounded-full"
                onPress={() => router.push("/")}
              >
                <Text className="text-white">Browse Anime</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={getCurrentListData()}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
