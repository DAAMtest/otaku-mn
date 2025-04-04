import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

// Extend Session type to include expires_at
export interface ExtendedSession extends Session {
  expires_at?: number;
}

// Interface for profile data
export interface UserProfile {
  id: string;
  username?: string;
  nickname?: string;
  bio?: string;
  avatar_url?: string;
  avatarUrl?: string; // For compatibility with existing code
  created_at?: string;
  updated_at?: string;
  lists?: {
    watchlist: number;
    favorites: number;
    history: number;
  };
}

// Response types
interface AuthResponse {
  success: boolean;
  error?: string;
}

interface ProfileResponse extends AuthResponse {
  profile?: UserProfile;
}

/**
 * Authentication service that interacts with Supabase Auth and the auth-helpers Edge Function
 */
export const authService = {
  /**
   * Sign in a user with email and password
   */
  signIn: async (email: string, password: string): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Auth service - Sign in error:", error);
      throw error;
    }
  },

  /**
   * Sign up a new user with email and password
   */
  signUp: async (email: string, password: string): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create a user profile in the users table if signup was successful
      if (data.user) {
        const username = email.split("@")[0];
        console.log("Creating user profile for:", username);

        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      return data.session;
    } catch (error) {
      console.error("Auth service - Sign up error:", error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Auth service - Sign out error:", error);
      throw error;
    }
  },

  /**
   * Validate a session using the auth-helpers Edge Function
   */
  validateSession: async (session: ExtendedSession): Promise<User | null> => {
    try {
      if (!session?.access_token) return null;

      const { data, error } = await supabase.functions.invoke("auth-helpers", {
        body: {
          action: "validateSession",
          payload: { session },
        },
      });

      if (error) throw error;
      return data.user || null;
    } catch (error) {
      console.error("Auth service - Validate session error:", error);
      return null;
    }
  },

  /**
   * Get user profile data using the auth-helpers Edge Function
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("auth-helpers", {
        body: {
          action: "getUserProfile",
          payload: { userId },
        },
      });

      if (error) throw error;
      return data.profile || null;
    } catch (error) {
      console.error("Auth service - Get user profile error:", error);
      return null;
    }
  },

  /**
   * Update user profile data using the auth-helpers Edge Function
   */
  updateUserProfile: async (
    userId: string,
    profileData: Partial<UserProfile>,
  ): Promise<ProfileResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke("auth-helpers", {
        body: {
          action: "updateUserProfile",
          payload: { userId, profileData },
        },
      });

      if (error) throw error;
      return { success: true, profile: data.profile };
    } catch (error) {
      console.error("Auth service - Update user profile error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Refresh the current session
   */
  refreshSession: async (refreshToken: string): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Auth service - Refresh session error:", error);
      return null;
    }
  },
};
