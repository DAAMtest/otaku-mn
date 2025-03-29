import React from "react";
import { View, StyleSheet } from "react-native";
import VideoThumbnail from "@/components/VideoThumbnail";
import { useTheme } from "@/context/ThemeProvider";

interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnailUri: string;
  videoUri: string;
  duration: string;
  episodeNumber: number;
  watched?: boolean;
  progress?: number;
}

interface AnimeEpisodesListProps {
  episodes: Episode[];
  onEpisodeSelect: (episode: Episode) => void;
}

/**
 * AnimeEpisodesList component displays a list of episodes with thumbnails
 */
export default function AnimeEpisodesList({
  episodes,
  onEpisodeSelect,
}: AnimeEpisodesListProps) {
  const { colors } = useTheme();

  if (!episodes || episodes.length === 0) {
    return null;
  }

  return (
    <View style={styles.episodesContainer}>
      {episodes.map((episode) => (
        <View key={episode.id} style={styles.episodeItem}>
          <VideoThumbnail
            title={episode.title}
            episodeInfo={episode.description}
            duration={episode.duration}
            thumbnailUri={episode.thumbnailUri}
            onPress={() => onEpisodeSelect(episode)}
          />
          {episode.watched && (
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${episode.progress || 0}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  episodesContainer: {
    padding: 16,
  },
  episodeItem: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    width: "100%",
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
