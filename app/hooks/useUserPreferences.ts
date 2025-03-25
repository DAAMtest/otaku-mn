import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "@lib/database.types";
import { UUID } from "./useAnimeSearch";

export interface UserPreferences {
  id: UUID;
  userId: UUID;
  darkMode: boolean;
  autoplay: boolean;
  notificationsEnabled: boolean;
  subtitleLanguage: string;
  audioLanguage: string;
  videoQuality: "auto" | "low" | "medium" | "high";
  downloadQuality: "low" | "medium" | "high";
  updatedAt: string;
}

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user preferences
  const fetchPreferences = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected for new users
        throw fetchError;
      }

      if (data) {
        setPreferences({
          id: data.id,
          userId: data.user_id,
          darkMode: data.dark_mode,
          autoplay: data.autoplay,
          notificationsEnabled: data.notifications_enabled,
          subtitleLanguage: data.subtitle_language,
          audioLanguage: data.audio_language,
          videoQuality: data.video_quality,
          downloadQuality: data.download_quality,
          updatedAt: data.updated_at,
        });
      } else {
        // Create default preferences for new users
        const defaultPreferences = {
          user_id: userId,
          dark_mode: true,
          autoplay: true,
          notifications_enabled: true,
          subtitle_language: "english",
          audio_language: "japanese",
          video_quality: "auto",
          download_quality: "medium",
          updated_at: new Date().toISOString(),
        };

        const { data: newData, error: insertError } = await supabase
          .from("user_preferences")
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) throw insertError;

        if (newData) {
          setPreferences({
            id: newData.id,
            userId: newData.user_id,
            darkMode: newData.dark_mode,
            autoplay: newData.autoplay,
            notificationsEnabled: newData.notifications_enabled,
            subtitleLanguage: newData.subtitle_language,
            audioLanguage: newData.audio_language,
            videoQuality: newData.video_quality,
            downloadQuality: newData.download_quality,
            updatedAt: newData.updated_at,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user preferences:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (
    updates: Partial<Omit<UserPreferences, "id" | "userId" | "updatedAt">>,
  ) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      // Convert from camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.darkMode !== undefined)
        dbUpdates.dark_mode = updates.darkMode;
      if (updates.autoplay !== undefined) dbUpdates.autoplay = updates.autoplay;
      if (updates.notificationsEnabled !== undefined)
        dbUpdates.notifications_enabled = updates.notificationsEnabled;
      if (updates.subtitleLanguage !== undefined)
        dbUpdates.subtitle_language = updates.subtitleLanguage;
      if (updates.audioLanguage !== undefined)
        dbUpdates.audio_language = updates.audioLanguage;
      if (updates.videoQuality !== undefined)
        dbUpdates.video_quality = updates.videoQuality;
      if (updates.downloadQuality !== undefined)
        dbUpdates.download_quality = updates.downloadQuality;

      dbUpdates.updated_at = new Date().toISOString();

      const { data, error: updateError } = await supabase
        .from("user_preferences")
        .update(dbUpdates)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setPreferences({
          id: data.id,
          userId: data.user_id,
          darkMode: data.dark_mode,
          autoplay: data.autoplay,
          notificationsEnabled: data.notifications_enabled,
          subtitleLanguage: data.subtitle_language,
          audioLanguage: data.audio_language,
          videoQuality: data.video_quality,
          downloadQuality: data.download_quality,
          updatedAt: data.updated_at,
        });
      }

      return { error: null };
    } catch (err) {
      console.error("Error updating user preferences:", err);
      return { error: err as Error };
    }
  };

  // Initialize preferences when userId changes
  useEffect(() => {
    if (userId) {
      fetchPreferences();
    } else {
      setPreferences(null);
    }
  }, [userId]);

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
  };
}

export default useUserPreferences;
