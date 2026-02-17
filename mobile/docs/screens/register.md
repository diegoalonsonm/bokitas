# Register Screen

## Route
`/app/(auth)/register`

## Description
The registration screen allows new users to create an account by providing their personal information. It includes comprehensive form validation and user feedback.

## Features
- Multi-field form (Name, Surnames, Email, Password)
- Real-time input validation
- Password confirmation check
- Error handling and display
- Success feedback and redirection to login

## API Dependencies
- `authApi.register(data)`: Endpoint to create a new user account
  - Payload: `email`, `password`, `nombre`, `primerapellido`

## State Management
- `formData` (useState): Object storing all form field values
- `errors` (useState): Object storing validation errors for each field
- `isLoading` (useState): Tracks API request status

## UI Components
- `ScrollView`: Allows scrolling through the form
- `KeyboardAvoidingView`: Handles keyboard overlap
- `TextInput`: Input fields for user data
- `Alert`: Native alert for success/error messages
