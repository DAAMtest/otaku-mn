import React, { useState, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AnimeCard from "./AnimeCard";

interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  isFavorite: boolean;
}

interface AnimeGridProps {
  data?: Anime[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onAnimePress?: (id: string) => void;
  onAddToList?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const AnimeGrid = memo(({
  data = [
    {
      id: "1",
      title: "Attack on Titan",
      imageUrl:
        "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
      rating: 4.8,
      isFavorite: true,
    },
    {
      id: "2",
      title: "My Hero Academia",
      imageUrl:
        "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
      rating: 4.6,
      isFavorite: false,
    },
    {
      id: "3",
      title: "Demon Slayer",
      imageUrl:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
      rating: 4.9,
      isFavorite: true,
    },
    {
      id: "4",
      title: "One Piece",
      imageUrl:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
      rating: 4.7,
      isFavorite: false,
    },
    {
      id: "5",
      title: "Jujutsu Kaisen",
      imageUrl:
        "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
      rating: 4.8,
      isFavorite: false,
    },
    {
      id: "6",
      title: "Naruto Shippuden",
      imageUrl:
        "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
      rating: 4.5,
      isFavorite: true,
    },
  ],
  isLoading = false,
  onLoadMore = () => {},
  onRefresh = () => {},
  onAnimePress = () => {},
  onAddToList = () => {},
  onFavorite = () => {},
}: AnimeGridProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    onRefresh();
    // Simulate refresh completion after 1.5 seconds
    setTimeout(() => setRefreshing(false), 1500);
  }, [onRefresh]);

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

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View className="py-4 w-full items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-10">
        <Text className="text-gray-400 text-lg">No anime found</Text>
        <Text className="text-gray-500 text-sm mt-2">
          Try adjusting your filters
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 8,
        }}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#6366F1"]}
            tintColor="#6366F1"
          />
        }
      />
    </View>
  );
};

});  // Close memo

export default AnimeGrid;
