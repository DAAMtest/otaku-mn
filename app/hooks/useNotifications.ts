import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's notifications
  const fetchNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedData = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type,
        isRead: item.is_read,
        relatedId: item.related_id,
        createdAt: item.created_at,
      }));

      setNotifications(formattedData);
      setUnreadCount(formattedData.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return { error: null };
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return { error: err as Error };
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      return { error: null };
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      return { error: err as Error };
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    if (!userId) return { error: new Error("User not authenticated") };

    try {
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Update local state
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId,
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return { error: null };
    } catch (err) {
      console.error("Error deleting notification:", err);
      return { error: err as Error };
    }
  };

  // Set up realtime subscription for new notifications
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();

    // Set up subscription
    const subscription = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Add new notification to state
          const newNotification = {
            id: payload.new.id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type,
            isRead: payload.new.is_read,
            relatedId: payload.new.related_id,
            createdAt: payload.new.created_at,
          };

          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.isRead) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Update notification in state
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id
                ? {
                    ...n,
                    title: payload.new.title,
                    message: payload.new.message,
                    type: payload.new.type,
                    isRead: payload.new.is_read,
                    relatedId: payload.new.related_id,
                    createdAt: payload.new.created_at,
                  }
                : n,
            ),
          );

          // Recalculate unread count
          setUnreadCount((prev) => {
            const unreadNotifications = notifications.filter(
              (n) => !n.isRead,
            ).length;
            return unreadNotifications;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Remove notification from state
          const deletedNotification = notifications.find(
            (n) => n.id === payload.old.id,
          );
          setNotifications((prev) =>
            prev.filter((n) => n.id !== payload.old.id),
          );

          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export default useNotifications;
