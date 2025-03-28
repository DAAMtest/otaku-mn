import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Play, Clock } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import { router } from "expo-router";
import Typography from "./Typography";

const CONTINUE_WATCHING_KEY = "CONTINUE_WATCHING";

import { UUID } from "@/hooks/useAnimeSearch";

interface WatchHistoryItem {
  animeId: UUID;
  episodeId: UUID;
  title: string;
  episodeInfo: string;
  thumbnailUri?: string;
  position: number;
  duration: number;
  timestamp: string;
}

interface ContinueWatchingListProps {
  onItemPress: (item: WatchHistoryItem) => void;
}

/**
 * ContinueWatchingList component displays a horizontal list of anime
 * that the user has started watching but not finished
 */
const ContinueWatchingList = ({ onItemPress }: ContinueWatchingListProps) => {
  const { colors } = useTheme();
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchHistory();
  }, []);

  const loadWatchHistory = async () => {
    try {
      setLoading(true);
      const savedData = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
      if (savedData) {
        const history = JSON.parse(savedData);
        setWatchHistory(history);
      }
    } catch (error) {
      console.error("Error loading watch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = async (animeId: string, episodeId: string) => {
    try {
      const updatedHistory = watchHistory.filter(
        (item) => !(item.animeId === animeId && item.episodeId === episodeId),
      );
      setWatchHistory(updatedHistory);
      await AsyncStorage.setItem(
        CONTINUE_WATCHING_KEY,
        JSON.stringify(updatedHistory),
      );
    } catch (error) {
      console.error("Error removing from watch history:", error);
    }
  };

  const formatProgress = (position: number, duration: number) => {
    if (duration === 0) return "0%";
    return `${Math.round((position / duration) * 100)}%`;
  };

  const renderItem = ({ item }: { item: WatchHistoryItem }) => {
    const progress = item.position / item.duration;
    const progressWidth = `${Math.min(Math.round(progress * 100), 100)}%`;

    const handlePress = () => {
      if (onItemPress) {
        onItemPress(item);
      } else {
        // Navigate to watch screen
        router.push({
          pathname: "/watch",
          params: { animeId: item.animeId, episodeId: item.episodeId },
        });
      }
    };

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {item.thumbnailUri ? (
            <Image
              source={{ uri: item.thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderThumbnail,
                { backgroundColor: colors.card },
              ]}
            />
          )}

          <View style={styles.playButtonOverlay}>
            <View
              style={[styles.playButton, { backgroundColor: colors.primary }]}
            >
              <Play size={16} color="white" />
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.primary, width: parseInt(progressWidth) },
              ]}
            />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Typography
            variant="bodySmall"
            color={colors.text}
            weight="500"
            numberOfLines={1}
          >
            {item.title}
          </Typography>

          <Typography
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={1}
          >
            {item.episodeInfo}
          </Typography>

          <View style={styles.progressInfo}>
            <Clock
              size={12}
              color={colors.textSecondary}
              style={styles.clockIcon}
            />
            <Typography variant="caption" color={colors.textSecondary}>
              {formatProgress(item.position, item.duration)}
            </Typography>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromHistory(item.animeId, item.episodeId)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (watchHistory.length === 0 && !loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Typography variant="h3" color={colors.text} weight="600">
          Continue Watching
        </Typography>
      </View>

      <FlatList
        data={watchHistory}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.animeId}-${item.episodeId}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const { width } = Dimensions.get("window");
const itemWidth = width * 0.7;

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
  listContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  separator: {
    width: 12,
  },
  itemContainer: {
    width: itemWidth,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    width: "100%",
    height: "100%",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
  },
  infoContainer: {
    padding: 8,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  clockIcon: {
    marginRight: 4,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ContinueWatchingList;
