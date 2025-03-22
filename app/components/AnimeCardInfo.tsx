import React from "react";
import { View, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

interface AnimeCardInfoProps {
  title: string;
  rating?: number;
  episodeCount?: number;
  releaseYear?: number;
  size?: "small" | "medium" | "large";
}

const AnimeCardInfo = ({
  title,
  rating,
  episodeCount,
  releaseYear,
  size = "large",
}: AnimeCardInfoProps) => {
  const { colors } = useTheme();

  // Get title variant based on size
  const getTitleVariant = () => {
    switch (size) {
      case "small":
        return "caption";
      case "medium":
        return "bodySmall";
      case "large":
      default:
        return "body";
    }
  };

  // Get metadata variant based on size
  const getMetadataVariant = () => {
    switch (size) {
      case "small":
      case "medium":
        return "caption";
      case "large":
      default:
        return "bodySmall";
    }
  };

  return (
    <View style={styles.infoContainer}>
      <Typography
        variant={getTitleVariant()}
        color={colors.text}
        weight="600"
        numberOfLines={2}
        style={styles.title}
      >
        {title}
      </Typography>

      <View style={styles.metadataContainer}>
        {rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Star
              size={size === "small" ? 10 : 12}
              color="#FFD700"
              fill="#FFD700"
            />
            <Typography
              variant={getMetadataVariant()}
              color={colors.textSecondary}
              style={styles.ratingText}
            >
              {rating.toFixed(1)}
            </Typography>
          </View>
        )}

        {episodeCount !== undefined && (
          <Typography
            variant={getMetadataVariant()}
            color={colors.textSecondary}
            style={styles.episodeCount}
          >
            {episodeCount} ep
          </Typography>
        )}

        {releaseYear !== undefined && (
          <Typography
            variant={getMetadataVariant()}
            color={colors.textSecondary}
          >
            {releaseYear}
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    marginTop: 8,
  },
  title: {
    marginBottom: 4,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 4,
  },
  episodeCount: {
    marginRight: 8,
  },
});

export default AnimeCardInfo;
