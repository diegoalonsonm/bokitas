# Footer

Site-wide footer with brand description, social media links, support contact, and legal navigation links.

## Props

This component does not accept props. All content is static.

## Usage

```tsx
import { Footer } from "@/components/Footer/Footer";

<Footer />
```

## Behavior

- Displays the Bokitas brand name and tagline.
- Social links: Instagram and LinkedIn (using `react-bootstrap-icons`).
- Support email: `soporte@bokitas.com`.
- Bottom bar: copyright with dynamic year, and links to `/privacy` and `/service`.

## Notes

- The copyright year is dynamically generated via `new Date().getFullYear()`.
- Social links use Next.js `<Link>` for consistency, though the Instagram `href` is currently a placeholder (`#`).
- This is a Server Component.
