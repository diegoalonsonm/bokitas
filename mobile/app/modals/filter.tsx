import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { useSearchStore } from '@/lib/stores';
import { Rating, Button, Badge } from '@/components/ui';

const FOOD_TYPE_OPTIONS = [
  'Mexican',
  'Italian',
  'Japanese',
  'Chinese',
  'Thai',
  'Indian',
  'American',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Costa Rican',
  'Seafood',
  'Vegetarian',
  'Vegan',
  'Fast Food',
  'Cafe',
  'Bakery',
];

export default function FilterModal() {
  const { filters, setFilters, clearFilters } = useSearchStore();
  
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<string[]>(filters.foodTypes);
  const [minRating, setMinRating] = useState(filters.minRating || 0);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'relevance');

  const handleClose = () => {
    router.back();
  };

  const handleClearAll = () => {
    setSelectedFoodTypes([]);
    setMinRating(0);
    setSortBy('relevance');
  };

  const handleApply = () => {
    setFilters({
      foodTypes: selectedFoodTypes,
      minRating: minRating > 0 ? minRating : undefined,
      sortBy,
    });
    router.back();
  };

  const toggleFoodType = (type: string) => {
    if (selectedFoodTypes.includes(type)) {
      setSelectedFoodTypes(selectedFoodTypes.filter((t) => t !== type));
    } else {
      setSelectedFoodTypes([...selectedFoodTypes, type]);
    }
  };

  const hasFilters = selectedFoodTypes.length > 0 || minRating > 0 || sortBy !== 'relevance';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={handleClearAll} disabled={!hasFilters}>
          <Text style={[styles.clearText, !hasFilters && styles.clearTextDisabled]}>
            Clear
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sort By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.sortOptions}>
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'recent', label: 'Most Recent' },
              { value: 'reviews', label: 'Most Reviews' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionActive,
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Minimum Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingOptions}>
            {[0, 3, 3.5, 4, 4.5].map((value) => (
              <Pressable
                key={value}
                style={[
                  styles.ratingOption,
                  minRating === value && styles.ratingOptionActive,
                ]}
                onPress={() => setMinRating(value)}
              >
                {value === 0 ? (
                  <Text
                    style={[
                      styles.ratingOptionText,
                      minRating === value && styles.ratingOptionTextActive,
                    ]}
                  >
                    Any
                  </Text>
                ) : (
                  <View style={styles.ratingRow}>
                    <Ionicons
                      name="star"
                      size={14}
                      color={minRating === value ? colors.text : colors.starFilled}
                    />
                    <Text
                      style={[
                        styles.ratingOptionText,
                        minRating === value && styles.ratingOptionTextActive,
                      ]}
                    >
                      {value}+
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Food Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Type</Text>
          <View style={styles.foodTypesContainer}>
            {FOOD_TYPE_OPTIONS.map((type) => {
              const isSelected = selectedFoodTypes.includes(type);
              return (
                <Pressable
                  key={type}
                  style={[
                    styles.foodTypeChip,
                    isSelected && styles.foodTypeChipActive,
                  ]}
                  onPress={() => toggleFoodType(type)}
                >
                  <Text
                    style={[
                      styles.foodTypeText,
                      isSelected && styles.foodTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <Button
          title={`Apply Filters${hasFilters ? ` (${selectedFoodTypes.length + (minRating > 0 ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0)})` : ''}`}
          fullWidth
          onPress={handleApply}
        />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  clearText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    paddingHorizontal: spacing.sm,
  },
  clearTextDisabled: {
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sortOptions: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  sortOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  sortOptionText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ratingOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  ratingOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  ratingOptionTextActive: {
    color: colors.text,
  },
  foodTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  foodTypeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  foodTypeChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  foodTypeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  foodTypeTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
});
