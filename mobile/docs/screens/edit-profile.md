# Edit Profile Screen

## Route
`/app/(tabs)/profile/edit`

## Description
Allows the user to update their profile information, including their avatar, name, and username.

## Features
- Avatar update via image picker
- Name and Username editing
- Form validation
- Read-only email display

## API Dependencies
- `usersApi.update(id, data)`: Updates profile info
- `usersApi.uploadPhoto(id, uri)`: Uploads new avatar
- `useAuth().refreshUser()`: Syncs local session with server

## State Management
- `name`, `username` (useState): Form fields
- `photoUrl` (useState): Temporary avatar preview
- `errors` (useState): Validation errors
- `isLoading` (useState): Saving status

## UI Components
- `useImagePicker`: Hook for gallery access
- `Input`: Custom input component
- `Avatar`: Image preview
- `KeyboardAvoidingView`: Form interaction management
