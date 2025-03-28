import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Info,
  Star,
  Calendar,
  Clock,
} from "lucide-react-native";
import { useTheme } from "@/context/ThemeProvider";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import useNotifications, { Notification } from "./hooks/useNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [refreshing, setRefreshing] = useState(false);
  
  // Properly use the useNotifications hook
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification
  } = useNotifications(user?.id || null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();

    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }
  };

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to related content if available
    if (notification.relatedId) {
      Alert.alert(
        "Anime Details",
        `View details for anime ID: ${notification.relatedId}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "View",
            onPress: () =>
              console.log(`Navigate to anime ID: ${notification.relatedId}`),
          },
        ],
      );
    } else {
      // Just show the notification content
      Alert.alert(notification.title, notification.message);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert("Info", "No unread notifications");
      return;
    }

    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not available, continue silently
    }

    markAllAsRead();
    Alert.alert("Success", "All notifications marked as read");
  };

  // Handle delete notification
  const handleDeleteNotification = (id: string) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            // Add haptic feedback
            try {
              const Haptics = require("expo-haptics");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
              // Haptics not available, continue silently
            }

            deleteNotification(id);
          },
          style: "destructive",
        },
      ],
    );
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "anime_recommendation":
      case "info":
        return <Info size={20} color={colors.info || "#60A5FA"} />;
      case "friend_activity":
      case "update":
        return <Calendar size={20} color={colors.success || "#34D399"} />;
      case "system":
      case "alert":
        return <AlertCircle size={20} color={colors.error || "#F87171"} />;
      default:
        return <Bell size={20} color={colors.textSecondary || "#9CA3AF"} />;
    }
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "just now";
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render notification item
  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => {
    // Animation for new items
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.isRead ? colors.card : colors.cardHover,
            borderLeftColor:
              item.type === "alert"
                ? colors.error
                : item.type === "update"
                  ? colors.success
                  : colors.info,
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </View>

          <View style={styles.notificationTextContainer}>
            <View style={styles.notificationHeader}>
              <Text
                style={[styles.notificationTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              <Text
                style={[
                  styles.notificationTime,
                  { color: colors.textSecondary },
                ]}
              >
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>

            <Text
              style={[
                styles.notificationMessage,
                { color: colors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.notificationActions}>
          {!item.isRead && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.success + "20" },
              ]}
              onPress={() => markAsRead(item.id)}
            >
              <Check size={16} color={colors.success} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.error + "20" },
            ]}
            onPress={() => handleDeleteNotification(item.id)}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading notifications...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Bell size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No notifications
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          You don't have any notifications yet. We'll notify you when something
          interesting happens!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={{ flex: 1 }}>
        <Header
          title="Notifications"
          showBack={true}
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        />

        {/* Header Actions */}
        <View className="w-full h-[60px] flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderLeftWidth: 4,
  },
  notificationContent: {
    flexDirection: "row",
    padding: 16,
  },
  notificationIcon: {
    marginRight: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 8,
    paddingTop: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
