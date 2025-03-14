import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Play, Star, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface FeaturedAnimeProps {
  id: string;
  title: string;
  imageUrl: string;
  rating: number;
  description?: string;
  genres?: string[];
  onPress?: () => void;
  onPlayPress?: () => void;
  onAddToListPress?: () => void;
}

const FeaturedAnime = ({
  id = "1",
  title = "Attack on Titan",
  imageUrl = "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80",
  rating = 4.8,
  description = "In a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason.",
  genres = ["Action", "Drama", "Fantasy"],
  onPress = () => {},
  onPlayPress = () => {},
  onAddToListPress = () => {},
}: FeaturedAnimeProps) => {
  return (
    <TouchableOpacity
      className="h-[200px] mx-4 mb-6 rounded-xl overflow-hidden"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="w-full h-full justify-end"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)"]}
          className="p-4 pt-12"
        >
          <View className="flex-row items-center mb-1">
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text className="text-white text-xs ml-1 mr-3">{rating}</Text>
            {genres.slice(0, 2).map((genre, index) => (
              <View
                key={genre}
                className="bg-gray-800/80 rounded-full px-2 py-0.5 mr-2"
              >
                <Text className="text-white text-xs">{genre}</Text>
              </View>
            ))}
          </View>

          <Text className="text-white font-bold text-xl mb-1">{title}</Text>

          <Text
            className="text-gray-300 text-xs mb-3"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {description}
          </Text>

          <View className="flex-row">
            <TouchableOpacity
              className="bg-purple-600 rounded-full flex-row items-center px-4 py-2 mr-3"
              onPress={onPlayPress}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white font-medium ml-1">Watch Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-800/80 rounded-full flex-row items-center px-4 py-2"
              onPress={onAddToListPress}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text className="text-white font-medium ml-1">My List</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default FeaturedAnime;
