import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import AnimeCard from "./AnimeCard";
import { Anime } from "../hooks/useAnimeSearch";

interface AnimeHorizontalListProps {
  title: string;
  data: Anime[];
  isLoading?: boolean;
  onSeeAllPress?: () => void;
  onAnimePress?: (id: string) => void;
  onAddToList?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const AnimeHorizontalList = ({
  title,
  data = [],
  isLoading = false,
  onSeeAllPress = () => {},
  onAnimePress = () => {},
  onAddToList = () => {},
  onFavorite = () => {},
}: AnimeHorizontalListProps) => {
  const renderItem = ({ item }: { item: Anime }) => (
    <AnimeCard
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      rating={item.rating}
      isFavorite={item.isFavorite}
      onPress={() => onAnimePress(item.id)}
      onAddToList={() => onAddToList(item.id)}
      onFavorite={() => onFavorite(item.id)}
    />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-10 px-4">
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-10 px-4">
        <Text className="text-gray-400 text-base">No anime found</Text>
      </View>
    );
  };

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center px-4 mb-2">
        <Text className="text-white font-bold text-lg">{title}</Text>
        <TouchableOpacity
          onPress={onSeeAllPress}
          className="flex-row items-center"
        >
          <Text className="text-blue-400 mr-1">See All</Text>
          <ChevronRight size={16} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 250,
        }}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
};

export default AnimeHorizontalList;
