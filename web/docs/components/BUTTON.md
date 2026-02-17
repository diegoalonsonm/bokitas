# Button

Reusable, polymorphic button component with multiple variants, sizes, and a loading state. Renders as a `<Link>` when an `href` is provided, otherwise as a `<button>`.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "link"` | No | `"primary"` | Visual style variant. |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | No | `"md"` | Button size. |
| `isLoading` | `boolean` | No | `false` | Shows a spinner and disables the button. |
| `href` | `string` | No | — | If provided, renders as a Next.js `<Link>` instead of `<button>`. |
| `fullWidth` | `boolean` | No | `false` | Makes the button take the full width of its container. |
| `children` | `React.ReactNode` | Yes | — | Button content. |
| `disabled` | `boolean` | No | `false` | Disables the button. Automatically set when `isLoading` is true. |
| `className` | `string` | No | `""` | Additional CSS classes appended to the button. |

Also extends all native `React.ButtonHTMLAttributes<HTMLButtonElement>`.

## Usage

```tsx
import { Button } from "@/components/Button/Button";

// Primary button
<Button onClick={handleClick}>Click me</Button>

// Link button with icon
<Button href="/about" variant="outline" size="lg">
  Learn More
</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Full-width secondary
<Button variant="secondary" fullWidth>
  Full Width
</Button>
```

## Notes

- Uses `React.forwardRef` for ref forwarding.
- When `href` is provided, all button-specific props (`disabled`, `ref`, `onClick` for form submission) are ignored since it renders as a `<Link>`.
- The loading spinner uses the `ArrowRepeat` icon from `react-bootstrap-icons` with a CSS spin animation.
