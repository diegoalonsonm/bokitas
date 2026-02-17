# RestaurantCard Component

Displays a restaurant's summary information, including its image, name, categories, rating, and review count. Used in lists and featured sections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `restaurant` | `Restaurant` | - | The restaurant object to display. |
| `variant` | `'default' \| 'compact' \| 'featured'` | `'default'` | The layout style of the card. |
| `style` | `ViewStyle` | - | Custom styles for the container. |
| `onPress` | `() => void` | - | Optional callback. If not provided, defaults to navigation to restaurant details. |
| `index` | `number` | `0` | The index of the item in a list. Used for staggered animation delay. |

## Usage

```tsx
import { RestaurantCard } from '@/components/restaurants';
import type { Restaurant } from '@/types';

// Regular list item
<RestaurantCard restaurant={restaurantData} />

// Horizontal scroll item (featured)
<RestaurantCard restaurant={featuredRestaurant} variant="featured" />

// Compact search result or list item
<RestaurantCard restaurant={item} variant="compact" index={index} />
```

## Implementation Details

- **Animations**: Uses `react-native-reanimated` (FadeInDown) to animate entry based on the `index` prop.
- **Image Optimization**: Uses `expo-image` with a shared blurhash placeholder for smooth loading.
- **Variants**:
  - `default`: Vertical layout with full-width image (approx 150px height).
  - `compact`: Horizontal layout with small thumbnail (60px), suitable for dense lists.
  - `featured`: Large card (280x200) with overlay text, suitable for horizontal scrollers.
