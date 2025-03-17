import { View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { session, isLoading } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">
        Welcome to AnimetempO
      </Text>
      <Text className="mt-2 text-gray-600">
        {session ? 'You are logged in' : 'Please sign in to continue'}
      </Text>
    </View>
  );
}
