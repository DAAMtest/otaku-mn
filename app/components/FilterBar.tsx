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

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedOptions: string[];
  onOptionPress: (option: FilterOption) => void;
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
  options = [],
  selectedOptions = [],
  onOptionPress,
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

  // Sort filters alphabetically
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  // Create loading placeholders data
  const loadingPlaceholders = isLoading
    ? Array(5)
        .fill(null)
        .map((_, index) => ({ id: `loading-${index}` }))
    : [];

  // Handle filter press with haptic feedback
  const handleOptionPress = (option: FilterOption) => {
    // Add haptic feedback
    try {
      const Haptics = require("expo-haptics");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }

    onOptionPress(option);
  };

  const renderFilterItem = ({ item: option }: { item: FilterOption }) => {
    const isSelected = selectedOptions.includes(option.id);
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => handleOptionPress(option)}
          style={[
            styles.filterButton,
            {
              backgroundColor: isSelected
                ? colors.primary
                : isDarkMode
                  ? "rgba(19, 47, 76, 0.95)"
                  : "rgba(237, 242, 247, 0.9)",
              borderColor: isSelected
                ? colors.primaryLight
                : isDarkMode
                  ? "rgba(64, 192, 87, 0.3)"
                  : "rgba(203, 213, 225, 0.8)",
              borderWidth: 2,
              shadowColor: isSelected
                ? colors.primary
                : isDarkMode
                  ? "rgba(64, 192, 87, 0.4)"
                  : "rgba(0, 0, 0, 0.1)",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 3,
              elevation: isSelected ? 4 : 2,
            },
          ]}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={`Filter by ${option.label}`}
          accessibilityState={{ selected: isSelected }}
          accessibilityHint={
            isSelected
              ? `Remove ${option.label} filter`
              : `Add ${option.label} filter`
          }
        >
          <Text
            style={[
              styles.filterText,
              {
                color: isSelected
                  ? colors.white
                  : isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(15, 23, 42, 0.9)",
                fontWeight: isSelected ? "700" : "500",
              },
            ]}
          >
            {option.label}
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
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? "rgba(19, 47, 76, 0.8)"
            : "rgba(241, 245, 249, 0.9)",
        },
      ]}
    >
      {title && (
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {onFilterButtonPress && (
            <TouchableOpacity
              onPress={onFilterButtonPress}
              style={[
                styles.filterIconButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(64, 192, 87, 0.15)"
                    : "rgba(64, 192, 87, 0.1)",
                  borderWidth: 1,
                  borderColor: isDarkMode
                    ? "rgba(64, 192, 87, 0.3)"
                    : "rgba(64, 192, 87, 0.2)",
                },
              ]}
              activeOpacity={0.6}
            >
              <FilterIcon size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <FlatList
          data={loadingPlaceholders}
          renderItem={renderLoadingItem}
          keyExtractor={(item: any) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <FlatList
          data={sortedOptions}
          renderItem={renderFilterItem as any}
          keyExtractor={(item: any) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  filterText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  separator: {
    width: 12,
  },
  filterIconButton: {
    padding: 10,
    borderRadius: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  loadingPlaceholder: {
    width: 90,
    height: 42,
    borderRadius: 24,
    marginRight: 10,
  },
});

export default FilterBar;
