import React from "react";
import {
  FlatList,
  RefreshControl,
  ListRenderItem,
  Dimensions,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import AnimeCard from "@/components/AnimeCard";
import { useTheme } from "@/context/ThemeProvider";
import { router } from "expo-router";
import { Anime } from "@/hooks/useAnimeSearch";

interface AnimeGridProps {
  animeList: Anime[];
  onAnimePress: (anime: Anime) => void;
  onAddToList: (anime: Anime) => Promise<void>;
  onFavorite: (anime: Anime) => Promise<void>;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  numColumns: number;
}

/**
 * AnimeGrid component displays a grid of anime cards with support for
 * refreshing, pagination, and interactions.
 *
 * @param props - Component props
 * @returns AnimeGrid component
 */
const AnimeGrid = ({
  animeList,
  onAnimePress,
  onAddToList,
  onFavorite,
  refreshing,
  onRefresh,
  numColumns,
}: AnimeGridProps) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  // Adjust padding for better spacing between cards
  const horizontalPadding = 16;
  const cardSpacing = 8;
  const totalHorizontalPadding = horizontalPadding * 2 + (numColumns - 1) * cardSpacing;
  const cardWidth = (screenWidth - totalHorizontalPadding) / numColumns;

  const renderItem = ({ item }: { item: Anime }) => (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <AnimeCard
        id={item.id}
        title={item.title}
        imageUrl={item.imageUrl || ""}
        rating={item.rating || 0}
        isFavorite={item.isFavorite}
        onPress={() => onAnimePress(item)}
        onFavoritePress={() => onFavorite(item)}
        onAddToListPress={() => onAddToList(item)}
        width={cardWidth - cardSpacing}
        height={(cardWidth - cardSpacing) * 1.5}
        releaseYear={item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined}
        episodeCount={undefined}
        isNew={isNewRelease(item.releaseDate || undefined)}
      />
    </View>
  );

  // Helper function to determine if an anime is a new release (within the last 30 days)
  const isNewRelease = (releaseDate?: string) => {
    if (!releaseDate) return false;
    const releaseTime = new Date(releaseDate).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return releaseTime > thirtyDaysAgo;
  };

  const keyExtractor = (item: Anime) => item.id.toString();

  // Custom empty component with improved styling
  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No anime found. Check back later for updates.
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={animeList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "ios" ? 100 : 80 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          refreshing ? (
            <ActivityIndicator 
              size="large" 
              color={colors.primary}
              style={styles.loadingIndicator} 
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingIndicator: {
    marginVertical: 20,
  }
});

export default AnimeGrid;