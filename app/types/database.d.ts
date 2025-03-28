export interface Database {
  public: {
    Tables: {
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
          genres: {
            id: string;
            name: string;
          };
        };
        Insert: {
          id?: string;
          anime_id: string;
          genre_id: string;
        };
        Update: {
          id?: string;
          anime_id?: string;
          genre_id?: string;
        };
      };
      genres: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      episodes: {
        Row: {
          id: string;
          anime_id: string;
          title: string;
          description: string | null;
          episode_number: number;
          video_url: string | null;
          thumbnail_url: string | null;
          duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          anime_id: string;
          title: string;
          description?: string | null;
          episode_number: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          anime_id?: string;
          title?: string;
          description?: string | null;
          episode_number?: number;
          video_url?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      related_anime: {
        Row: {
          id: string;
          anime_id: string;
          related_anime_id: string;
          relation_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anime_id: string;
          related_anime_id: string;
          relation_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anime_id?: string;
          related_anime_id?: string;
          relation_type?: string;
          created_at?: string;
        };
      };
      user_anime_lists: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress: number;
          added_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          list_type: string;
          progress?: number;
          added_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          list_type?: string;
          progress?: number;
          added_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          episode_id: string;
          progress: number;
          watched_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          episode_id: string;
          progress?: number;
          watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          episode_id?: string;
          progress?: number;
          watched_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
          type: string;
          related_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
          type?: string;
          related_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
          type?: string;
          related_id?: string | null;
        };
      };
    };
  };
}
