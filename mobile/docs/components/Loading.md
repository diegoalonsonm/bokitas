# Loading Component

Displays a loading indicator with an optional message. Can be used inline or cover the full screen.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'large'` | `'large'` | The size of the activity indicator. |
| `color` | `string` | `colors.primary` | The color of the spinner. |
| `message` | `string` | - | Optional text message to display below the spinner. |
| `fullScreen` | `boolean` | `false` | Whether the loader should center itself and verify the full screen (flex: 1). |

## Usage

```tsx
import { Loading } from '@/components/ui';

// Inline loading
<View>
  <Text>Content loading...</Text>
  <Loading size="small" />
</View>

// Full screen with message
if (isLoading) {
  return <Loading message="Loading profile..." fullScreen />;
}
```

## Implementation Details

- **Feedback**: Provides immediate visual feedback for asynchronous operations.
- **Access**: Uses the native `ActivityIndicator`.
