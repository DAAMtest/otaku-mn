import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Anime, UUID } from "./useAnimeSearch";

type UUID = string;

export function useAnimeData() {
  const [genres, setGenres] = useState<string[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [newReleases, setNewReleases] = useState<Anime[]>([]);
  const [loading, setLoading] = useState({
    genres: false,
    trending: false,
    newReleases: false,
  });
  const [error, setError] = useState<Error | null>(null);

  // Fetch all available genres
  const fetchGenres = async () => {
    setLoading((prev) => ({ ...prev, genres: true }));
    try {
      const { data, error: fetchError } = await supabase
        .from("genres")
        .select("name")
        .order("name");

      if (fetchError) throw fetchError;

      const genreNames = (data || []).map((genre) => genre.name);
      setGenres(genreNames);
    } catch (err) {
      console.error("Error fetching genres:", err);
      setError(err as Error);
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  // Fetch trending anime (could be based on recent views or ratings)
  const fetchTrendingAnime = async () => {
    setLoading((prev) => ({ ...prev, trending: true }));
    try {
      // This is a simplified example - in a real app, you might have a more complex query
      // that takes into account recent views, ratings changes, etc.
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres(genres(name))
        `,
        )
        .order("rating", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      const formattedData = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: false, // This would be determined by user's favorites in a real app
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        description: item.description,
        releaseDate: item.release_date,
      }));

      setTrendingAnime(formattedData);
    } catch (err) {
      console.error("Error fetching trending anime:", err);
      setError(err as Error);
    } finally {
      setLoading((prev) => ({ ...prev, trending: false }));
    }
  };

  // Fetch new releases (based on release date)
  const fetchNewReleases = async () => {
    setLoading((prev) => ({ ...prev, newReleases: true }));
    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres(genres(name))
        `,
        )
        .order("release_date", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      const formattedData = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: false,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        description: item.description,
        releaseDate: item.release_date,
      }));

      setNewReleases(formattedData);
    } catch (err) {
      console.error("Error fetching new releases:", err);
      setError(err as Error);
    } finally {
      setLoading((prev) => ({ ...prev, newReleases: false }));
    }
  };

  // Fetch anime by genre
  const fetchAnimeByGenre = async (
    genre: string,
    limit = 10,
  ): Promise<Anime[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres!inner(genres!inner(name))
        `,
        )
        .eq("anime_genres.genres.name", genre)
        .order("rating", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      return (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: false,
        genres: [genre], // We know this anime has this genre
        description: item.description,
        releaseDate: item.release_date,
      }));
    } catch (err) {
      console.error(`Error fetching anime by genre ${genre}:`, err);
      throw err;
    }
  };

  // Get anime details by ID
  const getAnimeDetails = async (animeId: UUID) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(
          `
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres(genres(name))
        `,
        )
        .eq("id", animeId)
        .single();

      if (fetchError) throw fetchError;

      if (!data) throw new Error("Anime not found");

      return {
        id: data.id,
        title: data.title,
        imageUrl: data.image_url,
        rating: data.rating || 0,
        isFavorite: false, // This would be determined by user's favorites
        genres: data.anime_genres?.map((g: any) => g.genres.name) || [],
        description: data.description,
        releaseDate: data.release_date,
      };
    } catch (err) {
      console.error(`Error fetching anime details for ID ${animeId}:`, err);
      throw err;
    }
  };

  return {
    genres,
    trendingAnime,
    newReleases,
    loading,
    error,
    fetchGenres,
    fetchTrendingAnime,
    fetchNewReleases,
    fetchAnimeByGenre,
    getAnimeDetails,
  };
}

export default useAnimeData;
