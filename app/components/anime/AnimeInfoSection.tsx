import React from "react";
import { View, StyleSheet } from "react-native";
import Typography from "@/components/Typography";

interface AnimeInfoSectionProps {
  title: string;
  content: string | string[];
}

/**
 * AnimeInfoSection component displays a section of information with a title
 */
export default function AnimeInfoSection({
  title,
  content,
}: AnimeInfoSectionProps) {
  const contentText = Array.isArray(content) ? content.join(", ") : content;

  return (
    <View style={styles.infoSection}>
      <Typography variant="h2" style={styles.sectionTitle}>
        {title}
      </Typography>
      <Typography variant="body" style={styles.infoText}>
        {contentText}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
});
