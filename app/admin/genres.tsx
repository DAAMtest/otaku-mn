import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
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
  Tag,
  Film,
} from "lucide-react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface Genre {
  id: string;
  name: string;
  created_at: string;
  anime_count?: number;
}

export default function GenreManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [filteredGenreList, setFilteredGenreList] = useState<Genre[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGenre, setCurrentGenre] = useState<Genre>({
    id: "",
    name: "",
    created_at: new Date().toISOString(),
  });

  // Fetch genre list on component mount
  useEffect(() => {
    fetchGenreList();
  }, []);

  // Filter genre list when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGenreList(genreList);
    } else {
      const filtered = genreList.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredGenreList(filtered);
    }
  }, [searchQuery, genreList]);

  // Fetch genre list from Supabase
  const fetchGenreList = async () => {
    setLoading(true);
    try {
      // First get all genres
      const { data: genreData, error: genreError } = await supabase
        .from("genres")
        .select("*")
        .order("name");

      if (genreError) throw genreError;

      // Then get anime count for each genre
      const { data: countData, error: countError } = await supabase
        .from("anime_genres")
        .select("genre_id, count", { count: "exact" })
        .group("genre_id");

      if (countError) throw countError;

      // Create a map of genre_id to count
      const countMap = new Map();
      countData.forEach((item) => {
        countMap.set(item.genre_id, parseInt(item.count));
      });

      // Combine the data
      const combinedData = genreData.map((genre) => ({
        ...genre,
        anime_count: countMap.get(genre.id) || 0,
      }));

      setGenreList(combinedData);
      setFilteredGenreList(combinedData);
    } catch (error) {
      console.error("Error fetching genres:", error);
      Alert.alert("Error", "Failed to fetch genre list");
    } finally {
      setLoading(false);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle add new genre
  const handleAddGenre = () => {
    setEditMode(false);
    setCurrentGenre({
      id: "",
      name: "",
      created_at: new Date().toISOString(),
    });
    setModalVisible(true);
  };

  // Handle edit genre
  const handleEditGenre = (genre: Genre) => {
    setEditMode(true);
    setCurrentGenre(genre);
    setModalVisible(true);
  };

  // Handle delete genre
  const handleDeleteGenre = (id: string, name: string, animeCount: number) => {
    if (animeCount > 0) {
      Alert.alert(
        "Cannot Delete",
        `The genre "${name}" is associated with ${animeCount} anime. Remove these associations first.`,
      );
      return;
    }

    Alert.alert(
      "Delete Genre",
      `Are you sure you want to delete the genre "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("genres")
                .delete()
                .eq("id", id);

              if (error) throw error;

              // Update the local state
              setGenreList(genreList.filter((genre) => genre.id !== id));
              Alert.alert("Success", "Genre deleted successfully");
            } catch (error) {
              console.error("Error deleting genre:", error);
              Alert.alert("Error", "Failed to delete genre");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  // Handle save genre
  const handleSaveGenre = async () => {
    // Validate form
    if (!currentGenre.name.trim()) {
      Alert.alert("Error", "Genre name is required");
      return;
    }

    try {
      if (editMode) {
        // Update existing genre
        const { error } = await supabase
          .from("genres")
          .update({
            name: currentGenre.name,
          })
          .eq("id", currentGenre.id);

        if (error) throw error;
      } else {
        // Insert new genre
        const { error } = await supabase.from("genres").insert({
          name: currentGenre.name,
        });

        if (error) throw error;
      }

      // Refresh genre list
      await fetchGenreList();
      setModalVisible(false);
      Alert.alert(
        "Success",
        editMode ? "Genre updated successfully" : "Genre added successfully",
      );
    } catch (error) {
      console.error("Error saving genre:", error);
      Alert.alert("Error", "Failed to save genre");
    }
  };

  // Render genre item
  const renderGenreItem = ({ item }: { item: Genre }) => (
    <View className="flex-row bg-gray-800 rounded-lg p-4 mb-3 items-center">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: "#8b5cf620" }}
      >
        <Tag size={18} color="#A78BFA" />
      </View>

      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{item.name}</Text>
        <View className="flex-row items-center mt-1">
          <Film size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1">
            {item.anime_count} anime
          </Text>
        </View>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          className="bg-blue-600/30 p-2 rounded-full mr-2"
          onPress={() => handleEditGenre(item)}
        >
          <Edit size={16} color="#60A5FA" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-600/30 p-2 rounded-full"
          onPress={() =>
            handleDeleteGenre(item.id, item.name, item.anime_count || 0)
          }
          disabled={item.anime_count && item.anime_count > 0}
          style={{
            opacity: item.anime_count && item.anime_count > 0 ? 0.5 : 1,
          }}
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
          <Text className="text-white font-bold text-lg">Genre Management</Text>
          <TouchableOpacity onPress={handleAddGenre}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search genres..."
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

        {/* Genre List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-gray-400 mt-4">Loading genres...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredGenreList}
            renderItem={renderGenreItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400 text-lg">
                  {searchQuery
                    ? "No genres found matching your search"
                    : "No genres available"}
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
                  onPress={handleAddGenre}
                >
                  <Text className="text-white">Add New Genre</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Add/Edit Genre Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="w-[90%] bg-gray-900 rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">
                  {editMode ? "Edit Genre" : "Add New Genre"}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Genre Name */}
              <View className="mb-4">
                <Text className="text-gray-300 mb-1">Genre Name</Text>
                <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                  <Tag size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 text-white ml-2"
                    placeholder="Enter genre name"
                    placeholderTextColor="#9CA3AF"
                    value={currentGenre.name}
                    onChangeText={(text) =>
                      setCurrentGenre({ ...currentGenre, name: text })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                className="bg-blue-600 rounded-lg py-3 items-center mt-4"
                onPress={handleSaveGenre}
              >
                <View className="flex-row items-center">
                  <Save size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2">
                    {editMode ? "Update Genre" : "Add Genre"}
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
