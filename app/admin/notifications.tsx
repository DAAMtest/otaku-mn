import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  X,
  Send,
  Bell,
  Users,
  FileText,
  Info,
  Heart,
  Play,
} from "lucide-react-native";
import { useAuthStore } from "@/src/store/authStore";
import {
  useAdminNotificationStore,
  Notification,
} from "@/src/store/adminNotificationStore";

export default function NotificationManagement() {
  const router = useRouter();
  const { user, session } = useAuthStore();
  const {
    notificationList,
    notificationTypes,
    audienceTypes,
    loading,
    error,
    fetchNotificationList,
    sendNotification,
    deleteNotification,
  } = useAdminNotificationStore();

  const [filteredNotificationList, setFilteredNotificationList] = useState<
    Notification[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    title: string;
    message: string;
    type: string;
    audience: string;
  }>({
    title: "",
    message: "",
    type: "system",
    audience: "all",
  });

  // Check authentication and fetch notification list on component mount
  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchNotificationList();
  }, [session, router]);

  // Filter notification list when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotificationList(notificationList);
    } else {
      const filtered = notificationList.filter(
        (notification) =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.message
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
      setFilteredNotificationList(filtered);
    }
  }, [searchQuery, notificationList]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle add new notification
  const handleAddNotification = () => {
    setCurrentNotification({
      title: "",
      message: "",
      type: "system",
      audience: "all",
    });
    setModalVisible(true);
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
              return;
            }

            Alert.alert("Success", "Notification deleted successfully");
          },
          style: "destructive",
        },
      ],
    );
  };

  // Handle send notification
  const handleSendNotification = async () => {
    // Validate form
    if (!currentNotification.title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    if (!currentNotification.message.trim()) {
      Alert.alert("Error", "Message is required");
      return;
    }

    const { error } = await sendNotification({
      title: currentNotification.title,
      message: currentNotification.message,
      type: currentNotification.type,
      audience: currentNotification.audience,
      user_id: user?.id, // In a real app, this would be based on audience
    });

    if (error) {
      Alert.alert("Error", `Failed to send notification: ${error.message}`);
      return;
    }

    setModalVisible(false);
    Alert.alert(
      "Success",
      `Notification sent to ${currentNotification.audience} users`,
    );
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    const notificationType = notificationTypes.find((t) => t.id === type);
    if (notificationType) {
      // Map string icon names to actual components
      let IconComponent;
      switch (notificationType.icon) {
        case "Info":
          IconComponent = Info;
          break;
        case "Play":
          IconComponent = Play;
          break;
        case "Heart":
          IconComponent = Heart;
          break;
        default:
          IconComponent = Bell;
      }
      return <IconComponent size={20} color={notificationType.color} />;
    }
    return <Bell size={20} color="#9CA3AF" />;
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-3">
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center mr-3">
          {getNotificationIcon(item.type)}
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-white font-semibold text-base flex-1 mr-2">
              {item.title}
            </Text>
            <Text className="text-gray-400 text-xs">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          <Text className="text-gray-300 mt-1" numberOfLines={2}>
            {item.message}
          </Text>

          <View className="flex-row mt-2">
            <View className="bg-gray-700 rounded-full px-2 py-0.5 mr-2">
              <Text className="text-gray-300 text-xs">{item.type}</Text>
            </View>
            <View className="bg-gray-700 rounded-full px-2 py-0.5">
              <Text className="text-gray-300 text-xs">{item.sent_to}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-600/30 p-2 rounded-full ml-2"
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Trash2 size={16} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View className="flex-1">
        {/* Header */}
        <View className="w-full h-[60px] bg-gray-900 flex-row items-center justify-between px-4 border-b border-gray-800">
          <TouchableOpacity onPress={handleBackPress}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">
            Notification Management
          </Text>
          <TouchableOpacity onPress={handleAddNotification}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search notifications..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#40C057" />
            <Text className="text-gray-400 mt-4">Loading notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotificationList}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400 text-lg">
                  {searchQuery
                    ? "No notifications found matching your search"
                    : "No notifications available"}
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-green-600 px-4 py-2 rounded-lg"
                  onPress={handleAddNotification}
                >
                  <Text className="text-white">Create New Notification</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Add Notification Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/70">
            <View className="w-[90%] bg-gray-900 rounded-xl p-4 max-h-[80%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">
                  Send New Notification
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1">
                {/* Notification Type */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-2">Notification Type</Text>
                  <View className="flex-row flex-wrap">
                    {notificationTypes.map((type) => {
                      // Map string icon names to actual components
                      let IconComponent;
                      switch (type.icon) {
                        case "Info":
                          IconComponent = Info;
                          break;
                        case "Play":
                          IconComponent = Play;
                          break;
                        case "Heart":
                          IconComponent = Heart;
                          break;
                        default:
                          IconComponent = Bell;
                      }

                      return (
                        <TouchableOpacity
                          key={type.id}
                          className={`flex-row items-center mr-2 mb-2 p-2 rounded-lg ${currentNotification.type === type.id ? "bg-gray-700" : "bg-gray-800"}`}
                          onPress={() =>
                            setCurrentNotification({
                              ...currentNotification,
                              type: type.id,
                            })
                          }
                        >
                          <IconComponent size={16} color={type.color} />
                          <Text className="text-white ml-1">{type.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Audience Selection */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-2">Send To</Text>
                  <View className="flex-row flex-wrap">
                    {audienceTypes.map((audience) => (
                      <TouchableOpacity
                        key={audience.id}
                        className={`flex-row items-center mr-2 mb-2 p-2 rounded-lg ${currentNotification.audience === audience.id ? "bg-gray-700" : "bg-gray-800"}`}
                        onPress={() =>
                          setCurrentNotification({
                            ...currentNotification,
                            audience: audience.id,
                          })
                        }
                      >
                        <Users size={16} color="#9CA3AF" />
                        <Text className="text-white ml-1">{audience.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Title */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Title</Text>
                  <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
                    <FileText size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 text-white ml-2"
                      placeholder="Notification title"
                      placeholderTextColor="#9CA3AF"
                      value={currentNotification.title}
                      onChangeText={(text) =>
                        setCurrentNotification({
                          ...currentNotification,
                          title: text,
                        })
                      }
                    />
                  </View>
                </View>

                {/* Message */}
                <View className="mb-4">
                  <Text className="text-gray-300 mb-1">Message</Text>
                  <View className="bg-gray-800 rounded-lg px-3 py-2">
                    <TextInput
                      className="text-white"
                      placeholder="Notification message"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={currentNotification.message}
                      onChangeText={(text) =>
                        setCurrentNotification({
                          ...currentNotification,
                          message: text,
                        })
                      }
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                className="bg-green-600 rounded-lg py-3 items-center mt-4"
                onPress={handleSendNotification}
              >
                <View className="flex-row items-center">
                  <Send size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2">
                    Send Notification
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
