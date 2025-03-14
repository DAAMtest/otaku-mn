import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

interface GenreSelectorProps {
  genres: string[];
  selectedGenres: string[];
  onGenrePress: (genre: string) => void;
  isLoading?: boolean;
}

const GenreSelector = ({
  genres = [],
  selectedGenres = [],
  onGenrePress,
  isLoading = false,
}: GenreSelectorProps) => {
  return (
    <View className="mb-4">
      <Text className="text-white font-bold text-lg px-4 mb-2">Genres</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        className="py-2"
      >
        {isLoading ? (
          // Loading placeholders
          Array.from({ length: 5 }).map((_, index) => (
            <View
              key={`loading-${index}`}
              className="h-8 w-20 bg-gray-800 rounded-full mr-2 opacity-50"
            />
          ))
        ) : genres.length === 0 ? (
          <Text className="text-gray-400 px-4">No genres available</Text>
        ) : (
          genres.map((genre) => (
            <TouchableOpacity
              key={genre}
              onPress={() => onGenrePress(genre)}
              className={`px-4 py-2 rounded-full mr-2 ${selectedGenres.includes(genre) ? "bg-purple-600" : "bg-gray-800"}`}
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">{genre}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default GenreSelector;
