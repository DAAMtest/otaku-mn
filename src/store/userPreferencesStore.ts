import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface UserPreferences {
  id: string;
  userId: string;
  darkMode: boolean;
  autoplay: boolean;
  notificationsEnabled: boolean;
  subtitleLanguage: string;
  audioLanguage: string;
  videoQuality: "auto" | "low" | "medium" | "high";
  downloadQuality: "low" | "medium" | "high";
  updatedAt: string;
}

interface UserPreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: Error | null;

  // Actions
  fetchPreferences: (userId: string) => Promise<void>;
  updatePreferences: (
    userId: string,
    updates: Partial<Omit<UserPreferences, "id" | "userId" | "updatedAt">>,
  ) => Promise<{ error: Error | null }>;
  setPreferences: (preferences: UserPreferences | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>(
  (set, get) => ({
    preferences: null,
    loading: false,
    error: null,

    // Setters
    setPreferences: (preferences) => set({ preferences }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch user preferences
    fetchPreferences: async (userId: string) => {
      if (!userId) return;

      set({ loading: true, error: null });

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
          set({
            preferences: {
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
            },
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
            set({
              preferences: {
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
              },
            });
          }
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
        set({ error: err as Error });
      } finally {
        set({ loading: false });
      }
    },

    // Update user preferences
    updatePreferences: async (
      userId: string,
      updates: Partial<Omit<UserPreferences, "id" | "userId" | "updatedAt">>,
    ) => {
      if (!userId) return { error: new Error("User not authenticated") };

      try {
        // Convert from camelCase to snake_case for database
        const dbUpdates: any = {};
        if (updates.darkMode !== undefined)
          dbUpdates.dark_mode = updates.darkMode;
        if (updates.autoplay !== undefined)
          dbUpdates.autoplay = updates.autoplay;
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
          set({
            preferences: {
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
            },
          });
        }

        return { error: null };
      } catch (err) {
        console.error("Error updating user preferences:", err);
        return { error: err as Error };
      }
    },
  }),
);
