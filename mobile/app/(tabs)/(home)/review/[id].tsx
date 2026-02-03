import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';
import { reviewsApi } from '@/lib/api';
import { Avatar, Rating, Loading, EmptyState } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import type { Review } from '@/types';

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    if (!id) return;

    try {
      setError(null);
      const response = await reviewsApi.getById(id);
      if (response.data) {
        setReview(response.data);
      }
    } catch (err) {
      setError('Failed to load review');
      console.error('Error fetching review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUserPress = () => {
    if (review?.userId) {
      router.push(`/(tabs)/(home)/user/${review.userId}` as Href);
    }
  };

  const handleRestaurantPress = () => {
    if (review?.restaurantId) {
      router.push(`/(tabs)/(home)/restaurant/${review.restaurantId}` as Href);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error || !review) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <EmptyState
          icon="chatbubble-outline"
          title="Review not found"
          description={error || 'This review may have been deleted'}
          actionLabel="Go Back"
          onAction={handleBack}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <Pressable style={styles.userSection} onPress={handleUserPress}>
          <Avatar
            source={review.user?.photoUrl}
            name={review.user?.name}
            size="lg"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{review.user?.name || 'Anonymous'}</Text>
            <Text style={styles.date}>{formatRelativeTime(review.createdAt)}</Text>
          </View>
        </Pressable>

        {/* Restaurant */}
        {review.restaurant && (
          <Pressable style={styles.restaurantSection} onPress={handleRestaurantPress}>
            <Ionicons name="restaurant-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.restaurantName}>{review.restaurant.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}

        {/* Rating */}
        <View style={styles.ratingSection}>
          <Rating value={review.rating} size="lg" />
          <Text style={styles.ratingText}>
            {review.rating.toFixed(1)} out of 5
          </Text>
        </View>

        {/* Comment */}
        {review.comment && (
          <View style={styles.commentSection}>
            <Text style={styles.comment}>{review.comment}</Text>
          </View>
        )}

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.photosTitle}>Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosContainer}
            >
              {review.photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  {/* In production, use Image component */}
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image" size={24} color={colors.textMuted} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  restaurantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  restaurantName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  commentSection: {
    marginBottom: spacing.lg,
  },
  comment: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    lineHeight: 28,
  },
  photosSection: {
    marginBottom: spacing.lg,
  },
  photosTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  photosContainer: {
    gap: spacing.sm,
  },
  photoWrapper: {
    marginRight: spacing.sm,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
