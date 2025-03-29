import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Heart, BookmarkPlus, Download } from "lucide-react-native";
import Typography from "@/components/Typography";
import { useTheme } from "@/context/ThemeProvider";

interface AnimeActionButtonsProps {
  isFavorite: boolean;
  isInWatchlist: boolean;
  onToggleFavorite: () => void;
  onToggleWatchlist: () => void;
  onDownload: () => void;
}

/**
 * AnimeActionButtons component displays action buttons for favorite, watchlist, and download
 */
export default function AnimeActionButtons({
  isFavorite,
  isInWatchlist,
  onToggleFavorite,
  onToggleWatchlist,
  onDownload,
}: AnimeActionButtonsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.background }]}
        onPress={onToggleFavorite}
      >
        <Heart
          size={20}
          color={isFavorite ? "#FF6B6B" : colors.text}
          fill={isFavorite ? "#FF6B6B" : "transparent"}
        />
        <Typography
          variant="button"
          style={[styles.actionButtonText, { color: colors.text }]}
        >
          {isFavorite ? "Favorited" : "Favorite"}
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.background }]}
        onPress={onToggleWatchlist}
      >
        <BookmarkPlus
          size={20}
          color={isInWatchlist ? "#4CAF50" : colors.text}
          fill={isInWatchlist ? "#4CAF50" : "transparent"}
        />
        <Typography
          variant="button"
          style={[styles.actionButtonText, { color: colors.text }]}
        >
          {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.background }]}
        onPress={onDownload}
      >
        <Download size={20} color={colors.text} />
        <Typography
          variant="button"
          style={[styles.actionButtonText, { color: colors.text }]}
        >
          Download
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
