# UI Guidelines Changes

All changes follow the [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines). This document lists every change made and how to verify it.

---

## Files Modified (11 total)

| File | Status |
|---|---|
| `src/app/globals.css` | Modified |
| `src/app/layout.tsx` | Modified |
| `src/app/page.tsx` | Modified |
| `src/app/privacy/page.tsx` | Modified |
| `src/app/service/page.tsx` | Modified |
| `src/components/Button/Button.tsx` | Modified |
| `src/components/Features/Features.tsx` | Modified |
| `src/components/Footer.tsx` | **Deleted** (duplicate) |
| `src/components/Footer/Footer.tsx` | Modified |
| `src/components/Hero/Hero.tsx` | Modified |
| `src/components/Navbar/Navbar.tsx` | Modified |

---

## Changes by Category

### 1. Dark Mode & Theming

**`layout.tsx`** - Added `color-scheme: dark` and `<meta name="theme-color">`

- `style={{ colorScheme: "dark" }}` on `<html>` -- tells the browser to render native controls (scrollbars, form inputs, color picker) in dark mode
- `<meta name="theme-color" content="#18181B">` -- sets the browser tab/address bar color to match the page background

**How to check:** Open the site in Chrome. The scrollbar should be dark-themed. On mobile (or Chrome DevTools mobile emulation), the address bar should match the dark background color.

---

### 2. Skip Link & Landmark Navigation

**`layout.tsx`** - Added a skip-to-content link  
**`page.tsx`, `privacy/page.tsx`, `service/page.tsx`** - Added `id="main"` to `<main>`

- A visually-hidden `<a href="#main">` appears when focused via keyboard, allowing users to skip past the navbar

**How to check:** Load any page and press `Tab` once. A "Saltar al contenido principal" link should appear at the top-left. Press `Enter` -- focus should jump past the navbar to the main content.

---

### 3. Reduced Motion Support

**`globals.css`** - Added `@media (prefers-reduced-motion: reduce)` global rule

- Disables all CSS animations and transitions for users who have enabled "Reduce motion" in their OS settings
- Covers: `animate-pulse`, `animate-spin`, `animate-fade-in-up`, and all `transition-*` classes

**How to check:**
1. **Chrome DevTools:** Open DevTools > Rendering tab (Ctrl+Shift+P, type "Rendering") > check "Emulate CSS media feature prefers-reduced-motion: reduce"
2. All animations (hero fade-in, pulse effects, button spinner) should be instant/disabled
3. **OS-level:** Windows: Settings > Accessibility > Visual Effects > turn off "Animation effects"

---

### 4. Touch Interaction

**`globals.css`** - Added `touch-action: manipulation` on interactive elements

- Eliminates the 300ms double-tap-to-zoom delay on mobile browsers for buttons, links, and form inputs

**How to check:** Test on a mobile device or Chrome DevTools with touch emulation. Tapping buttons should feel instant with no delay.

---

### 5. Focus States (`:focus` to `:focus-visible`)

**`Button.tsx`** - Replaced `focus:` with `focus-visible:` classes; replaced `transition-all` with `transition-colors transition-transform`

- `focus:ring-2` changed to `focus-visible:ring-2` -- focus ring only appears on keyboard navigation, not on mouse click
- `focus:outline-none` changed to `focus-visible:outline-none`
- `transition-all` (anti-pattern) replaced with explicit properties

**How to check:**
1. Click a button with your mouse -- no focus ring should appear
2. Tab to a button with keyboard -- a primary-colored ring should appear around it
3. Inspect the button element -- verify no `transition-all` in the computed styles

---

### 6. Accessibility: `aria-hidden` on Decorative Icons

**`Button.tsx`** - `aria-hidden="true"` on loading spinner  
**`Features.tsx`** - `aria-hidden="true"` on feature card icons  
**`Footer/Footer.tsx`** - `aria-hidden="true"` on Instagram and LinkedIn icons  
**`Hero.tsx`** - `aria-hidden="true"` on ArrowRight icon  
**`Navbar.tsx`** - `aria-hidden="true"` on List and X (hamburger/close) icons

- Decorative icons are hidden from screen readers so they don't announce meaningless content like "image" or the icon name

**How to check:**
1. Inspect any icon element in DevTools -- it should have `aria-hidden="true"` attribute
2. Use a screen reader (NVDA on Windows, or Chrome's built-in screen reader via DevTools Accessibility panel) -- icons should not be announced

---

### 7. Accessibility: `aria-label` on Icon-Only Interactive Elements

**`Footer/Footer.tsx`** - Added `aria-label="Siguenos en Instagram"` and `aria-label="Siguenos en LinkedIn"` on social links  
**`Navbar.tsx`** - Added `aria-label` on mobile menu toggle button (dynamic: "Abrir menu" / "Cerrar menu")

**How to check:**
1. Inspect the Instagram/LinkedIn links in the footer -- they should have `aria-label` attributes
2. Inspect the hamburger button (mobile view) -- it should have `aria-label`
3. In the DevTools Accessibility panel, these elements should show their labels

---

### 8. Accessibility: `aria-expanded` on Disclosure Controls

**`Navbar.tsx`** - Added `aria-expanded={isMobileMenuOpen}` on mobile menu toggle

- Communicates to assistive tech whether the menu is open or closed

**How to check:** Inspect the hamburger button in mobile view. `aria-expanded` should be `"false"` when closed and `"true"` when opened.

---

### 9. Anti-Pattern: `transition-all` Removal

**`Button.tsx`** - `transition-all` replaced with `transition-colors transition-transform`  
**`Navbar.tsx`** - `transition-all` replaced with `transition-[background-color,border-color,padding]`

- `transition-all` is a performance anti-pattern -- it transitions every CSS property, including ones that trigger layout recalculation. Explicit properties are compositor-friendly.

**How to check:** Inspect the nav element and buttons. The `transition-property` in computed styles should list specific properties, not `all`.

---

### 10. Typography: `text-balance` on Heading

**`Hero.tsx`** - Added `text-balance` class to `<h1>`

- Prevents typographic widows (single words on the last line of a heading) by balancing line lengths

**How to check:** Resize the browser window. The main hero heading should distribute words more evenly across lines instead of leaving a single word on the last line.

---

### 11. Hydration Safety

**`Footer/Footer.tsx`** - Added `suppressHydrationWarning` on the copyright year paragraph

- `new Date().getFullYear()` can produce different values on server vs client if rendered around midnight or across time zones. `suppressHydrationWarning` prevents React from throwing a mismatch error.

**How to check:** Open the browser console. There should be no React hydration mismatch warnings related to the copyright year.

---

### 12. Cleanup: Duplicate Footer Deleted

**`src/components/Footer.tsx`** - Deleted

- A duplicate `Footer.tsx` existed both at `src/components/Footer.tsx` (using `lucide-react`) and `src/components/Footer/Footer.tsx` (using `react-bootstrap-icons`). All imports reference `@/components/Footer/Footer`, so the standalone file was unused dead code.

**How to check:** Run `grep -r "components/Footer" web/src/` -- all imports should point to `Footer/Footer`. The standalone `Footer.tsx` should no longer exist.

---

## Quick Verification Checklist

```
[ ] npm run build -- passes without errors
[ ] Tab through the page -- skip link appears, focus rings visible on keyboard only
[ ] Enable "prefers-reduced-motion" -- all animations stop
[ ] Check mobile hamburger button -- has aria-label, aria-expanded
[ ] Check footer social links -- have aria-label
[ ] Inspect icons -- all have aria-hidden="true"
[ ] No hydration warnings in console
[ ] No transition-all in any component
[ ] Browser scrollbar is dark-themed
[ ] Hero h1 has balanced text wrapping
```
