export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      anime: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          cover_image_url: string | null;
          release_date: string | null;
          release_year: number | null;
          season: string | null;
          status: string | null;
          rating: number | null;
          popularity: number | null;
          created_at: string;
          updated_at: string;
          alternative_titles: string[] | null;
          anime_genres: { genres: { name: string }[] }[];
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          cover_image_url?: string | null;
          release_date?: string | null;
          release_year?: number | null;
          season?: string | null;
          status?: string | null;
          rating?: number | null;
          popularity?: number | null;
          created_at?: string;
          updated_at?: string;
          alternative_titles?: string[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          cover_image_url?: string | null;
          release_date?: string | null;
          release_year?: number | null;
          season?: string | null;
          status?: string | null;
          rating?: number | null;
          popularity?: number | null;
          created_at?: string;
          updated_at?: string;
          alternative_titles?: string[] | null;
        };
      };
      anime_genres: {
        Row: {
          id: string;
          anime_id: string;
          genre_id: string;
          created_at: string | null;
          genres: {
            id: string;
            name: string;
          };
        };
        Insert: {
          id?: string;
          anime_id: string;
          genre_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          anime_id?: string;
          genre_id?: string;
          created_at?: string | null;
        };
      };
      genres: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
        };
      };
      episodes: {
        Row: {
          id: string;
          anime_id: string | null;
          title: string | null;
          description: string | null;
          episode_number: number | null;
          video_url: string | null;
          thumbnail_url: string | null;
          duration: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          anime_id?: string | null;
          title?: string | null;
          description?: string | null;
          episode_number?: number | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          anime_id?: string | null;
          title?: string | null;
          description?: string | null;
          episode_number?: number | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration?: string | null;
          created_at?: string | null;
        };
      };
      anime_relations: {
        Row: {
          id: string;
          anime_id: string | null;
          related_anime_id: string | null;
          relation_type: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          anime_id?: string | null;
          related_anime_id?: string | null;
          relation_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          anime_id?: string | null;
          related_anime_id?: string | null;
          relation_type?: string | null;
          created_at?: string | null;
        };
      };
      user_anime_lists: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress: number | null;
          added_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress?: number | null;
          added_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          list_type?: string;
          progress?: number | null;
          added_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          watched_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          watched_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          watched_at?: string | null;
          created_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string | null;
          updated_at: string | null;
          type: string;
          related_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
          type?: string;
          related_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
          type?: string;
          related_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
