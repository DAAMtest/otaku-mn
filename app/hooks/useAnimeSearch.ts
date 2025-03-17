import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  isFavorite: boolean;
  genres?: string[];
  description?: string;
  releaseDate?: string;
  type?: string;
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
        let animeQuery = supabase.from("anime").select(`
          id,
          title,
          image_url,
          rating,
          description,
          release_date,
          anime_genres!inner(genres(name))
        `);

        // Add title search if query is provided
        if (query) {
          animeQuery = animeQuery.ilike("title", `%${query}%`);
        }

        // Add genre filter if genres are selected
        if (selectedGenres.length > 0) {
          animeQuery = animeQuery.in(
            "anime_genres.genres.name",
            selectedGenres,
          );
        }

        // Order by rating descending by default
        animeQuery = animeQuery.order("rating", { ascending: false });

        const { data, error: searchError } = await animeQuery;

        if (searchError) throw searchError;

        // Format the data
        const formattedData = await formatAnimeData(data || [], userId);
        setSearchResults(formattedData);
      } catch (err) {
        console.error("Error searching anime:", err);
        setError(err as Error);
        setSearchResults([]);
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

  // Fetch popular anime (highest rated)
  const fetchPopularAnime = async () => {
    setLoading(true);
    setError(null);

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
        .order("rating", { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      // Format the data
      const formattedData = await formatAnimeData(data || [], userId);
      setPopularAnime(formattedData);
    } catch (err) {
      console.error("Error fetching popular anime:", err);
      setError(err as Error);
      setPopularAnime([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format anime data and check favorites
  const formatAnimeData = async (
    data: any[],
    userId: string | null,
  ): Promise<Anime[]> => {
    // If no user is logged in, just format the data without checking favorites
    if (!userId || !data || data.length === 0) {
      return (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: false,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        description: item.description,
        releaseDate: item.release_date,
      }));
    }

    try {
      // Get user's favorites to check against
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("user_anime_lists")
        .select("anime_id")
        .eq("user_id", userId)
        .eq("list_type", "favorites");

      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError);
        // Continue without favorites data
        return data.map((item) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          rating: item.rating || 0,
          isFavorite: false,
          genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
          description: item.description,
          releaseDate: item.release_date,
        }));
      }

      // Create a set of favorite anime IDs for quick lookup
      const favoriteIds = new Set(
        (favoritesData || []).map((fav) => fav.anime_id),
      );

      // Format the data with favorite status
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: favoriteIds.has(item.id),
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        description: item.description,
        releaseDate: item.release_date,
      }));
    } catch (err) {
      console.error("Error in formatAnimeData:", err);
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url,
        rating: item.rating || 0,
        isFavorite: false,
        genres: item.anime_genres?.map((g: any) => g.genres.name) || [],
        description: item.description,
        releaseDate: item.release_date,
      }));
    }
  };

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
