# Home Screen

## Route
`/app/(tabs)/(home)/index`

## Description
The main landing screen of the application. It displays a curated list of restaurants, including top-rated spots, nearby locations, and recent activity from the community.

## Features
- Greeting based on time of day
- Search bar with navigation to Search and Map screens
- "Featured" restaurants horizontal scroll
- "Nearby" restaurants vertical list
- Recent reviews feed
- Pull-to-refresh functionality

## API Dependencies
- `useHomeData()`: Custom hook aggregating multiple API calls
  - `restaurantsApi.getTopRated()`
  - `restaurantsApi.getNearby()`
  - `reviewsApi.getRecent()`
- `useAuth()`: Access user profile for greeting and avatar

## State Management
- `isRefreshing` (useState): Tracks pull-to-refresh state
- `useHomeData` (hook):
  - `topRestaurants`: Array of featured restaurants
  - `recentReviews`: Array of latest reviews
  - `isLoading`: Data fetching status
  - `error`: Error state

## UI Components
- `RestaurantCard`: Displays restaurant information (variants: featured, compact)
- `ReviewCard`: Displays review snippets
- `RefreshControl`: Native pull-to-refresh
- `Avatar`: User profile image
- `EmptyState`: Fallback for empty data or errors
