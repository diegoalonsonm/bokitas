import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';
import { useAuth } from '@/lib/hooks';
import { restaurantsApi, reviewsApi } from '@/lib/api';
import { RestaurantCard } from '@/components/restaurants';
import { ReviewCard } from '@/components/reviews';
import { Loading, EmptyState, Avatar } from '@/components/ui';
import type { Restaurant, Review } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [restaurantsRes, reviewsRes] = await Promise.all([
        restaurantsApi.getTop(10),
        restaurantsApi.getAll({ limit: 10, sortBy: 'recent' }),
      ]);

      if (restaurantsRes.data) {
        setTopRestaurants(restaurantsRes.data);
      }

      // For now, we'll get reviews from the recent restaurants
      // In a real app, you might have a dedicated recent reviews endpoint
      if (reviewsRes.data) {
        // Flatten reviews from restaurants or use a dedicated endpoint
        setRecentReviews([]);
      }
    } catch (err) {
      setError('Error al cargar datos. Desliza para actualizar.');
      console.error('Error fetching home data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/(home)/search' as Href);
  };

  const handleMapPress = () => {
    router.push('/(tabs)/(home)/map' as Href);
  };

  if (isLoading) {
    return <Loading fullScreen message="Cargando lugares deliciosos..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
          </Text>
          <Text style={styles.subGreeting}>Encuentra tu próximo lugar favorito</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Avatar
            source={user?.photoUrl}
            name={user?.name}
            size="md"
            showBorder
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      <Pressable style={styles.searchBar} onPress={handleSearchPress}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Buscar restaurantes...</Text>
        <Pressable style={styles.mapButton} onPress={handleMapPress}>
          <Ionicons name="map-outline" size={20} color={colors.primary} />
        </Pressable>
      </Pressable>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="¡Ups!"
            description={error}
            actionLabel="Reintentar"
            onAction={handleRefresh}
          />
        ) : (
          <>
            {/* Featured Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mejor calificados</Text>
                <Pressable onPress={handleSearchPress}>
                  <Text style={styles.seeAll}>Ver todos</Text>
                </Pressable>
              </View>
              {topRestaurants.length > 0 ? (
                <FlatList
                  data={topRestaurants.slice(0, 5)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RestaurantCard
                      restaurant={item}
                      variant="featured"
                      style={styles.featuredCard}
                    />
                  )}
                />
              ) : (
                <EmptyState
                  icon="restaurant-outline"
                  title="Aún no hay restaurantes"
                  description="¡Sé el primero en descubrir un gran lugar!"
                />
              )}
            </View>

            {/* Nearby Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explorar cercanos</Text>
                <Pressable onPress={handleSearchPress}>
                  <Text style={styles.seeAll}>Ver todos</Text>
                </Pressable>
              </View>
              {topRestaurants.length > 0 ? (
                <View style={styles.restaurantList}>
                  {topRestaurants.slice(0, 4).map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      variant="compact"
                      style={styles.compactCard}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="location-outline"
                  title="No hay restaurantes cercanos"
                  description="Activa la ubicación para encontrar lugares cerca de ti"
                />
              )}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Actividad reciente</Text>
              </View>
              {recentReviews.length > 0 ? (
                <View style={styles.reviewList}>
                  {recentReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      showRestaurant
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon="chatbubbles-outline"
                  title="No hay reseñas recientes"
                  description="Vuelve más tarde para ver las últimas reseñas"
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subGreeting: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
  mapButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featuredCard: {
    marginRight: spacing.md,
  },
  restaurantList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  compactCard: {
    marginBottom: spacing.xs,
  },
  reviewList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
