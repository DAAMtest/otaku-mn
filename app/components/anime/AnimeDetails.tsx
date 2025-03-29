import React from "react";
import { View, StyleSheet } from "react-native";
import AnimePoster from "./AnimePoster";
import AnimeHeader from "./AnimeHeader";
import AnimeActionButtons from "./AnimeActionButtons";
import AnimeSynopsis from "./AnimeSynopsis";
import AnimeInfoSection from "./AnimeInfoSection";
import AnimeTabSelector from "./AnimeTabSelector";
import AnimeEpisodesList from "./AnimeEpisodesList";
import AnimeRelatedList from "./AnimeRelatedList";

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

interface RelatedAnime {
  id: string;
  title: string;
  imageUrl: string;
  relation: string;
}

interface AnimeDetailsProps {
  animeDetails: {
    id: string;
    title: string;
    alternativeTitles?: string[];
    description: string;
    imageUrl?: string;
    releaseYear?: number;
    releaseDate?: string;
    season?: string;
    status?: string;
    rating?: number;
    genres?: string[];
    episodes?: Episode[];
    relatedAnime?: RelatedAnime[];
  };
  isFavorite: boolean;
  isInWatchlist: boolean;
  activeTab: "episodes" | "related";
  onTabChange: (tab: "episodes" | "related") => void;
  onToggleFavorite: () => void;
  onToggleWatchlist: () => void;
  onEpisodeSelect: (episode: Episode) => void;
  onRelatedAnimeSelect: (animeId: string) => void;
}

/**
 * AnimeDetails component displays all the details of an anime
 */
export default function AnimeDetails({
  animeDetails,
  isFavorite,
  isInWatchlist,
  activeTab,
  onTabChange,
  onToggleFavorite,
  onToggleWatchlist,
  onEpisodeSelect,
  onRelatedAnimeSelect,
}: AnimeDetailsProps) {
  if (!animeDetails) return null;

  return (
    <>
      <View style={styles.animeInfoContainer}>
        <AnimePoster imageUrl={animeDetails.imageUrl} />
      </View>

      <View style={styles.detailsContainer}>
        <AnimeHeader
          title={animeDetails.title}
          releaseYear={animeDetails.releaseYear}
          rating={animeDetails.rating}
          releaseDate={animeDetails.releaseDate}
          status={animeDetails.status}
          genres={animeDetails.genres}
        />

        <AnimeActionButtons
          isFavorite={isFavorite}
          isInWatchlist={isInWatchlist}
          onToggleFavorite={onToggleFavorite}
          onToggleWatchlist={onToggleWatchlist}
          onDownload={() => alert("This feature is coming soon!")}
        />

        <AnimeSynopsis description={animeDetails.description} />

        {animeDetails.alternativeTitles &&
          animeDetails.alternativeTitles.length > 0 && (
            <AnimeInfoSection
              title="Alternative Titles"
              content={animeDetails.alternativeTitles}
            />
          )}

        {animeDetails.season && (
          <AnimeInfoSection title="Season" content={animeDetails.season} />
        )}

        <AnimeTabSelector activeTab={activeTab} onTabChange={onTabChange} />

        {activeTab === "episodes" && (
          <AnimeEpisodesList
            episodes={animeDetails.episodes || []}
            onEpisodeSelect={onEpisodeSelect}
          />
        )}

        {activeTab === "related" && (
          <AnimeRelatedList
            relatedAnime={animeDetails.relatedAnime || []}
            onRelatedAnimeSelect={onRelatedAnimeSelect}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  animeInfoContainer: {
    marginTop: -50,
    padding: 16,
    flexDirection: "row",
  },
  detailsContainer: {
    padding: 16,
  },
});
