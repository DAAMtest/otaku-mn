import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useAnimeData } from '../hooks/useAnimeData';
import AnimeCard from '../components/AnimeCard';
import { useTheme } from '../context/ThemeProvider';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { session, isLoading: authLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  
  const { trendingAnime, newReleases, loading } = useAnimeData();

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900">
          Welcome to AnimetempO
        </Text>
        
        <View className="mt-6">
          <Text className="text-xl font-semibold text-gray-900 mb-3">
            Trending Anime
          </Text>
          {loading.trending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {trendingAnime?.map((anime) => (
                <AnimeCard 
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  imageUrl={anime.imageUrl}
                  rating={anime.rating}
                  isFavorite={false}
                  onPress={() => router.push(`/anime/${anime.id}`)}
                  onFavoritePress={() => {}}
                  onAddToListPress={() => {}}
                  width={150}
                  height={225}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="mt-6">
          <Text className="text-xl font-semibold text-gray-900 mb-3">
            New Releases
          </Text>
          {loading.newReleases ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {newReleases?.map((anime) => (
                <AnimeCard 
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  imageUrl={anime.imageUrl}
                  rating={anime.rating}
                  isFavorite={false}
                  onPress={() => router.push(`/anime/${anime.id}`)}
                  onFavoritePress={() => {}}
                  onAddToListPress={() => {}}
                  width={150}
                  height={225}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
