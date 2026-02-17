# Profile Screen (Private)

## Route
`/app/(tabs)/profile/index`

## Description
The authenticated user's private profile. Shows personal stats, Top 4, reviews, and provides access to settings and profile editing.

## Features
- Personal profile overview
- Edit Profile navigation
- Settings navigation
- Stats display (Reviews, Saved info)
- Managed "Top 4" list
- Logout functionality

## API Dependencies
- `useAuth()`: Current user session
- `useProfileData(userId)`: Aggregates personal data
  - `usersApi.getReviews`
  - `usersApi.getTop4`

## State Management
- `useProfileData`:
  - `reviews`: User's reviews
  - `top4`: Top 4 favorites
  - `itemCounts`: Stats
  - `refresh`: Data reload function

## UI Components
- `Avatar`: Profile picture
- `ReviewCard`: Personal reviews
- `Card`: Container for empty states
- `Ionicons`: Icons for actions (Edit, Settings, Logout)
