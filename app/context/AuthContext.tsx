import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
  useRef,
} from "react";
import { Session, User, AuthResponse } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";

// Extend Session type to include expires_at
interface ExtendedSession extends Session {
  expires_at?: number;
}

interface AuthContextType {
  user: User | null;
  session: ExtendedSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  persistSession: (newSession: ExtendedSession) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  refreshSession: async () => false,
  persistSession: async () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

// Add debug function at the top after imports
const debug = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[AuthDebug]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error('[AuthError]', ...args);
    }
  },
  state: (prefix: string, obj: any) => {
    if (__DEV__) {
      console.log(`[AuthDebug] ${prefix}:`, JSON.stringify(obj, null, 2));
    }
  }
};

export default function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const initialSessionCheckDone = useRef(false);
  
  // Function to persist session to secure storage
  const persistSession = async (newSession: ExtendedSession) => {
    try {
      console.log("Auth Context - Persisting session to secure storage");
      // Only store minimal session data to reduce size
      const minimalSession = {
        access_token: newSession.access_token,
        refresh_token: newSession.refresh_token,
        expires_at: newSession.expires_at,
        user: {
          id: newSession.user.id,
          email: newSession.user.email,
        }
      };

      // Split storage to avoid size limit
      await SecureStore.setItemAsync(
        "supabase-session-tokens",
        JSON.stringify({
          access_token: minimalSession.access_token,
          refresh_token: minimalSession.refresh_token,
          expires_at: minimalSession.expires_at,
        })
      );

      await SecureStore.setItemAsync(
        "supabase-session-user",
        JSON.stringify(minimalSession.user)
      );
      
      // Keep full session in memory
      setSession(newSession);
      setUser(newSession.user);
      return true;
    } catch (error) {
      console.error("Auth Context - Error persisting session:", error);
      return false;
    }
  };
  
  // Function to check if a session is expired
  const isSessionExpired = (checkSession: ExtendedSession): boolean => {
    if (!checkSession.expires_at) return true;
    return new Date(checkSession.expires_at * 1000) < new Date();
  };

  // Function to load stored session
  const loadStoredSession = async (): Promise<ExtendedSession | null> => {
    try {
      const [tokensStr, userStr] = await Promise.all([
        SecureStore.getItemAsync("supabase-session-tokens"),
        SecureStore.getItemAsync("supabase-session-user")
      ]);

      if (!tokensStr || !userStr) return null;

      const tokens = JSON.parse(tokensStr);
      const user = JSON.parse(userStr);

      return {
        ...tokens,
        user,
      } as ExtendedSession;
    } catch (error) {
      console.error("Auth Context - Error loading stored session:", error);
      return null;
    }
  };

  // Function to clear stored session
  const clearStoredSession = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("supabase-session-tokens"),
        SecureStore.deleteItemAsync("supabase-session-user")
      ]);
    } catch (error) {
      console.error("Auth Context - Error clearing stored session:", error);
    }
  };
  
  // Function to refresh session state
  const refreshSession = async () => {
    console.log("Auth Context - Manually refreshing session");
    try {
      // First check if we already have a valid session in memory
      if (session?.access_token && !isSessionExpired(session)) {
        console.log("Auth Context - Current session is still valid");
        return true;
      }

      // Try to get active session from Supabase first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log("Auth Context - Found active Supabase session");
        await persistSession(currentSession);
        return true;
      }

      // No active Supabase session, try stored session
      const storedSession = await loadStoredSession();
      if (!storedSession) {
        console.log("Auth Context - No stored session found");
        setSession(null);
        setUser(null);
        return false;
      }

      // Always try to refresh the token if we're using a stored session
      try {
        console.log("Auth Context - Attempting to refresh stored session");
        const { data: { session: refreshedSession }, error } = await (supabase.auth as any).refreshSession({
          refresh_token: storedSession.refresh_token
        });
        
        if (refreshedSession && !error) {
          console.log("Auth Context - Successfully refreshed stored session");
          await persistSession(refreshedSession as ExtendedSession);
          return true;
        }
        
        // If refresh failed, check if current session is still valid
        if (!isSessionExpired(storedSession)) {
          console.log("Auth Context - Stored session still valid, using as fallback");
          setSession(storedSession);
          setUser(storedSession.user);
          return true;
        }
        
        console.log("Auth Context - Stored session expired, clearing");
        await clearStoredSession();
        setSession(null);
        setUser(null);
        return false;
      } catch (error) {
        console.error("Auth Context - Error refreshing token:", error);
        // Only keep using the stored session if it's not expired
        if (!isSessionExpired(storedSession)) {
          setSession(storedSession);
          setUser(storedSession.user);
          return true;
        }
        
        console.log("Auth Context - Stored session expired after refresh error");
        await clearStoredSession();
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth Context - Error in refresh session:", error);
      // Only clear session if we're sure it's invalid
      if (!session?.access_token) {
        setSession(null);
        setUser(null);
      }
    }
    return false;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (initialSessionCheckDone.current) return;
      
      initialSessionCheckDone.current = true;
      setIsLoading(true);

      try {
        // First try to get session from Supabase
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession) {
          console.log("Auth Context - Found Supabase session during init");
          await persistSession(supabaseSession);
          setIsLoading(false);
          return;
        }

        // If no Supabase session, try stored session
        const storedSession = await loadStoredSession();
        if (storedSession && !isSessionExpired(storedSession)) {
          console.log("Auth Context - Using stored session during init");
          setSession(storedSession);
          setUser(storedSession.user);
          setIsLoading(false);
          return;
        }

        // No valid session found
        console.log("Auth Context - No valid session found during init");
        setSession(null);
        setUser(null);
      } catch (error) {
        console.error("Auth Context - Error initializing auth:", error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth Context - Auth state changed:", event, newSession?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        console.log("Auth Context - Sign out detected, clearing auth state");
        setSession(null);
        setUser(null);
        await clearStoredSession();
      } else if (newSession) {
        console.log("Auth Context - New session detected");
        await persistSession(newSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Setup periodic session refresh
  useEffect(() => {
    const checkSession = async () => {
      if (!session && !user) return; // Don't refresh if logged out
      await refreshSession();
    };

    // Check session every minute
    sessionCheckRef.current = setInterval(checkSession, 60 * 1000);
    
    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [session, user]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      console.log("Auth Context - Sign in successful");
      if (data.session) {
        await persistSession(data.session as ExtendedSession);
        return data.session;
      }
      return null;
    } catch (error) {
      console.error("Auth Context - Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
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
        
        // Remove DiceBear avatar for now as it's causing issues
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
          user: data.session.user ? {
            id: data.session.user.id,
            email: data.session.user.email
          } : "missing"
        });
        
        await persistSession(data.session as ExtendedSession);
        return data.session;
      }
      return null;
    } catch (error) {
      debug.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Clear session first to prevent UI flicker
      setSession(null);
      setUser(null);
      
      // Clear stored session
      await clearStoredSession();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Auth Context - Sign out successful");
    } catch (error) {
      console.error("Auth Context - Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSession,
        persistSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
