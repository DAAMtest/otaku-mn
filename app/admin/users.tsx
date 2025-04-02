import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  X,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  UserCog,
} from "lucide-react-native";
import { useAuthStore } from "@/src/store/authStore";
import { useAdminUserStore, UserProfile } from "@/src/store/adminUserStore";

export default function UserManagement() {
  const router = useRouter();
  const { user, session } = useAuthStore();
  const {
    userList,
    loading,
    error,
    fetchUserList,
    updateUserRole,
    updateUserStatus,
    deleteUser,
  } = useAdminUserStore();
  const [filteredUserList, setFilteredUserList] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Check authentication and fetch user list on component mount
  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    fetchUserList();
  }, [session, router]);

  // Filter user list when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUserList(userList);
    } else {
      const filtered = userList.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email &&
            user.email.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      setFilteredUserList(filtered);
    }
  }, [searchQuery, userList]);

  // Handle back button press
  const handleBackPress = () => {
    router.back();
  };

  // Handle user role toggle
  const handleRoleToggle = async (userId: string) => {
    // Find the current user and toggle their admin status
    const currentUser = userList.find((u) => u.id === userId);
    if (!currentUser) return;

    const { error } = await updateUserRole(userId, !currentUser.is_admin);

    if (error) {
      Alert.alert("Error", `Failed to update user role: ${error.message}`);
      return;
    }

    Alert.alert(
      "Role Updated",
      "User role has been updated. In a real app, this would update the database.",
    );
  };

  // Handle user status toggle
  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    const { error } = await updateUserStatus(userId, newStatus);

    if (error) {
      Alert.alert("Error", `Failed to update user status: ${error.message}`);
      return;
    }

    Alert.alert(
      "Status Updated",
      `User has been ${newStatus}. In a real app, this would update the database.`,
    );
  };

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const { error } = await deleteUser(userId);

            if (error) {
              Alert.alert("Error", `Failed to delete user: ${error.message}`);
              return;
            }

            Alert.alert("Success", "User deleted successfully");
          },
          style: "destructive",
        },
      ],
    );
  };

  // Handle user details
  const handleUserDetails = (userId: string) => {
    // In a real app, this would navigate to a user details screen
    Alert.alert(
      "User Details",
      "This would show detailed user information and activity.",
    );
  };

  // Render user item
  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <View className="bg-gray-800 rounded-lg p-4 mb-3">
      <View className="flex-row items-center">
        <Image
          source={{
            uri:
              item.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
          }}
          className="w-12 h-12 rounded-full"
          resizeMode="cover"
        />

        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-base">
              {item.username}
            </Text>
            {item.is_admin && (
              <View className="bg-purple-600/30 rounded-full px-2 py-0.5 ml-2">
                <Text className="text-purple-400 text-xs">Admin</Text>
              </View>
            )}
            <View
              className={`${item.status === "active" ? "bg-green-600/30" : "bg-red-600/30"} rounded-full px-2 py-0.5 ml-2`}
            >
              <Text
                className={`${item.status === "active" ? "text-green-400" : "text-red-400"} text-xs`}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <Text className="text-gray-400 text-xs mt-1">{item.email}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            Joined: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="bg-blue-600/30 p-2 rounded-full mr-2"
            onPress={() => handleUserDetails(item.id)}
          >
            <UserCog size={16} color="#60A5FA" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-600/30 p-2 rounded-full"
            onPress={() => handleDeleteUser(item.id)}
          >
            <Trash2 size={16} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-700">
        <View className="flex-row items-center">
          <Text className="text-gray-300 mr-2">Admin Access</Text>
          <Switch
            value={item.is_admin}
            onValueChange={() => handleRoleToggle(item.id)}
            trackColor={{ false: "#3f3f46", true: "#7c3aed" }}
            thumbColor={item.is_admin ? "#a78bfa" : "#9ca3af"}
          />
        </View>

        <View className="flex-row items-center">
          <Text className="text-gray-300 mr-2">Active</Text>
          <Switch
            value={item.status === "active"}
            onValueChange={() => handleStatusToggle(item.id, item.status || "")}
            trackColor={{ false: "#3f3f46", true: "#059669" }}
            thumbColor={item.status === "active" ? "#10b981" : "#9ca3af"}
          />
        </View>
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
          <Text className="text-white font-bold text-lg">User Management</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-white ml-2"
              placeholder="Search users..."
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

        {/* User Stats */}
        <View className="flex-row justify-between px-4 mb-4">
          <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
            <Text className="text-blue-400 font-bold text-lg">
              {userList.length}
            </Text>
            <Text className="text-gray-400 text-xs">Total Users</Text>
          </View>
          <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
            <Text className="text-purple-400 font-bold text-lg">
              {userList.filter((u) => u.is_admin).length}
            </Text>
            <Text className="text-gray-400 text-xs">Admins</Text>
          </View>
          <View className="bg-gray-800 rounded-lg p-3 w-[31%]">
            <Text className="text-green-400 font-bold text-lg">
              {userList.filter((u) => u.status === "active").length}
            </Text>
            <Text className="text-gray-400 text-xs">Active</Text>
          </View>
        </View>

        {/* User List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#40C057" />
            <Text className="text-gray-400 mt-4">Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUserList}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400 text-lg">
                  {searchQuery
                    ? "No users found matching your search"
                    : "No users available"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
