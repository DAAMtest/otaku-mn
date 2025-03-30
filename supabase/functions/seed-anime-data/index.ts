import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnimeData {
  title: string;
  image_url: string;
  rating: number;
  description: string;
  release_date: string;
  genres: string[];
}

interface Genre {
  id: string;
  name: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Sample anime data
    const animeData: AnimeData[] = [
      {
        title: "Attack on Titan",
        image_url:
          "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
        rating: 4.8,
        description:
          "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason.",
        release_date: "2013-04-07",
        genres: ["Action", "Drama", "Fantasy"],
      },
      {
        title: "My Hero Academia",
        image_url:
          "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&q=80",
        rating: 4.6,
        description:
          "In a world where people with superpowers known as 'Quirks' are the norm, Izuku Midoriya has dreams of one day becoming a Hero, despite being bullied by his classmates for not having a Quirk.",
        release_date: "2016-04-03",
        genres: ["Action", "Comedy", "Sci-Fi"],
      },
      {
        title: "Demon Slayer",
        image_url:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
        rating: 4.9,
        description:
          "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.",
        release_date: "2019-04-06",
        genres: ["Action", "Fantasy", "Horror"],
      },
      {
        title: "One Piece",
        image_url:
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80",
        rating: 4.7,
        description:
          "Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger. The famous mystery treasure named 'One Piece'.",
        release_date: "1999-10-20",
        genres: ["Action", "Adventure", "Comedy"],
      },
      {
        title: "Jujutsu Kaisen",
        image_url:
          "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&q=80",
        rating: 4.8,
        description:
          "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon's other body parts and thus exorcise himself.",
        release_date: "2020-10-03",
        genres: ["Action", "Fantasy", "Horror"],
      },
      {
        title: "Naruto Shippuden",
        image_url:
          "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&q=80",
        rating: 4.5,
        description:
          "Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage, who is acknowledged as the leader and strongest of all ninja in the village.",
        release_date: "2007-02-15",
        genres: ["Action", "Adventure", "Fantasy"],
      },
      {
        title: "Tokyo Ghoul",
        image_url:
          "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
        rating: 4.3,
        description:
          "A Tokyo college student is attacked by a ghoul, a superpowered human who feeds on human flesh. He survives, but has become part ghoul and becomes a fugitive on the run.",
        release_date: "2014-07-04",
        genres: ["Action", "Drama", "Horror"],
      },
      {
        title: "Fullmetal Alchemist: Brotherhood",
        image_url:
          "https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&q=80",
        rating: 4.9,
        description:
          "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms.",
        release_date: "2009-04-05",
        genres: ["Action", "Adventure", "Drama"],
      },
    ];

    // Get all genres to map names to IDs
    const { data: genresData, error: genresError } = await supabaseClient
      .from("genres")
      .select("id, name");

    if (genresError) {
      throw genresError;
    }

    if (!genresData) {
      throw new Error("No genres found in database");
    }

    // Create a map of genre names to IDs
    const genreMap = new Map<string, string>();
    genresData.forEach((genre: Genre) => {
      genreMap.set(genre.name, genre.id);
    });

    // Insert anime data and link to genres
    for (const anime of animeData) {
      try {
        // Insert anime
        const { data: animeInsertData, error: animeInsertError } =
          await supabaseClient
            .from("anime")
            .insert({
              title: anime.title,
              imageurl: anime.image_url,
              rating: anime.rating,
              description: anime.description,
              release_date: anime.release_date,
            })
            .select("id")
            .single();

        if (animeInsertError) {
          console.error(
            `Error inserting anime ${anime.title}:`,
            animeInsertError.message
          );
          continue;
        }

        if (!animeInsertData) {
          console.error(`No data returned after inserting anime ${anime.title}`);
          continue;
        }

        const animeId = animeInsertData.id;

        // Link anime to genres
        for (const genreName of anime.genres) {
          const genreId = genreMap.get(genreName);
          if (!genreId) {
            console.warn(`Genre ${genreName} not found in database`);
            continue;
          }

          const { error: linkError } = await supabaseClient
            .from("anime_genres")
            .insert({
              anime_id: animeId,
              genre_id: genreId,
            });

          if (linkError) {
            console.error(
              `Error linking anime ${anime.title} to genre ${genreName}:`,
              linkError.message
            );
          }
        }
      } catch (error) {
        console.error(`Error processing anime ${anime.title}:`, error instanceof Error ? error.message : "Unknown error");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Anime data seeded successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
