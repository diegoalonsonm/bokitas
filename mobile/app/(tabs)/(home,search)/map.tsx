import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography } from '@/lib/constants';
import { useLocation } from '@/lib/hooks';
import { restaurantsApi } from '@/lib/api';
import { RestaurantCard } from '@/components/restaurants';
import { Loading } from '@/components/ui';
import type { Restaurant } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COSTA_RICA_REGION = {
  latitude: 9.9281,
  longitude: -84.0907,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { location, isLoading: isLoadingLocation, requestPermission } = useLocation();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNearbyRestaurants();
  }, [location]);

  const fetchNearbyRestaurants = async () => {
    try {
      const response = await restaurantsApi.getAll({
        limit: 50,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
      if (response.data) {
        setRestaurants(response.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleMyLocation = async () => {
    if (!location) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Location Permission',
          'Please enable location services to see restaurants near you.'
        );
        return;
      }
    }

    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCardPress = () => {
    if (selectedRestaurant) {
      router.push(`/(tabs)/(home,search)/restaurant/${selectedRestaurant.id}` as Href);
    }
  };

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : COSTA_RICA_REGION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={darkMapStyle}
        onPress={() => setSelectedRestaurant(null)}
      >
        {restaurants.map((restaurant) => {
          if (!restaurant.latitude || !restaurant.longitude) return null;
          
          return (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              onPress={() => handleMarkerPress(restaurant)}
            >
              <View style={[
                styles.marker,
                selectedRestaurant?.id === restaurant.id && styles.markerSelected,
              ]}>
                <Ionicons
                  name="restaurant"
                  size={16}
                  color={selectedRestaurant?.id === restaurant.id ? colors.text : colors.primary}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <Pressable style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Explore Map</Text>
          <Text style={styles.subtitle}>{restaurants.length} restaurants</Text>
        </View>
        <Pressable style={styles.headerButton} onPress={handleMyLocation}>
          <Ionicons name="locate" size={22} color={colors.primary} />
        </Pressable>
      </SafeAreaView>

      {/* Selected Restaurant Card */}
      {selectedRestaurant && (
        <View style={styles.cardContainer}>
          <RestaurantCard
            restaurant={selectedRestaurant}
            variant="compact"
            onPress={handleCardPress}
            style={styles.card}
          />
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loading message="Loading restaurants..." />
        </View>
      )}
    </View>
  );
}

// Dark mode map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2c2c2c' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d1d1d' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
