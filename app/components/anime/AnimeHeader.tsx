import React from "react";
import { View, StyleSheet } from "react-native";
import { Star, Calendar, Info } from "lucide-react-native";
import Typography from "@/components/Typography";
import Badge from "@/components/Badge";
import { useTheme } from "@/context/ThemeProvider";

interface AnimeHeaderProps {
  title: string;
  releaseYear?: number;
  rating?: number;
  releaseDate?: string;
  status?: string;
  genres?: string[];
}

/**
 * AnimeHeader component displays the anime title, metadata, and genres
 */
export default function AnimeHeader({
  title,
  releaseYear,
  rating,
  releaseDate,
  status,
  genres = [],
}: AnimeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.headerSection}>
      <View style={styles.titleContainer}>
        <Typography variant="h1" style={styles.title}>
          {String(title)}
        </Typography>
        {releaseYear && (
          <Typography variant="body" style={styles.year}>
            {"(" + releaseYear + ")"}
          </Typography>
        )}
      </View>

      <View style={styles.statsContainer}>
        {rating && (
          <View style={styles.statItem}>
            <Star size={16} color={colors.primary} />
            <Typography variant="body" style={styles.statText}>
              {rating.toFixed(1)}
            </Typography>
          </View>
        )}
        {releaseDate && (
          <View style={styles.statItem}>
            <Calendar size={16} color={colors.primary} />
            <Typography variant="body" style={styles.statText}>
              {releaseDate}
            </Typography>
          </View>
        )}
        {status && (
          <View style={styles.statItem}>
            <Info size={16} color={colors.primary} />
            <Typography variant="body" style={styles.statText}>
              {status}
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.genreContainer}>
        {genres.map((genre) => (
          <Badge key={genre} label={genre} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  year: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
});
