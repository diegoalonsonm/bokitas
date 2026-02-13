# ReviewCard Component

Displays a single review, showing the user's information, rating, comment, and photos.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `review` | `Review` | - | The review object to display. |
| `showRestaurant` | `boolean` | `false` | Whether to display the restaurant name (useful when listing reviews on a user profile). |
| `style` | `ViewStyle` | - | Custom styles for the container. |
| `onPress` | `() => void` | - | Optional callback. If not provided, defaults to navigation to review details. |

## Usage

```tsx
import { ReviewCard } from '@/components/reviews';

// Standard review in a list
<ReviewCard review={reviewData} />

// Review on a user profile (showing "at [Restaurant Name]")
<ReviewCard review={userReview} showRestaurant />
```

## Implementation Details

- **Animations**: Uses `react-native-reanimated` (FadeIn) for smooth entry.
- **User Header**: Displays user avatar, name, and relative date (e.g., "2 days ago").
- **Photos**: Displays up to 3 photos. If more exist, the 3rd photo shows an overlay indicating the remaining count (e.g., "+2").
- **Navigation**: Tapping the card navigates to the review details. Tapping the user header navigates to the user's profile.
