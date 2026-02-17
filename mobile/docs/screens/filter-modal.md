# Filter Modal

## Route
`/app/modals/filter`

## Description
A modal screen providing options to filter and sort search results.

## Features
- Filter by Food Type (Multi-select)
- Filter by Minimum Rating
- Sort options (Relevance, Rating, Recent, Most Reviews)
- "Clear All" functionality

## API Dependencies
- `useSearchStore`: Updates global search filters

## State Management
- `selectedFoodTypes` (useState): Local state for food types
- `minRating` (useState): Local state for rating threshold
- `sortBy` (useState): Local state for sort order
- Syncs with `useSearchStore` on apply

## UI Components
- `ScrollView`: Container for filter sections
- `Pressable`: Custom radio buttons and chips
- `Button`: "Apply" action
