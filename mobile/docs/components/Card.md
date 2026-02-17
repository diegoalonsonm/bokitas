# Card Component

A container component for grouping related content with consistent styling, shadows, and optional interaction.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | The content to display inside the card. |
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | The visual style of the card. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | The internal padding of the card. |
| `style` | `ViewStyle` | - | Custom styles for the card container. |
| `onPress` | `() => void` | - | Optional. If provided, the card becomes interactive and pressable. |

## Usage

```tsx
import { Card } from '@/components/ui';
import { Text } from 'react-native';

// Default card
<Card>
  <Text>This is inside a card</Text>
</Card>

// Elevated card with less padding
<Card variant="elevated" padding="sm">
  <Text>This card has a shadow</Text>
</Card>

// Interactive card
<Card onPress={() => console.log('Pressed!')}>
  <Text>Click me</Text>
</Card>
```

## Implementation Details

- **Interactivity**: Automatically uses `Pressable` if `onPress` is provided, otherwise renders a basic `View`.
- **Feedback**: Provides visual feedback (opacity and scale) on press when interactive.
- **Layout**: Uses `borderCurve: 'continuous'` for smoother corners on iOS.
