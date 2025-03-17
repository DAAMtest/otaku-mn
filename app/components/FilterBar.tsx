import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeProvider";

interface FilterBarProps {
  filters: string[];
  selectedFilters: string[];
  onFilterPress: (filter: string) => void;
  isLoading?: boolean;
}

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
}: FilterBarProps) {
  const { colors } = useTheme();

  // Create loading placeholders data
  const loadingPlaceholders = isLoading 
    ? Array(5).fill(null).map((_, index) => ({ id: `loading-${index}` }))
    : [];

  const renderFilterItem = ({ item: filter }: { item: string }) => {
    const isSelected = selectedFilters.includes(filter);
    return (
      <TouchableOpacity
        onPress={() => onFilterPress(filter)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isSelected ? colors.primary : `${colors.background}99`,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        activeOpacity={0.7}
        testID={`filter-${filter}`}
      >
        <Text 
          style={[
            styles.filterText,
            { color: isSelected ? colors.text : colors.textSecondary }
          ]}
        >
          {filter}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLoadingItem = ({ item }: { item: { id: string } }) => (
    <View
      style={[styles.loadingPlaceholder, { backgroundColor: `${colors.background}99` }]}
      testID={item.id}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
      
      {isLoading ? (
        <FlatList
          horizontal
          data={loadingPlaceholders}
          renderItem={renderLoadingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
          testID="filter-loading-list"
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
          testID="filter-list"
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollView: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  filterText: {
    fontWeight: '500',
    fontSize: 14,
  },
  loadingPlaceholder: {
    height: 36,
    width: 80,
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
