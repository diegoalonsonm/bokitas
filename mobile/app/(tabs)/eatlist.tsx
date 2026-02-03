import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/lib/constants';
import { useEatlistStore } from '@/lib/stores';
import { useAuth } from '@/lib/hooks';
import { RestaurantCard } from '@/components/restaurants';
import { Loading, EmptyState, Badge, Button } from '@/components/ui';
import type { EatlistEntry } from '@/types';

type FilterType = 'all' | 'visited' | 'wishlist';

export default function EatlistScreen() {
  const { user } = useAuth();
  const { entries, isLoading, fetchEatlist, updateFlag, removeFromEatlist } = useEatlistStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEatlist();
    }
  }, [user, fetchEatlist]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEatlist();
    setIsRefreshing(false);
  };

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'visited') return entry.hasBeenFlag;
    if (filter === 'wishlist') return !entry.hasBeenFlag;
    return true;
  });

  const handleToggleVisited = async (entry: EatlistEntry) => {
    await updateFlag(entry.id, !entry.hasBeenFlag);
  };

  const handleRemove = (entry: EatlistEntry) => {
    Alert.alert(
      'Eliminar de Mi Lista',
      `¿Eliminar ${entry.restaurant?.name || 'este restaurante'} de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeFromEatlist(entry.id),
        },
      ]
    );
  };

  const handleExplore = () => {
    router.push('/(tabs)/(home)/search' as Href);
  };

  const renderEntry = ({ item }: { item: EatlistEntry }) => {
    if (!item.restaurant) return null;

    return (
      <View style={styles.entryContainer}>
        <RestaurantCard
          restaurant={item.restaurant}
          variant="compact"
          style={styles.restaurantCard}
        />
        <View style={styles.entryActions}>
          <Pressable
            style={[
              styles.actionButton,
              item.hasBeenFlag && styles.actionButtonActive,
            ]}
            onPress={() => handleToggleVisited(item)}
          >
            <Ionicons
              name={item.hasBeenFlag ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
              color={item.hasBeenFlag ? colors.success : colors.textMuted}
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleRemove(item)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <Pressable
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          Todos ({entries.length})
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'wishlist' && styles.filterButtonActive]}
        onPress={() => setFilter('wishlist')}
      >
        <Text style={[styles.filterText, filter === 'wishlist' && styles.filterTextActive]}>
          Por visitar ({entries.filter((e) => !e.hasBeenFlag).length})
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'visited' && styles.filterButtonActive]}
        onPress={() => setFilter('visited')}
      >
        <Text style={[styles.filterText, filter === 'visited' && styles.filterTextActive]}>
          Visitados ({entries.filter((e) => e.hasBeenFlag).length})
        </Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    let title = 'Tu lista está vacía';
    let description = 'Guardá restaurantes que querés probar o que ya visitaste';

    if (filter === 'visited') {
      title = 'No hay restaurantes visitados';
      description = 'Marcá los restaurantes como visitados después de ir';
    } else if (filter === 'wishlist') {
      title = 'No hay restaurantes por visitar';
      description = 'Guardá restaurantes que querés probar';
    }

    return (
      <EmptyState
        icon="bookmark-outline"
        title={title}
        description={description}
        actionLabel="Explorar restaurantes"
        onAction={handleExplore}
      />
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Lista</Text>
        </View>
        <EmptyState
          icon="person-outline"
          title="Iniciá sesión para guardar"
          description="Creá una cuenta para empezar a armar tu lista"
          actionLabel="Iniciar sesión"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Lista</Text>
        <View style={styles.headerStats}>
          <Badge text={`${entries.length} guardados`} variant="primary" />
        </View>
      </View>

      {isLoading && entries.length === 0 ? (
        <Loading fullScreen message="Cargando tu lista..." />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.text,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  restaurantCard: {
    flex: 1,
  },
  entryActions: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  actionButtonActive: {
    backgroundColor: colors.success + '20',
  },
});
