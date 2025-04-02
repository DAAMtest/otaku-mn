import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface AnimeRecommendation {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  genre?: string;
}

export function useAnimeRecommendations() {
  const [recommendations, setRecommendations] = useState<AnimeRecommendation[]>(
    [],
  );
  const [preferredGenres, setPreferredGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Call the anime-recommendations edge function
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-anime-recommendations",
          {
            body: { user_id: user.id },
          },
        );

        if (error) {
          console.error("Error fetching recommendations:", error);
          setError(error.message || "Failed to fetch recommendations");
          return;
        }

        if (data?.recommendations) {
          // Transform the data to match our expected format
          const formattedRecommendations = data.recommendations.map(
            (item: any) => ({
              id: item.id,
              title: item.title,
              imageUrl: item.image_url,
              rating: item.rating || 0,
              genre: item.genre,
            }),
          );

          setRecommendations(formattedRecommendations);
          setPreferredGenres(data.preferredGenres || []);
        }
      } catch (err: any) {
        console.error("Error in useAnimeRecommendations:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [user?.id]);

  return {
    recommendations,
    preferredGenres,
    isLoading,
    error,
    refetch: async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-anime-recommendations",
          {
            body: { user_id: user?.id },
          },
        );

        if (error) throw error;

        if (data?.recommendations) {
          const formattedRecommendations = data.recommendations.map(
            (item: any) => ({
              id: item.id,
              title: item.title,
              imageUrl: item.image_url,
              rating: item.rating || 0,
              genre: item.genre,
            }),
          );

          setRecommendations(formattedRecommendations);
          setPreferredGenres(data.preferredGenres || []);
        }
        setError(null);
      } catch (err: any) {
        console.error("Error refetching recommendations:", err);
        setError(err.message || "Failed to refresh recommendations");
      } finally {
        setIsLoading(false);
      }
    },
  };
}
