import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Eye,
  BookmarkIcon,
  Heart,
  Award,
  Clock,
  MoreVertical,
  Star,
  Filter,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import useAnimeLists, { ListType } from "@/hooks/useAnimeLists";
import { supabase } from "@/lib/supabase";

type UUID = string;

interface AnimeListItem {
  id: UUID;
  title: string;
  imageUrl: string;
  rating: number;
  progress?: number; // For currently watching
  addedDate: string;
  genres?: string[];
}

export default function LibraryScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState("library");
  const [selectedList, setSelectedList] = useState<ListType>(
    (params.tab as ListType) || "watching"
  );

  // Use the useAnimeLists hook to fetch real data
  const {
    lists,
    loading,
    error,
    fetchList,
    addToList,
    removeFromList,
    updateProgress,
    moveToList,
  } = useAnimeLists(user?.id || null);

  // Handle tab change
  const handleTabChange = (tab: ListType) => {
    setSelectedList(tab);
  };

  // Handle adding anime to favorites
  const handleAddToFavorites = async (animeId: string) => {
    try {
      await addToList(animeId, "favorites");
      Alert.alert("Success", "Added to favorites");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      Alert.alert("Error", "Failed to add to favorites");
    }
  };

  // Handle removing anime from list
  const handleRemoveFromList = async (animeId: string, listType: ListType) => {
    try {
      await removeFromList(animeId, listType);
      Alert.alert("Success", `Removed from ${listType}`);
    } catch (error) {
      console.error("Error removing from list:", error);
      Alert.alert("Error", `Failed to remove from ${listType}`);
    }
  };

  // Handle moving anime to another list
  const handleMoveToList = async (
    animeId: string,
    fromList: ListType,
    toList: ListType
  ) => {
    try {
      await moveToList(animeId, fromList, toList);
      Alert.alert("Success", `Moved to ${toList}`);
    } catch (error) {
      console.error("Error moving to list:", error);
      Alert.alert("Error", `Failed to move to ${toList}`);
    }
  };

  // Handle progress update
  const handleUpdateProgress = async (
    animeId: string,
    progress: number,
    episodeId?: string
  ) => {
    try {
      // Remove the episodeId parameter since the hook doesn't accept it
      await updateProgress(animeId, progress);
      Alert.alert("Success", "Progress updated");
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  // Handle anime options menu
  const handleAnimeOptions = (animeId: string, listType: ListType) => {
    const options: {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[] = [];

    if (listType === "watching") {
      options.push(
        {
          text: "Update Progress",
          onPress: () => {
            // In a real app, this would open a progress slider
            handleUpdateProgress(animeId, Math.floor(Math.random() * 100));
          },
        },
        {
          text: "Mark as Completed",
          onPress: () => handleMoveToList(animeId, listType, "completed"),
        }
      );
    }

    if (listType === "completed") {
      options.push({
        text: "Add to Favorites",
        onPress: () => handleAddToFavorites(animeId),
      });
    }

    if (listType === "history") {
      options.push({
        text: "Remove from History",
        onPress: () => {
          // In a real app, this would clear watch history
          Alert.alert(
            "Coming Soon",
            "This feature will be available in a future update"
          );
        },
      });
    }

    if (listType === "watchlist") {
      options.push({
        text: "Start Watching",
        onPress: () => handleMoveToList(animeId, listType, "watching"),
      });
    }

    if (listType !== "favorites") {
      options.push({
        text: "Add to Favorites",
        onPress: () => handleAddToFavorites(animeId),
      });
    }

    options.push({
      text: "Remove from List",
      onPress: () => handleRemoveFromList(animeId, listType),
      style: "destructive" as const,
    });

    Alert.alert(
      "Anime Options",
      "Select an option",
      [
        { text: "Cancel", style: "cancel" as const },
        ...options,
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

        {selectedList === "watching" && item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.progress}%`,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {item.progress}%
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => handleAnimeOptions(item.anime_id || item.id, selectedList)}
        >
          <MoreVertical size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F5F5F5' }]}>
      <Header
        title="Library"
        showSearch
        showNotifications
        onSearchPress={() => router.push('/search')}
        onNotificationsPress={() => router.push('/notifications')}
      />
      
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              selectedList === 'watching' && styles.activeTab,
              selectedList === 'watching' && { 
                backgroundColor: isDarkMode 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(99, 102, 241, 0.15)' 
              }
            ]}
            onPress={() => handleTabChange('watching')}
          >
            <Eye 
              size={16} 
              color={selectedList === 'watching' 
                ? colors.primary 
                : isDarkMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(15, 23, 42, 0.7)'
              } 
            />
            <Text
              style={[
                styles.tabText,
                { 
                  color: selectedList === 'watching' 
                    ? colors.primary 
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(15, 23, 42, 0.7)' 
                }
              ]}
            >
              Watching
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedList === 'completed' && styles.activeTab,
              selectedList === 'completed' && { 
                backgroundColor: isDarkMode 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : 'rgba(16, 185, 129, 0.15)' 
              }
            ]}
            onPress={() => handleTabChange('completed')}
          >
            <Award 
              size={16} 
              color={selectedList === 'completed' 
                ? colors.success 
                : isDarkMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(15, 23, 42, 0.7)'
              } 
            />
            <Text
              style={[
                styles.tabText,
                { 
                  color: selectedList === 'completed' 
                    ? colors.success 
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(15, 23, 42, 0.7)' 
                }
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedList === 'watchlist' && styles.activeTab,
              selectedList === 'watchlist' && { 
                backgroundColor: isDarkMode 
                  ? 'rgba(245, 158, 11, 0.2)' 
                  : 'rgba(245, 158, 11, 0.15)' 
              }
            ]}
            onPress={() => handleTabChange('watchlist')}
          >
            <BookmarkIcon 
              size={16} 
              color={selectedList === 'watchlist' 
                ? colors.warning 
                : isDarkMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(15, 23, 42, 0.7)'
              } 
            />
            <Text
              style={[
                styles.tabText,
                { 
                  color: selectedList === 'watchlist' 
                    ? colors.warning 
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(15, 23, 42, 0.7)' 
                }
              ]}
            >
              Watchlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedList === 'favorites' && styles.activeTab,
              selectedList === 'favorites' && { 
                backgroundColor: isDarkMode 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : 'rgba(239, 68, 68, 0.15)' 
              }
            ]}
            onPress={() => handleTabChange('favorites')}
          >
            <Heart 
              size={16} 
              color={selectedList === 'favorites' 
                ? colors.error 
                : isDarkMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(15, 23, 42, 0.7)'
              } 
              fill={selectedList === 'favorites' ? colors.error : 'none'}
            />
            <Text
              style={[
                styles.tabText,
                { 
                  color: selectedList === 'favorites' 
                    ? colors.error 
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(15, 23, 42, 0.7)' 
                }
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedList === 'history' && styles.activeTab,
              selectedList === 'history' && { 
                backgroundColor: isDarkMode 
                  ? 'rgba(59, 130, 246, 0.2)' 
                  : 'rgba(59, 130, 246, 0.15)' 
              }
            ]}
            onPress={() => handleTabChange('history')}
          >
            <Clock 
              size={16} 
              color={selectedList === 'history' 
                ? colors.info 
                : isDarkMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(15, 23, 42, 0.7)'
              } 
            />
            <Text
              style={[
                styles.tabText,
                { 
                  color: selectedList === 'history' 
                    ? colors.info 
                    : isDarkMode 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : 'rgba(15, 23, 42, 0.7)' 
                }
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your anime...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error loading your anime
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchList(selectedList)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : lists[selectedList].length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {selectedList === 'watching'
              ? "You're not watching any anime"
              : selectedList === 'completed'
              ? "You haven't completed any anime"
              : selectedList === 'watchlist'
              ? "Your watchlist is empty"
              : selectedList === 'favorites'
              ? "You don't have any favorites"
              : "Your watch history is empty"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {selectedList === 'watching'
              ? "Start watching anime to see them here"
              : selectedList === 'completed'
              ? "Complete anime to see them here"
              : selectedList === 'watchlist'
              ? "Add anime to your watchlist to see them here"
              : selectedList === 'favorites'
              ? "Add anime to your favorites to see them here"
              : "Watch anime to see your history here"}
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
          data={lists[selectedList]}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => (item.anime_id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    borderRadius: 20,
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
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
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 10,
    alignSelf: 'flex-end',
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
