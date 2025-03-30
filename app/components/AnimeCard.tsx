import React, { useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Text,
} from "react-native";
import { Star, Heart, Clock, Calendar, Plus } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
import { router } from "expo-router";
import { Anime } from "@/hooks/useAnimeSearch";

interface AnimeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  image_url?: string;
  rating: number;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
  onAddToListPress: () => void;
  width: number;
  height: number;
  releaseYear?: number;
  episodeCount?: number;
  isNew?: boolean;
}

/**
 * AnimeCard component displays anime information in a card format
 * with customizable size, interactive elements, and animations
 */
const AnimeCard = ({
  id,
  title,
  imageUrl,
  image_url,
  rating,
  isFavorite,
  onPress,
  onFavoritePress,
  onAddToListPress,
  width,
  height,
  releaseYear,
  episodeCount,
  isNew,
}: AnimeCardProps) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Determine card dimensions based on size prop
  const dimensions = {
    small: { width: 120, height: 180 },
    medium: { width: 150, height: 225 },
    large: { width: 180, height: 270 },
  };

  const { width: defaultWidth, height: defaultHeight } = dimensions['medium'];

  // Use provided width and height if available, otherwise use default dimensions
  const cardWidth = width ?? defaultWidth;
  const cardHeight = height ?? defaultHeight;

  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  // Handle card press - navigate to anime details screen
  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else if (id) {
      // Navigate to anime details screen
      router.push({
        pathname: `/anime/${id}`,
      });
    }
  };

  // Handle favorite button press with haptic feedback
  const handleFavoritePress = () => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    onFavoritePress?.();
  };

  // Skeleton loading state
  const isLoading = false;
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            width: cardWidth,
            backgroundColor: colors.skeleton,
            borderRadius: 8,
            overflow: "hidden",
          },
        ]}
      >
        <View
          style={[
            styles.image,
            {
              width: cardWidth,
              height: cardHeight,
              backgroundColor: colors.skeleton,
            },
          ]}
        />
        <View style={styles.infoContainer}>
          <View
            style={[
              styles.skeletonText,
              {
                backgroundColor: colors.cardHover,
                width: cardWidth * 0.8,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={[
          styles.container,
          {
            width: cardWidth,
            backgroundColor: colors.card,
            marginBottom: 16,
            marginHorizontal: 4,
          },
        ]}
        accessible={true}
        accessibilityLabel={`Anime card for ${title}`}
        accessibilityHint="Double tap to view anime details"
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl || image_url }}
            style={[
              styles.image,
              { backgroundColor: colors.background },
            ]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors={true}
          />

          {/* Rating badge */}
          {rating > 0 && (
            <View
              style={[
                styles.ratingContainer,
                { backgroundColor: "rgba(0,0,0,0.7)" },
              ]}
            >
              <Star size={14} color={colors.yellow} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Action buttons container */}
          <View style={styles.actionsContainer}>
            {/* Favorite button */}
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={[
                styles.actionButton,
                isFavorite && styles.favoriteButton,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              accessibilityRole="button"
            >
              <Heart
                size={16}
                color={colors.white}
                fill={isFavorite ? colors.white : "transparent"}
              />
            </TouchableOpacity>

            {/* Add to list button */}
            {onAddToListPress && (
              <TouchableOpacity
                onPress={onAddToListPress}
                style={[
                  styles.actionButton,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible={true}
                accessibilityLabel="Add to watchlist"
                accessibilityRole="button"
              >
                <Plus size={16} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* New badge */}
          {isNew && (
            <View
              style={[
                styles.newBadge,
                { position: "absolute", bottom: 8, left: 8 },
              ]}
            >
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.infoContainer}>
          {/* Title */}
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>

          {/* Additional info */}
          <View style={styles.metadataContainer}>
            {releaseYear && (
              <View style={styles.metadataItem}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  {releaseYear}
                </Text>
              </View>
            )}
            
            {episodeCount !== undefined && (
              <View style={styles.metadataItem}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  {episodeCount} ep
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    aspectRatio: 2/3,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    height: 40, // Fixed height for 2 lines of text
  },
  actionsContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "column",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  favoriteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.7)",
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
  },
  newBadge: {
    backgroundColor: "#34C759",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  skeletonText: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default AnimeCard;
