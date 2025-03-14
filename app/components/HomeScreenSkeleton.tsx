import React from "react";
import { View, ScrollView, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 180;

const HomeScreenSkeleton = () => {
  // Create a skeleton for horizontal lists
  const renderHorizontalListSkeleton = () => (
    <View className="mb-6">
      {/* Title skeleton */}
      <View className="flex-row justify-between items-center px-4 mb-2">
        <View className="h-6 w-40 bg-gray-800 rounded-md" />
        <View className="h-4 w-16 bg-gray-800 rounded-md" />
      </View>

      {/* Cards skeleton */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={`card-${index}`}
            className="w-[180px] h-[250px] bg-gray-800 rounded-lg overflow-hidden m-1 mr-3"
          >
            <View className="w-full h-[170px] bg-gray-700" />
            <View className="p-2">
              <View className="h-4 w-3/4 bg-gray-700 rounded-md mb-2" />
              <View className="h-4 w-1/2 bg-gray-700 rounded-md" />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      showsVerticalScrollIndicator={false}
    >
      {/* Genre selector skeleton */}
      <View className="mb-4 mt-2">
        <View className="h-6 w-24 bg-gray-800 rounded-md mx-4 mb-2" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          className="py-2"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={`genre-${index}`}
              className="h-8 w-20 bg-gray-800 rounded-full mr-2"
            />
          ))}
        </ScrollView>
      </View>

      {/* Featured anime skeleton */}
      <View className="h-[200px] mx-4 mb-6 bg-gray-800 rounded-xl overflow-hidden">
        <View className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-black to-transparent p-4">
          <View className="h-6 w-3/4 bg-gray-700 rounded-md mb-2 opacity-70" />
          <View className="h-4 w-1/2 bg-gray-700 rounded-md opacity-70" />
        </View>
      </View>

      {/* Multiple horizontal lists */}
      {renderHorizontalListSkeleton()}
      {renderHorizontalListSkeleton()}
      {renderHorizontalListSkeleton()}

      {/* Bottom padding for navigation */}
      <View className="h-20" />
    </ScrollView>
  );
};

export default HomeScreenSkeleton;
