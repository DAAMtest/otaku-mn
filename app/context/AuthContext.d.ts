import { User, Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { ExtendedSession } from "@/services/authService";

export interface AuthContextType {
  user: User | null;
  session: ExtendedSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  persistSession: (newSession: ExtendedSession) => Promise<boolean>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
