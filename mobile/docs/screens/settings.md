# Settings Screen

## Route
`/app/(tabs)/profile/settings`

## Description
Provides application settings and account management options.

## Features
- Account management options
- Notification preferences toggle
- Contact and Support links
- Legal information (Privacy, Terms)
- Destructive actions (Logout, Delete Account)

## API Dependencies
- `useAuth().logout()`: Ends session
- `usersApi.delete(id)`: Permanently deletes account

## State Management
- `notifications` (useState): Toggle state for push notifications
- `user` (useAuth): Current user context

## UI Components
- `Switch`: Toggle for preferences
- `Alert`: Confirmation dialogs for destructive actions
- `ScrollView`: List of settings options
- `Linking`: Opens external URLs
