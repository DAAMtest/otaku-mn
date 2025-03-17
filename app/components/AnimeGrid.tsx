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
  Platform
} from "react-native";
import AnimeCard from "@/components/AnimeCard";
import { useTheme } from "@/context/ThemeProvider";
import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];
type Anime = Tables["anime"]["Row"] & {
  is_favorite?: boolean;
};

interface AnimeGridProps {
  data: Anime[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onAnimePress?: (anime: Anime) => void;
  onAddToList?: (anime: Anime) => void;
  onFavorite?: (anime: Anime) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  numColumns?: number;
}

/**
 * AnimeGrid component displays a grid of anime cards with support for
 * refreshing, pagination, and interactions.
 *
 * @param props - Component props
 * @returns AnimeGrid component
 */
const AnimeGrid = React.memo(function AnimeGrid({
  data,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onAnimePress,
  onAddToList,
  onFavorite,
  ListEmptyComponent,
  ListHeaderComponent,
  numColumns = 2,
}: AnimeGridProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 32) / numColumns; // 32 = padding (16) * 2

  const renderItem: ListRenderItem<Anime> = ({ item }) => (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <AnimeCard
        id={item.id}
        title={item.title}
        imageUrl={item.image_url}
        rating={item.rating ?? undefined}
        isFavorite={item.is_favorite}
        onPress={() => onAnimePress?.(item)}
        onFavoritePress={() => onFavorite?.(item)}
      />
    </View>
  );

  const keyExtractor = (item: Anime) => item.id.toString();

  // Custom empty component that doesn't show "End of List"
  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No anime found. Check back later for updates.
        </Text>
      </View>
    );
  };

  if (loading && !refreshing && data.length === 0) {
    return (
      <View style={[styles.fullScreenLoading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        ListEmptyComponent={ListEmptyComponent || renderEmpty}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={
          loading && data.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  fullScreenLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default AnimeGrid;
