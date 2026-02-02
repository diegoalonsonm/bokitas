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
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/lib/constants';
import { useAuth } from '@/lib/hooks';
import { usersApi } from '@/lib/api';
import { Avatar, Rating, Badge, Loading, EmptyState, Card } from '@/components/ui';
import { ReviewCard } from '@/components/reviews';
import type { Review, Restaurant } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [top4, setTop4] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({ reviewCount: 0, eatlistCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [reviewsRes, top4Res, eatlistRes] = await Promise.all([
        usersApi.getReviews(user.id, { limit: 5 }),
        usersApi.getTop4(user.id),
        usersApi.getEatlist(user.id),
      ]);

      if (reviewsRes.data) {
        setReviews(reviewsRes.data);
        setStats((prev) => ({ 
          ...prev, 
          reviewCount: reviewsRes.meta?.total || reviewsRes.data!.length 
        }));
      }
      if (top4Res.data) {
        setTop4(top4Res.data);
      }
      if (eatlistRes.data) {
        setStats((prev) => ({ ...prev, eatlistCount: eatlistRes.data!.length }));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUserData();
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handleSettings = () => {
    router.push('/(tabs)/profile/settings');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          icon="person-outline"
          title="Not signed in"
          description="Sign in to see your profile"
          actionLabel="Sign In"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.settingsButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Avatar
            source={user.photoUrl}
            name={user.name}
            size="xl"
            showBorder
          />
          <Text style={styles.name}>{user.name}</Text>
          {user.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}
          
          <Pressable style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.eatlistCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{top4.length}</Text>
            <Text style={styles.statLabel}>Top 4</Text>
          </View>
        </View>

        {/* Top 4 Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Top 4</Text>
            {top4.length > 0 && (
              <Pressable>
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            )}
          </View>
          {top4.length > 0 ? (
            <View style={styles.top4Grid}>
              {top4.map((restaurant, index) => (
                <Pressable
                  key={restaurant.id}
                  style={styles.top4Item}
                  onPress={() => router.push(`/(tabs)/(home,search)/restaurant/${restaurant.id}` as Href)}
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
          ) : (
            <Card variant="outlined" padding="lg">
              <View style={styles.emptyTop4}>
                <Ionicons name="trophy-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyTop4Text}>Add your favorite restaurants</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Recent Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {reviews.length > 0 && (
              <Pressable>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            )}
          </View>
          {isLoading ? (
            <Loading size="small" />
          ) : reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} showRestaurant />
              ))}
            </View>
          ) : (
            <Card variant="outlined" padding="lg">
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>
                  Start reviewing restaurants you've visited!
                </Text>
              </View>
            </Card>
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
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
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
  },
  editButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
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
  editText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
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
  emptyTop4: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTop4Text: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
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
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  emptyReviewsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.error,
  },
});
