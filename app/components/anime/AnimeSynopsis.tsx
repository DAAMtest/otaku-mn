import React from "react";
import { View, StyleSheet } from "react-native";
import Typography from "@/components/Typography";

interface AnimeSynopsisProps {
  description: string;
}

/**
 * AnimeSynopsis component displays the anime description
 */
export default function AnimeSynopsis({ description }: AnimeSynopsisProps) {
  return (
    <View style={styles.descriptionContainer}>
      <Typography variant="h2" style={styles.sectionTitle}>
        Synopsis
      </Typography>
      <Typography variant="body" style={styles.description}>
        {description}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  descriptionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
