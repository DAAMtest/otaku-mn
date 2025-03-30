import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Session, AuthError, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
  joinDate?: string;
}

export interface AuthData {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
  error: AuthError | null;
}

export function useSupabaseAuth() {
  const { user: authUser, session: authSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (profileData: {
    nickname?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; error: any }> => {
    try {
      if (!authUser?.id || !authSession) {
        throw new Error("User not authenticated");
      }

      // Add updated_at timestamp
      const updatedData = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      // Check if user exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .single();

      if (checkError) {
        // User doesn't exist in the users table, create a new record
        const defaultNickname =
          profileData.nickname ||
          authUser.email?.split("@")[0] ||
          "user_" + Math.random().toString(36).substring(2, 7);

        // Ensure avatar_url is in PNG format
        const avatarUrl = profileData.avatar_url ? 
          profileData.avatar_url.replace('/svg?', '/png?') : 
          `https://api.dicebear.com/7.x/avataaars/png?seed=${defaultNickname}`;

        const { error: insertError } = await supabase.from("users").insert({
          id: authUser.id,
          username: authUser.email?.split("@")[0] || defaultNickname,
          nickname: defaultNickname,
          avatar_url: avatarUrl,
          bio: profileData.bio || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      } else {
        // User exists, update the record
        const { error } = await supabase
          .from("users")
          .update(updatedData)
          .eq("id", authUser.id);

        if (error) throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username, nickname, avatar_url, bio, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      if (data) {
        // Format join date
        const joinDate = data.created_at
          ? new Date(data.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : undefined;

        return {
          username: data.username,
          nickname: data.nickname,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          joinDate,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthData> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
  ): Promise<AuthData> => {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile in the users table
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  return {
    loading,
    updateProfile,
    fetchUserProfile,
    signIn,
    signUp,
    signOut,
  };
}
