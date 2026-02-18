import { useCallback } from 'react';
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
import { colors, spacing, typography } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEatlistData } from '@/lib/hooks/useEatlistData';
import { EatlistCard } from '@/components/restaurants';
import { Loading, EmptyState, Badge } from '@/components/ui';
import type { EatlistEntry } from '@/types';
import { hapticSuccess, hapticLight, hapticWarning, hapticSelection } from '@/lib/utils/haptics';

export default function EatlistScreen() {
  const { user } = useAuth();
  const {
    entries,
    filteredEntries,
    filter,
    filterCounts,
    isLoading,
    isRefreshing,
    setFilter,
    refresh,
    toggleVisited,
    remove,
  } = useEatlistData(!!user);

  const handleToggleVisited = async (entry: EatlistEntry) => {
    hapticLight();
    toggleVisited(entry);
  };

  const handleRemove = (entry: EatlistEntry) => {
    hapticWarning();
    Alert.alert(
      'Eliminar de Mi Lista',
      `¿Eliminar ${entry.restaurant?.name || 'este restaurante'} de tu lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => remove(entry.restaurantId),
        },
      ]
    );
  };

  const handleRefresh = useCallback(async () => {
    await refresh();
    hapticSuccess();
  }, [refresh]);

  const handleExplore = () => {
    router.push('/(tabs)/(home)/search' as Href);
  };

  const handlePress = (restaurantId: string) => {
    router.push(`/(tabs)/(home)/restaurant/${restaurantId}` as Href);
  };

  const renderEntry = ({ item, index }: { item: EatlistEntry; index: number }) => {
    if (!item.restaurant) return null;

    return (
      <EatlistCard
        entry={item}
        index={index}
        onPress={() => handlePress(item.restaurantId)}
        onToggleVisited={() => handleToggleVisited(item)}
        onRemove={() => handleRemove(item)}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <Pressable
        style={[styles.filterButton, filter === 'wishlist' && styles.filterButtonActive]}
        onPress={() => { hapticSelection(); setFilter('wishlist'); }}
      >
        <Text style={[styles.filterText, filter === 'wishlist' && styles.filterTextActive]}>
          Por visitar ({filterCounts.wishlist})
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'visited' && styles.filterButtonActive]}
        onPress={() => { hapticSelection(); setFilter('visited'); }}
      >
        <Text style={[styles.filterText, filter === 'visited' && styles.filterTextActive]}>
          Visitados ({filterCounts.visited})
        </Text>
      </Pressable>
      <Pressable
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => { hapticSelection(); setFilter('all'); }}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          Todos ({filterCounts.all})
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
        <Text style={styles.title}>Eatlist</Text>
        <View style={styles.headerStats}>
          <Badge text={`${entries.length} guardados`} variant="primary" />
        </View>
      </View>

      {isLoading && entries.length === 0 ? (
        <Loading fullScreen message="Cargando tu lista..." />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item, index) => item.id ?? `eatlist-${index}`}
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
    marginBottom: spacing.xs,
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
    borderCurve: 'continuous',
    padding: spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderCurve: 'continuous',
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
});
