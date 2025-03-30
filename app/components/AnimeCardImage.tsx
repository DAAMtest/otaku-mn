import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { Heart } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Badge from "./Badge";

interface AnimeCardImageProps {
  imageUrl: string;
  image_url: string;
  isFavorite?: boolean;
  isNew?: boolean;
  onFavoritePress?: () => void;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
}

const AnimeCardImage = ({
  imageUrl,
  image_url,
  isFavorite = false,
  isNew = false,
  onFavoritePress,
  onPress,
  size = "large",
}: AnimeCardImageProps) => {
  const { colors } = useTheme();

  // Size configurations
  const sizeStyles = {
    small: { width: 100, height: 150, borderRadius: 6 } as const,
    medium: { width: 140, height: 200, borderRadius: 8 } as const,
    large: { width: 100, height: 220, borderRadius: 10 } as const,
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[styles.imageContainer, currentSize]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUrl || image_url || "https://via.placeholder.com/100x150" }}
        style={[styles.image, { borderRadius: currentSize.borderRadius }]}
        resizeMode="cover"
        onError={(e) => {
          console.log('Image load error:', e.nativeEvent);
        }}
      />

      {/* Favorite button */}
      {onFavoritePress && (
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={18}
            color={isFavorite ? colors.error : "#FFFFFF"}
            fill={isFavorite ? colors.error : "transparent"}
          />
        </TouchableOpacity>
      )}

      {/* New badge */}
      {isNew && (
        <View style={styles.newBadgeContainer}>
          <Badge label="NEW" variant="primary" size="sm" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1F2937", // Placeholder color
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  newBadgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
  },
});

export default AnimeCardImage;
