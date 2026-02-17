# User Profile Screen (Public)

## Route
`/app/(tabs)/(home)/user/[id]`

## Description
Displays a public profile of another user, showing their statistics, "Top 4" favorite restaurants, and their review history.

## Features
- Public profile information (Name, Avatar, Username)
- User statistics (Review count, Top 4 count)
- "Top 4" restaurants grid
- List of user's reviews
- Pull-to-refresh

## API Dependencies
- `usersApi.getById(id)`: Fetches public user info
- `usersApi.getReviews(id)`: Fetches user's reviews
- `usersApi.getTop4(id)`: Fetches user's top 4 restaurants

## State Management
- `user` (useState): User profile data
- `reviews` (useState): List of reviews
- `top4` (useState): List of favorite restaurants
- `stats` (useState): Aggregated statistics
- `isLoading` / `isRefreshing`: Loading states

## UI Components
- `Avatar`: Large profile picture
- `ReviewCard`: User's reviews
- `RefreshControl`: Update data interaction
- `EmptyState`: user not found state
