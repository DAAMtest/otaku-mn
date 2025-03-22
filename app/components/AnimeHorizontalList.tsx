import React from "react";
import {
  FlatList,
  ListRenderItem,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import AnimeCard from "@/components/AnimeCard";
import { useTheme } from "@/context/ThemeProvider";
import { router } from "expo-router";
import type { Database } from "@/lib/database.types";

type UUID = string;
type Tables = Database["public"]["Tables"];
type Anime = Tables["anime"]["Row"] & {
  is_favorite?: boolean;
  episode_count?: number;
  release_year?: number;
  is_new?: boolean;
};

interface AnimeHorizontalListProps {
  title: string;
  data: Anime[];
  loading?: boolean;
  onSeeAllPress?: () => void;
  onAnimePress?: (anime: Anime) => void;
  onFavorite?: (anime: Anime) => void;
}

/**
 * AnimeHorizontalList component displays a horizontal scrollable list of anime
 * with a title and optional "See All" button.
 */
const AnimeHorizontalList = React.memo(function AnimeHorizontalList({
  title,
  data = [],
  loading = false,
  onSeeAllPress,
  onAnimePress,
  onFavorite,
}: AnimeHorizontalListProps) {
  const { colors } = useTheme();

  const renderItem: ListRenderItem<Anime> = ({ item }) => {
    const handlePress = () => {
      if (onAnimePress) {
        onAnimePress(item);
      } else {
        // Navigate to anime details screen
        router.push({
          pathname: `/anime/${item.id}`,
        });
      }
    };

    return (
      <AnimeCard
        id={item.id}
        title={item.title}
        imageUrl={item.image_url}
        rating={item.rating ?? undefined}
        isFavorite={item.is_favorite}
        episodeCount={item.episode_count}
        releaseYear={item.release_year}
        isNew={item.is_new}
        onPress={handlePress}
        onFavoritePress={() => onFavorite?.(item)}
        size="medium"
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No anime available
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {onSeeAllPress && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onSeeAllPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              See All
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  separator: {
    width: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
    width: 240,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
    width: 240,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
  },
});

export default AnimeHorizontalList;
