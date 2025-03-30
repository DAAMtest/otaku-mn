import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "@lib/database.types";

export type Anime = {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  description: string;
  releaseDate: string;
  coverImageUrl: string;
  releaseYear: number;
  season: string;
  status: string;
  popularity: number;
  genres: string[];
  isFavorite: boolean;
};

export function useAnimeData() {
  const [genres, setGenres] = useState<string[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [newReleases, setNewReleases] = useState<Anime[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState<{
    genres: boolean;
    trending: boolean;
    newReleases: boolean;
  }>({
    genres: false,
    trending: false,
    newReleases: false,
  });
  const [error, setError] = useState<Error | null>(null);

  // Fetch data when the hook mounts
  useEffect(() => {
    fetchGenres();
    fetchTrendingAnime();
    fetchNewReleases();
    fetchFeaturedAnime();
  }, []);

  // Fetch all available genres
  const fetchGenres = async () => {
    try {
      setLoading((prev) => ({ ...prev, genres: true }));
      const { data, error: fetchError } = await supabase
        .from("genres")
        .select("name")
        .order("name");

      if (fetchError) throw fetchError;

      const genreNames = (data || []).map((genre: { name: string }) => genre.name);
      setGenres(genreNames);
    } catch (err) {
      console.error("Error fetching genres:", err);
      setError(err as Error);
    } finally {
      setLoading((prev) => ({ ...prev, genres: false }));
    }
  };

  // Fetch trending anime
  const fetchTrendingAnime = async () => {
    try {
      setLoading((prev) => ({ ...prev, trending: true }));
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          cover_image_url,
          release_year,
          season,
          status,
          popularity,
          anime_genres(genres(name))
        `)
        .order("rating", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData = data.map((anime: any) => ({
          id: anime.id,
          title: anime.title,
          imageUrl: anime.image_url,
          rating: anime.rating || 0,
          description: anime.description || "",
          releaseDate: anime.release_date || "",
          coverImageUrl: anime.cover_image_url,
          releaseYear: anime.release_year,
          season: anime.season,
          status: anime.status,
          popularity: anime.popularity,
          genres: Array.isArray(anime.anime_genres) 
            ? anime.anime_genres.map((ag: any) => 
                ag.genres && typeof ag.genres === 'object' 
                  ? ag.genres.name 
                  : null
              ).filter(Boolean)
            : [],
          isFavorite: false,
        }));
        setTrendingAnime(formattedData);
      }
    } catch (error) {
      console.error("Error fetching trending anime:", error);
    } finally {
      setLoading((prev) => ({ ...prev, trending: false }));
    }
  };

  // Fetch new releases
  const fetchNewReleases = async () => {
    try {
      setLoading((prev) => ({ ...prev, newReleases: true }));
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          cover_image_url,
          release_year,
          season,
          status,
          popularity,
          anime_genres(genres(name))
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData = data.map((anime: any) => ({
          id: anime.id,
          title: anime.title,
          imageUrl: anime.image_url,
          rating: anime.rating || 0,
          description: anime.description || "",
          releaseDate: anime.release_date || "",
          coverImageUrl: anime.cover_image_url,
          releaseYear: anime.release_year,
          season: anime.season,
          status: anime.status,
          popularity: anime.popularity,
          genres: Array.isArray(anime.anime_genres) 
            ? anime.anime_genres.map((ag: any) => 
                ag.genres && typeof ag.genres === 'object' 
                  ? ag.genres.name 
                  : null
              ).filter(Boolean)
            : [],
          isFavorite: false,
        }));
        setNewReleases(formattedData);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading((prev) => ({ ...prev, newReleases: false }));
    }
  };

  // Fetch featured anime
  const fetchFeaturedAnime = async () => {
    try {
      setLoading((prev) => ({ ...prev, newReleases: true }));
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          cover_image_url,
          release_year,
          season,
          status,
          popularity,
          anime_genres(genres(name))
        `)
        .order("rating", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        const featuredAnime = {
          id: data[0].id,
          title: data[0].title,
          imageUrl: data[0].image_url,
          rating: data[0].rating,
          description: data[0].description,
          releaseDate: data[0].release_date,
          coverImageUrl: data[0].cover_image_url,
          releaseYear: data[0].release_year,
          season: data[0].season,
          status: data[0].status,
          popularity: data[0].popularity,
          genres: Array.isArray(data[0].anime_genres) 
            ? data[0].anime_genres.map((ag: any) => 
                ag.genres && typeof ag.genres === 'object' 
                  ? ag.genres.name 
                  : null
              ).filter(Boolean)
            : [],
          isFavorite: false,
        };
        setFeaturedAnime(featuredAnime);
      }
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading((prev) => ({ ...prev, newReleases: false }));
    }
  };

  // Fetch anime by genre
  const fetchAnimeByGenre = async (genre: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          cover_image_url,
          release_year,
          season,
          status,
          popularity,
          anime_genres(genres(name))
        `)
        .eq("anime_genres.genres.name", genre)
        .order("rating", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        description: item.description || "",
        releaseDate: item.release_date || "",
        coverImageUrl: item.cover_image_url,
        releaseYear: item.release_year,
        season: item.season,
        status: item.status,
        popularity: item.popularity,
        genres: Array.isArray(item.anime_genres) 
          ? item.anime_genres.map((ag: any) => 
              ag.genres && typeof ag.genres === 'object' 
                ? ag.genres.name 
                : null
            ).filter(Boolean)
          : [genre], 
        isFavorite: false,
      }));
    } catch (err) {
      console.error(`Error fetching anime by genre ${genre}:`, err);
      throw err;
    }
  };

  // Fetch anime details by ID
  const fetchAnimeDetails = async (animeId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("anime")
        .select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          cover_image_url,
          release_year,
          season,
          status,
          popularity,
          anime_genres(genres(name))
        `)
        .eq("id", animeId)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        title: data.title,
        imageUrl: data.image_url,
        rating: data.rating || 0,
        description: data.description || "",
        releaseDate: data.release_date || "",
        coverImageUrl: data.cover_image_url,
        releaseYear: data.release_year,
        season: data.season,
        status: data.status,
        popularity: data.popularity,
        genres: Array.isArray(data.anime_genres) 
          ? data.anime_genres.map((ag: any) => 
              ag.genres && typeof ag.genres === 'object' 
                ? ag.genres.name 
                : null
            ).filter(Boolean)
          : [],
        isFavorite: false,
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
    featuredAnime,
    loading,
    error,
    fetchGenres,
    fetchTrendingAnime,
    fetchNewReleases,
    fetchFeaturedAnime,
    fetchAnimeByGenre,
    fetchAnimeDetails,
  };
}

export default useAnimeData;
