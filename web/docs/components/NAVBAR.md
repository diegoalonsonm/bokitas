# Navbar

Fixed-position navigation bar with scroll-aware styling and a responsive mobile menu. This is a **Client Component** (`"use client"`) due to its use of `useState` and `useEffect`.

## Props

This component does not accept props. Navigation links are defined internally.

## Usage

```tsx
import { Navbar } from "@/components/Navbar/Navbar";

<Navbar />
```

## Behavior

- **Scroll detection**: On scroll past 10px, the navbar gains a blurred background (`bg-background/80 backdrop-blur-md`) and a bottom border.
- **Mobile menu**: A hamburger menu (`List` icon) toggles a slide-down mobile nav on screens below `md`. Clicking a link or the CTA auto-closes the menu.
- **Logo**: Displays the Bokitas logo image and brand name with a gradient text effect.
- **CTA**: A "Descargar App" button linking to `#download`.

## Internal Types

- `NavLink` (`Navbar.types.ts`): `{ name: string; href: string }` — represents a navigation item.

## Notes

- This is the only Client Component in the project. All other components are Server Components.
- The logo is imported from `@/images/logo.png` as a static asset for Next.js image optimization.
- Nav links use anchor fragments (`#hero`, `#features`, `#about`) for same-page scrolling.
