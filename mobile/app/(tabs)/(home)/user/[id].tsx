import { useState, useEffect, useCallback } from 'react';
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
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { usersApi } from '@/lib/api';
import { Avatar, Rating, Loading, EmptyState, Card } from '@/components/ui';
import { ReviewCard } from '@/components/reviews';
import type { User, Review, Restaurant } from '@/types';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [top4, setTop4] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({ reviewCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      const [userRes, reviewsRes, top4Res] = await Promise.all([
        usersApi.getById(id),
        usersApi.getReviews(id, { limit: 10 }),
        usersApi.getTop4(id),
      ]);

      if (userRes.data) {
        // Map UserPublic to User-like object for state
        setUser({
          ...userRes.data,
          email: '', // Not available on public profile
          secondLastName: null,
          statusId: '',
          active: true,
        });
      }
      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
        setStats({ reviewCount: reviewsRes.meta?.total || reviewsRes.data.length });
      }
      if (top4Res.data) {
        setTop4(top4Res.data);
      }
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserData();
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <EmptyState
          icon="person-outline"
          title="User not found"
          description={error || 'This user may have been deleted'}
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
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
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Avatar
            source={user.photoUrl}
            name={user.name}
            size="xl"
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{top4.length}</Text>
            <Text style={styles.statLabel}>Top 4</Text>
          </View>
        </View>

        {/* Top 4 Section */}
        {top4.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{user.name.split(' ')[0]}'s Top 4</Text>
            <View style={styles.top4Grid}>
              {top4.map((restaurant, index) => (
                <Pressable
                  key={restaurant.id}
                  style={styles.top4Item}
                  onPress={() => router.push(`/(tabs)/(home)/restaurant/${restaurant.id}` as Href)}
                >
                  <View style={styles.top4Rank}>
                    <Text style={styles.top4RankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.top4Name} numberOfLines={2}>
                    {restaurant.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showRestaurant />
              ))}
            </View>
          ) : (
            <Card variant="outlined" padding="lg">
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
              </View>
            </Card>
          )}
        </View>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  name: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  username: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surfaceBorder,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  top4Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  top4Item: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  top4Rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  top4RankText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  top4Name: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  reviewsList: {
    gap: spacing.md,
  },
  emptyReviews: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyReviewsText: {
    fontSize: typography.sizes.md,
    color: colors.textMuted,
  },
});
