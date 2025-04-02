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
  Tag,
  Film,
} from "lucide-react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useGenreStore, Genre } from "@/src/store/genreStore";

// Using Genre type from genreStore

/**
 * Genre management screen for administrators.
 * Allows CRUD operations on anime genres with proper error handling.
 */
export default function GenreManagement() {
  const router = useRouter();
  const { session } = useAuthStore();
  const {
    genres,
    loading,
    error,
    fetchGenres,
    addGenre,
    updateGenre,
    deleteGenre,
  } = useGenreStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [genreName, setGenreName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchGenres();
  }, [session]);

  const handleAddGenre = async () => {
    if (!genreName.trim()) {
      Alert.alert("Error", "Genre name is required");
      return;
    }

    const { error } = await addGenre(genreName, description);

    if (error) {
      Alert.alert("Error", `Failed to add genre: ${error.message}`);
      return;
    }

    setIsModalVisible(false);
    setGenreName("");
    setDescription("");
  };

  const handleEditGenre = async () => {
    if (!editingGenre || !genreName.trim()) {
      Alert.alert("Error", "Genre name is required");
      return;
    }

    const { error } = await updateGenre(
      editingGenre.id,
      genreName,
      description,
    );

    if (error) {
      Alert.alert("Error", `Failed to update genre: ${error.message}`);
      return;
    }

    setIsModalVisible(false);
    setEditingGenre(null);
    setGenreName("");
    setDescription("");
  };

  const handleDeleteGenre = async (genre: Genre) => {
    const { error } = await deleteGenre(genre.id);

    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  const filteredGenres = genres.filter(
    (genre) =>
      genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (genre.description &&
        genre.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const renderItem = ({ item: genre }: { item: Genre }) => (
    <View className="flex-row items-center justify-between bg-gray-800 rounded-lg p-4 mb-2">
      <View className="flex-1">
        <Text className="text-white text-lg font-semibold">{genre.name}</Text>
        {genre.description && (
          <Text className="text-gray-400 mt-1">{genre.description}</Text>
        )}
        <View className="flex-row items-center mt-2">
          <Film size={16} color="#9CA3AF" />
          <Text className="text-gray-400 ml-1">{genre.anime_count} anime</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => {
            setEditingGenre(genre);
            setGenreName(genre.name);
            setDescription(genre.description || "");
            setIsModalVisible(true);
          }}
          className="p-2"
        >
          <Edit size={20} color="#60A5FA" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Genre",
              `Are you sure you want to delete "${genre.name}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  onPress: () => handleDeleteGenre(genre),
                  style: "destructive",
                },
              ],
            );
          }}
          className="p-2"
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" />
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Manage Genres</Text>
      </View>

      <View className="flex-row items-center p-4">
        <View className="flex-1 flex-row items-center bg-gray-800 rounded-lg px-4 py-2 mr-2">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search genres..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-white"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            setEditingGenre(null);
            setGenreName("");
            setDescription("");
            setIsModalVisible(true);
          }}
          className="bg-indigo-600 p-2 rounded-lg"
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#60A5FA" />
        </View>
      ) : (
        <FlatList
          data={filteredGenres}
          renderItem={renderItem}
          keyExtractor={(genre) => genre.id}
          contentContainerClassName="p-4"
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Tag size={48} color="#4B5563" />
              <Text className="text-gray-400 text-lg mt-4">
                {searchQuery
                  ? "No genres found matching your search"
                  : "No genres added yet"}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-gray-800 w-full max-w-sm rounded-lg p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-semibold">
                {editingGenre ? "Edit Genre" : "Add Genre"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="p-2"
              >
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Genre name"
              placeholderTextColor="#9CA3AF"
              value={genreName}
              onChangeText={setGenreName}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4"
            />

            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4"
            />

            <TouchableOpacity
              onPress={editingGenre ? handleEditGenre : handleAddGenre}
              className="bg-indigo-600 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                {editingGenre ? "Save Changes" : "Add Genre"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
