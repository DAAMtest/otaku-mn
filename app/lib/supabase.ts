import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration with AsyncStorage for session persistence.
 * Uses environment variables for configuration.
 */

// Secure storage implementation with size check
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    // Check if value size is less than 2KB (2048 bytes)
    const encoder = new TextEncoder();
    const dataSize = encoder.encode(value).length;
    
    if (dataSize > 2048) {
      // For large values, fall back to AsyncStorage
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Fetch anime data from Supabase
export const fetchAnime = async () => {
  try {
    // Query without is_favorite which doesn't exist in the database
    const { data, error } = await supabase
      .from('anime')
      .select(`
        id,
        title,
        description,
        image_url,
        cover_image_url,
        release_date,
        rating,
        anime_genres(genres(name))
      `)
      .order('title');

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
        ? item.anime_genres.map((ag: any) => 
            ag.genres && typeof ag.genres === 'object' 
              ? ag.genres.name 
              : null
          ).filter(Boolean)
        : [],
      isFavorite: false // Default value since is_favorite doesn't exist
    }));

    return formattedData;
  } catch (error) {
    console.error('Error loading anime:', error);
    return [];
  }
};

// Add anime to a list
export const addToList = async (animeId: string, listType: "watchlist" | "favorites") => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_anime_lists')
      .insert([
        { user_id: sessionData.session.user.id, anime_id: animeId, list_type: listType }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Error adding to ${listType}:`, error);
    return { success: false, error };
  }
};

// Move anime from one list to another
export const moveToList = async (animeId: string, currentList: string, targetList: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('user_anime_lists')
      .update({ list_type: targetList })
      .eq('user_id', sessionData.session.user.id)
      .eq('anime_id', animeId)
      .eq('list_type', currentList);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error moving from ${currentList} to ${targetList}:`, error);
    return { success: false, error };
  }
};
