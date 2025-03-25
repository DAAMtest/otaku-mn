import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/context/ThemeProvider";

interface AnimeSkeletonProps {
  type: "card" | "horizontal" | "featured" | "detail";
  count?: number;
}

const AnimeSkeleton = ({ type, count = 1 }: AnimeSkeletonProps) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  const renderCardSkeleton = () => {
    return (
      <View
        style={[styles.cardSkeleton, { backgroundColor: colors.cardHover }]}
      >
        <View
          style={[styles.imageSkeleton, { backgroundColor: colors.skeleton }]}
        />
        <View
          style={[styles.titleSkeleton, { backgroundColor: colors.skeleton }]}
        />
        <View
          style={[
            styles.subtitleSkeleton,
            { backgroundColor: colors.skeleton },
          ]}
        />
      </View>
    );
  };

  const renderHorizontalSkeleton = () => {
    return (
      <View style={styles.horizontalContainer}>
        <View
          style={[
            styles.horizontalSkeleton,
            { backgroundColor: colors.cardHover },
          ]}
        >
          <View
            style={[
              styles.horizontalImageSkeleton,
              { backgroundColor: colors.skeleton },
            ]}
          />
          <View style={styles.horizontalContent}>
            <View
              style={[
                styles.horizontalTitleSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
            <View
              style={[
                styles.horizontalSubtitleSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderFeaturedSkeleton = () => {
    return (
      <View
        style={[styles.featuredSkeleton, { backgroundColor: colors.cardHover }]}
      >
        <View style={styles.featuredContent}>
          <View
            style={[
              styles.featuredTitleSkeleton,
              { backgroundColor: colors.skeleton },
            ]}
          />
          <View
            style={[
              styles.featuredSubtitleSkeleton,
              { backgroundColor: colors.skeleton },
            ]}
          />
          <View style={styles.featuredButtonsContainer}>
            <View
              style={[
                styles.featuredButtonSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
            <View
              style={[
                styles.featuredButtonSkeleton,
                { backgroundColor: colors.skeleton, width: 80 },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDetailSkeleton = () => {
    return (
      <View style={styles.detailContainer}>
        <View
          style={[
            styles.detailHeaderSkeleton,
            { backgroundColor: colors.cardHover },
          ]}
        />
        <View style={styles.detailContent}>
          <View
            style={[
              styles.detailImageSkeleton,
              { backgroundColor: colors.skeleton },
            ]}
          />
          <View style={styles.detailInfo}>
            <View
              style={[
                styles.detailTitleSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
            <View
              style={[
                styles.detailGenreSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
            <View
              style={[
                styles.detailRatingSkeleton,
                { backgroundColor: colors.skeleton },
              ]}
            />
          </View>
        </View>
        <View
          style={[
            styles.detailDescriptionSkeleton,
            { backgroundColor: colors.skeleton },
          ]}
        />
        <View
          style={[
            styles.detailDescriptionSkeleton,
            { backgroundColor: colors.skeleton, width: "70%" },
          ]}
        />
      </View>
    );
  };

  const renderSkeletonByType = () => {
    switch (type) {
      case "card":
        return renderCardSkeleton();
      case "horizontal":
        return renderHorizontalSkeleton();
      case "featured":
        return renderFeaturedSkeleton();
      case "detail":
        return renderDetailSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  const renderSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(
        <View key={`skeleton-${type}-${i}`}>{renderSkeletonByType()}</View>,
      );
    }
    return skeletons;
  };

  return <>{renderSkeletons()}</>;
};

const styles = StyleSheet.create({
  // Card skeleton styles
  cardSkeleton: {
    width: 150,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  imageSkeleton: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  titleSkeleton: {
    height: 16,
    marginTop: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  subtitleSkeleton: {
    height: 12,
    width: "60%",
    marginTop: 4,
    marginHorizontal: 4,
    borderRadius: 4,
  },

  // Horizontal skeleton styles
  horizontalContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  horizontalSkeleton: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    height: 100,
  },
  horizontalImageSkeleton: {
    width: 80,
    height: "100%",
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
  },
  horizontalTitleSkeleton: {
    height: 16,
    width: "80%",
    borderRadius: 4,
    marginBottom: 8,
  },
  horizontalSubtitleSkeleton: {
    height: 12,
    width: "50%",
    borderRadius: 4,
  },

  // Featured skeleton styles
  featuredSkeleton: {
    height: 200,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitleSkeleton: {
    height: 20,
    width: "70%",
    borderRadius: 4,
    marginBottom: 8,
  },
  featuredSubtitleSkeleton: {
    height: 14,
    width: "90%",
    borderRadius: 4,
    marginBottom: 16,
  },
  featuredButtonsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  featuredButtonSkeleton: {
    height: 32,
    width: 100,
    borderRadius: 16,
    marginRight: 12,
  },

  // Detail skeleton styles
  detailContainer: {
    padding: 16,
  },
  detailHeaderSkeleton: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailImageSkeleton: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  detailTitleSkeleton: {
    height: 24,
    width: "90%",
    borderRadius: 4,
    marginBottom: 12,
  },
  detailGenreSkeleton: {
    height: 16,
    width: "60%",
    borderRadius: 4,
    marginBottom: 12,
  },
  detailRatingSkeleton: {
    height: 16,
    width: "40%",
    borderRadius: 4,
  },
  detailDescriptionSkeleton: {
    height: 14,
    width: "100%",
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default AnimeSkeleton;
