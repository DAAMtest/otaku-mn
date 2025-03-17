import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "@/context/ThemeProvider";
import OfflineDownloads from "@/components/OfflineDownloads";
import Typography from "@/components/Typography";
import { Download } from "lucide-react-native";

/**
 * Downloads screen for managing offline content
 */
export default function DownloadsScreen() {
  const { colors } = useTheme();

  const handlePlayDownload = (item: any) => {
    // Navigate to watch screen with the downloaded video
    router.push({
      pathname: "/watch",
      params: {
        animeId: item.animeId,
        episodeId: item.episodeId,
        isOffline: "true",
        localUri: item.localUri,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Downloads",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => null,
        }}
      />

      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Download
            size={24}
            color={colors.primary}
            style={styles.headerIcon}
          />
          <Typography variant="h1" color={colors.text} weight="700">
            Downloads
          </Typography>
        </View>

        <Typography
          variant="body"
          color={colors.textSecondary}
          style={styles.subtitle}
        >
          Watch your favorite anime offline
        </Typography>
      </View>

      <OfflineDownloads onPlayPress={handlePlayDownload} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerIcon: {
    marginRight: 12,
  },
  subtitle: {
    marginLeft: 36, // Align with title text after icon
  },
});
