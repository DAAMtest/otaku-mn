import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  is_admin?: boolean;
  status?: string;
}

interface AdminUserState {
  userList: UserProfile[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchUserList: () => Promise<void>;
  updateUserRole: (
    userId: string,
    isAdmin: boolean,
  ) => Promise<{ error: Error | null }>;
  updateUserStatus: (
    userId: string,
    status: string,
  ) => Promise<{ error: Error | null }>;
  deleteUser: (userId: string) => Promise<{ error: Error | null }>;
  setUserList: (userList: UserProfile[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  userList: [],
  loading: false,
  error: null,

  // Setters
  setUserList: (userList) => set({ userList }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch user list from Supabase
  fetchUserList: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, you would fetch from auth.users and join with public.users
      // For this demo, we'll just fetch from public.users
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("username");

      if (error) throw error;

      // Add mock admin status and email for demo purposes
      const enhancedData = data.map((user: UserProfile) => ({
        ...user,
        email: user.email || `${user.username.toLowerCase()}@example.com`,
        is_admin: user.username === "admin",
        status: "active",
      }));

      set({ userList: enhancedData, loading: false });
    } catch (err) {
      console.error("Error fetching users:", err);
      set({ error: err as Error, loading: false });
    }
  },

  // Update user role
  updateUserRole: async (userId: string, isAdmin: boolean) => {
    try {
      // In a real app, this would update the user's role in the database
      // For this demo, we'll just update the local state
      set((state) => ({
        userList: state.userList.map((user) =>
          user.id === userId ? { ...user, is_admin: isAdmin } : user,
        ),
      }));
      return { error: null };
    } catch (err) {
      console.error("Error updating user role:", err);
      return { error: err as Error };
    }
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string) => {
    try {
      // In a real app, this would update the user's status in the database
      // For this demo, we'll just update the local state
      set((state) => ({
        userList: state.userList.map((user) =>
          user.id === userId ? { ...user, status } : user,
        ),
      }));
      return { error: null };
    } catch (err) {
      console.error("Error updating user status:", err);
      return { error: err as Error };
    }
  },

  // Delete user
  deleteUser: async (userId: string) => {
    try {
      // In a real app, you would delete from auth.users and cascade to public.users
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) throw error;

      // Update the local state
      set((state) => ({
        userList: state.userList.filter((user) => user.id !== userId),
      }));
      return { error: null };
    } catch (err) {
      console.error("Error deleting user:", err);
      return { error: err as Error };
    }
  },
}));
