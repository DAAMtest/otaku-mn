import React from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Heart, Star, Plus, MoreHorizontal } from "lucide-react-native";

interface AnimeCardProps {
  id?: string;
  title?: string;
  imageUrl?: string;
  rating?: number;
  onPress?: () => void;
  onAddToList?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  genres?: string[];
}

const AnimeCard = React.memo(({
  id = "1",
  title = "Attack on Titan",
  imageUrl = "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&q=80",
  rating = 4.8,
  onPress = () => {},
  onAddToList = () => {},
  onFavorite = () => {},
  isFavorite = false,
  genres = ["Action", "Drama", "Fantasy"],
}: AnimeCardProps) => {
  // Handle image loading error
  const [imageError, setImageError] = React.useState(false);
  const fallbackImage = "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&q=80";
  // Handle more options press
  const handleMorePress = () => {
    Alert.alert(title, "Select an option", [
      { text: "Cancel", style: "cancel" },
      { text: "View Details", onPress },
      { text: "Add to List", onPress: onAddToList },
      {
        text: isFavorite ? "Remove from Favorites" : "Add to Favorites",
        onPress: onFavorite,
      },
      {
        text: "Share",
        onPress: () => Alert.alert("Share", `Sharing ${title}`),
      },
    ]);
  };

  return (
    <TouchableOpacity
      className="w-[180px] h-[250px] bg-gray-800 rounded-lg overflow-hidden m-1 shadow-md"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageError ? fallbackImage : imageUrl }}
        className="w-full h-[170px]"
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      <View className="p-2">
        <Text className="text-white font-semibold text-sm" numberOfLines={2}>
          {title}
        </Text>

        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text className="text-white text-xs ml-1">{rating}</Text>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              className="mr-2"
              onPress={onAddToList}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart
                size={18}
                color="#FFFFFF"
                fill={isFavorite ? "#FF6B6B" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
        onPress={handleMorePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MoreHorizontal size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

});  // Close memo

export default AnimeCard;
