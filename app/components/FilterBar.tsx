import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { useTheme } from "@/context/ThemeProvider";
import { Filter as FilterIcon } from "lucide-react-native";

interface FilterBarProps {
  filters: string[];
  selectedFilters: string[];
  onFilterPress: (filter: string) => void;
  isLoading?: boolean;
  title?: string;
  onFilterButtonPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * FilterBar component displays a horizontal scrollable list of filter tags
 * with selection state and loading indicators
 *
 * @param props - Component props
 * @returns FilterBar component
 */
const FilterBar = React.memo(function FilterBar({
  filters = [],
  selectedFilters = [],
  onFilterPress,
  isLoading = false,
  title = "Filters",
  onFilterButtonPress,
}: FilterBarProps) {
  const { colors, isDarkMode } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(0.97)).current;

  // Animation effect when component mounts
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Create loading placeholders data
  const loadingPlaceholders = isLoading
    ? Array(5)
        .fill(null)
        .map((_, index) => ({ id: `loading-${index}` }))
    : [];

  // Handle filter press with haptic feedback
  const handleFilterPress = (filter: string) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    onFilterPress(filter);
  };

  const renderFilterItem = ({ item: filter }: { item: string }) => {
    const isSelected = selectedFilters.includes(filter);
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => handleFilterPress(filter)}
          style={[
            styles.filterButton,
            {
              backgroundColor: isSelected
                ? colors.primary
                : isDarkMode
                  ? "rgba(31, 41, 55, 0.8)"
                  : "rgba(243, 244, 246, 0.8)",
              borderColor: isSelected ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${filter}`}
          accessibilityState={{ selected: isSelected }}
          accessibilityHint={
            isSelected ? `Remove ${filter} filter` : `Add ${filter} filter`
          }
        >
          <Text
            style={[
              styles.filterText,
              {
                color: isSelected
                  ? isDarkMode
                    ? "#FFFFFF"
                    : "#FFFFFF"
                  : colors.textSecondary,
                fontWeight: isSelected ? "600" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadingItem = ({ item }: { item: { id: string } }) => (
    <View
      style={[
        styles.loadingPlaceholder,
        {
          backgroundColor: isDarkMode
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(243, 244, 246, 0.5)",
        },
      ]}
      accessibilityLabel="Loading filters"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {onFilterButtonPress && (
          <TouchableOpacity
            onPress={onFilterButtonPress}
            style={[
              styles.filterAllButton,
              { backgroundColor: colors.cardHover },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Advanced filters"
          >
            <FilterIcon size={16} color={colors.text} />
            <Text style={[styles.filterAllText, { color: colors.text }]}>
              All Filters
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <FlatList
          horizontal
          data={loadingPlaceholders}
          renderItem={renderLoadingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Loading filters"
        />
      ) : filters.length === 0 ? (
        <View style={styles.scrollView}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No filters available
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={filters}
          renderItem={renderFilterItem}
          keyExtractor={(item, index) => `filter-${index}-${item}`}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Filter options"
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          decelerationRate="fast"
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterAllText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  scrollView: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24, // Extra padding at the end for better UX
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    minWidth: 80, // Ensure minimum width for better touch targets
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
  },
  loadingPlaceholder: {
    height: 36,
    width: Platform.OS === "ios" ? 90 : 80,
    borderRadius: 20,
    marginRight: 8,
    opacity: 0.5,
  },
  emptyText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
});

export default FilterBar;
