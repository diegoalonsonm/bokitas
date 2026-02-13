# Login Screen

## Route
`/app/(auth)/login`

## Description
The login screen allows users to authenticate using their email and password. It includes validation, error handling, and navigation to the registration screen or password recovery.

## Features
- Email and password validation
- Secure text entry for password
- Loading state handling
- Error message display
- Navigation to Register and Forgot Password screens
- Persistent login session management

## API Dependencies
- `useAuth`: Custom hook for authentication context
  - `login(email, password)`: Authenticates the user
  - `isLoading`: Tracks authentication status

## State Management
- `email` (useState): Controlled input for email
- `password` (useState): Controlled input for password
- `isLoading` (useState): UI loading state during API calls
- `errors` (useState): Object containing validation error messages

## UI Components
- `SafeAreaView`: Ensures content respects device boundaries
- `KeyboardAvoidingView`: Manages keyboard interactions
- `TextInput`: User input fields
- `ActivityIndicator`: Loading feedback
