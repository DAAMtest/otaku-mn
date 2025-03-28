declare module "@supabase/supabase-js" {
  export interface User {
    id: string;
    email?: string;
    app_metadata: { provider?: string };
    user_metadata: { [key: string]: any };
    aud: string;
  }

  export interface Session {
    user: User;
    access_token: string;
    refresh_token: string;
  }

  export interface AuthError {
    message: string;
    status?: number;
  }

  export interface AuthResponse {
    data: { session: Session | null; user: User | null };
    error: AuthError | null;
  }

  export interface PostgrestResponse<T> {
    data: T[] | null;
    error: Error | null;
  }

  export interface PostgrestSingleResponse<T> {
    data: T | null;
    error: Error | null;
  }

  export interface SupabaseClient {
    from: (table: string) => any;
    auth: {
      getSession(): Promise<AuthResponse>;
      signUp(credentials: { email: string; password: string }): Promise<AuthResponse>;
      signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse>;
      signOut(): Promise<{ error: AuthError | null }>;
      onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: { unsubscribe(): void } } };
    };
  }

  export function createClient(url: string, key: string): SupabaseClient;
}
