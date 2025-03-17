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
