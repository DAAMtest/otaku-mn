import { create } from "zustand";
import { supabase } from "@/lib/supabase";

interface AdminState {
  // Dashboard stats
  stats: {
    animeCount: number;
    userCount: number;
    genreCount: number;
    viewsToday: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    color: string;
  }>;
  loading: {
    stats: boolean;
    activity: boolean;
  };
  error: Error | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  setStats: (stats: AdminState["stats"]) => void;
  setRecentActivity: (activity: AdminState["recentActivity"]) => void;
  setLoading: (key: keyof AdminState["loading"], value: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: {
    animeCount: 0,
    userCount: 0,
    genreCount: 0,
    viewsToday: 0,
  },
  recentActivity: [],
  loading: {
    stats: false,
    activity: false,
  },
  error: null,

  // Setters
  setStats: (stats) => set({ stats }),
  setRecentActivity: (activity) => set({ recentActivity: activity }),
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),
  setError: (error) => set({ error }),

  // Fetch admin dashboard stats
  fetchStats: async () => {
    try {
      set((state) => ({
        loading: { ...state.loading, stats: true },
      }));

      // Fetch anime count
      const { count: animeCount, error: animeError } = await supabase
        .from("anime")
        .select("id", { count: "exact", head: true });

      if (animeError) throw animeError;

      // Fetch user count
      const { count: userCount, error: userError } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      if (userError) throw userError;

      // Fetch genre count
      const { count: genreCount, error: genreError } = await supabase
        .from("genres")
        .select("id", { count: "exact", head: true });

      if (genreError) throw genreError;

      // For views today, we would typically have a separate analytics table
      // For this demo, we'll use a placeholder value
      const viewsToday = 1200;

      set({
        stats: {
          animeCount: animeCount || 0,
          userCount: userCount || 0,
          genreCount: genreCount || 0,
          viewsToday,
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      set({ error: error as Error });
    } finally {
      set((state) => ({
        loading: { ...state.loading, stats: false },
      }));
    }
  },

  // Fetch recent activity
  fetchRecentActivity: async () => {
    try {
      set((state) => ({
        loading: { ...state.loading, activity: true },
      }));

      // In a real app, we would fetch from an activity log table
      // For this demo, we'll use mock data
      const mockActivity = [
        {
          id: "1",
          type: "user_joined",
          message: "New user registered",
          timestamp: "10 minutes ago",
          color: "#60A5FA",
        },
        {
          id: "2",
          type: "content_reported",
          message: "Content reported for review",
          timestamp: "25 minutes ago",
          color: "#F87171",
        },
        {
          id: "3",
          type: "anime_added",
          message: "New anime added to database",
          timestamp: "1 hour ago",
          color: "#34D399",
        },
        {
          id: "4",
          type: "high_traffic",
          message: "Unusual traffic detected",
          timestamp: "3 hours ago",
          color: "#F59E0B",
        },
      ];

      set({ recentActivity: mockActivity });
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      set({ error: error as Error });
    } finally {
      set((state) => ({
        loading: { ...state.loading, activity: false },
      }));
    }
  },
}));
