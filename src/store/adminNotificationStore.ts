import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  sent_to: string;
  user_id?: string;
  is_read?: boolean;
}

export interface NotificationType {
  id: string;
  name: string;
  icon: any; // Using any for icon component type
  color: string;
}

export interface AudienceType {
  id: string;
  name: string;
}

interface AdminNotificationState {
  notificationList: Notification[];
  notificationTypes: NotificationType[];
  audienceTypes: AudienceType[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetchNotificationList: () => Promise<void>;
  sendNotification: (notification: {
    title: string;
    message: string;
    type: string;
    audience: string;
    user_id?: string;
  }) => Promise<{ error: Error | null }>;
  deleteNotification: (id: string) => Promise<{ error: Error | null }>;
  setNotificationList: (notificationList: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAdminNotificationStore = create<AdminNotificationState>(
  (set, get) => ({
    notificationList: [],
    notificationTypes: [
      { id: "system", name: "System", icon: "Info", color: "#A78BFA" },
      {
        id: "anime_recommendation",
        name: "Anime Recommendation",
        icon: "Play",
        color: "#60A5FA",
      },
      {
        id: "friend_activity",
        name: "Friend Activity",
        icon: "Heart",
        color: "#F87171",
      },
    ],
    audienceTypes: [
      { id: "all", name: "All Users" },
      { id: "active", name: "Active Users" },
      { id: "inactive", name: "Inactive Users" },
      { id: "admins", name: "Admins Only" },
    ],
    loading: false,
    error: null,

    // Setters
    setNotificationList: (notificationList) => set({ notificationList }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Fetch notification list from Supabase
    fetchNotificationList: async () => {
      set({ loading: true, error: null });
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Add sent_to field for demo purposes
        const enhancedData = data.map((notification: any) => ({
          ...notification,
          sent_to: notification.user_id ? "Specific User" : "All Users",
        }));

        set({ notificationList: enhancedData, loading: false });
      } catch (err) {
        console.error("Error fetching notifications:", err);
        set({ error: err as Error, loading: false });
      }
    },

    // Send notification
    sendNotification: async (notification) => {
      try {
        // Validate required fields
        if (!notification.title.trim()) {
          return { error: new Error("Title is required") };
        }

        if (!notification.message.trim()) {
          return { error: new Error("Message is required") };
        }

        // In a real app, you would fetch users based on audience
        // For this demo, we'll just create a notification for the current user
        const { data, error } = await supabase
          .from("notifications")
          .insert({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            user_id: notification.user_id, // In a real app, this would be based on audience
            is_read: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Add the new notification to the list
        const newNotification = {
          ...data,
          sent_to: data.user_id ? "Specific User" : "All Users",
        };

        set((state) => ({
          notificationList: [newNotification, ...state.notificationList],
        }));

        return { error: null };
      } catch (err) {
        console.error("Error sending notification:", err);
        return { error: err as Error };
      }
    },

    // Delete notification
    deleteNotification: async (id) => {
      try {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Update the local state
        set((state) => ({
          notificationList: state.notificationList.filter(
            (notification) => notification.id !== id,
          ),
        }));

        return { error: null };
      } catch (err) {
        console.error("Error deleting notification:", err);
        return { error: err as Error };
      }
    },
  }),
);
