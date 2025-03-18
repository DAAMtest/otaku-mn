import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Heart, Star } from "lucide-react-native";
import { StyledView, StyledText } from "@/lib/styled";

interface AnimeCardProps {
  id: string;
  title: string;
  image_url: string;
  rating?: number;
  is_favorite?: boolean;
  genres?: string[];
  onPress?: () => void;
  onFavoritePress?: () => void;
}

const AnimeCard: React.FC<AnimeCardProps> = ({
  id,
  title,
  image_url,
  rating,
  is_favorite = false,
  genres = [],
  onPress,
  onFavoritePress,
}) => {
  // Ensure rating is a number for display
  const safeRating = typeof rating === 'number' ? rating : 0;
  
  return (
    <TouchableOpacity 
      className="bg-gray-800 rounded-lg overflow-hidden m-1 w-40"
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityLabel={`${title}, Rating: ${safeRating}`}
    >
      <View className="relative">
        <Image
          source={{
            uri: image_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
          }}
          className="w-full h-56 rounded-t-lg"
          resizeMode="cover"
        />
        <StyledView className="absolute top-0 right-0 left-0 flex-row justify-between p-2">
          {rating !== undefined && (
            <StyledView className="bg-black/50 rounded-md px-2 py-1 flex-row items-center">
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <StyledText className="text-white text-xs ml-1">{safeRating.toFixed(1)}</StyledText>
            </StyledView>
          )}
          
          {onFavoritePress && (
            <TouchableOpacity 
              className="bg-black/50 rounded-full p-1.5"
              onPress={onFavoritePress}
              activeOpacity={0.7}
            >
              <Heart
                size={16}
                color="#FFFFFF"
                fill={is_favorite ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          )}
        </StyledView>
      </View>
      
      <StyledView className="p-2">
        <StyledText className="text-white font-medium text-sm" numberOfLines={2}>
          {title}
        </StyledText>
        
        {genres.length > 0 && (
          <StyledView className="flex-row flex-wrap mt-1">
            {genres.slice(0, 2).map((genre, index) => (
              <StyledView key={index} className="bg-gray-700 rounded-full px-2 py-0.5 mr-1 mt-1">
                <StyledText className="text-gray-300 text-xs">{genre}</StyledText>
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledView>
    </TouchableOpacity>
  );
};

export default AnimeCard;