# Map Screen

## Route
`/app/(tabs)/(home)/map`

## Description
Displays restaurants on an interactive map. Users can view their location, explore nearby restaurants, and select markers to preview restaurant details.

## Features
- Interactive Google Map
- User location tracking
- Custom map markers for restaurants
- "Locate Me" functionality
- Selected restaurant preview card
- Custom dark mode map style

## API Dependencies
- `restaurantsApi.getAll(params)`: Fetches restaurants based on location
  - `latitude`, `longitude`: Current user coordinates
- `useLocation()`: Custom hook for device location services

## State Management
- `restaurants` (useState): access to list of restaurants on map.
- `selectedRestaurant` (useState): Currently selected restaurant for preview
- `isLoading` (useState): Loading state for fetching data
- `location` (useLocation hook): Current device coordinates

## UI Components
- `MapView` (react-native-maps): Main map component
- `Marker`: Custom pins for restaurants
- `RestaurantCard`: Preview card for selected restaurant
- `SafeAreaView`: Header layout management
