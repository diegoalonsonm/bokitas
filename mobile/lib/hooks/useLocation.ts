import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationState {
  location: LocationCoords | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to get user's current location
 */
export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Location permission denied',
        }));
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        location: {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
      }));
    }
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location: state.location,
    error: state.error,
    isLoading: state.isLoading,
    isLoadingLocation: state.isLoading,
    requestLocation,
    requestPermission,
    hasLocation: state.location !== null,
  };
}
