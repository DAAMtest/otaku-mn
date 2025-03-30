import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@lib/supabase';
import { useEffect, useState } from 'react';
import { Edit, LogOut, Eye, Heart, BookmarkIcon } from 'lucide-react-native';

// Add debug function
const debug = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[ProfileDebug]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error('[ProfileError]', ...args);
    }
  },
  state: (prefix: string, obj: any) => {
    if (__DEV__) {
      console.log(`[ProfileDebug] ${prefix}:`, JSON.stringify(obj, null, 2));
    }
  }
};

interface UserStats {
  watchingCount: number;
  favoriteCount: number;
  watchlistCount: number;
}

interface UserAnimeListItem {
  list_type: 'watching' | 'favorites' | 'watchlist';
  user_id: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, session, signOut, isLoading, refreshSession } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    watchingCount: 0,
    favoriteCount: 0,
    watchlistCount: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Initialize and check session state
  useEffect(() => {
    const checkSession = async () => {
      debug.log("Checking session state...");
      await refreshSession();
      setHasCheckedSession(true);
      debug.state("Session check complete", {
        hasSession: !!session,
        isLoading,
        userId: session?.user?.id,
        hasCheckedSession: true
      });
    };

    checkSession();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    debug.state("Auth state updated", {
      hasSession: !!session,
      isLoading,
      userId: session?.user?.id,
      hasCheckedSession
    });

    // Only redirect if we've checked the session and there's definitely no session
    if (hasCheckedSession && !isLoading && !session) {
      debug.log("No session after complete check, redirecting to home");
      router.replace('/');
    }
  }, [session, isLoading, hasCheckedSession, router]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user?.id) {
        debug.log("No user ID, skipping stats fetch");
        return;
      }
      
      try {
        debug.log("Fetching stats for user:", session.user.id);
        setStatsLoading(true);
        
        const { data, error } = await supabase
          .from('user_anime_lists')
          .select('list_type')
          .eq('user_id', session.user.id);

        if (error) {
          debug.error("Error fetching stats:", error);
          throw error;
        }

        const counts = {
          watchingCount: (data as UserAnimeListItem[]).filter(item => item.list_type === 'watching').length,
          favoriteCount: (data as UserAnimeListItem[]).filter(item => item.list_type === 'favorites').length,
          watchlistCount: (data as UserAnimeListItem[]).filter(item => item.list_type === 'watchlist').length
        };

        debug.state("User stats", counts);
        setStats(counts);
      } catch (error) {
        debug.error("Error in fetchUserStats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchUserStats();
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      debug.log("Signing out...");
      await signOut();
      router.replace('/');
    } catch (error) {
      debug.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    debug.log("Showing loading state");
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!session) {
    debug.log("No session, redirecting");
    router.replace('/');
    return null;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1">
        <View className="p-4 border-b border-gray-200 dark:border-gray-800">
          <View className="flex-row items-center">
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/edit-profile')}
                className="bg-indigo-600 rounded-full px-4 py-1 mt-2 flex-row items-center self-start"
              >
                <Edit size={14} color="#FFFFFF" />
                <Text className="text-white text-sm ml-1">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-6">
            <View className="items-center flex-1">
              <View className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Eye size={24} color="#4F46E5" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {statsLoading ? '-' : stats.watchingCount}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Watching</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Heart size={24} color="#EF4444" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {statsLoading ? '-' : stats.favoriteCount}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Favorites</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-full items-center justify-center mb-2">
                <BookmarkIcon size={24} color="#059669" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                {statsLoading ? '-' : stats.watchlistCount}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">Watchlist</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="p-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 py-3 px-4 rounded-lg"
          >
            <View className="flex-row items-center justify-center">
              <LogOut size={20} color="#FFFFFF" />
              <Text className="text-white text-center font-semibold ml-2">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
