---
trigger: always_on
---

# Expo / React Native Mobile Rules

> These rules apply to mobile projects using React Native, Expo, and TypeScript.
> This file complements `shared-rules.md` which MUST also be followed.

---

## Tech Stack

- **Framework**: React Native + Expo (SDK 50+)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet (default) or NativeWind (Tailwind for RN, optional)
- **State Management**: React Context + Hooks (Zustand for complex state)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage (non-sensitive) / Expo SecureStore (sensitive)
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons (`@expo/vector-icons`)

---

## Project Structure

```
mobile/
├── app/                             # Expo Router screens (file-based routing)
│   ├── _layout.tsx                  # Root layout (providers, navigation)
│   ├── index.tsx                    # Entry screen
│   ├── (auth)/                      # Auth group (unauthenticated routes)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                      # Tab navigation group
│   │   ├── _layout.tsx              # Tab bar configuration
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   └── [id].tsx                     # Dynamic routes
│
├── components/
│   └── [ComponentName]/
│       ├── ComponentName.tsx
│       ├── ComponentName.types.ts   # Props interface
│       └── ComponentName.styles.ts  # StyleSheet (if complex)
│
├── lib/
│   ├── api/
│   │   ├── client.ts                # Axios instance + interceptors
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── users.ts
│   │       └── expenses.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useStorage.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/
│   │   ├── formatDate.ts
│   │   └── formatCurrency.ts
│   └── constants/
│       ├── colors.ts
│       ├── spacing.ts
│       └── config.ts
│
├── types/
│   └── index.ts                     # Shared type definitions
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── docs/
│   ├── components/
│   ├── screens/
│   ├── utils/
│   └── postmortem/
│
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build configuration
├── tsconfig.json
├── .env.local
└── .env.example
```

---

## Component Rules

### Folder Structure

Every component lives in its own folder under `components/[ComponentName]/`:

- `ComponentName.tsx` - Component implementation.
- `ComponentName.types.ts` - Props interface.
- `ComponentName.styles.ts` - StyleSheet (only for components with complex styles).

### Props Interface

Always define props in a separate `.types.ts` file:

```typescript
// Button/Button.types.ts
export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
```

### Component Implementation

- Use **named exports** for components.
- Use the `@/` path alias for all imports.
- Handle `loading` and `disabled` states.

### Styles

- Use `StyleSheet.create()` for type safety and performance.
- Define colors and spacing via constants (`lib/constants/`), never hardcode values.
- Avoid inline styles for repeated values.
- Use consistent style naming: `container`, `title`, `label`, `button`, etc.

```typescript
// ComponentName.styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
});
```

---

## Screen Rules (app/)

Expo Router uses file-based routing. Screen files go in `app/`.

- **Default export** is required for all screen components (Expo Router requirement).
- Use `Stack.Screen` for per-screen navigation options.
- Handle loading and error states on every screen.
- Use `FlatList` for lists, NEVER `ScrollView` with `.map()`.
- Group routes logically: `(auth)/` for unauthenticated, `(tabs)/` for tab navigation.

```typescript
// app/(tabs)/home.tsx
export default function HomeScreen() {
  // ...
}
```

---

## Layout Rules (app/_layout.tsx)

- Root layout wraps the app in context providers (Auth, Theme, etc.).
- Tab layout configures tab bar appearance and icons.
- Providers are ordered outermost to innermost: Theme > Auth > Navigation.

---

## API Layer Rules

### Axios Client (`lib/api/client.ts`)

- Create a single centralized Axios instance.
- Configure `baseURL` from Expo constants (`Constants.expoConfig?.extra?.apiUrl`).
- Set timeout (default 10000ms).
- Add request interceptor to attach auth token from SecureStore.
- Add response interceptor to handle 401 errors globally (clear token, redirect to login).

### Endpoint Files (`lib/api/endpoints/[domain].ts`)

- Group API calls by domain.
- Export an object with typed methods.
- Return `response.data` directly (unwrap Axios response).
- Type all payloads and responses.

**NEVER call Axios directly in components or screens.** Always use the API layer.

---

## Hooks Rules (`lib/hooks/`)

- Every custom hook must validate its context:
  ```typescript
  const context = useContext(SomeContext);
  if (!context) {
    throw new Error('useHook must be used within a Provider');
  }
  ```
- Name hooks with the `use` prefix: `useAuth`, `useStorage`, `useTheme`.
- Keep hooks focused: one concern per hook.

---

## Context Rules (`lib/context/`)

- Define the context type interface explicitly (never use `any`).
- Initialize context with `null` and check in the hook.
- Auth context must:
  - Check auth state on mount.
  - Protect routes based on auth state (redirect to login/home).
  - Provide `login`, `logout`, `register` methods.
  - Store tokens in SecureStore, not AsyncStorage.

---

## Constants (`lib/constants/`)

- `colors.ts` - All color values. Never hardcode hex values in components.
- `spacing.ts` - Spacing scale (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`).
- `config.ts` - App configuration (API URL, app name, etc.) sourced from Expo constants.

---

## Storage Rules

| Data Type | Storage | Example |
|-----------|---------|---------|
| Auth tokens | SecureStore | JWT tokens, API keys |
| User preferences | AsyncStorage | Theme, language |
| Cached data | AsyncStorage | API response cache |
| Sensitive data | SecureStore | Passwords, PINs |

NEVER store sensitive data (tokens, passwords) in AsyncStorage. Use `expo-secure-store`.

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase folder + files | `Button/Button.tsx` |
| Screens | lowercase (Expo Router) | `home.tsx`, `profile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | camelCase or PascalCase | `index.ts` |
| Constants | camelCase | `colors.ts`, `config.ts` |
| API endpoints | camelCase | `expenses.ts` |
| Layouts | `_layout.tsx` | `app/_layout.tsx` |

---

## Environment Variables

Use `app.config.js` (or `app.json`) with `extra` field for environment variables:

```javascript
// app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
    },
  },
};
```

Access in code:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

Use EAS Build environment profiles for staging/production:
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "env": { "API_URL": "https://staging-api.myapp.com" } },
    "production": { "env": { "API_URL": "https://api.myapp.com" } }
  }
}
```

---

## Documentation Requirements

### Component Docs (`docs/components/COMPONENTNAME.md`)

For each component, document:
- Brief description.
- Props table.
- Usage example.
- Platform-specific notes (iOS vs Android differences, if any).

### Screen Docs (`docs/screens/SCREENNAME.md`)

For each screen, document:
- Route path.
- Features/functionality.
- API dependencies (which endpoints it calls).
- State it manages.

---

## When Creating Components

1. Check if a similar component already exists.
2. Create the full folder structure: `.tsx`, `.types.ts`, `.styles.ts` (if needed).
3. Use constants for colors and spacing.
4. Create or update documentation in `docs/components/`.

## When Creating Screens

1. Place in the appropriate route group (`(auth)`, `(tabs)`, etc.).
2. Use default export (required by Expo Router).
3. Handle loading and error states.
4. Create or update documentation in `docs/screens/`.
