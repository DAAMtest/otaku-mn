import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import VideoThumbnail from "@/components/VideoThumbnail";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  Heart,
  BookmarkPlus,
  Download,
  Star,
  Calendar,
  Clock,
  Info,
  Play,
} from "lucide-react-native";
import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from '@/types/database';

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

interface RelatedAnimeRecord {
  relation_type: string;
  related_anime_id: UUID;
  anime: {
    id: UUID;
    title: string;
    image_url: string | null;
  } | null;
}

interface RelatedAnime {
  id: UUID;
  title: string;
  imageUrl: string;
  relation: string;
}

interface WatchProgress {
  episode_id: string;
  progress: number;
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
  const [activeTab, setActiveTab] = useState<"episodes" | "related">("episodes");

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

        if (animeData && isMounted) { // Check if component is still mounted
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
            genres: animeData.anime_genres?.map((ag: any) => 
              ag.genres && typeof ag.genres === 'object' 
                ? ag.genres.name 
                : null
            ).filter(Boolean) || [],
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

          if (episodesData && isMounted) { // Check if component is still mounted
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
              const relatedAnimeIds = relatedData.map((item: { related_anime_id: string }) => item.related_anime_id);
              
              // Fetch the actual anime details for these IDs
              const { data: relatedAnimeData, error: relatedAnimeError } = await supabase
                .from("anime")
                .select("id, title, image_url")
                .in("id", relatedAnimeIds);
                
              if (relatedAnimeError) throw relatedAnimeError;
              
              if (relatedAnimeData && isMounted) {
                // Create a map of anime details by ID for quick lookup
                const animeDetailsMap = new Map<string, { id: string; title: string; image_url: string | null }>();
                relatedAnimeData.forEach((anime: { id: string; title: string; image_url: string | null }) => {
                  animeDetailsMap.set(anime.id, anime);
                });
                
                // Format related anime by combining relation type with anime details
                formattedAnime.relatedAnime = relatedData
                  .filter((relation: { related_anime_id: string }) => animeDetailsMap.has(relation.related_anime_id))
                  .map((relation: { related_anime_id: string; relation_type: string }) => {
                    const anime = animeDetailsMap.get(relation.related_anime_id)!;
                    return {
                      id: anime.id,
                      title: anime.title,
                      imageUrl: anime.image_url || "",
                      relation: relation.relation_type,
                    };
                  });
              }
            } else {
              formattedAnime.relatedAnime = [];
            }
          } catch (error) {
            console.log("Error fetching related anime:", error);
            formattedAnime.relatedAnime = [];
          }

          // Check if anime is in user's lists
          if (user && isMounted) { // Check if component is still mounted
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

              if (isMounted) { // Check if component is still mounted
                setIsInWatchlist(inWatchlist);
                setIsFavorite(inFavorites);
              }
            }
          }

          // Set anime details
          if (isMounted) { // Check if component is still mounted
            setAnimeDetails(formattedAnime);
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error("Error fetching anime details:", err);
        if (isMounted) { // Check if component is still mounted
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

  // Render anime details
  const renderAnimeDetails = () => {
    if (!animeDetails) return null;

    return (
      // Added a fragment to wrap poster and details
      <> 
        {/* Moved Poster Rendering Here */}
        <View style={styles.animeInfoContainer}>
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: animeDetails.imageUrl }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          </View>
          {/* Removed stray comment */}
        </View>

        {/* Original Details Container */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
            <Typography variant="h1" style={styles.title}>
              {String(animeDetails.title)} {/* Ensure title is string */}
            </Typography>
            {animeDetails.releaseYear && (
              <Typography variant="body" style={styles.year}>
                {'(' + animeDetails.releaseYear + ')'} 
              </Typography>
            )}
          </View>

          {/* Uncommented statsContainer */}
          <View style={styles.statsContainer}>
            {animeDetails.rating && (
              <View style={styles.statItem}>
                <Star size={16} color={colors.primary} />
                <Typography variant="body" style={styles.statText}>
                  {animeDetails.rating.toFixed(1)}
                </Typography>
              </View>
            )}
            {animeDetails.releaseDate && (
              <View style={styles.statItem}>
                <Calendar size={16} color={colors.primary} />
                <Typography variant="body" style={styles.statText}>
                  {animeDetails.releaseDate}
                </Typography>
              </View>
            )}
            {animeDetails.status && (
              <View style={styles.statItem}>
                <Info size={16} color={colors.primary} />
                <Typography variant="body" style={styles.statText}>
                  {animeDetails.status}
                </Typography>
              </View>
            )}
          </View>
          

          {/* Uncommented genreContainer */}
          <View style={styles.genreContainer}>
            {animeDetails.genres?.map((genre) => ( 
              <Badge key={genre} label={genre} /> 
            ))}
          </View>
          
        </View>

        {/* Uncommented actionButtonsContainer */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
            onPress={toggleFavorite}
          >
            <Heart
              size={20}
              color={isFavorite ? "#FF6B6B" : colors.text}
              fill={isFavorite ? "#FF6B6B" : "transparent"}
            />
            <Typography
              variant="button"
              style={[styles.actionButtonText, { color: colors.text }]}
            >
              {isFavorite ? "Favorited" : "Favorite"}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
            onPress={toggleWatchlist}
          >
            <BookmarkPlus
              size={20}
              color={isInWatchlist ? "#4CAF50" : colors.text}
              fill={isInWatchlist ? "#4CAF50" : "transparent"}
            />
            <Typography
              variant="button"
              style={[styles.actionButtonText, { color: colors.text }]}
            >
              {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.background },
            ]}
            onPress={() => {
              // Handle download action
              alert(
                "This feature is coming soon!"
              );
            }}
          >
            <Download size={20} color={colors.text} />
            <Typography
              variant="button"
              style={[styles.actionButtonText, { color: colors.text }]}
            >
              Download
            </Typography>
          </TouchableOpacity>
        </View>
        

        {/* Uncommented descriptionContainer */}
        <View style={styles.descriptionContainer}>
          <Typography variant="h2" style={styles.sectionTitle}>
            Synopsis
          </Typography>
          <Typography variant="body" style={styles.description}>
            {animeDetails.description}
          </Typography>
        </View>
        

        {/* Uncommented alternativeTitles section */}
        {animeDetails.alternativeTitles && animeDetails.alternativeTitles.length > 0 && (
          <View style={styles.infoSection}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Alternative Titles
            </Typography>
            <Typography variant="body" style={styles.infoText}>
              {animeDetails.alternativeTitles.join(", ")}
            </Typography>
          </View>
        )}
        

        {/* Uncommented season section */}
        {animeDetails.season && (
          <View style={styles.infoSection}>
            <Typography variant="h2" style={styles.sectionTitle}>
              Season
            </Typography>
            <Typography variant="body" style={styles.infoText}>
              {animeDetails.season}
            </Typography>
          </View>
        )}
        

        {/* Uncommented tabContainer */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "episodes" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("episodes")}
          >
            <Typography
              variant="button"
              style={[
                styles.tabButtonText,
                activeTab === "episodes" && styles.activeTabButtonText,
              ]}
            >
              Episodes
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "related" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("related")}
          >
            <Typography
              variant="button"
              style={[
                styles.tabButtonText,
                activeTab === "related" && styles.activeTabButtonText,
              ]}
            >
              Related Anime
            </Typography>
          </TouchableOpacity>
        </View>
        

        {/* Restored calls */}
        {activeTab === "episodes" && renderEpisodes()}
        {activeTab === "related" && renderRelatedAnime()}
        </View> 
      </> // Close fragment
    );
  };

  // Render episodes (Restored content)
  const renderEpisodes = () => {
    if (!animeDetails || !animeDetails.episodes) return null;

    return (
      <View style={styles.episodesContainer}>
        {animeDetails.episodes.map((episode) => (
          <View key={episode.id} style={styles.episodeItem}>
            <VideoThumbnail
              title={episode.title}
              episodeInfo={episode.description}
              duration={episode.duration}
              thumbnailUri={episode.thumbnailUri}
              onPress={() => handleEpisodeSelect(episode)}
            />
            {episode.watched && (
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: colors.border },
                ]}
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
  };

  // Render related anime (Restored content with nullish coalescing and dynamic label)
  const renderRelatedAnime = () => {
    // Add check for array and length
    if (!animeDetails || !Array.isArray(animeDetails.relatedAnime) || animeDetails.relatedAnime.length === 0) {
        return null;
    }

    return (
      <View style={styles.relatedContainer}>
        {animeDetails.relatedAnime.map((related, index) => ( 
          <TouchableOpacity
            key={index} // Use index as key
            style={styles.relatedAnimeItem}
            onPress={() => handleRelatedAnimeSelect(related.id)}
          >
            <Image
              source={{ uri: related.imageUrl }}
              style={styles.relatedAnimeImage}
              resizeMode="cover"
            />
            <View style={styles.relatedAnimeInfo}>
              <Typography variant="body" numberOfLines={2}>
                {String(related.title ?? '')} {/* Ensure title is string, fallback for null/undefined */}
              </Typography>
              <Badge
                label={String( // Ensure label is string
                  (related.relation?.charAt(0).toUpperCase() ?? '') + // Null check for relation and charAt
                  (related.relation?.slice(1) ?? '') // Null check for relation and slice
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
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Typography variant="body" style={{ marginTop: 16, color: colors.text }}>
          Loading anime details...
        </Typography>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Typography variant="h2" style={{ textAlign: "center", marginBottom: 20, color: colors.error }}>
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
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
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
        <View style={styles.coverImageContainer}>
          {animeDetails.coverImageUrl ? (
            <Image
              source={{ uri: animeDetails.coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.background }]} />
          )}
          <View
            style={[
              styles.coverGradient,
              { backgroundColor: "rgba(23, 23, 23, 0.8)" },
            ]}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Removed Anime Info block from here */}
        
        {renderAnimeDetails()}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#171717",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: { 
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Add padding for bottom navigation
  },
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
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  animeInfoContainer: {
    marginTop: -50,
    padding: 16,
    flexDirection: "row",
  },
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
  infoContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginLeft: 4,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genre: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#333333",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  synopsisContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    marginHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6200EE",
  },
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
  bottomSpacing: {
    height: 40,
  },
  // New styles for the improved UI
  detailsContainer: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  tabButtonText: {
    fontSize: 14,
  },
  activeTabButton: {
    backgroundColor: "#6200ee",
  },
  activeTabButtonText: {
    color: "#fff",
  },
});
