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
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Anime {
  id: string;
  title: string;
  image_url: string;
  rating: number;
  description: string;
  release_date: string;
  genres?: string[];
}

export default function AnimeManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAnime, setCurrentAnime] = useState<Anime>({
    id: "",
    title: "",
    image_url: "",
    rating: 0,
    description: "",
    release_date: new Date().toISOString().split("T")[0],
  });
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Fetch anime list on component mount
  useEffect(() => {
    fetchAnimeList();
    fetchGenres();
  }, []);

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

  // Fetch anime list from Supabase
  const fetchAnimeList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres(genres(id, name))
        `,
        )
        .order("title");

      if (error) throw error;

      const formattedData = data.map((item) => ({
        ...item,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
      }));

      setAnimeList(formattedData);
      setFilteredAnimeList(formattedData);
    } catch (error) {
      console.error("Error fetching anime:", error);
      Alert.alert("Error", "Failed to fetch anime list");
    } finally {
      setLoading(false);
    }
  };

  // Fetch genres from Supabase
  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from("genres")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setGenres(data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

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
    setModalVisible(true);
  };

  // Handle edit anime
  const handleEditAnime = (anime: Anime) => {
    setEditMode(true);
    setCurrentAnime(anime);
    setSelectedGenres(anime.genres || []);
    setModalVisible(true);
  };

  // Handle delete anime
  const handleDeleteAnime = (id: string) => {
    Alert.alert("Delete Anime", "Are you sure you want to delete this anime?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            // First delete related records in anime_genres
            const { error: genresError } = await supabase
              .from("anime_genres")
              .delete()
              .eq("anime_id", id);

            if (genresError) throw genresError;

            // Then delete the anime
            const { error } = await supabase
              .from("anime")
              .delete()
              .eq("id", id);

            if (error) throw error;

            // Update the local state
            setAnimeList(animeList.filter((anime) => anime.id !== id));
            Alert.alert("Success", "Anime deleted successfully");
          } catch (error) {
            console.error("Error deleting anime:", error);
            Alert.alert("Error", "Failed to delete anime");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Handle save anime
  const handleSaveAnime = async () => {
    // Validate form
    if (!currentAnime.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    if (!currentAnime.image_url.trim()) {
      Alert.alert("Error", "Image URL is required");
      return;
    }

    try {
      let animeId = currentAnime.id;

      if (editMode) {
        // Update existing anime
        const { error } = await supabase
          .from("anime")
          .update({
            title: currentAnime.title,
            image_url: currentAnime.image_url,
            rating: currentAnime.rating,
            description: currentAnime.description,
            release_date: currentAnime.release_date,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentAnime.id);

        if (error) throw error;
      } else {
        // Insert new anime
        const { data, error } = await supabase
          .from("anime")
          .insert({
            title: currentAnime.title,
            image_url: currentAnime.image_url,
            rating: currentAnime.rating,
            description: currentAnime.description,
            release_date: currentAnime.release_date,
          })
          .select("id")
          .single();

        if (error) throw error;
        animeId = data.id;
      }

      // Handle genres
      if (editMode) {
        // Delete existing genre relationships
        const { error: deleteError } = await supabase
          .from("anime_genres")
          .delete()
          .eq("anime_id", animeId);

        if (deleteError) throw deleteError;
      }

      // Add new genre relationships
      for (const genreName of selectedGenres) {
        const genre = genres.find((g) => g.name === genreName);
        if (genre) {
          const { error: insertError } = await supabase
            .from("anime_genres")
            .insert({
              anime_id: animeId,
              genre_id: genre.id,
            });

          if (insertError) throw insertError;
        }
      }

      // Refresh anime list
      await fetchAnimeList();
      setModalVisible(false);
      Alert.alert(
        "Success",
        editMode ? "Anime updated successfully" : "Anime added successfully",
      );
    } catch (error) {
      console.error("Error saving anime:", error);
      Alert.alert("Error", "Failed to save anime");
    }
  };

  // Toggle genre selection
  const toggleGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName],
    );
  };

  // Render anime item
  const renderAnimeItem = ({ item }: { item: Anime }) => (
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
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
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
            <ActivityIndicator size="large" color="#6366F1" />
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
                  className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
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
                        onPress={() => toggleGenre(genre.name)}
                      >
                        <Text className="text-white">{genre.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="bg-blue-600 rounded-lg py-3 items-center mt-4"
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
