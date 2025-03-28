import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

import type { Database } from "@lib/database.types";

export type UUID = string;

export interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  description: string;
  releaseDate: string;
  genres: string[];
  isFavorite: boolean;
}

export function useAnimeSearch(userId: string | null) {
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch popular anime on component mount
  useEffect(() => {
    fetchPopularAnime();
  }, []);

  // Debounced search function to prevent too many API calls
  const searchAnime = useCallback(
    debounce(async (query: string, selectedGenres: string[] = []) => {
      setLoading(true);
      setError(null);

      try {
        let animeQuery = supabase
          .from("anime")
          .select(
            "id, title, image_url: imageUrl, rating, description, release_date: releaseDate, anime_genres!inner(genres(name))"
          );

        // Add title search if query is provided
        if (query.trim()) {
          animeQuery = animeQuery.ilike("title", `%${query}%`);
        }

        // Add genre filters if any are selected
        if (selectedGenres.length > 0) {
          animeQuery = animeQuery
            .in("anime_genres.genres.name", selectedGenres)
            .order("rating", { ascending: false });
        } else {
          animeQuery = animeQuery.order("rating", { ascending: false });
        }

        const { data, error } = await animeQuery.limit(20);

        if (error) throw error;

        const formattedAnime = (data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl,
          rating: item.rating || 0,
          description: item.description,
          releaseDate: item.releaseDate,
          genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
          isFavorite: false,
        }));

        setSearchResults(formattedAnime);
      } catch (err) {
        console.error("Error searching anime:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Fetch popular anime
  const fetchPopularAnime = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("anime")
        .select(
          "id, title, image_url: imageUrl, rating, description, release_date: releaseDate, anime_genres!inner(genres(name))"
        )
        .order("rating", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedAnime = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        rating: item.rating || 0,
        description: item.description,
        releaseDate: item.releaseDate,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        isFavorite: false,
      }));

      setPopularAnime(formattedAnime);
    } catch (err) {
      console.error("Error fetching popular anime:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    popularAnime,
    loading,
    error,
    searchAnime,
    fetchPopularAnime,
  };
}

export default useAnimeSearch;
