import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { Filter, ChevronDown, SortAsc, SortDesc } from "lucide-react-native";

interface FilterBarProps {
  onFilterChange?: (filters: string[]) => void;
  onSortChange?: (sortOrder: "asc" | "desc") => void;
  onFilterButtonPress?: () => void;
  genres?: string[];
  initialSortOrder?: "asc" | "desc";
  initialFilters?: string[];
}

const FilterBar = React.memo(({
  onFilterChange = () => {},
  onSortChange = () => {},
  onFilterButtonPress = () => {},
  initialSortOrder = "desc",
  initialFilters = [],
  genres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mecha",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
  ],
}: FilterBarProps) => {
  const [selectedGenres, setSelectedGenres] =
    useState<string[]>(initialFilters);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  // Update state if props change
  useEffect(() => {
    setSortOrder(initialSortOrder);
  }, [initialSortOrder]);

  useEffect(() => {
    setSelectedGenres(initialFilters);
  }, [initialFilters]);

  const toggleGenre = (genre: string) => {
    const newSelectedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];

    setSelectedGenres(newSelectedGenres);
    onFilterChange(newSelectedGenres);
    
    // Provide haptic feedback if available
    try {
      const Haptics = require('expo-haptics');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    onSortChange(newSortOrder);
  };

  return (
    <View className="w-full h-[50px] bg-gray-900 border-b border-gray-800 px-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
        className="h-full"
      >
        {/* Sort Button */}
        <TouchableOpacity
          onPress={toggleSortOrder}
          className="flex-row items-center bg-gray-800 rounded-full px-3 py-1.5 mr-2"
          activeOpacity={0.7}
        >
          <Text className="text-white text-xs mr-1">Popular</Text>
          {sortOrder === "asc" ? (
            <SortAsc size={14} color="#FFFFFF" />
          ) : (
            <SortDesc size={14} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Genre Tags */}
        {genres.map((genre) => (
          <Pressable
            key={genre}
            onPress={() => toggleGenre(genre)}
            className={`rounded-full px-3 py-1.5 mr-2 ${selectedGenres.includes(genre) ? "bg-blue-600" : "bg-gray-800"}`}
          >
            <Text className="text-white text-xs">{genre}</Text>
          </Pressable>
        ))}

        {/* Filter Button */}
        <TouchableOpacity
          onPress={onFilterButtonPress}
          className="flex-row items-center bg-gray-800 rounded-full px-3 py-1.5 ml-1"
          activeOpacity={0.7}
        >
          <Filter size={14} color="#FFFFFF" />
          <Text className="text-white text-xs ml-1">Filters</Text>
          <ChevronDown size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

});  // Close memo

export default FilterBar;
