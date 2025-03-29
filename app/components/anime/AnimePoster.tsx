import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface AnimePosterProps {
  imageUrl?: string;
}

/**
 * AnimePoster component displays the anime poster image
 */
export default function AnimePoster({ imageUrl }: AnimePosterProps) {
  return (
    <View style={styles.posterContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.posterImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  posterContainer: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#171717",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
});
