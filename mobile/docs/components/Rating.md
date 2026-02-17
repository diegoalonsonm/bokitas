# Rating Component

Displays a star rating using icons. Supports both read-only display and interactive input.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | The current rating value (0 to maxValue). |
| `maxValue` | `number` | `5` | The maximum possible rating. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the stars. |
| `showValue` | `boolean` | `false` | Whether to display the numeric value next to the stars. |
| `interactive` | `boolean` | `false` | Whether the rating is interactive (can be changed by user). |
| `onChange` | `(value: number) => void` | - | Callback function when a star is pressed (if interactive). |

## Usage

```tsx
import { Rating } from '@/components/ui';

// Read-only display
<Rating value={4.5} size="sm" showValue />

// Interactive input
<Rating
  value={rating}
  interactive
  size="lg"
  onChange={(newValue) => setRating(newValue)}
/>
```

## Implementation Details

- **Visuals**: Uses `Ionicons` for stars (`star`, `star-half`, `star-outline`).
- **Half Stars**: Logically handles half-star display based on the decimal value.
- **Sizes**:
  - `sm`: 14px
  - `md`: 18px
  - `lg`: 24px
