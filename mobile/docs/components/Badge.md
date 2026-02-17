# Badge Component

Displays a small badge for status, categories, or labels.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | The text to display inside the badge. |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'error'` | `'default'` | The visual style of the badge. |
| `size` | `'sm' \| 'md'` | `'md'` | The size of the badge. |
| `style` | `ViewStyle` | - | Custom styles for the badge container. |

## Usage

```tsx
import { Badge } from '@/components/ui';

// Default badge
<Badge text="Category" />

// Primary badge
<Badge text="Featured" variant="primary" />

// Success badge
<Badge text="Open" variant="success" size="sm" />
```

## Implementation Details

- **Variants**:
  - `default`: Grey background, secondary text color.
  - `primary`: Primary color background (with opacity), primary text color.
  - `success`: Green background (with opacity), green text color.
  - `warning`: Yellow/Orange background (with opacity), yellow/orange text color.
  - `error`: Red background (with opacity), red text color.
- **Styling**: Uses completely rounded corners (`borderRadius.full`).
