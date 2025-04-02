import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface AdminAnime {
  id: string;
  title: string;
  image_url: string;
  rating: number;
  description: string;
  release_date: string;
  genres?: string[];
  created_at?: string;
  updated_at?: string;
}

interface AdminAnimeState {
  animeList: AdminAnime[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchAnimeList: () => Promise<void>;
  addAnime: (
    anime: Omit<AdminAnime, "id">,
    genreIds: string[],
  ) => Promise<{ error: Error | null; id?: string }>;
  updateAnime: (
    anime: AdminAnime,
    genreIds: string[],
  ) => Promise<{ error: Error | null }>;
  deleteAnime: (id: string) => Promise<{ error: Error | null }>;
  setAnimeList: (animeList: AdminAnime[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAdminAnimeStore = create<AdminAnimeState>((set, get) => ({
  animeList: [],
  loading: false,
  error: null,

  // Setters
  setAnimeList: (animeList) => set({ animeList }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch all anime with genres
  fetchAnimeList: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres(genres(id, name))
        `,
        )
        .order("title");

      if (error) throw error;

      const formattedData = data.map((item: any) => ({
        ...item,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
      }));

      set({ animeList: formattedData });
    } catch (err) {
      console.error("Error fetching anime:", err);
      set({ error: err as Error });
    } finally {
      set({ loading: false });
    }
  },

  // Add a new anime
  addAnime: async (anime, genreIds) => {
    try {
      // Validate required fields
      if (!anime.title.trim()) {
        return { error: new Error("Title is required") };
      }

      if (!anime.image_url.trim()) {
        return { error: new Error("Image URL is required") };
      }

      // Insert new anime
      const { data, error } = await supabase
        .from("anime")
        .insert({
          title: anime.title,
          image_url: anime.image_url,
          rating: anime.rating,
          description: anime.description,
          release_date: anime.release_date,
        })
        .select("id")
        .single();

      if (error) throw error;
      const animeId = data.id;

      // Add genre relationships
      for (const genreId of genreIds) {
        const { error: insertError } = await supabase
          .from("anime_genres")
          .insert({
            anime_id: animeId,
            genre_id: genreId,
          });

        if (insertError) throw insertError;
      }

      // Refresh anime list
      await get().fetchAnimeList();
      return { error: null, id: animeId };
    } catch (err) {
      console.error("Error adding anime:", err);
      return { error: err as Error };
    }
  },

  // Update an existing anime
  updateAnime: async (anime, genreIds) => {
    try {
      // Validate required fields
      if (!anime.id) {
        return { error: new Error("Anime ID is required") };
      }

      if (!anime.title.trim()) {
        return { error: new Error("Title is required") };
      }

      if (!anime.image_url.trim()) {
        return { error: new Error("Image URL is required") };
      }

      // Update anime
      const { error } = await supabase
        .from("anime")
        .update({
          title: anime.title,
          image_url: anime.image_url,
          rating: anime.rating,
          description: anime.description,
          release_date: anime.release_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", anime.id);

      if (error) throw error;

      // Delete existing genre relationships
      const { error: deleteError } = await supabase
        .from("anime_genres")
        .delete()
        .eq("anime_id", anime.id);

      if (deleteError) throw deleteError;

      // Add new genre relationships
      for (const genreId of genreIds) {
        const { error: insertError } = await supabase
          .from("anime_genres")
          .insert({
            anime_id: anime.id,
            genre_id: genreId,
          });

        if (insertError) throw insertError;
      }

      // Refresh anime list
      await get().fetchAnimeList();
      return { error: null };
    } catch (err) {
      console.error("Error updating anime:", err);
      return { error: err as Error };
    }
  },

  // Delete an anime
  deleteAnime: async (id) => {
    try {
      // First delete related records in anime_genres
      const { error: genresError } = await supabase
        .from("anime_genres")
        .delete()
        .eq("anime_id", id);

      if (genresError) throw genresError;

      // Then delete the anime
      const { error } = await supabase.from("anime").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        animeList: state.animeList.filter((anime) => anime.id !== id),
      }));

      return { error: null };
    } catch (err) {
      console.error("Error deleting anime:", err);
      return { error: err as Error };
    }
  },
}));
