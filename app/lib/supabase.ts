import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@lib/database.types';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

/**
 * Supabase client configuration with secure storage and authentication.
 * Uses Expo Constants for environment variables and SecureStore for session persistence.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your .env file');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: async (key: string) => {
        try {
          return await SecureStore.getItemAsync(key);
        } catch (e) {
          console.error('Error getting item from SecureStore:', e);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await SecureStore.setItemAsync(key, value);
        } catch (e) {
          console.error('Error setting item in SecureStore:', e);
        }
      },
      removeItem: async (key: string) => {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          console.error('Error removing item from SecureStore:', e);
        }
      },
    },
  },
});

export default supabase;
