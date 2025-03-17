import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Play, Clock, Download } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

interface VideoThumbnailProps {
  title: string;
  episodeInfo?: string;
  duration?: string;
  thumbnailUri: string;
  onPress: () => void;
  isDownloaded?: boolean;
  downloadProgress?: number;
  onDownloadPress?: () => void;
}

/**
 * VideoThumbnail component displays a video thumbnail with play button
 * and optional download status
 */
const VideoThumbnail = ({
  title,
  episodeInfo,
  duration,
  thumbnailUri,
  onPress,
  isDownloaded = false,
  downloadProgress = 0,
  onDownloadPress,
}: VideoThumbnailProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.overlay}>
          <View
            style={[styles.playButton, { backgroundColor: colors.primary }]}
          >
            <Play size={24} color="white" fill="white" />
          </View>
        </View>

        {duration && (
          <View style={styles.durationBadge}>
            <Clock size={12} color="white" style={styles.durationIcon} />
            <Typography variant="caption" color="white">
              {duration}
            </Typography>
          </View>
        )}

        {onDownloadPress && (
          <TouchableOpacity
            style={[
              styles.downloadButton,
              isDownloaded && { backgroundColor: colors.success },
            ]}
            onPress={onDownloadPress}
          >
            <Download
              size={16}
              color="white"
              style={
                downloadProgress > 0 && downloadProgress < 100
                  ? styles.downloading
                  : undefined
              }
            />

            {downloadProgress > 0 && downloadProgress < 100 && (
              <View style={styles.downloadProgressContainer}>
                <View
                  style={[
                    styles.downloadProgress,
                    {
                      width: `${downloadProgress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Typography
          variant="bodySmall"
          color={colors.text}
          weight="500"
          numberOfLines={1}
        >
          {title}
        </Typography>

        {episodeInfo && (
          <Typography
            variant="caption"
            color={colors.textSecondary}
            numberOfLines={1}
          >
            {episodeInfo}
          </Typography>
        )}
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get("window");
const thumbnailWidth = width - 32; // Full width minus padding

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: thumbnailWidth,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  durationIcon: {
    marginRight: 4,
  },
  downloadButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  downloading: {
    opacity: 0.7,
  },
  downloadProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  downloadProgress: {
    height: "100%",
  },
  infoContainer: {
    marginTop: 8,
  },
});

export default VideoThumbnail;
