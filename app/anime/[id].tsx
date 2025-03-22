import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Dimensions,
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
  imageUrl?: string;
  relation: string; // e.g., "sequel", "prequel", "side_story"
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
    const fetchAnimeData = async () => {
      try {
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

        if (animeData) {
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
            rating: animeData.rating,
            popularity: animeData.popularity,
            genres:
              animeData.anime_genres?.map((g: any) => g.genres.name) || [],
          };

          // Fetch episodes for this anime
          const { data: episodesData, error: episodesError } = await supabase
            .from("episodes")
            .select("*")
            .eq("anime_id", animeId)
            .order("episode_number", { ascending: true });

          if (episodesError) throw episodesError;

          if (episodesData && episodesData.length > 0) {
            // Format episodes data
            formattedAnime.episodes = episodesData.map((ep) => ({
              id: ep.id,
              title: `Episode ${ep.episode_number}: ${ep.title}`,
              description: ep.description || "",
              thumbnailUri: ep.thumbnail_url || animeData.image_url,
              videoUri:
                ep.video_url ||
                "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
              duration: ep.duration || "24:00",
              episodeNumber: ep.episode_number,
              watched: false,
              progress: 0,
            }));
          } else {
            // If no episodes found in database, use mock data
            formattedAnime.episodes = [
              {
                id: "1",
                title: "Episode 1: The Beginning",
                description:
                  "The journey begins as our hero discovers their hidden powers.",
                thumbnailUri:
                  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                videoUri:
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
                duration: "24:15",
                episodeNumber: 1,
                watched: false,
                progress: 0,
              },
              {
                id: "2",
                title: "Episode 2: The Challenge",
                description:
                  "Our hero faces their first major challenge and meets new allies.",
                thumbnailUri:
                  "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&q=80",
                videoUri:
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
                duration: "23:42",
                episodeNumber: 2,
                watched: false,
                progress: 0,
              },
              {
                id: "3",
                title: "Episode 3: The Revelation",
                description:
                  "A shocking revelation changes everything for our hero.",
                thumbnailUri:
                  "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?w=800&q=80",
                videoUri:
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
                duration: "25:10",
                episodeNumber: 3,
                watched: false,
                progress: 0,
              },
            ];
          }

          // Fetch related anime
          const { data: relatedData, error: relatedError } = await supabase
            .from("anime_relations")
            .select(
              `
              relation_type,
              related_anime_id,
              related_anime:related_anime_id(id, title, image_url)
            `,
            )
            .eq("anime_id", animeId);

          if (!relatedError && relatedData && relatedData.length > 0) {
            formattedAnime.relatedAnime = relatedData.map((relation) => ({
              id: relation.related_anime.id,
              title: relation.related_anime.title,
              imageUrl: relation.related_anime.image_url,
              relation: relation.relation_type,
            }));
          } else {
            // Mock related anime if none found
            formattedAnime.relatedAnime = [
              {
                id: "mock-related-1",
                title: "Related Anime 1",
                imageUrl:
                  "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80",
                relation: "sequel",
              },
              {
                id: "mock-related-2",
                title: "Related Anime 2",
                imageUrl:
                  "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=800&q=80",
                relation: "prequel",
              },
            ];
          }

          setAnimeDetails(formattedAnime);

          // Check if anime is in user's favorites
          if (user) {
            const { data: favData } = await supabase
              .from("user_favorites")
              .select("*")
              .eq("user_id", user.id)
              .eq("anime_id", animeId)
              .single();

            setIsFavorite(!!favData);

            // Check if anime is in user's watchlist
            const { data: watchlistData } = await supabase
              .from("user_watchlist")
              .select("*")
              .eq("user_id", user.id)
              .eq("anime_id", animeId)
              .single();

            setIsInWatchlist(!!watchlistData);

            // Get watch progress for episodes if user is logged in
            if (formattedAnime.episodes && formattedAnime.episodes.length > 0) {
              const { data: progressData } = await supabase
                .from("watch_history")
                .select("*")
                .eq("user_id", user.id)
                .eq("anime_id", animeId);

              if (progressData && progressData.length > 0) {
                const updatedEpisodes = formattedAnime.episodes.map(
                  (episode) => {
                    const progress = progressData.find(
                      (p) => p.episode_id === episode.id,
                    );
                    if (progress) {
                      return {
                        ...episode,
                        watched: true,
                        progress: progress.progress || 0,
                      };
                    }
                    return episode;
                  },
                );
                formattedAnime.episodes = updatedEpisodes;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching anime data:", err);
        setError("Failed to load anime data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography
            variant="body"
            color={colors.textSecondary}
            style={styles.loadingText}
          >
            Loading anime details...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !animeDetails) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Typography
            variant="h2"
            color={colors.error}
            style={styles.errorText}
          >
            {error || "Failed to load anime details"}
          </Typography>
          <Button
            onPress={() => router.back()}
            variant="primary"
            label="Go Back"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Back button */}
        <View style={styles.backButtonContainer}>
          <Button
            onPress={() => router.back()}
            variant="ghost"
            leftIcon={<ChevronLeft size={20} color={colors.text} />}
            label="Back"
          />
        </View>

        {/* Cover Image */}
        <View style={styles.coverImageContainer}>
          {animeDetails.coverImageUrl ? (
            <Image
              source={{ uri: animeDetails.coverImageUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.coverImagePlaceholder,
                { backgroundColor: colors.card },
              ]}
            />
          )}
          <View style={styles.coverGradient} />
        </View>

        {/* Anime Poster and Title Section */}
        <View style={styles.posterSection}>
          <View style={styles.posterContainer}>
            <Image
              source={{
                uri:
                  animeDetails.imageUrl ||
                  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
              }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.titleContainer}>
            <Typography
              variant="h1"
              color={colors.text}
              weight="700"
              numberOfLines={2}
            >
              {animeDetails.title}
            </Typography>

            {animeDetails.alternativeTitles &&
              animeDetails.alternativeTitles.length > 0 && (
                <Typography
                  variant="bodySmall"
                  color={colors.textSecondary}
                  style={styles.altTitles}
                >
                  {animeDetails.alternativeTitles[0]}
                </Typography>
              )}

            {/* Rating and Year */}
            <View style={styles.metadataRow}>
              {animeDetails.rating && (
                <View style={styles.ratingContainer}>
                  <Star
                    size={16}
                    color={colors.warning}
                    fill={colors.warning}
                  />
                  <Typography
                    variant="bodySmall"
                    color={colors.text}
                    weight="600"
                    style={styles.ratingText}
                  >
                    {animeDetails.rating.toFixed(1)}
                  </Typography>
                </View>
              )}

              {animeDetails.releaseYear && (
                <View style={styles.metadataItem}>
                  <Calendar
                    size={14}
                    color={colors.textSecondary}
                    style={styles.metadataIcon}
                  />
                  <Typography variant="bodySmall" color={colors.textSecondary}>
                    {animeDetails.releaseYear}
                  </Typography>
                </View>
              )}

              {animeDetails.status && (
                <View style={styles.metadataItem}>
                  <Info
                    size={14}
                    color={colors.textSecondary}
                    style={styles.metadataIcon}
                  />
                  <Typography variant="bodySmall" color={colors.textSecondary}>
                    {animeDetails.status}
                  </Typography>
                </View>
              )}
            </View>

            {/* Genres */}
            {animeDetails.genres && animeDetails.genres.length > 0 && (
              <View style={styles.genresContainer}>
                {animeDetails.genres.map((genre, index) => (
                  <Badge
                    key={index}
                    label={genre}
                    variant="secondary"
                    style={styles.genreBadge}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <Button
            onPress={startWatching}
            variant="primary"
            label="Watch Now"
            leftIcon={<Play size={18} color="white" />}
            style={styles.watchButton}
          />

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              onPress={toggleFavorite}
              style={[styles.iconButton, isFavorite && styles.activeIconButton]}
            >
              <Heart
                size={22}
                color={isFavorite ? colors.error : colors.text}
                fill={isFavorite ? colors.error : "transparent"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleWatchlist}
              style={[
                styles.iconButton,
                isInWatchlist && styles.activeIconButton,
              ]}
            >
              <BookmarkPlus
                size={22}
                color={isInWatchlist ? colors.primary : colors.text}
                fill={isInWatchlist ? colors.primary : "transparent"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Download size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Synopsis */}
        <View style={styles.synopsisContainer}>
          <Typography
            variant="h2"
            color={colors.text}
            weight="600"
            style={styles.sectionTitle}
          >
            Synopsis
          </Typography>
          <Typography
            variant="body"
            color={colors.textSecondary}
            style={styles.synopsis}
          >
            {animeDetails.description}
          </Typography>
        </View>

        {/* Tabs for Episodes and Related */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "episodes" && styles.activeTab]}
            onPress={() => setActiveTab("episodes")}
          >
            <Typography
              variant="bodyLarge"
              color={
                activeTab === "episodes" ? colors.primary : colors.textSecondary
              }
              weight={activeTab === "episodes" ? "600" : "400"}
            >
              Episodes
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "related" && styles.activeTab]}
            onPress={() => setActiveTab("related")}
          >
            <Typography
              variant="bodyLarge"
              color={
                activeTab === "related" ? colors.primary : colors.textSecondary
              }
              weight={activeTab === "related" ? "600" : "400"}
            >
              Related
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Episodes List */}
        {activeTab === "episodes" && animeDetails.episodes && (
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
        )}

        {/* Related Anime */}
        {activeTab === "related" && animeDetails.relatedAnime && (
          <View style={styles.relatedContainer}>
            {animeDetails.relatedAnime.map((related) => (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedAnimeItem}
                onPress={() => handleRelatedAnimeSelect(related.id)}
              >
                <Image
                  source={{
                    uri:
                      related.imageUrl ||
                      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                  }}
                  style={styles.relatedAnimeImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedAnimeInfo}>
                  <Typography
                    variant="bodySmall"
                    color={colors.text}
                    weight="500"
                    numberOfLines={2}
                  >
                    {related.title}
                  </Typography>
                  <Badge
                    label={
                      related.relation.charAt(0).toUpperCase() +
                      related.relation.slice(1)
                    }
                    variant="outline"
                    style={styles.relationBadge}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backButtonContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
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
  coverImagePlaceholder: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  posterSection: {
    flexDirection: "row",
    padding: 16,
    marginTop: -60,
  },
  posterContainer: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "flex-start",
  },
  altTitles: {
    marginTop: 4,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  ratingText: {
    marginLeft: 4,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metadataIcon: {
    marginRight: 4,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  genreBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  watchButton: {
    flex: 1,
  },
  secondaryActions: {
    flexDirection: "row",
    marginLeft: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  activeIconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  synopsisContainer: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  synopsis: {
    lineHeight: 22,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6200ee",
  },
  episodesContainer: {
    padding: 16,
  },
  episodeItem: {
    marginBottom: 16,
  },
  progressBar: {
    height: 3,
    width: "100%",
    borderRadius: 1.5,
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  relatedContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  relatedAnimeItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  relatedAnimeImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  relatedAnimeInfo: {
    marginTop: 8,
  },
  relationBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    minWidth: 120,
  },
  bottomSpacing: {
    height: 40,
  },
});
