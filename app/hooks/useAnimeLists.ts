import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "@lib/database.types";
import { UUID } from "./useAnimeSearch";

export interface AnimeListItem {
  id: UUID;
  title: string;
  imageUrl: string;
  rating: number;
  progress?: number;
  addedDate: string;
  genres?: string[];
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
          .select(
            `
            id,
            watched_at,
            anime:anime_id(id, title, image_url, rating)
          `,
          )
          .eq("user_id", userId)
          .order("watched_at", { ascending: false });

        if (historyError) throw historyError;

        const formattedData = (data || []).map((item) => ({
          id: item.anime.id,
          title: item.anime.title,
          imageUrl: item.anime.image_url,
          rating: item.anime.rating || 0,
          addedDate: item.watched_at,
        }));

        setLists((prev) => ({ ...prev, [listType]: formattedData }));
      } else {
        // For other lists, we use the user_anime_lists table
        const { data, error: listsError } = await supabase
          .from("user_anime_lists")
          .select(
            `
            id,
            progress,
            added_date,
            anime:anime_id(id, title, image_url, rating)
          `,
          )
          .eq("user_id", userId)
          .eq("list_type", listType)
          .order("added_date", { ascending: false });

        if (listsError) throw listsError;

        const formattedData = (data || []).map((item) => ({
          id: item.anime.id,
          title: item.anime.title,
          imageUrl: item.anime.image_url,
          rating: item.anime.rating || 0,
          progress: item.progress,
          addedDate: item.added_date,
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
    animeId: UUID,
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
  const removeFromList = async (animeId: UUID, listType: ListType) => {
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
  const updateProgress = async (animeId: UUID, progress: number) => {
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
    animeId: UUID,
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
