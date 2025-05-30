import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import BottomNavigation from "@/components/BottomNavigation";
import AuthModal from "@/auth/components/AuthModal";
import { Download, Trash2, Play } from "lucide-react-native";

interface DownloadedAnime {
  id: string;
  title: string;
  imageUrl: string;
  episodeNumber: number;
  episodeTitle: string;
  downloadDate: string;
  fileSize: string;
  progress: number;
}

const DownloadsScreen = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [downloads, setDownloads] = useState<DownloadedAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (user) {
      // In a real app, you would fetch this from a local database or storage
      const mockDownloads: DownloadedAnime[] = [
        {
          id: "1",
          title: "Attack on Titan",
          imageUrl:
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
          episodeNumber: 1,
          episodeTitle: "To You, 2000 Years From Now",
          downloadDate: new Date().toISOString(),
          fileSize: "250 MB",
          progress: 100,
        },
        {
          id: "2",
          title: "Demon Slayer",
          imageUrl:
            "https://images.unsplash.com/photo-1614851099175-e5b30eb6f696?w=800&q=80",
          episodeNumber: 19,
          episodeTitle: "Hinokami",
          downloadDate: new Date().toISOString(),
          fileSize: "320 MB",
          progress: 100,
        },
      ];
      setDownloads(mockDownloads);
      setLoading(false);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleDeleteDownload = (id: string) => {
    Alert.alert(
      "Delete Download",
      "Are you sure you want to delete this download?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, you would delete the file from storage
            setDownloads(downloads.filter((item) => item.id !== id));
          },
        },
      ],
    );
  };

  const handlePlayDownload = (item: DownloadedAnime) => {
    // In a real app, you would play the downloaded file
    router.push({
      pathname: `/anime/${item.id}`,
      params: { animeId: item.id },
    });
  };

  const handleClearAllDownloads = () => {
    Alert.alert(
      "Clear All Downloads",
      "Are you sure you want to delete all downloads?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            // In a real app, you would delete all files from storage
            setDownloads([]);
          },
        },
      ],
    );
  };

  const renderDownloadItem = ({ item }: { item: DownloadedAnime }) => {
    const date = new Date(item.downloadDate);
    const formattedDate = date.toLocaleDateString();

    return (
      <View style={styles.downloadItem}>
        <Image source={{ uri: item.imageUrl }} style={styles.animeImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.animeTitle}>{item.title}</Text>
          <Text style={styles.episodeTitle}>
            Episode {item.episodeNumber}: {item.episodeTitle}
          </Text>
          <Text style={styles.downloadInfo}>
            {formattedDate} • {item.fileSize}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePlayDownload(item)}
          >
            <Play size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteDownload(item.id)}
          >
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Download size={64} color="#6B7280" />
      <Text style={styles.emptyTitle}>No Downloads</Text>
      <Text style={styles.emptyText}>
        Your downloaded anime episodes will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>
        {downloads.length > 0 && (
          <TouchableOpacity onPress={handleClearAllDownloads}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {!user && !authLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to access your downloads.
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloads}
          renderItem={renderDownloadItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={loading ? null : renderEmptyState()}
        />
      )}

      <BottomNavigation
        currentRoute="/downloads"
        activeTab="downloads"
        onTabChange={(tab) => {
          switch (tab) {
            case "home":
              router.push("/");
              break;
            case "history":
              router.push("/history");
              break;
            case "lists":
              router.push("/lists");
              break;
            case "profile":
              router.push("/profile");
              break;
          }
        }}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#171717",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  clearText: {
    fontSize: 14,
    color: "#EF4444",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  downloadItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  animeImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  episodeTitle: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  downloadInfo: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 300,
  },
  signInButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DownloadsScreen;
