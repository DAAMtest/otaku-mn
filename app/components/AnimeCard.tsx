import React, { useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Star, Heart, Clock, Calendar } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";
import { router } from "expo-router";

import { UUID } from "@/hooks/useAnimeSearch";

interface AnimeCardProps {
  id: UUID;
  title: string;
  imageUrl: string;
  rating: number;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  episodeCount?: number;
  releaseYear?: number;
  isNew?: boolean;
}

/**
 * AnimeCard component displays anime information in a card format
 * with customizable size, interactive elements, and animations
 */
const AnimeCard = React.memo(function AnimeCard({
  id,
  title,
  imageUrl,
  rating = 0,
  isFavorite = false,
  onPress,
  onFavoritePress,
  size = "medium",
  isLoading = false,
  episodeCount,
  releaseYear,
  isNew = false,
}: AnimeCardProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Determine card dimensions based on size prop
  const dimensions = {
    small: { width: 120, height: 180 },
    medium: { width: 150, height: 225 },
    large: { width: 180, height: 270 },
  };

  const { width, height } = dimensions[size];

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
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            width,
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
              width,
              height,
              backgroundColor: colors.skeleton,
            },
          ]}
        />
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.skeletonText,
              {
                backgroundColor: colors.cardHover,
                width: width * 0.8,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  const BADGE_LEFT_OFFSET = 8;
  const RATING_BADGE_WIDTH = 70;

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
        activeOpacity={0.9}
        style={[styles.container, { width }]}
        accessible={true}
        accessibilityLabel={`${title}, Rating: ${rating}, ${isFavorite ? "In favorites" : "Not in favorites"}`}
        accessibilityRole="button"
        accessibilityHint="Opens anime details"
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              { width, height, backgroundColor: colors.background },
            ]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors={true}
          />

          {/* Rating badge */}
          {rating > 0 && (
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: "rgba(0,0,0,0.7)" },
              ]}
            >
              <Star size={12} color="#FFD700" style={styles.starIcon} />
              <Typography
                variant="caption"
                color="#FFFFFF"
                style={styles.ratingText}
              >
                {rating.toFixed(1)}
              </Typography>
            </View>
          )}

          {/* New badge */}
          {isNew && (
            <View
              style={[
                styles.newBadge,
                { backgroundColor: colors.secondary, left: rating > 0 ? BADGE_LEFT_OFFSET + RATING_BADGE_WIDTH : BADGE_LEFT_OFFSET },
              ]}
            >
              <Typography
                variant="caption"
                color="#FFFFFF"
                style={styles.badgeText}
              >
                NEW
              </Typography>
            </View>
          )}

          {/* Favorite button */}
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            accessibilityRole="button"
          >
            <Heart
              size={16}
              color={isFavorite ? colors.secondary : "#FFFFFF"}
              fill={isFavorite ? colors.secondary : "none"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Typography
            variant="bodySmall"
            numberOfLines={2}
            color={colors.text}
            weight="500"
          >
            {title}
          </Typography>

          {/* Additional info row */}
          {(episodeCount || releaseYear) && (
            <View style={styles.infoContainer}>
              {episodeCount && (
                <View style={styles.infoContainer}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Typography
                    variant="caption"
                    color={colors.textSecondary}
                    style={styles.infoText}
                  >
                    {episodeCount} episodes
                  </Typography>
                </View>
              )}
              {releaseYear && (
                <View style={styles.infoContainer}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <Typography
                    variant="caption"
                    color={colors.textSecondary}
                    style={styles.infoText}
                  >
                    {releaseYear}
                  </Typography>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 2/3,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111827",
  },
  titleContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 10,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 8,
  },
});

export default AnimeCard;
