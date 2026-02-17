# Features

Grid section showcasing four key app features, each with an icon, title, and description.

## Props

This component does not accept props. Feature data is defined as a static array internally.

## Usage

```tsx
import { Features } from "@/components/Features/Features";

<Features />
```

## Internal Types

- `Feature` (`Features.types.ts`): `{ icon: Icon; title: string; description: string }` — represents a single feature card. The `Icon` type comes from `react-bootstrap-icons`.

## Features Displayed

| Icon | Title | Description |
|------|-------|-------------|
| `EggFried` | Descubrimiento Local | Find hidden gems and popular places. Filter by craving, price, or proximity. |
| `StarFill` | Resenas Honestas | Real opinions from real users. No filters, no sponsors. |
| `CameraFill` | Comparte tu Experiencia | Upload photos, rate service, and share your story. |
| `PeopleFill` | Comunidad Activa | Follow foodies, comment on reviews, create your own lists. |

## Notes

- Responsive grid: 1 column on mobile, 2 on `md`, 4 on `lg`.
- Each card has a hover effect that changes the background color.
- Icon containers have a subtle primary-tinted background that intensifies on hover.
