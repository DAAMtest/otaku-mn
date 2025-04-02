import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Genre {
  id: string;
  name: string;
  description: string | null;
  anime_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface GenreState {
  genres: Genre[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchGenres: () => Promise<void>;
  addGenre: (
    name: string,
    description?: string,
  ) => Promise<{ error: Error | null }>;
  updateGenre: (
    id: string,
    name: string,
    description?: string,
  ) => Promise<{ error: Error | null }>;
  deleteGenre: (id: string) => Promise<{ error: Error | null }>;
  setGenres: (genres: Genre[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useGenreStore = create<GenreState>((set, get) => ({
  genres: [],
  loading: false,
  error: null,

  // Setters
  setGenres: (genres) => set({ genres }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch all genres with anime counts
  fetchGenres: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch genres
      const { data: genres, error: genresError } = await supabase
        .from("genres")
        .select("*")
        .order("name");

      if (genresError) throw genresError;

      // Fetch anime counts for each genre
      const { data: counts, error: countsError } = await supabase.rpc(
        "get_genre_anime_counts",
      );

      if (countsError) throw countsError;

      // Combine the data
      const genresWithCounts = genres.map((genre: Genre) => ({
        ...genre,
        anime_count:
          counts.find((count: any) => count.genre_id === genre.id)?.count || 0,
      }));

      set({ genres: genresWithCounts });
    } catch (err) {
      console.error("Error fetching genres:", err);
      set({ error: err as Error });
    } finally {
      set({ loading: false });
    }
  },

  // Add a new genre
  addGenre: async (name, description = "") => {
    try {
      if (!name.trim()) {
        return { error: new Error("Genre name is required") };
      }

      const { data, error } = await supabase
        .from("genres")
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        genres: [...state.genres, { ...data, anime_count: 0 }],
      }));

      return { error: null };
    } catch (err) {
      console.error("Error adding genre:", err);
      return { error: err as Error };
    }
  },

  // Update an existing genre
  updateGenre: async (id, name, description = "") => {
    try {
      if (!id || !name.trim()) {
        return { error: new Error("Genre ID and name are required") };
      }

      const { error } = await supabase
        .from("genres")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        genres: state.genres.map((genre) =>
          genre.id === id
            ? {
                ...genre,
                name: name.trim(),
                description: description.trim() || null,
                updated_at: new Date().toISOString(),
              }
            : genre,
        ),
      }));

      return { error: null };
    } catch (err) {
      console.error("Error updating genre:", err);
      return { error: err as Error };
    }
  },

  // Delete a genre
  deleteGenre: async (id) => {
    try {
      // Check if genre has associated anime
      const genre = get().genres.find((g) => g.id === id);
      if (genre?.anime_count && genre.anime_count > 0) {
        return {
          error: new Error(
            `This genre is associated with ${genre.anime_count} anime. Please remove these associations first.`,
          ),
        };
      }

      const { error } = await supabase.from("genres").delete().eq("id", id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        genres: state.genres.filter((g) => g.id !== id),
      }));

      return { error: null };
    } catch (err) {
      console.error("Error deleting genre:", err);
      return { error: err as Error };
    }
  },
}));
