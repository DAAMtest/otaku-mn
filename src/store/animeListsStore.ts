import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface AnimeListItem {
  id: string;
  user_id: string;
  anime_id: string;
  list_type: string;
  progress: number;
  added_date: string;
  anime: {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    coverImageUrl: string;
    releaseDate: string;
    isFavorite?: boolean;
  };
  isFavorite?: boolean;
}

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  anime_id: string;
  watched_at: string;
  created_at: string;
  anime: {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    coverImageUrl: string;
    releaseDate: string;
  };
}

export type ListType =
  | "watching"
  | "completed"
  | "watchlist"
  | "favorites"
  | "history";

interface AnimeListsState {
  lists: Record<ListType, AnimeListItem[]>;
  loading: Record<ListType, boolean>;
  error: Record<ListType, Error | null>;

  // Actions
  fetchList: (userId: string, listType: ListType) => Promise<void>;
  addToList: (
    userId: string,
    animeId: string,
    listType: ListType,
    progress?: number,
  ) => Promise<{ error: Error | null }>;
  removeFromList: (
    userId: string,
    animeId: string,
    listType: ListType,
  ) => Promise<{ error: Error | null }>;
  updateProgress: (
    userId: string,
    animeId: string,
    progress: number,
  ) => Promise<{ error: Error | null }>;
  moveToList: (
    userId: string,
    animeId: string,
    fromList: ListType,
    toList: ListType,
    progress?: number,
  ) => Promise<{ error: Error | null }>;
  setLists: (listType: ListType, items: AnimeListItem[]) => void;
  setLoading: (listType: ListType, isLoading: boolean) => void;
  setError: (listType: ListType, error: Error | null) => void;
}

export const useAnimeListsStore = create<AnimeListsState>((set, get) => ({
  lists: {
    watching: [],
    completed: [],
    watchlist: [],
    favorites: [],
    history: [],
  },
  loading: {
    watching: false,
    completed: false,
    watchlist: false,
    favorites: false,
    history: false,
  },
  error: {
    watching: null,
    completed: null,
    watchlist: null,
    favorites: null,
    history: null,
  },

  // Setters
  setLists: (listType, items) =>
    set((state) => ({
      lists: { ...state.lists, [listType]: items },
    })),
  setLoading: (listType, isLoading) =>
    set((state) => ({
      loading: { ...state.loading, [listType]: isLoading },
    })),
  setError: (listType, error) =>
    set((state) => ({
      error: { ...state.error, [listType]: error },
    })),

  // Fetch user's anime lists
  fetchList: async (userId, listType) => {
    if (!userId) return;

    get().setLoading(listType, true);
    get().setError(listType, null);

    try {
      if (listType === "history") {
        // For history, we use the watch_history table
        const { data, error: historyError } = await supabase
          .from("watch_history")
          .select(
            `
            id,
            user_id,
            anime_id,
            watched_at,
            created_at,
            anime:anime_id(id, title, imageUrl, description, coverImageUrl, releaseDate)
          `,
          )
          .eq("user_id", userId)
          .order("watched_at", { ascending: false });

        if (historyError) throw historyError;

        const formattedData = (data || []).map((item: WatchHistoryItem) => ({
          id: item.anime.id,
          title: item.anime.title,
          imageUrl: item.anime.imageUrl,
          description: item.anime.description,
          coverImageUrl: item.anime.coverImageUrl,
          releaseDate: item.anime.releaseDate,
          watched_at: item.watched_at,
        }));

        get().setLists(listType, formattedData as any);
      } else {
        // For other lists, we use the user_anime_lists table
        const { data, error: listsError } = await supabase
          .from("user_anime_lists")
          .select(
            `
            id,
            user_id,
            anime_id,
            list_type,
            progress,
            added_date,
            anime:anime_id(id, title, imageUrl, description, coverImageUrl, releaseDate)
          `,
          )
          .eq("user_id", userId)
          .eq("list_type", listType)
          .order("added_date", { ascending: false });

        if (listsError) throw listsError;

        const formattedData = (data || []).map((item: AnimeListItem) => ({
          id: item.anime.id,
          title: item.anime.title,
          imageUrl: item.anime.imageUrl,
          description: item.anime.description,
          coverImageUrl: item.anime.coverImageUrl,
          releaseDate: item.anime.releaseDate,
          progress: item.progress,
          added_date: item.added_date,
        }));

        get().setLists(listType, formattedData as any);
      }
    } catch (err) {
      console.error(`Error fetching ${listType} list:`, err);
      get().setError(listType, err as Error);
    } finally {
      get().setLoading(listType, false);
    }
  },

  // Add anime to a list
  addToList: async (userId, animeId, listType, progress = 0) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      if (listType === "history") {
        // Add to watch history
        const { error: historyError } = await supabase
          .from("watch_history")
          .insert({
            user_id: userId,
            anime_id: animeId,
            watched_at: new Date().toISOString(),
          });

        if (historyError) throw historyError;
      } else {
        // Check if already in this list
        const { data: existingData, error: checkError } = await supabase
          .from("user_anime_lists")
          .select("id")
          .eq("user_id", userId)
          .eq("anime_id", animeId)
          .eq("list_type", listType)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "not found" which is expected
          throw checkError;
        }

        if (existingData) {
          // Update existing entry
          const { error: updateError } = await supabase
            .from("user_anime_lists")
            .update({
              progress: listType === "watching" ? progress : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingData.id);

          if (updateError) throw updateError;
        } else {
          // Insert new entry
          const { error: insertError } = await supabase
            .from("user_anime_lists")
            .insert({
              user_id: userId,
              anime_id: animeId,
              list_type: listType,
              progress: listType === "watching" ? progress : null,
              added_date: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }
      }

      // Refresh the list
      await get().fetchList(userId, listType);
      return { error: null };
    } catch (err) {
      console.error(`Error adding to ${listType} list:`, err);
      return { error: err as Error };
    }
  },

  // Remove anime from a list
  removeFromList: async (userId, animeId, listType) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      if (listType === "history") {
        // Remove from watch history (optional, usually history is not deleted)
        const { error: historyError } = await supabase
          .from("watch_history")
          .delete()
          .eq("user_id", userId)
          .eq("anime_id", animeId);

        if (historyError) throw historyError;
      } else {
        // Remove from user_anime_lists
        const { error: deleteError } = await supabase
          .from("user_anime_lists")
          .delete()
          .eq("user_id", userId)
          .eq("anime_id", animeId)
          .eq("list_type", listType);

        if (deleteError) throw deleteError;
      }

      // Refresh the list
      await get().fetchList(userId, listType);
      return { error: null };
    } catch (err) {
      console.error(`Error removing from ${listType} list:`, err);
      return { error: err as Error };
    }
  },

  // Update progress for a watching anime
  updateProgress: async (userId, animeId, progress) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      const { error: updateError } = await supabase
        .from("user_anime_lists")
        .update({
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("anime_id", animeId)
        .eq("list_type", "watching");

      if (updateError) throw updateError;

      // Refresh the watching list
      await get().fetchList(userId, "watching");
      return { error: null };
    } catch (err) {
      console.error("Error updating progress:", err);
      return { error: err as Error };
    }
  },

  // Move anime from one list to another
  moveToList: async (userId, animeId, fromList, toList, progress = 0) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      // Remove from current list
      await get().removeFromList(userId, animeId, fromList);

      // Add to new list
      await get().addToList(userId, animeId, toList, progress);

      return { error: null };
    } catch (err) {
      console.error(`Error moving from ${fromList} to ${toList}:`, err);
      return { error: err as Error };
    }
  },
}));
