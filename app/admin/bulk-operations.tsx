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
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  X,
  CheckSquare,
  Square,
  Trash2,
  Edit,
  Download,
  Upload,
  Film,
  Tag,
  Users,
  Filter,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type UUID = string;

interface BulkItem {
  id: UUID;
  title: string;
  type: string;
  image_url?: string;
  description?: string;
  selected: boolean;
}

/**
 * Bulk Operations screen for administrators to perform actions on multiple items at once.
 */
export default function BulkOperations() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [items, setItems] = useState<BulkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BulkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [importExportModalVisible, setImportExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  // Mock data for demonstration
  const mockAnimeItems: BulkItem[] = [
    {
      id: "1",
      title: "Attack on Titan",
      type: "anime",
      image_url: "https://images.unsplash.com/photo-1541562232579-512a21325720?w=400&q=80",
      description: "Humanity's last stand against man-eating giants",
      selected: false,
    },
    {
      id: "2",
      title: "My Hero Academia",
      type: "anime",
      image_url: "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
      description: "A quirkless boy's journey to become the greatest hero",
      selected: false,
    },
    {
      id: "3",
      title: "Demon Slayer",
      type: "anime",
      image_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      description: "A young demon slayer avenges his family",
      selected: false,
    },
  ];

  const mockGenreItems: BulkItem[] = [
    {
      id: "g1",
      title: "Action",
      type: "genre",
      description: "Fast-paced and exciting content",
      selected: false,
    },
    {
      id: "g2",
      title: "Comedy",
      type: "genre",
      description: "Humorous and light-hearted content",
      selected: false,
    },
    {
      id: "g3",
      title: "Drama",
      type: "genre",
      description: "Emotional and character-driven stories",
      selected: false,
    },
  ];

  const mockUserItems: BulkItem[] = [
    {
      id: "u1",
      title: "user123",
      type: "user",
      description: "Regular user, joined 3 months ago",
      selected: false,
    },
    {
      id: "u2",
      title: "anime_fan456",
      type: "user",
      description: "Premium user, joined 1 year ago",
      selected: false,
    },
    {
      id: "u3",
      title: "otaku789",
      type: "user",
      description: "Moderator, joined 2 years ago",
      selected: false,
    },
  ];

  // Check authentication and fetch items on component mount and when selected type changes
  useEffect(() => {
    if (!session) {
      router.replace('/');
      return;
    }
    fetchItems();
  }, [selectedType, session, router]);

  // Filter items when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  // Update selectAll state when all items are selected/deselected
  useEffect(() => {
    if (items.length > 0) {
      const allSelected = items.every((item) => item.selected);
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [items]);

  // Fetch items based on selected type
  const fetchItems = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from the database based on type
      // For demo, use mock data
      let mockItems: BulkItem[] = [];
      
      if (!selectedType || selectedType === "anime") {
        mockItems = [...mockAnimeItems];
      } else if (selectedType === "genre") {
        mockItems = [...mockGenreItems];
      } else if (selectedType === "user") {
        mockItems = [...mockUserItems];
      } else {
        mockItems = [...mockAnimeItems, ...mockGenreItems, ...mockUserItems];
      }

      setItems(mockItems);
      setFilteredItems(mockItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      Alert.alert("Error", "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems(items.map(item => ({ ...item, selected: newSelectAll })));
  };

  // Get selected items count
  const getSelectedCount = () => {
    return items.filter(item => item.selected).length;
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to delete");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${selectedItems.length} items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, you would delete from the database
            const remainingItems = items.filter(item => !item.selected);
            setItems(remainingItems);
            setFilteredItems(remainingItems);
            setActionModalVisible(false);
            Alert.alert("Success", `${selectedItems.length} items deleted successfully`);
          },
        },
      ]
    );
  };

  // Handle bulk edit
  const handleBulkEdit = () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to edit");
      return;
    }

    // In a real app, you would show a form to edit common properties
    Alert.alert(
      "Bulk Edit",
      "This would open a form to edit common properties of selected items",
      [{ text: "OK" }]
    );
    setActionModalVisible(false);
  };

  // Handle export
  const handleExport = () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert("No Items Selected", "Please select items to export");
      return;
    }

    // In a real app, you would generate and download a file
    Alert.alert(
      "Export Data",
      `This would export ${selectedItems.length} items as ${exportFormat.toUpperCase()} in a real app`,
      [{ text: "OK" }]
    );
    setImportExportModalVisible(false);
  };

  // Handle import
  const handleImport = () => {
    // In a real app, you would show a file picker
    Alert.alert(
      "Import Data",
      "This would open a file picker to import data in a real app",
      [{ text: "OK" }]
    );
    setImportExportModalVisible(false);
  };

  // Get icon based on item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case "anime":
        return <Film size={20} color="#60A5FA" />;
      case "genre":
        return <Tag size={20} color="#F59E0B" />;
      case "user":
        return <Users size={20} color="#34D399" />;
      default:
        return <Film size={20} color="#60A5FA" />;
    }
  };

  // Render item
  const renderItem = ({ item }: { item: BulkItem }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-3">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => toggleItemSelection(item.id)}
          className="mr-3"
        >
          {item.selected ? (
            <CheckSquare size={24} color="#8B5CF6" />
          ) : (
            <Square size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>

        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="w-12 h-12 rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="w-12 h-12 rounded-md bg-gray-700 items-center justify-center">
            {getItemIcon(item.type)}
          </View>
        )}

        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold">{item.title}</Text>
            <View className="bg-gray-700 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-gray-300 text-xs">{item.type}</Text>
            </View>
          </View>
          {item.description && (
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
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
          <Text className="text-white font-bold text-lg">Bulk Operations</Text>
          <TouchableOpacity onPress={() => setImportExportModalVisible(true)}>
            <Download size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search and Filter Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2 mb-4">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search items..."
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

          {/* Type Filter Buttons */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${selectedType === null ? "bg-purple-600" : "bg-gray-700"}`}
              onPress={() => setSelectedType(null)}
            >
              <Text className="text-white">All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${selectedType === "anime" ? "bg-blue-600" : "bg-gray-700"}`}
              onPress={() => setSelectedType("anime")}
            >
              <Text className="text-white">Anime</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`mr-2 px-3 py-1 rounded-full ${selectedType === "genre" ? "bg-amber-600" : "bg-gray-700"}`}
              onPress={() => setSelectedType("genre")}
            >
              <Text className="text-white">Genres</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${selectedType === "user" ? "bg-green-600" : "bg-gray-700"}`}
              onPress={() => setSelectedType("user")}
            >
              <Text className="text-white">Users</Text>
            </TouchableOpacity>
          </View>

          {/* Select All Row */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-800 rounded-lg p-3 mb-4"
            onPress={toggleSelectAll}
          >
            {selectAll ? (
              <CheckSquare size={24} color="#8B5CF6" />
            ) : (
              <Square size={24} color="#9CA3AF" />
            )}
            <Text className="text-white ml-3">Select All Items</Text>
            <View className="flex-1" />
            <Text className="text-gray-400">{getSelectedCount()} selected</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-gray-400 mt-4">Loading items...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Filter size={48} color="#4B5563" />
                <Text className="text-gray-400 text-lg mt-4">
                  {searchQuery
                    ? "No items match your search"
                    : "No items available"}
                </Text>
              </View>
            }
          />
        )}

        {/* Action Button */}
        {getSelectedCount() > 0 && (
          <View className="p-4 border-t border-gray-800">
            <TouchableOpacity
              className="bg-purple-600 rounded-lg py-3 items-center"
              onPress={() => setActionModalVisible(true)}
            >
              <Text className="text-white font-semibold">
                Actions ({getSelectedCount()} items)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Modal */}
        <Modal
          visible={actionModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setActionModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-gray-900 rounded-t-xl p-4">
              <View className="w-12 h-1 bg-gray-700 rounded-full self-center mb-4" />
              <Text className="text-white text-lg font-bold mb-4">
                Bulk Actions ({getSelectedCount()} items)
              </Text>

              <TouchableOpacity
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-3"
                onPress={handleBulkEdit}
              >
                <Edit size={24} color="#60A5FA" />
                <Text className="text-white ml-3">Edit Selected Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-3"
                onPress={() => {
                  setActionModalVisible(false);
                  setImportExportModalVisible(true);
                }}
              >
                <Download size={24} color="#34D399" />
                <Text className="text-white ml-3">Export Selected Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-red-900/30 rounded-lg p-4 mb-6"
                onPress={handleBulkDelete}
              >
                <Trash2 size={24} color="#F87171" />
                <Text className="text-red-400 ml-3">Delete Selected Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-800 rounded-lg py-3 items-center"
                onPress={() => setActionModalVisible(false)}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Import/Export Modal */}
        <Modal
          visible={importExportModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setImportExportModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-gray-900 rounded-t-xl p-4">
              <View className="w-12 h-1 bg-gray-700 rounded-full self-center mb-4" />
              <Text className="text-white text-lg font-bold mb-4">
                Import/Export Data
              </Text>

              <Text className="text-gray-400 mb-2">Export Format</Text>
              <View className="flex-row mb-4">
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-l-lg ${exportFormat === "json" ? "bg-indigo-600" : "bg-gray-800"}`}
                  onPress={() => setExportFormat("json")}
                >
                  <Text className="text-white text-center">JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 ${exportFormat === "csv" ? "bg-indigo-600" : "bg-gray-800"}`}
                  onPress={() => setExportFormat("csv")}
                >
                  <Text className="text-white text-center">CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-2 rounded-r-lg ${exportFormat === "xml" ? "bg-indigo-600" : "bg-gray-800"}`}
                  onPress={() => setExportFormat("xml")}
                >
                  <Text className="text-white text-center">XML</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-3"
                onPress={handleExport}
              >
                <Download size={24} color="#34D399" />
                <Text className="text-white ml-3">Export {getSelectedCount()} Selected Items</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-6"
                onPress={handleImport}
              >
                <Upload size={24} color="#60A5FA" />
                <Text className="text-white ml-3">Import Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-800 rounded-lg py-3 items-center"
                onPress={() => setImportExportModalVisible(false)}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}