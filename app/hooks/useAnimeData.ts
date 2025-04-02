import { useState, useEffect } from "react";
import { useAnimeStore, Anime } from "@/store/animeStore";

export { Anime } from "@/store/animeStore";

export function useAnimeData() {
  // Get state and actions from the Zustand store
  const {
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
  } = useAnimeStore();

  // Fetch data when the hook mounts
  useEffect(() => {
    fetchGenres();
    fetchTrendingAnime();
    fetchNewReleases();
    fetchFeaturedAnime();
  }, []);

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
