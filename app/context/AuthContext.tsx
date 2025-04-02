import {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAuthStore } from "@/store/authStore";

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

export default function AuthProvider({ children }: PropsWithChildren) {
  // Get state and actions from the Zustand store
  const {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    persistSession,
  } = useAuthStore();

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
