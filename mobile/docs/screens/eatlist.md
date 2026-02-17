# Eatlist Screen

## Route
`/app/(tabs)/eatlist`

## Description
Manages the user's "Eatlist" (saved restaurants). It allows filtering between "To Visit" and "Visited" places.

## Features
- Toggle between "Wishlist", "Visited", and "All"
- Mark restaurants as visited
- Remove restaurants from list
- Animated entry list
- Empty state with "Explore" redirection

## API Dependencies
- `useEatlistData(userId)`: Hook managing the list
  - Fetches entries from store/API
  - Handles filtering logic based on `visited` flag

## State Management
- `useEatlistData`:
  - `entries`: All saved entries
  - `filteredEntries`: Displayed entries based on filter
  - `filter`: Current filter mode ('wishlist', 'visited', 'all')
  - `toggleVisited`: Function to update status
  - `remove`: Function to delete entry

## UI Components
- `FlatList`: Render list of saved places
- `Animated.View`: Entry animations
- `RestaurantCard`: Displays restaurant info
- `Pressable`: Filter tabs custom buttons
