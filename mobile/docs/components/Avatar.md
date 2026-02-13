# Avatar Component

Displays a user's avatar image or initials if no image is provided.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `string \| null` | - | The URL or local source of the avatar image. |
| `name` | `string` | - | The name of the user. Used to generate initials if `source` is missing. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | The size of the avatar. |
| `style` | `ViewStyle` | - | Custom styles for the avatar container. |
| `showBorder` | `boolean` | `false` | Whether to show a border around the avatar. |

## Usage

```tsx
import { Avatar } from '@/components/ui';

// With image
<Avatar
  source="https://example.com/avatar.jpg"
  name="Diego"
  size="lg"
/>

// Without image (shows initials)
<Avatar
  name="Diego Alonso"
  size="md"
  showBorder
/>
```

## Implementation Details

- **Automatic Initials**: If `source` is not provided, the component automatically generates initials from the `name` prop (e.g., "Diego Alonso" -> "DA").
- **Image Optimization**: Uses `expo-image` for efficient image loading and caching.
- **Sizes**:
  - `xs`: 24px
  - `sm`: 32px
  - `md`: 40px
  - `lg`: 56px
  - `xl`: 80px
