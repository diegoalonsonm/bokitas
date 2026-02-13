# Restaurant Detail Screen

## Route
`/app/(tabs)/(home)/restaurant/[id]`

## Description
Displays detailed information about a specific restaurant, including photos, ratings, address, and user reviews.

## Features
- Photo gallery with pagination
- Restaurant metadata (Rating, Address, Food types)
- "Eatlist" (Save/Bookmark) toggle
- Action buttons: Directions, Call, Write Review
- Review list navigation
- Share functionality

## API Dependencies
- `restaurantsApi.getById(id)`: Fetches restaurant details
- `restaurantsApi.getByFoursquareId(id)`: Fallback for external IDs
- `restaurantsApi.getReviews(id)`: Fetches reviews for the restaurant
- `useEatlistStore`: Manages saved restaurants

## State Management
- `restaurant` (useState): Restaurant data
- `reviews` (useState): List of reviews
- `activePhotoIndex` (useState): Carousel position
- `isLoading` (useState): Data fetching status
- `error` (useState): Error state

## UI Components
- `ScrollView`: Main container
- `Image`: Photo gallery
- `Rating`: Displays star rating
- `ReviewCard`: Individual reviews
- `Button`: Call to action buttons
