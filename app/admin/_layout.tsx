import { Stack } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { View, Text } from 'react-native';

/**
 * Admin section layout that provides navigation stack and screen options.
 * Implements authentication check and loading states.
 */
export default function AdminLayout() {
  const { session, isLoading } = useAuth();

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
        <Text className="text-gray-400">Access Denied</Text>
        <Text className="text-gray-500 mt-2">Please sign in to access admin features</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#111827' },
        animation: 'slide_from_right',
      }}
    />
  );
}
