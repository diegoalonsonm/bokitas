import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';
import { useRestaurantSearch } from '@/lib/hooks';
import { useSearchStore } from '@/lib/stores';
import { RestaurantCard } from '@/components/restaurants';
import { Loading, EmptyState, Badge } from '@/components/ui';
import type { Restaurant } from '@/types';

export default function SearchScreen() {
  const [inputValue, setInputValue] = useState('');
  const { 
    query, 
    filters, 
    searchHistory, 
    setQuery, 
    addToHistory, 
    clearHistory 
  } = useSearchStore();
  
  const { 
    restaurants, 
    isLoading, 
    error, 
    search, 
    loadMore, 
    hasMore 
  } = useRestaurantSearch();

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim());
      search(searchQuery.trim());
    }
  }, [setQuery, addToHistory, search]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    handleSearch(inputValue);
  };

  const handleHistoryItemPress = (historyQuery: string) => {
    setInputValue(historyQuery);
    handleSearch(historyQuery);
  };

  const handleClearInput = () => {
    setInputValue('');
    setQuery('');
  };

  const handleBack = () => {
    router.back();
  };

  const handleOpenFilters = () => {
    router.push('/modals/filter');
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <RestaurantCard
      restaurant={item}
      variant="compact"
      style={styles.restaurantCard}
    />
  );

  const renderHeader = () => {
    if (query || restaurants.length > 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {/* Search History */}
        {searchHistory.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Búsquedas recientes</Text>
              <Pressable onPress={clearHistory}>
                <Text style={styles.clearText}>Limpiar</Text>
              </Pressable>
            </View>
            <View style={styles.historyList}>
              {searchHistory.slice(0, 5).map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleHistoryItemPress(item)}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.historyText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Popular Searches */}
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Búsquedas populares</Text>
          <View style={styles.popularTags}>
            {['Sushi', 'Pizza', 'Coffee', 'Tacos', 'Burgers', 'Thai'].map((tag) => (
              <Pressable
                key={tag}
                style={styles.popularTag}
                onPress={() => handleHistoryItemPress(tag)}
              >
                <Text style={styles.popularTagText}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    if (!query) return null;

    return (
      <EmptyState
        icon="search-outline"
        title="Sin resultados"
        description={`No encontramos restaurantes que coincidan con "${query}"`}
        actionLabel="Limpiar búsqueda"
        onAction={handleClearInput}
      />
    );
  };

  const renderFooter = () => {
    if (!hasMore || restaurants.length === 0) return null;
    return <Loading size="small" />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes, cocinas..."
            placeholderTextColor={colors.textMuted}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <Pressable onPress={handleClearInput} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.filterButton} onPress={handleOpenFilters}>
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Active Filters */}
      {(filters.foodTypes.length > 0 || filters.minRating) && (
        <View style={styles.activeFilters}>
          {filters.foodTypes.map((type) => (
            <Badge key={type} text={type} variant="primary" size="sm" />
          ))}
          {filters.minRating && (
            <Badge text={`${filters.minRating}+ estrellas`} variant="primary" size="sm" />
          )}
        </View>
      )}

      {/* Results */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {isLoading && restaurants.length === 0 && (
        <View style={styles.loadingOverlay}>
          <Loading message="Buscando..." />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    padding: spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  restaurantCard: {
    marginBottom: spacing.sm,
  },
  suggestionsContainer: {
    paddingTop: spacing.md,
  },
  historySection: {
    marginBottom: spacing.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clearText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  historyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  popularSection: {
    marginBottom: spacing.lg,
  },
  popularTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  popularTag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
  },
  popularTagText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
