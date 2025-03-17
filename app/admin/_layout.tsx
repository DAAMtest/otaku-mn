import { Stack } from "expo-router";
import { useAuth } from "@context/AuthContext";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Shield, LogIn } from "lucide-react-native";

/**
 * Admin section layout that provides navigation stack and screen options.
 * Implements authentication check and loading states with role-based access control.
 */
export default function AdminLayout() {
  const { session, user, isLoading } = useAuth();
  const router = useRouter();

  // Check if user has admin role
  // In a real app, this would check a role field in the user object or make a database query
  const isAdmin = user ? true : false; // For demo purposes, any logged in user is considered admin

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-gray-400">Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Shield size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text className="text-gray-200 text-xl font-bold">Access Denied</Text>
        <Text className="text-gray-400 mt-2 text-center px-8 mb-6">
          Please sign in with an admin account to access these features
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-lg flex-row items-center"
          onPress={() => router.push("/auth/login")}
        >
          <LogIn size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Shield size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text className="text-gray-200 text-xl font-bold">
          Admin Access Required
        </Text>
        <Text className="text-gray-400 mt-2 text-center px-8 mb-6">
          Your account does not have administrator privileges
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Text className="text-white font-semibold">Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111827" },
        animation: "slide_from_right",
      }}
    />
  );
}
