import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { Rating, Badge } from '@/components/ui';
import type { Restaurant } from '@/types';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'compact' | 'featured';
  style?: ViewStyle;
  onPress?: () => void;
}

export function RestaurantCard({
  restaurant,
  variant = 'default',
  style,
  onPress,
}: RestaurantCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/(home,search)/restaurant/${restaurant.id}`);
    }
  };

  if (variant === 'compact') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactContainer,
          pressed && styles.pressed,
          style,
        ]}
        onPress={handlePress}
      >
        <Image
          source={{ uri: restaurant.photos?.[0] || 'https://via.placeholder.com/80' }}
          style={styles.compactImage}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.compactCategory} numberOfLines={1}>
            {restaurant.foodTypes?.map((ft) => ft.name).join(', ') || 'Restaurant'}
          </Text>
          <View style={styles.compactMeta}>
            <Rating value={restaurant.averageRating || 0} size="sm" />
            <Text style={styles.compactReviews}>
              ({restaurant.reviewCount || 0})
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    );
  }

  if (variant === 'featured') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.featuredContainer,
          pressed && styles.pressed,
          style,
        ]}
        onPress={handlePress}
      >
        <Image
          source={{ uri: restaurant.photos?.[0] || 'https://via.placeholder.com/300' }}
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadges}>
            {restaurant.foodTypes?.slice(0, 2).map((ft) => (
              <Badge key={ft.id} text={ft.name} variant="primary" size="sm" />
            ))}
          </View>
          <Text style={styles.featuredName} numberOfLines={2}>
            {restaurant.name}
          </Text>
          <View style={styles.featuredMeta}>
            <Rating value={restaurant.averageRating || 0} size="sm" showValue />
            <Text style={styles.featuredReviews}>
              {restaurant.reviewCount || 0} reviews
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // Default card
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={handlePress}
    >
      <Image
        source={{ uri: restaurant.photos?.[0] || 'https://via.placeholder.com/200' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {restaurant.foodTypes?.map((ft) => ft.name).join(', ') || 'Restaurant'}
        </Text>
        <View style={styles.meta}>
          <Rating value={restaurant.averageRating || 0} size="sm" />
          <Text style={styles.reviews}>
            ({restaurant.reviewCount || 0})
          </Text>
        </View>
        {restaurant.address && (
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {restaurant.address}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Default card styles
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceElevated,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  category: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  reviews: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    flex: 1,
  },

  // Compact card styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  compactContent: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  compactCategory: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  compactReviews: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },

  // Featured card styles
  featuredContainer: {
    width: 280,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceElevated,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  featuredBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  featuredName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featuredReviews: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
