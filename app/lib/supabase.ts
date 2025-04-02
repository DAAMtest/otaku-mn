import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration with AsyncStorage for session persistence.
 * Uses environment variables for configuration.
 */

// Debug logger for Supabase client
const supabaseDebug = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log("[SupabaseDebug]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error("[SupabaseError]", ...args);
    }
  },
};

// Secure storage implementation with size check and error handling
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      supabaseDebug.error(
        `Error getting item from secure storage: ${key}`,
        error,
      );
      // Try fallback to AsyncStorage
      try {
        return await AsyncStorage.getItem(key);
      } catch (asyncError) {
        supabaseDebug.error(
          `Error getting item from async storage fallback: ${key}`,
          asyncError,
        );
        return null;
      }
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Check if value size is less than 2KB (2048 bytes)
      const encoder = new TextEncoder();
      const dataSize = encoder.encode(value).length;

      if (dataSize > 2048) {
        supabaseDebug.log(
          `Value for ${key} exceeds 2KB (${dataSize} bytes), using AsyncStorage`,
        );
        // For large values, fall back to AsyncStorage
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      supabaseDebug.error(
        `Error setting item in secure storage: ${key}`,
        error,
      );
      // Try fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(key, value);
      } catch (asyncError) {
        supabaseDebug.error(
          `Error setting item in async storage fallback: ${key}`,
          asyncError,
        );
      }
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
      // Also try to remove from AsyncStorage in case it was stored there
      try {
        await AsyncStorage.removeItem(key);
      } catch (asyncError) {
        // Ignore errors from AsyncStorage removal
      }
    } catch (error) {
      supabaseDebug.error(
        `Error removing item from secure storage: ${key}`,
        error,
      );
      // Try fallback to AsyncStorage
      try {
        await AsyncStorage.removeItem(key);
      } catch (asyncError) {
        supabaseDebug.error(
          `Error removing item from async storage fallback: ${key}`,
          asyncError,
        );
      }
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "X-Client-Info": "animetempo-mobile",
    },
  },
  // Add request/response logging in development
  ...(__DEV__
    ? {
        debug: {
          logLevel: "debug",
        },
      }
    : {}),
});

// Add event listeners for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  supabaseDebug.log(`Auth state changed: ${event}`);

  if (event === "SIGNED_IN") {
    supabaseDebug.log("User signed in, session established");
  } else if (event === "SIGNED_OUT") {
    supabaseDebug.log("User signed out, session cleared");
  } else if (event === "TOKEN_REFRESHED") {
    supabaseDebug.log("Session token refreshed");
  } else if (event === "USER_UPDATED") {
    supabaseDebug.log("User data updated");
  }
});

// Get user lists (watchlist, favorites, history)
export const getUserLists = async (
  listType?: "watchlist" | "favorites" | "history",
) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      throw new Error("User not authenticated");
    }

    let query = supabase
      .from("user_anime_lists")
      .select(
        `
        id,
        anime_id,
        list_type,
        added_at,
        updated_at,
        anime:anime_id(id, title, description, image_url, cover_image_url, release_date, rating, anime_genres(genres(name)))
      `,
      )
      .eq("user_id", sessionData.session.user.id);

    if (listType) {
      query = query.eq("list_type", listType);
    }

    const { data, error } = await query.order("added_at", { ascending: false });

    if (error) throw error;

    // Transform the data to include proper formatting
    const formattedData = (data || []).map((item) => ({
      id: item.id,
      animeId: item.anime_id,
      listType: item.list_type,
      addedAt: item.added_at,
      updatedAt: item.updated_at,
      anime: item.anime
        ? {
            id: item.anime.id,
            title: item.anime.title,
            description: item.anime.description,
            imageUrl: item.anime.image_url,
            coverImageUrl: item.anime.cover_image_url,
            releaseDate: item.anime.release_date,
            rating: item.anime.rating || 0,
            genres: Array.isArray(item.anime.anime_genres)
              ? item.anime.anime_genres
                  .map((ag) =>
                    ag.genres && typeof ag.genres === "object"
                      ? ag.genres.name
                      : null,
                  )
                  .filter(Boolean)
              : [],
          }
        : null,
    }));

    return formattedData;
  } catch (error) {
    console.error(`Error fetching ${listType || "user lists"}:`, error);
    return [];
  }
};

// Fetch anime data from Supabase
export const fetchAnime = async () => {
  try {
    // Query without is_favorite which doesn't exist in the database
    const { data, error } = await supabase
      .from("anime")
      .select(
        `
        id,
        title,
        description,
        image_url,
        cover_image_url,
        release_date,
        rating,
        anime_genres(genres(name))
      `,
      )
      .order("title");

    if (error) {
      throw error;
    }

    // Transform the data to include isFavorite with a default value of false
    const formattedData = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.image_url,
      coverImageUrl: item.cover_image_url,
      releaseDate: item.release_date,
      rating: item.rating || 0,
      genres: Array.isArray(item.anime_genres)
        ? item.anime_genres
            .map((ag: any) =>
              ag.genres && typeof ag.genres === "object"
                ? ag.genres.name
                : null,
            )
            .filter(Boolean)
        : [],
      isFavorite: false, // Default value since is_favorite doesn't exist
    }));

    return formattedData;
  } catch (error) {
    console.error("Error loading anime:", error);
    return [];
  }
};

// Add anime to a list
export const addToList = async (
  animeId: string,
  listType: "watchlist" | "favorites" | "history",
) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      throw new Error("User not authenticated");
    }

    // Check if entry already exists
    const { data: existingEntry } = await supabase
      .from("user_anime_lists")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .eq("anime_id", animeId)
      .eq("list_type", listType)
      .maybeSingle();

    // If entry exists, return success without inserting
    if (existingEntry) {
      return { success: true, data: existingEntry };
    }

    // Otherwise insert new entry
    const { data, error } = await supabase.from("user_anime_lists").insert([
      {
        user_id: sessionData.session.user.id,
        anime_id: animeId,
        list_type: listType,
        added_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Error adding to ${listType}:`, error);
    return { success: false, error };
  }
};

// Remove anime from a list
export const removeFromList = async (
  animeId: string,
  listType: "watchlist" | "favorites" | "history",
) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("user_anime_lists")
      .delete()
      .eq("user_id", sessionData.session.user.id)
      .eq("anime_id", animeId)
      .eq("list_type", listType);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error removing from ${listType}:`, error);
    return { success: false, error };
  }
};

// Move anime from one list to another
export const moveToList = async (
  animeId: string,
  currentList: string,
  targetList: string,
) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("user_anime_lists")
      .update({
        list_type: targetList,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", sessionData.session.user.id)
      .eq("anime_id", animeId)
      .eq("list_type", currentList);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error moving from ${currentList} to ${targetList}:`, error);
    return { success: false, error };
  }
};
