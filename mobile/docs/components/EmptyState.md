# EmptyState Component

Displays a message and optional action when no data is available or a list is empty.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `keyof typeof Ionicons.glyphMap` | `'search-outline'` | The name of the icon to display. |
| `title` | `string` | - | The main title text. |
| `description` | `string` | - | Additional explanatory text. |
| `actionLabel` | `string` | - | The label for the action button (if provided). |
| `onAction` | `() => void` | - | Function to call when the action button is pressed. |
| `style` | `ViewStyle` | - | Custom styles for the container. |

## Usage

```tsx
import { EmptyState } from '@/components/ui';

// Simple empty state
<EmptyState
  title="No items found"
  description="Try adjusting your search filters."
/>

// With action button
<EmptyState
  icon="cart-outline"
  title="Your cart is empty"
  actionLabel="Start Shopping"
  onAction={() => router.push('/shop')}
/>
```

## Implementation Details

- **Visuals**: Uses a circular background for the icon to make it prominent but not overwhelming.
- **Action**: The action button uses the `Button` component with the `outline` variant.
