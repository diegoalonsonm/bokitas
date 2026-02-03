import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { restaurantsApi } from '@/lib/api';
import { useEatlistStore } from '@/lib/stores';
import { useAuth } from '@/lib/hooks';
import { Rating, Badge, Loading, Button, EmptyState } from '@/components/ui';
import { ReviewCard } from '@/components/reviews';
import type { Restaurant, Review } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { entries, addToEatlist, removeFromEatlist } = useEatlistStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isInEatlist = entries.some((e) => e.restaurantId === id);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const [restaurantRes, reviewsRes] = await Promise.all([
        restaurantsApi.getById(id),
        restaurantsApi.getReviews(id, { limit: 10 }),
      ]);

      if (restaurantRes.data) {
        setRestaurant(restaurantRes.data);
      }
      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
    } catch (err) {
      setError('No se pudieron cargar los detalles del restaurante');
      console.error('Error fetching restaurant:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!restaurant) return;
    try {
      await Share.share({
        message: `¡Mirá ${restaurant.name} en Bokitas!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEatlistToggle = async () => {
    if (!id) return;

    if (isInEatlist) {
      const entry = entries.find((e) => e.restaurantId === id);
      if (entry) {
        await removeFromEatlist(entry.id);
      }
    } else {
      await addToEatlist(id);
    }
  };

  const handleOpenMaps = () => {
    if (!restaurant?.latitude || !restaurant?.longitude) {
      Alert.alert('Ubicación no disponible', 'No hay coordenadas disponibles para este restaurante.');
      return;
    }

    const url = `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    // Phone number would come from restaurant data
      Alert.alert('Próximamente', '¡La integración telefónica estará disponible pronto!');
  };

  const handleWriteReview = () => {
    router.push(`/modals/create-review?restaurantId=${id}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Cargando restaurante..." />;
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Restaurante no encontrado"
          description={error || 'Este restaurante puede haber sido eliminado'}
          actionLabel="Volver"
          onAction={handleBack}
        />
      </SafeAreaView>
    );
  }

  const photos = restaurant.photos || [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.photoContainer}>
          {photos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActivePhotoIndex(index);
              }}
            >
              {photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={48} color={colors.textMuted} />
            </View>
          )}

          {/* Photo indicators */}
          {photos.length > 1 && (
            <View style={styles.photoIndicators}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.photoIndicator,
                    index === activePhotoIndex && styles.photoIndicatorActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Header overlay */}
          <SafeAreaView style={styles.headerOverlay} edges={['top']}>
            <Pressable style={styles.headerButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <View style={styles.headerRight}>
              <Pressable style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={colors.text} />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={handleEatlistToggle}>
                <Ionicons
                  name={isInEatlist ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={isInEatlist ? colors.primary : colors.text}
                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.ratingRow}>
              <Rating value={restaurant.averageRating || 0} size="md" showValue />
              <Text style={styles.reviewCount}>
                ({restaurant.reviewCount || 0} reseñas)
              </Text>
            </View>
          </View>

          {/* Food Types */}
          {restaurant.foodTypes && restaurant.foodTypes.length > 0 && (
            <View style={styles.tagsRow}>
              {restaurant.foodTypes.map((type) => (
                <Badge key={type.id} text={type.name} variant="primary" />
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={handleOpenMaps}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="navigate-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Cómo llegar</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleCall}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="call-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Llamar</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleWriteReview}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Reseñar</Text>
            </Pressable>
          </View>

          {/* Address */}
          {restaurant.address && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>{restaurant.address}</Text>
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reseñas</Text>
              {reviews.length > 0 && (
                <Pressable>
                  <Text style={styles.seeAllText}>Ver todas</Text>
                </Pressable>
              )}
            </View>

            {reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {reviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </View>
            ) : (
              <View style={styles.noReviews}>
                <Text style={styles.noReviewsText}>Aún no hay reseñas</Text>
                <Button
                  title="Sé el primero en reseñar"
                  variant="outline"
                  size="sm"
                  onPress={handleWriteReview}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView style={styles.bottomCta} edges={['bottom']}>
        <Button
          title="Escribir una reseña"
          fullWidth
          leftIcon={<Ionicons name="star-outline" size={20} color={colors.text} />}
          onPress={handleWriteReview}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  photoContainer: {
    height: 280,
    position: 'relative',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: colors.surfaceElevated,
  },
  noPhoto: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: colors.text,
    width: 16,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewCount: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reviewsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  reviewsList: {
    gap: spacing.md,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  noReviewsText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  bottomCta: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.background,
  },
});
