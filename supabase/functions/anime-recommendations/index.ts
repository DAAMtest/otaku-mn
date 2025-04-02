import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define types
interface WatchHistoryItem {
  anime_id: string;
  user_id: string;
  watched_at: string;
  watch_duration: number;
  completed: boolean;
}

interface AnimeItem {
  id: string;
  title: string;
  image_url: string;
  rating: number;
  genres?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS for browser requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get the request body
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("Missing user_id parameter");
    }

    // Create Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's watch history
    const { data: watchHistory, error: watchHistoryError } = await supabase
      .from("watch_history")
      .select("anime_id, watched_at, watch_duration, completed")
      .eq("user_id", user_id)
      .order("watched_at", { ascending: false })
      .limit(20);

    if (watchHistoryError) {
      throw watchHistoryError;
    }

    if (!watchHistory || watchHistory.length === 0) {
      // If no watch history, return trending anime instead
      const { data: trendingAnime, error: trendingError } = await supabase
        .from("anime")
        .select("id, title, image_url, rating")
        .order("rating", { ascending: false })
        .limit(10);

      if (trendingError) {
        throw trendingError;
      }

      return new Response(
        JSON.stringify({
          recommendations: trendingAnime || [],
          source: "trending",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Extract anime IDs from watch history
    const watchedAnimeIds = watchHistory.map(
      (item: WatchHistoryItem) => item.anime_id,
    );

    // Get genres from watched anime to build preference profile
    const { data: animeGenres, error: genresError } = await supabase
      .from("anime_genres")
      .select("anime_id, genres(name)")
      .in("anime_id", watchedAnimeIds);

    if (genresError) {
      throw genresError;
    }

    // Build genre preference map
    const genrePreferences: Record<string, number> = {};
    animeGenres?.forEach((item: any) => {
      if (item.genres?.name) {
        const genreName = item.genres.name;
        genrePreferences[genreName] = (genrePreferences[genreName] || 0) + 1;
      }
    });

    // Get top genres (sorted by frequency)
    const topGenres = Object.entries(genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Find recommendations based on genre preferences
    let recommendations: AnimeItem[] = [];

    if (topGenres.length > 0) {
      // Get anime with matching genres that user hasn't watched
      const { data: genreBasedRecs, error: recsError } = await supabase
        .from("anime_genres")
        .select("anime_id, genres(name), anime(id, title, image_url, rating)")
        .in("genres.name", topGenres)
        .not("anime_id", "in", `(${watchedAnimeIds.join(",")})`)
        .limit(10);

      if (recsError) {
        throw recsError;
      }

      // Format recommendations
      recommendations = (genreBasedRecs || [])
        .map((item: any) => ({
          id: item.anime?.id,
          title: item.anime?.title,
          image_url: item.anime?.image_url,
          rating: item.anime?.rating || 0,
          genre: item.genres?.name,
        }))
        .filter((item: any) => item.id); // Filter out any null items
    }

    // If not enough genre-based recommendations, add some trending anime
    if (recommendations.length < 5) {
      const { data: trendingAnime, error: trendingError } = await supabase
        .from("anime")
        .select("id, title, image_url, rating")
        .not("id", "in", `(${watchedAnimeIds.join(",")})`)
        .order("rating", { ascending: false })
        .limit(10 - recommendations.length);

      if (trendingError) {
        throw trendingError;
      }

      recommendations = [
        ...recommendations,
        ...(trendingAnime || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          image_url: item.image_url,
          rating: item.rating || 0,
        })),
      ];
    }

    // Return recommendations
    return new Response(
      JSON.stringify({
        recommendations,
        preferredGenres: topGenres,
        source: topGenres.length > 0 ? "user_preferences" : "trending",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate recommendations",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});
