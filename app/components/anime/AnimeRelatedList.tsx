import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import Typography from "@/components/Typography";
import Badge from "@/components/Badge";

interface RelatedAnime {
  id: string;
  title: string;
  imageUrl: string;
  relation: string;
}

interface AnimeRelatedListProps {
  relatedAnime: RelatedAnime[];
  onRelatedAnimeSelect: (animeId: string) => void;
}

/**
 * AnimeRelatedList component displays a grid of related anime
 */
export default function AnimeRelatedList({
  relatedAnime,
  onRelatedAnimeSelect,
}: AnimeRelatedListProps) {
  if (!Array.isArray(relatedAnime) || relatedAnime.length === 0) {
    return null;
  }

  return (
    <View style={styles.relatedContainer}>
      {relatedAnime.map((related, index) => (
        <TouchableOpacity
          key={index}
          style={styles.relatedAnimeItem}
          onPress={() => onRelatedAnimeSelect(related.id)}
        >
          <Image
            source={{ uri: related.imageUrl }}
            style={styles.relatedAnimeImage}
            resizeMode="cover"
          />
          <View style={styles.relatedAnimeInfo}>
            <Typography variant="body" numberOfLines={2}>
              {String(related.title ?? "")}
            </Typography>
            <Badge
              label={String(
                (related.relation?.charAt(0).toUpperCase() ?? "") +
                  (related.relation?.slice(1) ?? ""),
              )}
              variant="default"
              size="sm"
              style={styles.relationBadge}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  relatedContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  relatedAnimeItem: {
    width: width / 2 - 24,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333333",
  },
  relatedAnimeImage: {
    width: "100%",
    aspectRatio: 0.7,
  },
  relatedAnimeInfo: {
    padding: 8,
  },
  relationBadge: {
    marginTop: 4,
  },
});
