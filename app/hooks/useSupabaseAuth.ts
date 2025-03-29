import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, AuthError, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session) {
          // Set basic user data immediately to reduce perceived loading time
          setUser({
            id: data.session.user.id,
            email: data.session.user.email ?? undefined,
          });

          // Fetch user profile data in the background
          fetchUserProfile(data.session.user.id);
        } else {
          // No session, so we're done loading
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        setSession(session);

        if (session) {
          // Set basic user data immediately
          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
          });

          // Fetch user profile data in the background
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Set loading to false after a short timeout to improve perceived performance
      // This allows the UI to render with basic user data while profile details load
      setTimeout(() => setLoading(false), 300);

      const { data, error } = await supabase
        .from("users")
        .select("username, avatar_url, bio, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // If the user doesn't exist in the users table yet, create a default profile
        if (error.code === "PGRST116") {
          const defaultUsername =
            user?.email?.split("@")[0] ||
            "user_" + Math.random().toString(36).substring(2, 7);
          const { error: insertError } = await supabase.from("users").insert({
            id: userId,
            username: defaultUsername,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultUsername}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (!insertError) {
            // If successfully created, set the user data
            setUser((prev) => ({
              ...prev!,
              username: defaultUsername,
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultUsername}`,
              bio: "",
              joinDate: new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }),
            }));
          }
        }
        return;
      }

      if (data) {
        // Format join date
        const joinDate = data.created_at
          ? new Date(data.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : undefined;

        setUser((prev) => ({
          ...prev!,
          username: data.username,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          joinDate,
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
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

  const updateProfile = async (profileData: {
    username?: string;
    bio?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; error: any }> => {
    try {
      if (!user?.id) {
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
        .eq("id", user.id)
        .single();

      if (checkError) {
        // User doesn't exist in the users table, create a new record
        const defaultUsername =
          profileData.username ||
          user.email?.split("@")[0] ||
          "user_" + Math.random().toString(36).substring(2, 7);
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          username: defaultUsername,
          avatar_url:
            profileData.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultUsername}`,
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
          .eq("id", user.id);

        if (error) throw error;
      }

      // Refresh user profile data
      await fetchUserProfile(user.id);

      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
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
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchUserProfile,
  };
}
