import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { router, Href } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { Avatar, Rating } from '@/components/ui';
import type { Review } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

export interface ReviewCardProps {
  review: Review;
  showRestaurant?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export function ReviewCard({
  review,
  showRestaurant = false,
  style,
  onPress,
}: ReviewCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/(home)/review/${review.id}` as Href);
    }
  };

  const handleUserPress = () => {
    router.push(`/(tabs)/(home)/user/${review.userId}` as Href);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={handlePress}
    >
      {/* User header */}
      <Pressable style={styles.header} onPress={handleUserPress}>
        <Avatar
          source={review.user?.photoUrl}
          name={review.user?.name}
          size="md"
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{review.user?.name || 'Anonymous'}</Text>
          <Text style={styles.date}>{formatRelativeTime(review.createdAt)}</Text>
        </View>
        <Rating value={review.rating} size="sm" />
      </Pressable>

      {/* Restaurant name if needed */}
      {showRestaurant && review.restaurant && (
        <Pressable 
          style={styles.restaurantRow}
          onPress={() => router.push(`/(tabs)/(home)/restaurant/${review.restaurantId}` as Href)}
        >
          <Text style={styles.restaurantLabel}>at </Text>
          <Text style={styles.restaurantName}>{review.restaurant.name}</Text>
        </Pressable>
      )}

      {/* Review content */}
      {review.comment && (
        <Text style={styles.comment} numberOfLines={4}>
          {review.comment}
        </Text>
      )}

      {/* Review photos */}
      {review.photos && review.photos.length > 0 && (
        <View style={styles.photos}>
          {review.photos.slice(0, 3).map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={[
                styles.photo,
                index === 2 && review.photos!.length > 3 && styles.lastPhoto,
              ]}
            />
          ))}
          {review.photos.length > 3 && (
            <View style={styles.morePhotosOverlay}>
              <Text style={styles.morePhotosText}>+{review.photos.length - 3}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  restaurantName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  comment: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  photos: {
    flexDirection: 'row',
    gap: spacing.xs,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  lastPhoto: {
    opacity: 0.7,
  },
  morePhotosOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
