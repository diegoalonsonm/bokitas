import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, Href } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { Rating, Badge } from '@/components/ui';
import type { Restaurant } from '@/types';

/** Shared blurhash placeholder for restaurant card images */
const PLACEHOLDER_BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  variant?: 'default' | 'compact' | 'featured';
  style?: ViewStyle;
  onPress?: () => void;
  /** Index in list for staggered animation delay */
  index?: number;
}

export function RestaurantCard({
  restaurant,
  variant = 'default',
  style,
  onPress,
  index = 0,
}: RestaurantCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/(home)/restaurant/${restaurant.id}` as Href);
    }
  };

  if (variant === 'compact') {
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
        <Pressable
          style={({ pressed }) => [
            styles.compactContainer,
            pressed && styles.pressed,
            style,
          ]}
          onPress={handlePress}
        >
          <Image
            source={restaurant.photos?.[0]}
            placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.compactContent}>
            <Text style={styles.compactName} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text style={styles.compactCategory} numberOfLines={1}>
              {restaurant.foodTypes?.map((ft) => ft.name).join(', ') || 'Restaurante'}
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
      </Animated.View>
    );
  }

  if (variant === 'featured') {
    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(500).springify()}>
        <Pressable
          style={({ pressed }) => [
            styles.featuredContainer,
            pressed && styles.pressed,
            style,
          ]}
          onPress={handlePress}
        >
          <Image
            source={restaurant.photos?.[0]}
            placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
            style={styles.featuredImage}
            contentFit="cover"
            transition={300}
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
                {restaurant.reviewCount || 0} reseñas
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Default card
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
          style,
        ]}
        onPress={handlePress}
      >
        <Image
          source={restaurant.photos?.[0]}
          placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {restaurant.foodTypes?.map((ft) => ft.name).join(', ') || 'Restaurante'}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Default card styles
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderCurve: 'continuous',
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
    borderCurve: 'continuous',
    padding: spacing.sm,
    gap: spacing.md,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    borderCurve: 'continuous',
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
    borderCurve: 'continuous',
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
