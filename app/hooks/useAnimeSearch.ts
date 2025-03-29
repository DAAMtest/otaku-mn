import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

import type { Database } from "@lib/database.types";

export type UUID = string;

export interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number | null;
  description: string;
  releaseDate: string | null;
  coverImageUrl: string | null;
  releaseYear: number | null;
  season: string | null;
  status: string | null;
  popularity: number | null;
  genres: string[];
  isFavorite: boolean;
}

export interface DatabaseAnime {
  id: string;
  title: string;
  image_url: string;
  rating: number | null;
  description: string | null;
  release_date: string | null;
  cover_image_url: string | null;
  release_year: number | null;
  season: string | null;
  status: string | null;
  popularity: number | null;
  anime_genres: Array<{ genres: { name: string } }>;
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
    debounce(async (query: string, selectedGenres: string[] = [], minRating: number | null = null) => {
      setLoading(true);
      setError(null);

      try {
        let animeQuery = supabase
          .from("anime")
          .select(
            `
              id,
              title,
              image_url as imageUrl,
              rating,
              description,
              release_date as releaseDate,
              cover_image_url as coverImageUrl,
              release_year as releaseYear,
              season,
              status,
              popularity,
              anime_genres!inner(genres(name))
            `
          );

        // Add title search if query is provided
        if (query.trim()) {
          animeQuery = animeQuery.ilike("title", `%${query}%`);
        }

        // Add genre filters if any are selected
        if (selectedGenres.length > 0) {
          animeQuery = animeQuery.in("anime_genres.genres.name", selectedGenres);
        }

        // Add rating filter if provided
        if (minRating !== null) {
          animeQuery = animeQuery.gte("rating", minRating);
        }

        // Order by popularity (descending) and title (ascending)
        animeQuery = animeQuery.order("popularity", { ascending: false }).order("title", { ascending: true });

        const { data, error } = await animeQuery;

        if (error) throw error;

        const formattedResults = data?.map((anime: DatabaseAnime) => ({
          id: anime.id,
          title: anime.title,
          imageUrl: anime.image_url,
          rating: anime.rating,
          description: anime.description || '',
          releaseDate: anime.release_date,
          coverImageUrl: anime.cover_image_url,
          releaseYear: anime.release_year,
          season: anime.season,
          status: anime.status,
          popularity: anime.popularity,
          genres: anime.anime_genres?.map((genre) => genre.genres.name) || [],
          isFavorite: false
        })) || [];

        setSearchResults(formattedResults);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch anime"));
      } finally {
        setLoading(false);
      }
    }, 500),
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
