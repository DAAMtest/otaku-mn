import React from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import Typography from "./Typography";

interface GenrePillsProps {
  genres: string[];
  selectedGenres: string[];
  onSelectGenre: (genre: string) => void;
  scrollable?: boolean;
  size?: "small" | "medium" | "large";
}

const GenrePills = ({
  genres,
  selectedGenres,
  onSelectGenre,
  scrollable = true,
  size = "medium",
}: GenrePillsProps) => {
  const { colors } = useTheme();

  // Size configurations
  const sizeStyles = {
    small: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: "caption",
      marginRight: 6,
      marginBottom: 6,
    },
    medium: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      fontSize: "bodySmall",
      marginRight: 8,
      marginBottom: 8,
    },
    large: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      fontSize: "body",
      marginRight: 10,
      marginBottom: 10,
    },
  };

  const currentSize = sizeStyles[size];

  const renderGenrePill = (genre: string) => {
    const isSelected = selectedGenres.includes(genre);

    return (
      <TouchableOpacity
        key={genre}
        style={[
          styles.pill,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            paddingHorizontal: currentSize.paddingHorizontal,
            paddingVertical: currentSize.paddingVertical,
            marginRight: currentSize.marginRight,
            marginBottom: currentSize.marginBottom,
          },
        ]}
        onPress={() => onSelectGenre(genre)}
        activeOpacity={0.7}
      >
        <Typography
          variant={currentSize.fontSize as any}
          color={isSelected ? "white" : colors.text}
          weight={isSelected ? "600" : "400"}
        >
          {genre}
        </Typography>
      </TouchableOpacity>
    );
  };

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {genres.map(renderGenrePill)}
      </ScrollView>
    );
  }

  return <View style={styles.container}>{genres.map(renderGenrePill)}</View>;
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pill: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GenrePills;
