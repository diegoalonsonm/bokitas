# About

Two-column about section with an image on the left and descriptive text on the right, explaining the mission behind Bokitas.

## Props

This component does not accept props. All content is static.

## Usage

```tsx
import { About } from "@/components/About/About";

<About />
```

## Behavior

- On desktop (`md`+): side-by-side layout with image and text.
- On mobile: stacked layout (image on top, text below).
- The image uses Next.js `<Image>` with `fill`, `placeholder="blur"`, and responsive `sizes`.
- Decorative blur circles (primary and purple) are layered behind the image for visual depth.

## Notes

- The image is imported from `@/images/image.png` as a static asset for automatic blur placeholder generation.
- There is a commented-out stats section (1M+ Resenas Compartidas, 50+ Ciudades) ready to be enabled when real data is available.
- This is a Server Component.
