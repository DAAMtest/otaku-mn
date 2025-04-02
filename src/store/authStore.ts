import { create } from "zustand";
import { Session, User, AuthResponse } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";

// Extend Session type to include expires_at
interface ExtendedSession extends Session {
  expires_at?: number;
}

interface AuthState {
  user: User | null;
  session: ExtendedSession | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  signIn: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  persistSession: (newSession: ExtendedSession) => Promise<boolean>;
  setUser: (user: User | null) => void;
  setSession: (session: ExtendedSession | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// Debug utility functions
const debug = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log("[AuthDebug]", ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error("[AuthError]", ...args);
    }
  },
  state: (prefix: string, obj: any) => {
    if (__DEV__) {
      console.log(`[AuthDebug] ${prefix}:`, JSON.stringify(obj, null, 2));
    }
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  // Setters
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Function to persist session to secure storage
  persistSession: async (newSession: ExtendedSession) => {
    try {
      debug.log("Persisting session to secure storage");
      if (!newSession) {
        debug.error("Cannot persist null session");
        return false;
      }

      // Only store minimal session data to reduce size
      const minimalSession = {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
        expires_at:
          newSession.expires_at || Math.floor(Date.now() / 1000) + 3600, // Default 1 hour expiry if missing
        user: {
          id: newSession.user?.id,
          email: newSession.user?.email,
        },
      };

      // Validate required fields
      if (
        !minimalSession.access_token ||
        !minimalSession.refresh_token ||
        !minimalSession.user?.id
      ) {
        debug.error("Invalid session data for persistence", {
          hasAccessToken: !!minimalSession.access_token,
          hasRefreshToken: !!minimalSession.refresh_token,
          hasUserId: !!minimalSession.user?.id,
        });
        return false;
      }

      // Split storage to avoid size limit
      await SecureStore.setItemAsync(
        "supabase-session-tokens",
        JSON.stringify({
          access_token: minimalSession.access_token,
          refresh_token: minimalSession.refresh_token,
          expires_at: minimalSession.expires_at,
        }),
      );

      await SecureStore.setItemAsync(
        "supabase-session-user",
        JSON.stringify(minimalSession.user),
      );

      // Update state
      set({
        session: newSession,
        user: newSession.user,
      });

      debug.log("Session successfully persisted");
      return true;
    } catch (error) {
      debug.error("Error persisting session:", error);
      return false;
    }
  },

  // Function to check if a session is expired
  isSessionExpired: (checkSession: ExtendedSession): boolean => {
    if (!checkSession || !checkSession.expires_at) {
      debug.log("Session considered expired: missing expires_at");
      return true;
    }

    const expiryDate = new Date(checkSession.expires_at * 1000);
    const now = new Date();
    const isExpired = expiryDate < now;

    // Add buffer time (5 minutes) to refresh before actual expiry
    const expiresInMinutes = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60),
    );

    if (isExpired) {
      debug.log(`Session expired at ${expiryDate.toISOString()}`);
    } else if (expiresInMinutes < 5) {
      debug.log(`Session expires soon (in ${expiresInMinutes} minutes)`);
      // Consider soon-to-expire sessions as expired to trigger refresh
      return true;
    }

    return isExpired;
  },

  // Function to load stored session
  loadStoredSession: async (): Promise<ExtendedSession | null> => {
    try {
      debug.log("Loading session from secure storage");
      const [tokensStr, userStr] = await Promise.all([
        SecureStore.getItemAsync("supabase-session-tokens"),
        SecureStore.getItemAsync("supabase-session-user"),
      ]);

      if (!tokensStr) {
        debug.log("No tokens found in secure storage");
        return null;
      }

      if (!userStr) {
        debug.log("No user data found in secure storage");
        return null;
      }

      try {
        const tokens = JSON.parse(tokensStr);
        const user = JSON.parse(userStr);

        // Validate required fields
        if (!tokens.access_token || !tokens.refresh_token || !user.id) {
          debug.error("Invalid stored session data", {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            hasUserId: !!user.id,
          });
          return null;
        }

        const session = {
          ...tokens,
          user,
        } as ExtendedSession;

        debug.log("Successfully loaded session from secure storage");
        return session;
      } catch (parseError) {
        debug.error("Error parsing stored session data:", parseError);
        // Clear invalid data
        await get().clearStoredSession();
        return null;
      }
    } catch (error) {
      debug.error("Error loading stored session:", error);
      return null;
    }
  },

  // Function to clear stored session
  clearStoredSession: async () => {
    try {
      debug.log("Clearing stored session data");
      await Promise.all([
        SecureStore.deleteItemAsync("supabase-session-tokens"),
        SecureStore.deleteItemAsync("supabase-session-user"),
      ]);
      debug.log("Successfully cleared stored session data");
      return true;
    } catch (error) {
      debug.error("Error clearing stored session:", error);
      return false;
    }
  },

  // Function to refresh session state
  refreshSession: async () => {
    debug.log("Manually refreshing session");
    try {
      const { session } = get();
      const isSessionExpired = get().isSessionExpired;
      const loadStoredSession = get().loadStoredSession;
      const clearStoredSession = get().clearStoredSession;

      // First check if we already have a valid session in memory
      if (session?.access_token && !isSessionExpired(session)) {
        debug.log("Current session is still valid");
        return true;
      }

      // Try to get active session from Supabase first
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        debug.error("Error getting session from Supabase:", sessionError);
      }

      if (currentSession) {
        debug.log("Found active Supabase session");
        const success = await get().persistSession(currentSession);
        if (!success) {
          debug.error("Failed to persist active Supabase session");
        }
        return success;
      }

      // No active Supabase session, try stored session
      const storedSession = await loadStoredSession();
      if (!storedSession) {
        debug.log("No stored session found");
        set({ session: null, user: null });
        return false;
      }

      // Always try to refresh the token if we're using a stored session
      try {
        debug.log("Attempting to refresh stored session");

        // Ensure refresh token exists
        if (!storedSession.refresh_token) {
          debug.error("Missing refresh token in stored session");
          await clearStoredSession();
          set({ session: null, user: null });
          return false;
        }

        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: storedSession.refresh_token,
        });

        if (error) {
          debug.error("Error refreshing token:", error);
          // Token might be invalid or expired
          if (
            error.message?.includes("token is invalid") ||
            error.message?.includes("expired")
          ) {
            debug.log("Invalid or expired refresh token, clearing session");
            await clearStoredSession();
            set({ session: null, user: null });
            return false;
          }
        }

        if (data?.session) {
          debug.log("Successfully refreshed stored session");
          const success = await get().persistSession(
            data.session as ExtendedSession,
          );
          return success;
        }

        // If refresh failed, check if current session is still valid
        if (!isSessionExpired(storedSession)) {
          debug.log("Stored session still valid, using as fallback");
          set({ session: storedSession, user: storedSession.user });
          return true;
        }

        debug.log("Stored session expired, clearing");
        await clearStoredSession();
        set({ session: null, user: null });
        return false;
      } catch (error) {
        debug.error("Error in token refresh process:", error);
        // Only keep using the stored session if it's not expired
        if (!isSessionExpired(storedSession)) {
          debug.log("Using unexpired stored session despite refresh error");
          set({ session: storedSession, user: storedSession.user });
          return true;
        }

        debug.log("Stored session expired after refresh error");
        await clearStoredSession();
        set({ session: null, user: null });
        return false;
      }
    } catch (error) {
      debug.error("Error in refresh session:", error);
      // Only clear session if we're sure it's invalid
      const { session } = get();
      if (!session?.access_token) {
        set({ session: null, user: null });
      }
      return false;
    }
  },

  // Sign in function
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      console.log("Auth Store - Sign in successful");
      if (data.session) {
        await get().persistSession(data.session as ExtendedSession);
        return data.session;
      }
      return null;
    } catch (error) {
      console.error("Auth Store - Sign in error:", error);
      set({ error: error as Error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign up function
  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      debug.log("Sign up successful");

      // Create a user profile in the users table if signup was successful
      if (data.user) {
        const username = email.split("@")[0];
        debug.log("Creating user profile for:", username);

        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          debug.error("Error creating user profile:", profileError);
        }
      }

      if (data.session) {
        debug.log("New session created during signup");
        debug.state("Session data", {
          access_token: data.session.access_token ? "exists" : "missing",
          refresh_token: data.session.refresh_token ? "exists" : "missing",
          expires_at: data.session.expires_at,
          user: data.session.user
            ? {
                id: data.session.user.id,
                email: data.session.user.email,
              }
            : "missing",
        });

        await get().persistSession(data.session as ExtendedSession);
        return data.session;
      }
      return null;
    } catch (error) {
      debug.error("Sign up error:", error);
      set({ error: error as Error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign out function
  signOut: async () => {
    set({ isLoading: true });
    try {
      debug.log("Signing out user");

      // Clear session first to prevent UI flicker
      set({ session: null, user: null });

      // Clear stored session
      await get().clearStoredSession();

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        debug.error("Error during Supabase signOut:", error);
        // Continue with local cleanup even if Supabase signOut fails
      }

      // Clear any other app state or caches related to the user
      try {
        // Clear AsyncStorage items related to the user
        const keysToRemove = [
          "user-preferences",
          "recent-searches",
          "watch-progress",
          "offline-data",
        ];

        // Import AsyncStorage since it's used here
        const AsyncStorage = (
          await import("@react-native-async-storage/async-storage")
        ).default;

        await Promise.all(
          keysToRemove.map((key) => AsyncStorage.removeItem(key)),
        );
      } catch (cleanupError) {
        debug.error("Error cleaning up user data:", cleanupError);
        // Non-critical error, continue with sign out
      }

      debug.log("Sign out successful");
      return true;
    } catch (error) {
      debug.error("Sign out error:", error);
      // Even if there's an error, we want to clear the session state
      // to prevent the user from being stuck in a logged-in state
      set({ session: null, user: null });
      await get().clearStoredSession();
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Initialize auth state
export const initializeAuth = async () => {
  const store = useAuthStore.getState();

  try {
    store.setIsLoading(true);

    // First try to get session from Supabase
    const {
      data: { session: supabaseSession },
    } = await supabase.auth.getSession();

    if (supabaseSession) {
      console.log("Auth Store - Found Supabase session during init");
      await store.persistSession(supabaseSession);
      store.setIsLoading(false);
      return;
    }

    // If no Supabase session, try stored session
    const storedSession = await store.loadStoredSession();
    if (storedSession && !store.isSessionExpired(storedSession)) {
      console.log("Auth Store - Using stored session during init");
      store.setSession(storedSession);
      store.setUser(storedSession.user);
      store.setIsLoading(false);
      return;
    }

    // No valid session found
    console.log("Auth Store - No valid session found during init");
    store.setSession(null);
    store.setUser(null);
  } catch (error) {
    console.error("Auth Store - Error initializing auth:", error);
    store.setSession(null);
    store.setUser(null);
    store.setError(error as Error);
  } finally {
    store.setIsLoading(false);
  }
};

// Setup auth state change listener
export const setupAuthListener = () => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, newSession) => {
    console.log(
      "Auth Store - Auth state changed:",
      event,
      newSession?.user?.email,
    );

    const store = useAuthStore.getState();

    if (event === "SIGNED_OUT") {
      console.log("Auth Store - Sign out detected, clearing auth state");
      store.setSession(null);
      store.setUser(null);
      await store.clearStoredSession();
    } else if (newSession) {
      console.log("Auth Store - New session detected");
      await store.persistSession(newSession);
    }
  });

  return subscription;
};
