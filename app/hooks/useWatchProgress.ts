import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "@lib/database.types";
import { UUID } from "./useAnimeSearch";

export interface WatchProgress {
  id: UUID;
  animeId: UUID;
  episodeId: UUID;
  userId: UUID;
  position: number; // in seconds
  duration: number; // total duration in seconds
  completed: boolean;
  updatedAt: string;
}

export function useWatchProgress(userId: string | null) {
  const [watchProgress, setWatchProgress] = useState<
    Record<string, WatchProgress>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch watch progress for a specific episode
  const fetchEpisodeProgress = async (episodeId: UUID) => {
    if (!userId) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from("watch_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("episode_id", episodeId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected
        throw fetchError;
      }

      if (data) {
        const progressData: WatchProgress = {
          id: data.id,
          animeId: data.anime_id,
          episodeId: data.episode_id,
          userId: data.user_id,
          position: data.position,
          duration: data.duration,
          completed: data.completed,
          updatedAt: data.updated_at,
        };

        setWatchProgress((prev) => ({
          ...prev,
          [episodeId]: progressData,
        }));

        return progressData;
      }

      return null;
    } catch (err) {
      console.error("Error fetching episode progress:", err);
      throw err;
    }
  };

  // Fetch all watch progress for an anime
  const fetchAnimeProgress = async (animeId: UUID) => {
    if (!userId) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("watch_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("anime_id", animeId);

      if (fetchError) throw fetchError;

      const progressMap: Record<string, WatchProgress> = {};

      (data || []).forEach((item) => {
        const progressData: WatchProgress = {
          id: item.id,
          animeId: item.anime_id,
          episodeId: item.episode_id,
          userId: item.user_id,
          position: item.position,
          duration: item.duration,
          completed: item.completed,
          updatedAt: item.updated_at,
        };

        progressMap[item.episode_id] = progressData;
      });

      setWatchProgress((prev) => ({
        ...prev,
        ...progressMap,
      }));

      return Object.values(progressMap);
    } catch (err) {
      console.error("Error fetching anime progress:", err);
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update watch progress
  const updateProgress = async ({
    animeId,
    episodeId,
    position,
    duration,
    completed = false,
  }: {
    animeId: UUID;
    episodeId: UUID;
    position: number;
    duration: number;
    completed?: boolean;
  }) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      // Check if progress already exists
      const { data: existingData, error: checkError } = await supabase
        .from("watch_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("episode_id", episodeId)
        .single();

      const now = new Date().toISOString();
      let result;

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingData) {
        // Update existing progress
        result = await supabase
          .from("watch_progress")
          .update({
            position,
            duration,
            completed,
            updated_at: now,
          })
          .eq("id", existingData.id)
          .select()
          .single();
      } else {
        // Insert new progress
        result = await supabase
          .from("watch_progress")
          .insert({
            user_id: userId,
            anime_id: animeId,
            episode_id: episodeId,
            position,
            duration,
            completed,
            updated_at: now,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Also add to watch history if completed
      if (completed) {
        const { error: historyError } = await supabase
          .from("watch_history")
          .upsert(
            {
              user_id: userId,
              anime_id: animeId,
              episode_id: episodeId,
              watched_at: now,
            },
            {
              onConflict: "user_id,anime_id,episode_id",
            },
          );

        if (historyError) throw historyError;
      }

      // Update local state
      const progressData: WatchProgress = {
        id: result.data.id,
        animeId: result.data.anime_id,
        episodeId: result.data.episode_id,
        userId: result.data.user_id,
        position: result.data.position,
        duration: result.data.duration,
        completed: result.data.completed,
        updatedAt: result.data.updated_at,
      };

      setWatchProgress((prev) => ({
        ...prev,
        [episodeId]: progressData,
      }));

      return { data: progressData, error: null };
    } catch (err) {
      console.error("Error updating watch progress:", err);
      return { data: null, error: err as Error };
    }
  };

  return {
    watchProgress,
    loading,
    error,
    fetchEpisodeProgress,
    fetchAnimeProgress,
    updateProgress,
  };
}

export default useWatchProgress;
