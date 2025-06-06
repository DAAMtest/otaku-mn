import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Calendar,
  Star,
  Tag,
  FileText,
  Image as ImageIcon,
} from "lucide-react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useGenreStore } from "@/src/store/genreStore";
import { useAdminAnimeStore, AdminAnime } from "@/src/store/adminAnimeStore";

// Using AdminAnime type from adminAnimeStore

export default function AnimeManagement() {
  const router = useRouter();
  const { user, session } = useAuthStore();
  const {
    animeList,
    loading,
    error,
    fetchAnimeList,
    addAnime,
    updateAnime,
    deleteAnime,
  } = useAdminAnimeStore();
  const { genres, fetchGenres } = useGenreStore();
  const [filteredAnimeList, setFilteredAnimeList] = useState<AdminAnime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAnime, setCurrentAnime] = useState<AdminAnime>({
    id: "",
    title: "",
    image_url: "",
    rating: 0,
    description: "",
    release_date: new Date().toISOString().split("T")[0],
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  // Check authentication and fetch anime list on component mount
  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchAnimeList();
    fetchGenres();
  }, [session, router]);

  // Filter anime list when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnimeList(animeList);
    } else {
      const filtered = animeList.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredAnimeList(filtered);
    }
  }, [searchQuery, animeList]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle add new anime
  const handleAddAnime = () => {
    setEditMode(false);
    setCurrentAnime({
      id: "",
      title: "",
      image_url: "",
      rating: 0,
      description: "",
      release_date: new Date().toISOString().split("T")[0],
    });
    setSelectedGenres([]);
    setSelectedGenreIds([]);
    setModalVisible(true);
  };

  // Handle edit anime
  const handleEditAnime = (anime: AdminAnime) => {
    setEditMode(true);
    setCurrentAnime(anime);
    setSelectedGenres(anime.genres || []);

    // Find genre IDs based on names
    const genreIds =
      anime.genres
        ?.map((genreName) => {
          const genre = genres.find((g) => g.name === genreName);
          return genre?.id || "";
        })
        .filter((id) => id !== "") || [];

    setSelectedGenreIds(genreIds);
    setModalVisible(true);
  };

  // Handle delete anime
  const handleDeleteAnime = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this anime?")) {
        deleteAnime(id).then(({ error }) => {
          if (error) {
            window.alert(`Failed to delete anime: ${error.message}`);
          } else {
            window.alert("Anime deleted successfully");
          }
        });
      }
    } else {
      Alert.alert(
        "Delete Anime",
        "Are you sure you want to delete this anime?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              const { error } = await deleteAnime(id);
              if (error) {
                Alert.alert(
                  "Error",
                  `Failed to delete anime: ${error.message}`,
                );
              } else {
                Alert.alert("Success", "Anime deleted successfully");
              }
            },
            style: "destructive",
          },
        ],
      );
    }
  };

  // Handle save anime
  const handleSaveAnime = async () => {
    // Validate form
    if (!currentAnime.title.trim()) {
      if (Platform.OS === "web") {
        window.alert("Title is required");
      } else {
        Alert.alert("Error", "Title is required");
      }
      return;
    }

    if (!currentAnime.image_url.trim()) {
      if (Platform.OS === "web") {
        window.alert("Image URL is required");
      } else {
        Alert.alert("Error", "Image URL is required");
      }
      return;
    }

    try {
      if (editMode) {
        // Update existing anime
        const { error } = await updateAnime(currentAnime, selectedGenreIds);
        if (error) throw error;
      } else {
        // Insert new anime
        const { error, id } = await addAnime(currentAnime, selectedGenreIds);
        if (error) throw error;
      }

      setModalVisible(false);
      if (Platform.OS === "web") {
        window.alert(
          editMode ? "Anime updated successfully" : "Anime added successfully",
        );
      } else {
        Alert.alert(
          "Success",
          editMode ? "Anime updated successfully" : "Anime added successfully",
        );
      }
    } catch (error) {
      console.error("Error saving anime:", error);
      if (Platform.OS === "web") {
        window.alert("Failed to save anime");
      } else {
        Alert.alert("Error", "Failed to save anime");
      }
    }
  };

  // Toggle genre selection
  const toggleGenre = (genreName: string, genreId: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreName)) {
        return prev.filter((g) => g !== genreName);
      } else {
        return [...prev, genreName];
      }
    });

    setSelectedGenreIds((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  // Render anime item
  const renderAnimeItem = ({ item }: { item: AdminAnime }) => (
    <View className="flex-row bg-gray-800 rounded-lg p-3 mb-3">
      <Image
        source={{ uri: item.image_url }}
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
            Released: {new Date(item.release_date).toLocaleDateString()}
          </Text>

          {item.genres && item.genres.length > 0 && (
            <View className="flex-row flex-wrap mt-1">
              {item.genres.slice(0, 2).map((genre) => (
                <View
                  key={genre}
                  className="bg-gray-700 rounded-full px-2 py-0.5 mr-1 mt-1"
                >
                  <Text className="text-gray-300 text-xs">{genre}</Text>
                </View>
              ))}
              {item.genres.length > 2 && (
                <View className="bg-gray-700 rounded-full px-2 py-0.5 mt-1">
                  <Text className="text-gray-300 text-xs">
                    +{item.genres.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View className="justify-center space-y-2">
        <TouchableOpacity
          className="bg-blue-600/30 p-2 rounded-full"
          onPress={() => handleEditAnime(item)}
        >
          <Edit size={16} color="#60A5FA" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-600/30 p-2 rounded-full"
          onPress={() => handleDeleteAnime(item.id)}
        >
          <Trash2 size={16} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar style="light" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Anime Management</Text>
          <TouchableOpacity onPress={handleAddAnime}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search anime..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Anime List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#40C057" />
            <Text className="text-gray-400 mt-4">Loading anime...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAnimeList}
            renderItem={renderAnimeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400 text-lg">
                  {searchQuery
                    ? "No anime found matching your search"
                    : "No anime available"}
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-green-600 px-4 py-2 rounded-lg"
                  onPress={handleAddAnime}
                >
                  <Text className="text-white">Add New Anime</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Add/Edit Anime Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="w-[90%] bg-gray-900 rounded-xl p-4 max-h-[80%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">
                  {editMode ? "Edit Anime" : "Add New Anime"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1">
                {/* Title */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Title</Text>
                  <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                    <FileText size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="Anime title"
                      placeholderTextColor="#9CA3AF"
                      value={currentAnime.title}
                      onChangeText={(text) =>
                        setCurrentAnime({ ...currentAnime, title: text })
                      }
                    />
                  </View>
                </View>

                {/* Image URL */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Image URL</Text>
                  <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                    <ImageIcon size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="https://example.com/image.jpg"
                      placeholderTextColor="#9CA3AF"
                      value={currentAnime.image_url}
                      onChangeText={(text) =>
                        setCurrentAnime({ ...currentAnime, image_url: text })
                      }
                    />
                  </View>
                </View>

                {/* Rating */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Rating (0-5)</Text>
                  <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                    <Star size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="4.5"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={currentAnime.rating.toString()}
                      onChangeText={(text) =>
                        setCurrentAnime({
                          ...currentAnime,
                          rating: parseFloat(text) || 0,
                        })
                      }
                    />
                  </View>
                </View>

                {/* Release Date */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Release Date</Text>
                  <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                    <Calendar size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                      value={currentAnime.release_date}
                      onChangeText={(text) =>
                        setCurrentAnime({ ...currentAnime, release_date: text })
                      }
                    />
                  </View>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Description</Text>
                  <View className="bg-gray-800 rounded-lg px-3 py-2">
                    <TextInput
                      className="text-white"
                      placeholder="Anime description"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={currentAnime.description}
                      onChangeText={(text) =>
                        setCurrentAnime({ ...currentAnime, description: text })
                      }
                    />
                  </View>
                </View>

                {/* Genres */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Genres</Text>
                  <View className="flex-row flex-wrap">
                    {genres.map((genre) => (
                      <TouchableOpacity
                        key={genre.id}
                        className={`m-1 px-3 py-1 rounded-full ${selectedGenres.includes(genre.name) ? "bg-purple-600" : "bg-gray-800"}`}
                        onPress={() => toggleGenre(genre.name, genre.id)}
                      >
                        <Text className="text-white">{genre.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="bg-green-600 rounded-lg py-3 items-center mt-4"
                onPress={handleSaveAnime}
              >
                <View className="flex-row items-center">
                  <Save size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2">
                    {editMode ? "Update Anime" : "Add Anime"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
