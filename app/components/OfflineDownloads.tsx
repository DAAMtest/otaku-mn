import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Play, Trash2, WifiOff } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

const DOWNLOADS_STORAGE_KEY = "OFFLINE_DOWNLOADS";

type UUID = string;

interface DownloadedItem {
  id: UUID;
  animeId: UUID;
  episodeId: UUID;
  title: string;
  episodeTitle: string;
  thumbnailUri: string;
  localUri: string;
  downloadDate: string;
  fileSize: string;
}

interface OfflineDownloadsProps {
  onPlayPress: (item: DownloadedItem) => void;
}

/**
 * OfflineDownloads component displays a list of downloaded videos
 * that can be played without an internet connection
 */
const OfflineDownloads = ({ onPlayPress }: OfflineDownloadsProps) => {
  const { colors } = useTheme();
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockDownloads: DownloadedItem[] = [
    {
      id: "1",
      animeId: "1",
      episodeId: "1",
      title: "My Hero Academia",
      episodeTitle: "Episode 1: The Beginning",
      thumbnailUri:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
      localUri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
      downloadDate: "2023-06-15T14:30:00Z",
      fileSize: "245 MB",
    },
    {
      id: "2",
      animeId: "1",
      episodeId: "2",
      title: "My Hero Academia",
      episodeTitle: "Episode 2: The Challenge",
      thumbnailUri:
        "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&q=80",
      localUri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
      downloadDate: "2023-06-16T10:15:00Z",
      fileSize: "230 MB",
    },
  ];

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      // In a real app, we would load from AsyncStorage
      // const savedData = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
      // if (savedData) {
      //   const downloadedItems = JSON.parse(savedData);
      //   setDownloads(downloadedItems);
      // }

      // For demo purposes, use mock data
      setDownloads(mockDownloads);
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDownload = (item: DownloadedItem) => {
    Alert.alert(
      "Delete Download",
      `Are you sure you want to delete "${item.episodeTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove from state
              const updatedDownloads = downloads.filter(
                (d) => d.id !== item.id,
              );
              setDownloads(updatedDownloads);

              // In a real app, we would also:
              // 1. Delete the actual file using FileSystem
              // 2. Update AsyncStorage
              // await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updatedDownloads));
            } catch (error) {
              console.error("Error deleting download:", error);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderItem = ({ item }: { item: DownloadedItem }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={() => onPlayPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playButtonOverlay}>
          <View
            style={[styles.playButton, { backgroundColor: colors.primary }]}
          >
            <Play size={20} color="white" />
          </View>
        </View>
      </TouchableOpacity>

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
          {item.episodeTitle}
        </Typography>

        <View style={styles.metaContainer}>
          <Typography variant="caption" color={colors.textSecondary}>
            {formatDate(item.downloadDate)}
          </Typography>

          <Typography variant="caption" color={colors.textSecondary}>
            {item.fileSize}
          </Typography>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteDownload(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (downloads.length === 0 && !loading) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <WifiOff
          size={48}
          color={colors.textSecondary}
          style={styles.emptyIcon}
        />
        <Typography
          variant="bodyLarge"
          color={colors.text}
          weight="600"
          style={styles.emptyTitle}
        >
          No Downloads
        </Typography>
        <Typography
          variant="body"
          color={colors.textSecondary}
          style={styles.emptyText}
        >
          Downloaded episodes will appear here for offline viewing
        </Typography>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={downloads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    padding: 12,
  },
  thumbnailContainer: {
    width: 120,
    height: 68,
    borderRadius: 4,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  deleteButton: {
    alignSelf: "center",
    padding: 8,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    maxWidth: 300,
  },
});

export default OfflineDownloads;
