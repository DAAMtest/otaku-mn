import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart, Star, MoreVertical } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import useAnimeLists from "@/hooks/useAnimeLists";
import { supabase } from "@/lib/supabase";

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Use the useAnimeLists hook to fetch favorites
  const { 
    lists, 
    loading, 
    error, 
    fetchList, 
    removeFromList 
  } = useAnimeLists(user?.id || null);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchList("favorites");
    setRefreshing(false);
  };

  // Handle removing from favorites
  const handleRemoveFromFavorites = async (animeId: string) => {
    try {
      await removeFromList(animeId, "favorites");
      Alert.alert("Success", "Removed from favorites");
    } catch (error) {
      console.error("Error removing from favorites:", error);
      Alert.alert("Error", "Failed to remove from favorites");
    }
  };

  // Handle anime options
  const handleAnimeOptions = (animeId: string) => {
    Alert.alert(
      "Anime Options",
      "Select an option",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "View Details",
          onPress: () => router.push(`/anime/${animeId}`),
        },
        {
          text: "Remove from Favorites",
          onPress: () => handleRemoveFromFavorites(animeId),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Render anime item
  const renderAnimeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => router.push(`/anime/${item.anime_id || item.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.anime?.imageUrl || item.imageUrl }}
        style={[
          styles.animeImage,
          {
            backgroundColor: isDarkMode ? "#1f2937" : "#e5e7eb",
          },
        ]}
        resizeMode="cover"
      />
      <View
        style={[
          styles.animeDetails,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.animeTitle,
            {
              color: colors.text,
            },
          ]}
          numberOfLines={1}
        >
          {item.anime?.title || item.title}
        </Text>

        <View style={styles.ratingContainer}>
          <Star
            size={14}
            color={colors.warning}
            fill={colors.warning}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.ratingText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {item.anime?.rating || item.rating || "N/A"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFromFavorites(item.anime_id || item.id)}
        >
          <Heart size={16} color={colors.error} fill={colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => handleAnimeOptions(item.anime_id || item.id)}
        >
          <MoreVertical size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Favorites"
        showSearch
        showNotifications
        onSearchPress={() => router.push('/search')}
        onNotificationsPress={() => router.push('/notifications')}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your favorites...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error loading your favorites
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : lists.favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add anime to your favorites to see them here
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreButtonText}>Explore Anime</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists.favorites}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => (item.anime_id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  animeItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  animeImage: {
    width: '100%',
    aspectRatio: 0.7,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  animeDetails: {
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'relative',
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
  },
  optionsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  exploreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
