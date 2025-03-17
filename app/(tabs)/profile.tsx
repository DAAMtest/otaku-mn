import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import { supabase } from '@lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="items-center py-8">
        <View className="h-24 w-24 rounded-full bg-gray-200 mb-4" />
        <Text className="text-xl font-semibold text-gray-900">
          {session?.user?.email}
        </Text>
      </View>

      <View className="mt-8">
        {session ? (
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 py-3 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            className="bg-indigo-600 py-3 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
