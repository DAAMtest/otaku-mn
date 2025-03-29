import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

// Import new components
import AnimeCoverImage from "@/components/anime/AnimeCoverImage";
import AnimeDetails from "@/components/anime/AnimeDetails";

type UUID = string;

interface AnimeDetails {
  id: UUID;
  title: string;
  alternativeTitles?: string[];
  description: string;
  imageUrl?: string;
  coverImageUrl?: string;
  releaseDate?: string;
  releaseYear?: number;
  season?: string;
  status?: string;
  rating?: number;
  popularity?: number;
  genres?: string[];
  episodes?: Episode[];
  relatedAnime?: RelatedAnime[];
}

interface Episode {
  id: UUID;
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
  id: UUID;
  title: string;
  imageUrl: string;
  relation: string;
}

/**
 * AnimeDetailsScreen displays detailed information about a specific anime
 */
export default function AnimeDetailsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: UUID }>();
  const animeId = params.id;

  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState<"episodes" | "related">(
    "episodes",
  );

  // Fetch anime details
  useEffect(() => {
    let isMounted = true; // Flag to track if component is mounted

    const fetchAnimeData = async () => {
      try {
        if (!isMounted) return; // Don't proceed if component unmounted

        setLoading(true);
        setError(null);

        if (!animeId) {
          setError("Anime ID is missing");
          setLoading(false);
          return;
        }

        // Fetch anime details from Supabase
        const { data: animeData, error: animeError } = await supabase
          .from("anime")
          .select(
            `
            id,
            title,
            alternative_titles,
            description,
            image_url,
            cover_image_url,
            release_date,
            release_year,
            season,
            status,
            rating,
            popularity,
            anime_genres(genres(name))
          `,
          )
          .eq("id", animeId)
          .single();

        if (animeError) throw animeError;

        if (animeData && isMounted) {
          // Check if component is still mounted
          // Format anime details
          const formattedAnime: AnimeDetails = {
            id: animeData.id,
            title: animeData.title,
            alternativeTitles: animeData.alternative_titles || [],
            description: animeData.description || "No description available",
            imageUrl: animeData.image_url,
            coverImageUrl: animeData.cover_image_url || animeData.image_url,
            releaseDate: animeData.release_date,
            releaseYear: animeData.release_year,
            season: animeData.season,
            status: animeData.status,
            rating: animeData.rating || 0,
            popularity: animeData.popularity,
            genres:
              animeData.anime_genres
                ?.map((ag: any) =>
                  ag.genres && typeof ag.genres === "object"
                    ? ag.genres.name
                    : null,
                )
                .filter(Boolean) || [],
            episodes: [],
            relatedAnime: [],
          };

          // Fetch episodes
          const { data: episodesData, error: episodesError } = await supabase
            .from("episodes")
            .select("*")
            .eq("anime_id", animeId)
            .order("episode_number", { ascending: true });

          if (episodesError) throw episodesError;

          if (episodesData && isMounted) {
            // Check if component is still mounted
            // Format episodes
            formattedAnime.episodes = episodesData.map((ep: any) => ({
              id: ep.id,
              title: ep.title,
              description: ep.description || "",
              thumbnailUri: ep.thumbnail_url || formattedAnime.imageUrl || "",
              videoUri: ep.video_url || "",
              duration: ep.duration || "Unknown",
              episodeNumber: ep.episode_number,
              watched: false,
              progress: 0,
            }));
          }

          // Fetch related anime - using anime_relations table instead of related_anime
          try {
            const { data: relatedData, error: relatedError } = await supabase
              .from("anime_relations")
              .select("*")
              .eq("anime_id", animeId);

            if (relatedError) throw relatedError;

            if (relatedData && relatedData.length > 0 && isMounted) {
              // Get the related anime IDs
              const relatedAnimeIds = relatedData.map(
                (item: { related_anime_id: string }) => item.related_anime_id,
              );

              // Fetch the actual anime details for these IDs
              const { data: relatedAnimeData, error: relatedAnimeError } =
                await supabase
                  .from("anime")
                  .select("id, title, image_url")
                  .in("id", relatedAnimeIds);

              if (relatedAnimeError) throw relatedAnimeError;

              if (relatedAnimeData && isMounted) {
                // Create a map of anime details by ID for quick lookup
                const animeDetailsMap = new Map<
                  string,
                  { id: string; title: string; image_url: string | null }
                >();
                relatedAnimeData.forEach(
                  (anime: {
                    id: string;
                    title: string;
                    image_url: string | null;
                  }) => {
                    animeDetailsMap.set(anime.id, anime);
                  },
                );

                // Format related anime by combining relation type with anime details
                formattedAnime.relatedAnime = relatedData
                  .filter((relation: { related_anime_id: string }) =>
                    animeDetailsMap.has(relation.related_anime_id),
                  )
                  .map(
                    (relation: {
                      related_anime_id: string;
                      relation_type: string;
                    }) => {
                      const anime = animeDetailsMap.get(
                        relation.related_anime_id,
                      )!;
                      return {
                        id: anime.id,
                        title: anime.title,
                        imageUrl: anime.image_url || "",
                        relation: relation.relation_type,
                      };
                    },
                  );
              }
            } else {
              formattedAnime.relatedAnime = [];
            }
          } catch (error) {
            console.log("Error fetching related anime:", error);
            formattedAnime.relatedAnime = [];
          }

          // Check if anime is in user's lists
          if (user && isMounted) {
            // Check if component is still mounted
            const { data: listData, error: listError } = await supabase
              .from("user_anime_lists")
              .select("list_type")
              .eq("user_id", user.id)
              .eq("anime_id", animeId);

            if (!listError && listData) {
              const inWatchlist = listData.some(
                (item: any) => item.list_type === "watchlist",
              );
              const inFavorites = listData.some(
                (item: any) => item.list_type === "favorites",
              );

              if (isMounted) {
                // Check if component is still mounted
                setIsInWatchlist(inWatchlist);
                setIsFavorite(inFavorites);
              }
            }
          }

          // Set anime details
          if (isMounted) {
            // Check if component is still mounted
            setAnimeDetails(formattedAnime);
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error("Error fetching anime details:", err);
        if (isMounted) {
          // Check if component is still mounted
          setError(err.message || "Failed to load anime details");
          setLoading(false);
        }
      }
    };

    fetchAnimeData();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [animeId, user]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!user || !animeDetails) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("anime_id", animeDetails.id);
      } else {
        // Add to favorites
        await supabase.from("user_favorites").insert({
          user_id: user.id,
          anime_id: animeDetails.id,
          created_at: new Date().toISOString(),
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  // Toggle watchlist status
  const toggleWatchlist = async () => {
    if (!user || !animeDetails) return;

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await supabase
          .from("user_watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("anime_id", animeDetails.id);
      } else {
        // Add to watchlist
        await supabase.from("user_watchlist").insert({
          user_id: user.id,
          anime_id: animeDetails.id,
          created_at: new Date().toISOString(),
        });
      }
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error("Error toggling watchlist status:", error);
    }
  };

  // Start watching from the first episode or continue watching
  const startWatching = () => {
    if (
      !animeDetails ||
      !animeDetails.episodes ||
      animeDetails.episodes.length === 0
    )
      return;

    // Find first unwatched episode or the one with the least progress
    const episodeToWatch =
      animeDetails.episodes.find((ep) => !ep.watched) ||
      animeDetails.episodes[0];

    router.push({
      pathname: "/watch",
      params: { animeId: animeDetails.id, episodeId: episodeToWatch.id },
    });
  };

  // Handle episode selection
  const handleEpisodeSelect = (episode: Episode) => {
    router.push({
      pathname: "/watch",
      params: { animeId: animeDetails?.id, episodeId: episode.id },
    });
  };

  // Handle related anime selection
  const handleRelatedAnimeSelect = (relatedAnimeId: UUID) => {
    router.push({
      pathname: `/anime/${relatedAnimeId}`,
    });
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography
          variant="body"
          style={{ marginTop: 16, color: colors.text }}
        >
          Loading anime details...
        </Typography>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Typography
          variant="h2"
          style={{ textAlign: "center", marginBottom: 20, color: colors.error }}
        >
          {error}
        </Typography>
        <Button
          title="Try Again"
          onPress={() => router.replace(`/anime/${animeId}`)}
          style={{ minWidth: 120 }}
        />
      </View>
    );
  }

  if (!animeDetails) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Typography variant="body" style={{ color: colors.text }}>
          No anime details found
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Cover Image */}
        <AnimeCoverImage
          coverImageUrl={animeDetails.coverImageUrl}
          onBackPress={() => router.back()}
        />

        {/* Anime Details */}
        <AnimeDetails
          animeDetails={animeDetails}
          isFavorite={isFavorite}
          isInWatchlist={isInWatchlist}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onToggleFavorite={toggleFavorite}
          onToggleWatchlist={toggleWatchlist}
          onEpisodeSelect={handleEpisodeSelect}
          onRelatedAnimeSelect={handleRelatedAnimeSelect}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === "ios" ? 90 : 70, // Add padding for bottom navigation
  },
});
