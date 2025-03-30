export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          username: string;
          avatar_url: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          username: string;
          avatar_url: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string;
          avatar_url?: string;
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
      anime: {
        Row: {
          id: string;
          title: string;
          image_url: string;
          rating: number | null;
          description: string | null;
          release_date: string | null;
          cover_image_url: string | null;
          release_year: number | null;
          season: string | null;
          status: string | null;
          popularity: number | null;
          created_at: string;
          updated_at: string;
          alternative_titles: string[];
        };
        Insert: {
          id?: string;
          title: string;
          image_url: string;
          rating?: number | null;
          description?: string | null;
          release_date?: string | null;
          cover_image_url?: string | null;
          release_year?: number | null;
          season?: string | null;
          status?: string | null;
          popularity?: number | null;
          created_at?: string;
          updated_at?: string;
          alternative_titles?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          image_url?: string;
          rating?: number | null;
          description?: string | null;
          release_date?: string | null;
          cover_image_url?: string | null;
          release_year?: number | null;
          season?: string | null;
          status?: string | null;
          popularity?: number | null;
          created_at?: string;
          updated_at?: string;
          alternative_titles?: string[];
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
  };
}
