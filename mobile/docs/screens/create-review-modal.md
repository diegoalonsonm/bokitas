# Create Review Modal

## Route
`/app/modals/create-review`

## Description
A modal screen used to compose and submit a new review for a restaurant.

## Features
- Interactive 5-star rating
- Text comment input
- Photo upload (up to 5 images)
- Unsaved changes protection (Alert on dismiss)

## API Dependencies
- `reviewsApi.create(data)`: Submits the review
- `reviewsApi.uploadPhoto(id, uri)`: Uploads attached photos
- `useImagePicker()`: Selects photos from device

## State Management
- `rating` (useState): Numeric rating
- `comment` (useState): Review text
- `photos` (useState): Array of image URIs
- `isSubmitting` (useState): Loading state

## UI Components
- `Rating`: Interactive star component
- `TextInput`: Multiline comment box
- `Image`: Photo previews with remove button
- `Alert`: Validation and confirmation messages
