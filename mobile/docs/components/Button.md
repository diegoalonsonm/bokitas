# Button Component

A customizable button component with support for loading states, icons, and various styles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | The text to display on the button. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | The visual style of the button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the button. |
| `isLoading` | `boolean` | `false` | Whether the button is in a loading state. Shows a spinner and disables interaction. |
| `isDisabled` | `boolean` | `false` | Whether the button is disabled. |
| `leftIcon` | `React.ReactNode` | - | Icon component to display to the left of the text. |
| `rightIcon` | `React.ReactNode` | - | Icon component to display to the right of the text. |
| `fullWidth` | `boolean` | `false` | Whether the button should take up the full width of its container. |
| `style` | `ViewStyle` | - | Custom styles for the button container. |
| `textStyle` | `TextStyle` | - | Custom styles for the button text. |
| `...props` | `PressableProps` | - | All other standard `Pressable` props. |

## Usage

```tsx
import { Button } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

// Basic primary button
<Button title="Save Changes" onPress={handleSave} />

// Loading state
<Button title="Saving..." isLoading />

// Outline variant with icon
<Button
  title="Cancel"
  variant="outline"
  leftIcon={<Ionicons name="close" size={20} color="red" />}
  onPress={handleCancel}
/>

// Full width button
<Button title="Login" fullWidth onPress={handleLogin} />
```

## Implementation Details

- **Haptics**: Triggers a medium haptic feedback on press (unless disabled).
- **Press State**: Includes a scale down animation and opacity change when pressed.
- **Loading**: Replaces content with an `ActivityIndicator` when `isLoading` is true. The color of the indicator automatically adapts to the button variant.
