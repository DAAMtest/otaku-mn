import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Database } from '@/types/database';
import { useQuery } from "react-query";

interface AnimeListItem {
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

interface WatchHistoryItem {
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

export function useAnimeLists(userId: string | null) {
  const [lists, setLists] = useState<Record<ListType, AnimeListItem[]>>({
    watching: [],
    completed: [],
    watchlist: [],
    favorites: [],
    history: [],
  });
  const [loading, setLoading] = useState<Record<ListType, boolean>>({
    watching: false,
    completed: false,
    watchlist: false,
    favorites: false,
    history: false,
  });
  const [error, setError] = useState<Record<ListType, Error | null>>({
    watching: null,
    completed: null,
    watchlist: null,
    favorites: null,
    history: null,
  });

  const { data: animeLists, error: queryError, isLoading } = useQuery(
    ["animeLists", userId],
    async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_anime_lists")
        .select("id, user_id, anime_id, list_type, progress, added_date, anime(id, title, imageUrl, description, coverImageUrl, releaseDate, isFavorite)")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    { enabled: !!userId }
  );

  useEffect(() => {
    if (animeLists) {
      const formattedLists: Record<ListType, AnimeListItem[]> = {
        watching: [],
        completed: [],
        watchlist: [],
        favorites: [],
        history: [],
      };

      animeLists.forEach((item: AnimeListItem) => {
        const listType = item.list_type;
        const animeItem: AnimeListItem = {
          id: item.id,
          user_id: item.user_id,
          anime_id: item.anime_id,
          list_type: item.list_type,
          progress: item.progress,
          added_date: item.added_date,
          anime: {
            id: item.anime.id,
            title: item.anime.title,
            imageUrl: item.anime.imageUrl,
            description: item.anime.description,
            coverImageUrl: item.anime.coverImageUrl,
            releaseDate: item.anime.releaseDate,
            isFavorite: item.anime.isFavorite
          }
        };

        if (listType === "watching") {
          animeItem.isFavorite = false;
        }

        formattedLists[listType as ListType].push(animeItem);
      });

      setLists(formattedLists);
    }
  }, [animeLists]);

  // Fetch user's anime lists
  const fetchList = async (listType: ListType) => {
    if (!userId) return;

    setLoading((prev) => ({ ...prev, [listType]: true }));
    setError((prev) => ({ ...prev, [listType]: null }));

    try {
      if (listType === "history") {
        // For history, we use the watch_history table
        const { data, error: historyError } = await supabase
          .from("watch_history")
          .select(`
            id,
            user_id,
            anime_id,
            watched_at,
            created_at,
            anime:anime_id(id, title, imageUrl, description, coverImageUrl, releaseDate)
          `)
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
          watched_at: item.watched_at
        }));

        setLists((prev) => ({ ...prev, [listType]: formattedData }));
      } else {
        // For other lists, we use the user_anime_lists table
        const { data, error: listsError } = await supabase
          .from("user_anime_lists")
          .select(`
            id,
            user_id,
            anime_id,
            list_type,
            progress,
            added_date,
            anime:anime_id(id, title, imageUrl, description, coverImageUrl, releaseDate)
          `)
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
          added_date: item.added_date
        }));

        setLists((prev) => ({ ...prev, [listType]: formattedData }));
      }
    } catch (err) {
      console.error(`Error fetching ${listType} list:`, err);
      setError((prev) => ({ ...prev, [listType]: err as Error }));
    } finally {
      setLoading((prev) => ({ ...prev, [listType]: false }));
    }
  };

  // Add anime to a list
  const addToList = async (
    animeId: string,
    listType: ListType,
    progress: number = 0,
  ) => {
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
      await fetchList(listType);
      return { error: null };
    } catch (err) {
      console.error(`Error adding to ${listType} list:`, err);
      return { error: err as Error };
    }
  };

  // Remove anime from a list
  const removeFromList = async (animeId: string, listType: ListType) => {
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
      await fetchList(listType);
      return { error: null };
    } catch (err) {
      console.error(`Error removing from ${listType} list:`, err);
      return { error: err as Error };
    }
  };

  // Update progress for a watching anime
  const updateProgress = async (animeId: string, progress: number) => {
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
      await fetchList("watching");
      return { error: null };
    } catch (err) {
      console.error("Error updating progress:", err);
      return { error: err as Error };
    }
  };

  // Move anime from one list to another
  const moveToList = async (
    animeId: string,
    fromList: ListType,
    toList: ListType,
    progress: number = 0,
  ) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      // Remove from current list
      await removeFromList(animeId, fromList);

      // Add to new list
      await addToList(animeId, toList, progress);

      return { error: null };
    } catch (err) {
      console.error(`Error moving from ${fromList} to ${toList}:`, err);
      return { error: err as Error };
    }
  };

  return {
    lists,
    loading,
    error,
    fetchList,
    addToList,
    removeFromList,
    updateProgress,
    moveToList,
  };
}

export default useAnimeLists;
