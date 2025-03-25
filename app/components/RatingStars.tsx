import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Star } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "small" | "medium" | "large";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

const RatingStars = ({
  rating,
  maxRating = 5,
  size = "medium",
  interactive = false,
  onRatingChange,
  showValue = false,
}: RatingStarsProps) => {
  const { colors } = useTheme();

  // Size configurations
  const sizeMap = {
    small: 14,
    medium: 20,
    large: 28,
  };

  const starSize = sizeMap[size];

  const handlePress = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;
    const isHalfFilled = !isFilled && starValue <= rating + 0.5;

    return (
      <TouchableOpacity
        key={`star-${index}`}
        style={styles.starContainer}
        onPress={() => handlePress(starValue)}
        disabled={!interactive}
        activeOpacity={interactive ? 0.7 : 1}
      >
        <Star
          size={starSize}
          color={colors.warning}
          fill={isFilled ? colors.warning : "transparent"}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    );
  };

  const stars = [];
  for (let i = 0; i < maxRating; i++) {
    stars.push(renderStar(i));
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{stars}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  starContainer: {
    marginRight: 2,
  },
});

export default RatingStars;
