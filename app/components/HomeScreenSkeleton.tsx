import React from "react";
import { Dimensions } from "react-native";
import { View, ScrollView } from "@/lib/nativewind-setup";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

/**
 * Props for the SkeletonView component
 */
interface SkeletonViewProps {
  children?: React.ReactNode;
}

/**
 * Base skeleton view component
 */
const SkeletonView = React.memo(({ children }: SkeletonViewProps) => (
  <View className="bg-neutral-900 dark:bg-neutral-800 flex-1">{children}</View>
));

SkeletonView.displayName = "SkeletonView";

/**
 * Banner skeleton component.
 * Displays a loading placeholder for the featured anime banner.
 */
const BannerSkeleton = React.memo(() => (
  <View className="relative w-full h-56">
    <View className="w-full h-full bg-neutral-800 dark:bg-neutral-700 rounded-lg animate-pulse" />
    <View className="absolute bottom-4 left-4 right-4">
      <View className="h-6 w-2/3 bg-neutral-700 dark:bg-neutral-600 rounded-md mb-2" />
      <View className="h-4 w-1/3 bg-neutral-700 dark:bg-neutral-600 rounded-md" />
    </View>
  </View>
));

BannerSkeleton.displayName = "BannerSkeleton";

/**
 * Section header skeleton component.
 * Displays a loading placeholder for section headings.
 */
const SectionHeaderSkeleton = React.memo(() => (
  <View className="flex-row justify-between items-center mx-4 mb-2">
    <View className="h-6 w-40 bg-neutral-700 dark:bg-neutral-600 rounded-md" />
    <View className="h-4 w-14 bg-neutral-700 dark:bg-neutral-600 rounded-md" />
  </View>
));

SectionHeaderSkeleton.displayName = "SectionHeaderSkeleton";

/**
 * Grid item skeleton component.
 * Displays a loading placeholder for an anime card.
 */
const GridItem = React.memo(() => {
  const cardWidth = (width - 32) / 2 - 8;

  return (
    <View style={{ width: cardWidth }} className="p-2">
      <View className="bg-neutral-800 dark:bg-neutral-700 rounded-lg overflow-hidden">
        <View
          style={{ height: cardWidth * 1.5 }}
          className="bg-neutral-700 dark:bg-neutral-600 animate-pulse"
        />
        <View className="p-2">
          <View className="h-4 w-3/4 bg-neutral-700 dark:bg-neutral-600 rounded-md mb-1" />
          <View className="h-4 w-1/2 bg-neutral-700 dark:bg-neutral-600 rounded-md" />
        </View>
      </View>
    </View>
  );
});

GridItem.displayName = "GridItem";

/**
 * Filter item skeleton component.
 * Displays a loading placeholder for a filter option.
 */
const FilterItem = React.memo(() => (
  <View className="h-8 w-20 bg-neutral-700 dark:bg-neutral-600 rounded-full mx-1 animate-pulse" />
));

FilterItem.displayName = "FilterItem";

/**
 * Grid skeleton component.
 * Displays a grid of anime card loading placeholders.
 */
const SkeletonGrid = React.memo(() => (
  <View className="flex-row flex-wrap px-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <GridItem key={`grid-${index}`} />
    ))}
  </View>
));

SkeletonGrid.displayName = "SkeletonGrid";

/**
 * Filter bar skeleton component.
 * Displays loading placeholders for filter options.
 */
const FilterSkeleton = React.memo(() => (
  <View className="py-2 px-4 flex-row items-center">
    <View className="flex-row items-center">
      <View className="h-4 w-4 bg-neutral-700 dark:bg-neutral-600 rounded mr-1" />
      <View className="h-4 w-16 bg-neutral-700 dark:bg-neutral-600 rounded" />
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="ml-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <FilterItem key={`filter-${index}`} />
      ))}
    </ScrollView>
  </View>
));

FilterSkeleton.displayName = "FilterSkeleton";

/**
 * HomeScreenSkeleton component.
 * Displays loading placeholders for the home screen content.
 */
const HomeScreenSkeleton = React.memo(() => (
  <SkeletonView>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-16"
    >
      <View className="p-4">
        <BannerSkeleton />
      </View>

      <View className="mb-6">
        <SectionHeaderSkeleton />
        <FilterSkeleton />
      </View>

      <View className="mb-6">
        <SectionHeaderSkeleton />
        <SkeletonGrid />
      </View>

      <View className="mb-6">
        <SectionHeaderSkeleton />
        <SkeletonGrid />
      </View>
    </ScrollView>
  </SkeletonView>
));

export default HomeScreenSkeleton;
