import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Search, RefreshCw } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

interface AnimeListEmptyStateProps {
  type: "search" | "list" | "favorites" | "history" | "generic";
  message?: string;
  onActionPress?: () => void;
  actionLabel?: string;
  loading?: boolean;
}

const AnimeListEmptyState = ({
  type,
  message,
  onActionPress,
  actionLabel,
  loading = false,
}: AnimeListEmptyStateProps) => {
  const { colors } = useTheme();

  // Default messages based on type
  const getDefaultMessage = () => {
    switch (type) {
      case "search":
        return "No results found. Try different search terms.";
      case "list":
        return "Your list is empty. Start adding anime to your list.";
      case "favorites":
        return "You haven't added any favorites yet.";
      case "history":
        return "Your watch history is empty.";
      case "generic":
      default:
        return "No content available.";
    }
  };

  // Default action labels based on type
  const getDefaultActionLabel = () => {
    switch (type) {
      case "search":
        return "Search Again";
      case "list":
      case "favorites":
        return "Browse Anime";
      case "history":
        return "Explore";
      case "generic":
      default:
        return "Refresh";
    }
  };

  // Icon based on type
  const renderIcon = () => {
    switch (type) {
      case "search":
        return <Search size={40} color={colors.textSecondary} />;
      case "generic":
      case "list":
      case "favorites":
      case "history":
      default:
        return <RefreshCw size={40} color={colors.textSecondary} />;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Typography
        variant="body"
        color={colors.textSecondary}
        style={styles.message}
      >
        {message || getDefaultMessage()}
      </Typography>

      {onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Typography variant="bodySmall" color="white" weight="500">
            {actionLabel || getDefaultActionLabel()}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 200,
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});

export default AnimeListEmptyState;
