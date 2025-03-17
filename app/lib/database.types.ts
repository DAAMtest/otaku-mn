export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      anime: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          rating: number | null;
          description: string | null;
          release_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          rating?: number | null;
          description?: string | null;
          release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          rating?: number | null;
          description?: string | null;
          release_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      anime_genres: {
        Row: {
          id: string;
          anime_id: string;
          genre_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anime_id: string;
          genre_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anime_id?: string;
          genre_id?: string;
          created_at?: string;
        };
      };
      genres: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_anime_lists: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress: number | null;
          added_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress?: number | null;
          added_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          list_type?: string;
          progress?: number | null;
          added_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          watched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          watched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          watched_at?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_genre_anime_counts: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{
          genre_id: string;
          count: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
