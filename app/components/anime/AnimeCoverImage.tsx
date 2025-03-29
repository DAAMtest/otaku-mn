import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";

interface AnimeCoverImageProps {
  coverImageUrl?: string;
  onBackPress: () => void;
}

/**
 * AnimeCoverImage component displays the anime cover image with a back button
 */
export default function AnimeCoverImage({
  coverImageUrl,
  onBackPress,
}: AnimeCoverImageProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.coverImageContainer}>
      {coverImageUrl ? (
        <Image
          source={{ uri: coverImageUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[styles.coverImage, { backgroundColor: colors.background }]}
        />
      )}
      <View
        style={[
          styles.coverGradient,
          { backgroundColor: "rgba(23, 23, 23, 0.8)" },
        ]}
      />
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <ChevronLeft color={colors.text} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  coverImageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
