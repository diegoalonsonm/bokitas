# Review Detail Screen

## Route
`/app/(tabs)/(home)/review/[id]`

## Description
Shows the full details of a specific review, including the user, rating, full comment, and attached photos.

## Features
- User profile navigation
- Restaurant navigation
- Full comment display
- Photo gallery for the review
- Star rating display

## API Dependencies
- `reviewsApi.getById(id)`: Fetches full review details

## State Management
- `review` (useState): Review object
- `isLoading` (useState): Fetch status
- `error` (useState): Error handling

## UI Components
- `Avatar`: User profile picture
- `Rating`: Visual star rating
- `ScrollView`: Content container
- `EmptyState`: Error handling display
