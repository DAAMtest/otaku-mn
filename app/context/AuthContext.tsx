import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAuthStore } from "@/store/authStore";
import { authService, ExtendedSession } from "@/services/authService";

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

export default function AuthProvider({ children }: PropsWithChildren) {
  // Get state and actions from the Zustand store
  const { user, session, isLoading, persistSession } = useAuthStore();

  // Use the new auth service for authentication operations
  const signIn = async (
    email: string,
    password: string,
  ): Promise<Session | null> => {
    try {
      const newSession = await authService.signIn(email, password);
      if (newSession) {
        await persistSession(newSession as ExtendedSession);
      }
      return newSession;
    } catch (error) {
      console.error("Auth Context - Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
  ): Promise<Session | null> => {
    try {
      const newSession = await authService.signUp(email, password);
      if (newSession) {
        await persistSession(newSession as ExtendedSession);
      }
      return newSession;
    } catch (error) {
      console.error("Auth Context - Sign up error:", error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      // Clear local auth state using the store's signOut method
      await useAuthStore.getState().signOut();
    } catch (error) {
      console.error("Auth Context - Sign out error:", error);
      throw error;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      // Get the current refresh token from the store
      const currentSession = useAuthStore.getState().session;
      if (!currentSession?.refresh_token) return false;

      // Use the auth service to refresh the session
      const newSession = await authService.refreshSession(
        currentSession.refresh_token,
      );
      if (newSession) {
        await persistSession(newSession as ExtendedSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Auth Context - Refresh session error:", error);
      return false;
    }
  };

  // Initialize auth state when component mounts
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };

    initAuth();

    // Setup auth state change listener
    const subscription = setupAuthListener();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Setup auth state change listener
  const setupAuthListener = () => {
    const { data } = useAuthStore
      .getState()
      .supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log(
          "Auth Context - Auth state changed:",
          event,
          newSession?.user?.email,
        );

        if (event === "SIGNED_OUT") {
          console.log("Auth Context - Sign out detected, clearing auth state");
          await signOut();
        } else if (newSession) {
          console.log("Auth Context - New session detected");
          await persistSession(newSession as ExtendedSession);
        }
      });

    return data.subscription;
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
