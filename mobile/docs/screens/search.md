# Search Screen

## Route
`/app/(tabs)/(home)/search`

## Description
Allows users to search for restaurants by name or cuisine. It features a history of recent searches, popular tags, and advanced filtering options.

## Features
- Real-time search input
- Search history management
- Popular search tags
- Infinite scroll pagination
- Filtering integration (via Filter Modal)
- Empty state handling

## API Dependencies
- `useRestaurantSearch()`: Hook handling search logic
  - `search(query)`: Executes search against API
  - `loadMore()`: Fetches next page of results
- `useSearchStore`: Zustand store for search state and history

## State Management
- `inputValue` (useState): Local input state
- `useSearchStore`:
  - `query`: Current search query
  - `filters`: Active filters
  - `searchHistory`: list of past searches
- `useRestaurantSearch`:
  - `restaurants`: List of search results
  - `isLoading`: Search status
  - `hasMore`: Pagination flag

## UI Components
- `FlatList`: Renders search results efficiently
- `TextInput`: Search bar
- `Badge`: Displays active filters
- `EmptyState`: Shows when no results found
