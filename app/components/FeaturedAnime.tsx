import React from "react";
import { ImageBackground, FlatList, ListRenderItem } from "react-native";
import { Play, Star, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";
import { View, Text, TouchableOpacity } from "react-native";
import type { Database } from "@/lib/database.types";

import { Anime, UUID } from "@/hooks/useAnimeSearch";

interface FeaturedAnimeItem extends Anime {
  genres?: string[];
}

interface FeaturedAnimeProps {
  anime: FeaturedAnimeItem;
  onPress?: (anime: FeaturedAnimeItem) => void;
  onPlayPress?: (anime: FeaturedAnimeItem) => void;
  onAddToListPress?: (anime: FeaturedAnimeItem) => void;
}

interface GenreTagsProps {
  genres: string[];
}

const GenreTags = React.memo<GenreTagsProps>(function GenreTags({ genres }) {
  const renderGenre: ListRenderItem<string> = ({ item }) => (
    <View className="bg-neutral-800 dark:bg-neutral-700 rounded-full px-2 py-0.5 mr-2">
      <Text className="text-white text-xs">{item}</Text>
    </View>
  );

  return (
    <View className="flex-row">
      <FlatList
        data={genres.slice(0, 2)}
        renderItem={renderGenre}
        keyExtractor={(item: string, index: number) => `genre-${index}`}
        horizontal
        scrollEnabled={false}
      />
    </View>
  );
});

const FeaturedAnime = React.memo(function FeaturedAnime({
  anime,
  onPress,
  onPlayPress,
  onAddToListPress,
}: FeaturedAnimeProps) {
  return (
    <TouchableOpacity
      className="h-[200px] mx-4 mb-6 rounded-xl overflow-hidden"
      onPress={() => onPress?.(anime)}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: anime.image_url }}
        className="w-full h-full justify-end"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)"]}
          className="p-4 pt-12"
        >
          <View className="flex-row items-center mb-1">
            {anime.rating && (
              <>
                <Star size={14} className="text-amber-500" fill="#f59e0b" />
                <Text className="text-white text-xs ml-1 mr-3">
                  {anime.rating}
                </Text>
              </>
            )}
            {anime.genres && <GenreTags genres={anime.genres} />}
          </View>

          <Text className="text-white font-bold text-xl mb-1">
            {anime.title}
          </Text>

          {anime.description && (
            <Text className="text-gray-300 text-xs" numberOfLines={2}>
              {anime.description}
            </Text>
          )}

          <View className="flex-row mt-3">
            <TouchableOpacity
              className="bg-indigo-600 dark:bg-indigo-500 flex-row items-center rounded-full px-4 py-1.5 mr-3"
              onPress={() => onPlayPress?.(anime)}
              activeOpacity={0.8}
            >
              <Play size={16} className="text-white" />
              <Text className="text-white text-xs font-medium ml-1">
                Watch Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={cn(
                "flex-row items-center rounded-full px-4 py-1.5",
                anime.is_favorite
                  ? "bg-indigo-700 dark:bg-indigo-600"
                  : "bg-neutral-800 dark:bg-neutral-700",
              )}
              onPress={() => onAddToListPress?.(anime)}
              activeOpacity={0.8}
            >
              <Plus size={16} className="text-white" />
              <Text className="text-white text-xs font-medium ml-1">
                {anime.is_favorite ? "In My List" : "Add to List"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
});

export default FeaturedAnime;
