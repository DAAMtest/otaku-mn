import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import VideoPlayer from "@/components/VideoPlayer";
import VideoThumbnail from "@/components/VideoThumbnail";
import Typography from "@/components/Typography";
import Button from "@/components/Button";
import { ChevronLeft } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from '@/types/database';

// Interface for episode data
interface Episode {
  id: UUID;
  title: string;
  description: string;
  thumbnailUri: string;
  videoUri: string;
  duration: string;
}

type UUID = string;

interface AnimeDetails {
  id: UUID;
  title: string;
  season?: string;
  description: string;
  imageUrl?: string;
  releaseDate?: string;
  genres?: string[];
}

/**
 * Watch screen for playing anime episodes with a Netflix-like experience
 */
export default function WatchScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    animeId: UUID;
    episodeId: string;
    isOffline?: string;
    localUri?: string;
  }>();
  const animeId = params.animeId || "1";
  const initialEpisodeId = params.episodeId || "1";
  const isOffline = params.isOffline === "true";
  const localUri = params.localUri;

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch anime details and episodes
  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If offline mode is enabled and we have a local URI
        if (isOffline && localUri) {
          // Load from offline storage
          const savedData = await AsyncStorage.getItem("OFFLINE_DOWNLOADS");
          if (savedData) {
            const downloads = JSON.parse(savedData);
            const download = downloads.find(
              (d: any) =>
                d.animeId === animeId && d.episodeId === initialEpisodeId,
            );

            if (download) {
              setAnimeDetails({
                id: animeId,
                title: download.title,
                description: "Offline content",
              });

              setCurrentEpisode({
                id: download.episodeId,
                title: download.episodeTitle,
                description: "",
                thumbnailUri: download.thumbnailUri,
                videoUri: download.localUri,
                duration: "00:00",
              });

              setEpisodes([
                {
                  id: download.episodeId,
                  title: download.episodeTitle,
                  description: "",
                  thumbnailUri: download.thumbnailUri,
                  videoUri: download.localUri,
                  duration: "00:00",
                },
              ]);

              setLoading(false);
              return;
            }
          }
        }

        // Fetch anime details from Supabase
        const { data: animeData, error: animeError } = await supabase
          .from("anime")
          .select(
            `
            id,
            title,
            description,
            image_url,
            release_date,
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
            description: animeData.description || "No description available",
            imageUrl: animeData.image_url,
            releaseDate: animeData.release_date,
            genres:
              animeData.anime_genres?.map((g: any) => g.genres.name) || [],
          };

          setAnimeDetails(formattedAnime);

          // Fetch episodes for this anime
          const { data: episodesData, error: episodesError } = await supabase
            .from("episodes")
            .select("*")
            .eq("anime_id", animeId)
            .order("episode_number", { ascending: true });

          if (episodesError) throw episodesError;

          if (episodesData && episodesData.length > 0) {
            // Format episodes data
            const formattedEpisodes: Episode[] = episodesData.map((ep: Database["public"]["Tables"]["episodes"]["Row"]) => ({
              id: ep.id,
              title: `Episode ${ep.episode_number}: ${ep.title}`,
              description: ep.description || "",
              thumbnailUri: ep.thumbnail_url || animeData.image_url,
              videoUri:
                ep.video_url ||
                "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4", // Fallback to sample
              duration: ep.duration || "24:00",
            }));

            setEpisodes(formattedEpisodes);

            // Set current episode based on ID or default to first
            const episode =
              formattedEpisodes.find((ep) => ep.id === initialEpisodeId) ||
              formattedEpisodes[0];
            setCurrentEpisode(episode);
          } else {
            // If no episodes found in database, use mock data
            const mockEpisodes: Episode[] = [
              {
                id: "1",
                title: "Episode 1: The Beginning",
                description:
                  "The journey begins as our hero discovers their hidden powers.",
                thumbnailUri:
                  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
                videoUri:
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4", // Sample video from Expo
                duration: "24:15",
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
              },
              {
                id: "4",
                title: "Episode 4: The Confrontation",
                description:
                  "The first major battle against the antagonist unfolds.",
                thumbnailUri:
                  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
                videoUri:
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
                duration: "24:30",
              },
            ];

            setEpisodes(mockEpisodes);
            const episode =
              mockEpisodes.find((ep) => ep.id === initialEpisodeId) ||
              mockEpisodes[0];
            setCurrentEpisode(episode);
          }
        }

        // Track view history if user is logged in
        if (user) {
          await supabase.from("watch_history").upsert({
            user_id: user.id,
            anime_id: animeId,
            episode_id: initialEpisodeId,
            watched_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Error fetching anime data:", err);
        setError("Failed to load anime data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [animeId, initialEpisodeId, isOffline, localUri, user]);

  // Handle episode selection
  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    // Update URL without full navigation
    router.setParams({ episodeId: episode.id });

    // Track view in watch history if user is logged in
    if (user) {
      supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          anime_id: animeId,
          episode_id: episode.id,
          watched_at: new Date().toISOString(),
        })
        .then(({ error }: { error: Error | null }) => {
          if (error) console.error("Error updating watch history:", error);
        });
    }
  };

  // Handle next episode
  const handleNextEpisode = () => {
    if (!currentEpisode) return;

    const currentIndex = episodes.findIndex(
      (ep) => ep.id === currentEpisode.id,
    );
    if (currentIndex < episodes.length - 1) {
      handleEpisodeSelect(episodes[currentIndex + 1]);
    }
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
            Loading anime...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !animeDetails || !currentEpisode) {
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
            {error || "Failed to load anime"}
          </Typography>
          <Button
            onPress={() => router.back()}
            variant="primary"
            title="Go Back"
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

      {isPlaying && currentEpisode ? (
        <VideoPlayer
          uri={currentEpisode.videoUri}
          title={animeDetails.title}
          episodeInfo={currentEpisode.title}
          thumbnailUri={currentEpisode.thumbnailUri}
          onClose={() => setIsPlaying(false)}
          animeId={animeId}
          episodeId={currentEpisode.id}
          nextEpisodeCallback={handleNextEpisode}
          allowDownload={!isOffline}
          subtitles={[
            { language: "English", uri: "" },
            { language: "Japanese", uri: "" },
          ]}
        />
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Back button */}
          <View style={styles.backButtonContainer}>
            <Button
              onPress={() => router.back()}
              variant="ghost"
              leftIcon={<ChevronLeft size={20} color={colors.text} />}
              title="Back"
            />
          </View>

          {/* Anime details */}
          <View style={styles.detailsContainer}>
            <Typography
              variant="h1"
              color={colors.text}
              weight="700"
            >
              {animeDetails.title}
            </Typography>

            {animeDetails.season && (
              <Typography
                variant="body"
                color={colors.textSecondary}
              >
                Season {animeDetails.season}
              </Typography>
            )}

            <Typography
              variant="body"
              color={colors.text}
              style={styles.description}
            >
              {animeDetails.description}
            </Typography>
          </View>

          {/* Episodes list */}
          <View style={styles.episodesContainer}>
            <Typography
              variant="h2"
              color={colors.text}
              style={styles.episodesTitle}
            >
              Episodes
            </Typography>

            {episodes.map((episode) => (
              <VideoThumbnail
                key={episode.id}
                title={episode.title}
                episodeInfo={episode.description}
                duration={episode.duration}
                thumbnailUri={episode.thumbnailUri}
                onPress={() => handleEpisodeSelect(episode)}
                onDownloadPress={
                  !isOffline
                    ? () => console.log(`Download episode ${episode.id}`)
                    : undefined
                }
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  seasonText: {
    marginTop: 4,
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 12,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    lineHeight: 22,
  },
  episodesContainer: {
    padding: 16,
  },
  episodesTitle: {
    marginBottom: 16,
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
});
