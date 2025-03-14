import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Check,
  Trash2,
  ChevronRight,
  Info,
  Heart,
  Play,
  Plus,
} from "lucide-react-native";
import BottomNavigation from "./components/BottomNavigation";
import { useAuth } from "./context/AuthContext";
import useNotifications, { Notification } from "./hooks/useNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.id || null);

  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert("Info", "No unread notifications");
      return;
    }

    const { error } = await markAllAsRead();
    if (error) {
      Alert.alert("Error", `Failed to mark all as read: ${error.message}`);
    } else {
      Alert.alert("Success", "All notifications marked as read");
    }
  };

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "anime_recommendation":
        if (notification.relatedId) {
          Alert.alert(
            "Anime Recommendation",
            `Viewing anime ID: ${notification.relatedId}`,
          );
          // In a real app, navigate to anime details
          // router.push(`/anime/${notification.relatedId}`);
        }
        break;
      case "friend_activity":
        Alert.alert("Friend Activity", notification.message);
        break;
      case "system":
        Alert.alert("System Notification", notification.message);
        break;
      default:
        Alert.alert(notification.title, notification.message);
        break;
    }
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
            const { error } = await deleteNotification(id);
            if (error) {
              Alert.alert(
                "Error",
                `Failed to delete notification: ${error.message}`,
              );
            }
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
        return <Play size={20} color="#60A5FA" />;
      case "friend_activity":
        return <Heart size={20} color="#F87171" />;
      case "list_update":
        return <Plus size={20} color="#34D399" />;
      case "system":
        return <Info size={20} color="#A78BFA" />;
      default:
        return <Bell size={20} color="#9CA3AF" />;
    }
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-800 ${!item.isRead ? "bg-gray-800/30" : ""}`}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center mr-3">
          {getNotificationIcon(item.type)}
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-white font-semibold text-base flex-1 mr-2">
              {item.title}
            </Text>
            <Text className="text-gray-400 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text className="text-gray-300 mt-1" numberOfLines={2}>
            {item.message}
          </Text>
          <View className="flex-row justify-between items-center mt-2">
            {!item.isRead ? (
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => markAsRead(item.id)}
              >
                <Check size={14} color="#60A5FA" />
                <Text className="text-blue-400 text-xs ml-1">Mark as read</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Trash2 size={14} color="#F87171" />
              <Text className="text-red-400 text-xs ml-1">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-gray-400 mt-4">Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-20">
        <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center mb-4">
          <Bell size={32} color="#9CA3AF" />
        </View>
        <Text className="text-white text-lg font-semibold mb-2">
          No notifications
        </Text>
        <Text className="text-gray-400 text-center px-8">
          You don't have any notifications yet. We'll notify you when something
          interesting happens!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="text-blue-400 text-sm">Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmptyComponent}
          onRefresh={fetchNotifications}
          refreshing={loading}
        />

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
