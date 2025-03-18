import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Tag,
  Star,
  Clock,
  Calendar,
  Info,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function BulkOperations() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState("json");
  const [importSource, setImportSource] = useState("file");
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Sample anime data for demonstration
  const animeList = [
    {
      id: "1",
      title: "Attack on Titan",
      genres: ["Action", "Drama", "Fantasy"],
      rating: 4.8,
      status: "Published",
      releaseDate: "2013-04-07",
    },
    {
      id: "2",
      title: "My Hero Academia",
      genres: ["Action", "Comedy", "Superhero"],
      rating: 4.6,
      status: "Published",
      releaseDate: "2016-04-03",
    },
    {
      id: "3",
      title: "Demon Slayer",
      genres: ["Action", "Fantasy", "Historical"],
      rating: 4.9,
      status: "Published",
      releaseDate: "2019-04-06",
    },
    {
      id: "4",
      title: "One Piece",
      genres: ["Action", "Adventure", "Comedy"],
      rating: 4.7,
      status: "Published",
      releaseDate: "1999-10-20",
    },
    {
      id: "5",
      title: "Jujutsu Kaisen",
      genres: ["Action", "Supernatural", "Horror"],
      rating: 4.8,
      status: "Published",
      releaseDate: "2020-10-03",
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      genres: ["Action", "Adventure", "Fantasy"],
      rating: 4.5,
      status: "Published",
      releaseDate: "2007-02-15",
    },
    {
      id: "7",
      title: "Tokyo Ghoul",
      genres: ["Action", "Horror", "Supernatural"],
      rating: 4.3,
      status: "Published",
      releaseDate: "2014-07-04",
    },
    {
      id: "8",
      title: "Fullmetal Alchemist: Brotherhood",
      genres: ["Action", "Adventure", "Fantasy"],
      rating: 4.9,
      status: "Published",
      releaseDate: "2009-04-05",
    },
  ];

  // All available genres from the anime list
  const allGenres = Array.from(
    new Set(animeList.flatMap((anime) => anime.genres)),
  ).sort();

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(animeList.map((anime) => anime.id));
    }
    setSelectAll(!selectAll);
  };

  // Filter anime list based on selected filters
  const filteredAnimeList = animeList.filter((anime) => {
    if (filterGenre && !anime.genres.includes(filterGenre)) {
      return false;
    }
    if (filterRating && anime.rating < filterRating) {
      return false;
    }
    return true;
  });

  // Handle bulk operation
  const handleBulkOperation = () => {
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select at least one item.");
      return;
    }

    if (operation === "delete") {
      Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete ${selectedItems.length} item(s)?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setIsLoading(true);
              // Simulate API call
              setTimeout(() => {
                Alert.alert(
                  "Success",
                  `${selectedItems.length} item(s) deleted successfully.`,
                );
                setSelectedItems([]);
                setSelectAll(false);
                setOperation(null);
                setIsLoading(false);
              }, 1500);
            },
          },
        ],
      );
    } else if (operation === "publish") {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          "Success",
          `${selectedItems.length} item(s) published successfully.`,
        );
        setSelectedItems([]);
        setSelectAll(false);
        setOperation(null);
        setIsLoading(false);
      }, 1500);
    } else if (operation === "unpublish") {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          "Success",
          `${selectedItems.length} item(s) unpublished successfully.`,
        );
        setSelectedItems([]);
        setSelectAll(false);
        setOperation(null);
        setIsLoading(false);
      }, 1500);
    } else if (operation === "export") {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        Alert.alert(
          "Export Complete",
          `${selectedItems.length} item(s) exported as ${exportFormat.toUpperCase()}.`,
        );
        setSelectedItems([]);
        setSelectAll(false);
        setOperation(null);
        setIsLoading(false);
      }, 1500);
    }
  };

  // Handle import operation
  const handleImport = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      Alert.alert("Import Complete", "Data imported successfully.");
      setImportSource("file");
      setIsLoading(false);
    }, 1500);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterGenre(null);
    setFilterRating(null);
  };

  // Effect to update selectAll state when selectedItems changes
  useEffect(() => {
    if (selectedItems.length === animeList.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, animeList.length]);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Bulk Operations</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="bg-gray-800 p-4">
            <Text className="text-white font-bold mb-2">Filters</Text>
            <View className="mb-4">
              <Text className="text-gray-300 mb-1">Genre</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {allGenres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    className={`mr-2 px-3 py-1 rounded-full ${filterGenre === genre ? "bg-indigo-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setFilterGenre(filterGenre === genre ? null : genre)
                    }
                  >
                    <Text className="text-white">{genre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View className="mb-4">
              <Text className="text-gray-300 mb-1">Minimum Rating</Text>
              <View className="flex-row">
                {[4, 4.5, 4.8].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    className={`mr-2 px-3 py-1 rounded-full ${filterRating === rating ? "bg-indigo-600" : "bg-gray-700"}`}
                    onPress={() =>
                      setFilterRating(filterRating === rating ? null : rating)
                    }
                  >
                    <Text className="text-white">{rating}+</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              className="bg-gray-700 py-2 rounded-lg items-center"
              onPress={resetFilters}
            >
              <Text className="text-white">Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Operation Selection */}
        <View className="bg-gray-800/50 p-4 flex-row flex-wrap">
          <TouchableOpacity
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${operation === "delete" ? "bg-red-600" : "bg-gray-700"}`}
            onPress={() => setOperation("delete")}
          >
            <Text className="text-white">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${operation === "publish" ? "bg-green-600" : "bg-gray-700"}`}
            onPress={() => setOperation("publish")}
          >
            <Text className="text-white">Publish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${operation === "unpublish" ? "bg-yellow-600" : "bg-gray-700"}`}
            onPress={() => setOperation("unpublish")}
          >
            <Text className="text-white">Unpublish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${operation === "export" ? "bg-blue-600" : "bg-gray-700"}`}
            onPress={() => setOperation("export")}
          >
            <Text className="text-white">Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`mr-2 mb-2 px-3 py-1 rounded-full ${operation === "import" ? "bg-purple-600" : "bg-gray-700"}`}
            onPress={() => setOperation("import")}
          >
            <Text className="text-white">Import</Text>
          </TouchableOpacity>
        </View>

        {/* Export Format Selection (if export operation is selected) */}
        {operation === "export" && (
          <View className="bg-gray-800 p-4">
            <Text className="text-white font-bold mb-2">Export Format</Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 py-2 ${exportFormat === "json" ? "bg-blue-600" : "bg-gray-700"} rounded-l-lg items-center`}
                onPress={() => setExportFormat("json")}
              >
                <Text className="text-white">JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 ${exportFormat === "csv" ? "bg-blue-600" : "bg-gray-700"} items-center`}
                onPress={() => setExportFormat("csv")}
              >
                <Text className="text-white">CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 ${exportFormat === "xml" ? "bg-blue-600" : "bg-gray-700"} rounded-r-lg items-center`}
                onPress={() => setExportFormat("xml")}
              >
                <Text className="text-white">XML</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Import Source Selection (if import operation is selected) */}
        {operation === "import" && (
          <View className="bg-gray-800 p-4">
            <Text className="text-white font-bold mb-2">Import Source</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                className={`flex-1 py-2 ${importSource === "file" ? "bg-purple-600" : "bg-gray-700"} rounded-l-lg items-center`}
                onPress={() => setImportSource("file")}
              >
                <Text className="text-white">File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 ${importSource === "api" ? "bg-purple-600" : "bg-gray-700"} rounded-r-lg items-center`}
                onPress={() => setImportSource("api")}
              >
                <Text className="text-white">API</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-purple-600 py-3 rounded-lg items-center"
              onPress={handleImport}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold">Start Import</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Action Button (if an operation is selected) */}
        {operation && operation !== "import" && (
          <View className="px-4 py-2 bg-gray-800">
            <TouchableOpacity
              className={`py-3 rounded-lg items-center ${isLoading ? "opacity-70" : ""} ${
                operation === "delete"
                  ? "bg-red-600"
                  : operation === "publish"
                    ? "bg-green-600"
                    : operation === "unpublish"
                      ? "bg-yellow-600"
                      : "bg-blue-600"
              }`}
              onPress={handleBulkOperation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold">
                  {operation === "delete"
                    ? "Delete Selected"
                    : operation === "publish"
                      ? "Publish Selected"
                      : operation === "unpublish"
                        ? "Unpublish Selected"
                        : "Export Selected"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Select All Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-gray-800/30 border-b border-gray-800">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={toggleSelectAll}
              className="mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {selectAll ? (
                <CheckCircle size={20} color="#60A5FA" />
              ) : (
                <View className="w-5 h-5 border border-gray-500 rounded-full" />
              )}
            </TouchableOpacity>
            <Text className="text-white">
              {selectedItems.length} of {filteredAnimeList.length} selected
            </Text>
          </View>
          {selectedItems.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedItems([]);
                setSelectAll(false);
              }}
            >
              <Text className="text-blue-400">Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Anime List */}
        <ScrollView className="flex-1">
          {filteredAnimeList.map((anime) => (
            <View
              key={anime.id}
              className="flex-row items-center px-4 py-3 border-b border-gray-800"
            >
              <TouchableOpacity
                onPress={() => toggleItemSelection(anime.id)}
                className="mr-3"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {selectedItems.includes(anime.id) ? (
                  <CheckCircle size={20} color="#60A5FA" />
                ) : (
                  <View className="w-5 h-5 border border-gray-500 rounded-full" />
                )}
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-white font-medium">{anime.title}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center mr-3">
                    <Tag size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {anime.genres.join(", ")}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {anime.rating}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center mr-3">
                    <Calendar size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {anime.releaseDate}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Info size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {anime.status}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="p-2"
                  onPress={() =>
                    Alert.alert("Edit", `Edit anime: ${anime.title}`)
                  }
                >
                  <Edit size={18} color="#60A5FA" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  onPress={() =>
                    Alert.alert(
                      "Delete",
                      `Are you sure you want to delete ${anime.title}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () =>
                            Alert.alert(
                              "Deleted",
                              `${anime.title} has been deleted`,
                            ),
                        },
                      ],
                    )
                  }
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
