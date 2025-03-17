import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeProvider";

interface GenreSelectorProps {
  genres: string[];
  selectedGenres: string[];
  onGenrePress: (genre: string) => void;
  isLoading?: boolean;
}

/**
 * GenreSelector component displays a horizontal scrollable list of genre tags
 * with selection state and loading indicators
 * 
 * @param props - Component props
 * @returns GenreSelector component
 */
const GenreSelector = React.memo(function GenreSelector({
  genres = [],
  selectedGenres = [],
  onGenrePress,
  isLoading = false,
}: GenreSelectorProps) {
  const { colors } = useTheme();

  // Create loading placeholders data
  const loadingPlaceholders = isLoading 
    ? Array(5).fill(null).map((_, index) => ({ id: `loading-${index}` }))
    : [];

  const renderGenreItem = ({ item: genre }: { item: string }) => {
    const isSelected = selectedGenres.includes(genre);
    return (
      <TouchableOpacity
        onPress={() => onGenrePress(genre)}
        style={[
          styles.genreButton,
          {
            backgroundColor: isSelected ? colors.primary : `${colors.background}99`,
            borderColor: isSelected ? colors.primary : colors.border,
          }
        ]}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.genreText,
            { color: isSelected ? colors.text : colors.textSecondary }
          ]}
        >
          {genre}
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
      <Text style={[styles.title, { color: colors.text }]}>Genres</Text>
      
      {isLoading ? (
        <FlatList
          horizontal
          data={loadingPlaceholders}
          renderItem={renderLoadingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
        />
      ) : genres.length === 0 ? (
        <View style={styles.scrollView}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No genres available
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={genres}
          renderItem={renderGenreItem}
          keyExtractor={(item, index) => `genre-${index}-${item}`}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsHorizontalScrollIndicator={false}
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
  genreButton: {
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
  genreText: {
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

export default GenreSelector;
