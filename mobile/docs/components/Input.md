# Input Component

A versatile text input component with support for labels, hints, error messages, icons, and password visibility toggling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | The label text displayed above the input. |
| `error` | `string` | - | Error message to display below the input (changes border color to red). |
| `hint` | `string` | - | Helper text to display below the input (if no error is present). |
| `leftIcon` | `keyof typeof Ionicons.glyphMap` | - | Icon to display inside the input on the left side. |
| `rightIcon` | `keyof typeof Ionicons.glyphMap` | - | Icon to display inside the input on the right side. |
| `onRightIconPress` | `() => void` | - | Function to call when the right icon is pressed. |
| `isPassword` | `boolean` | `false` | Whether the input is for a password. Adds a visibility toggle button. |
| `containerStyle` | `ViewStyle` | - | Style for the outer container (wrapping label, input, and messages). |
| `style` | `TextStyle` | - | Style for the input field itself. |
| `...props` | `TextInputProps` | - | All other standard `TextInput` props. |

## Usage

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Username"
  placeholder="Enter your username"
  onChangeText={setUsername}
/>

// Password input
<Input
  label="Password"
  isPassword
  placeholder="Enter your password"
  onChangeText={setPassword}
/>

// With validation error
<Input
  label="Email"
  value={email}
  error={emailError}
  leftIcon="mail-outline"
/>

// With helper hint
<Input
  label="Bio"
  hint="Tell us a little about yourself."
  multiline
/>
```

## Implementation Details

- **Focus State**: Highlights the border with the primary color when focused.
- **Error State**: Changes the border and error text color to red.
- **Password Toggle**: Automatically handles the visibility state when `isPassword` is true.
- **Layout**: Uses `borderCurve: 'continuous'` for smoother corners on iOS.
