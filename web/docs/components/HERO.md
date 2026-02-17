# Hero

Landing page hero section with a gradient headline, descriptive text, a CTA button, and decorative background blur elements.

## Props

This component does not accept props. All content is static.

## Usage

```tsx
import { Hero } from "@/components/Hero/Hero";

<Hero />
```

## Behavior

- Renders a vertically centered hero section with `min-h-[80vh]`.
- Displays a status badge ("Unete a la comunidad foodie mas grande") with a green dot indicator.
- The headline uses a vertical gradient from `text-main` to `text-secondary`.
- The CTA button includes an `ArrowRight` icon that animates on hover (`translate-x-1`).
- Two decorative blurred circles provide ambient background lighting effects.

## Notes

- There is a commented-out stats section (500+ Restaurantes, 10k+ Resenas, 4.9 rating) ready to be enabled when real data is available.
- This is a Server Component — no client-side interactivity.
