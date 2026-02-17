# Next.js Frontend Rules

> These rules apply to frontend projects using Next.js (App Router), TypeScript, and Tailwind CSS.
> This file complements `shared-rules.md` which MUST also be followed.

---

## Tech Stack

- **Framework**: Next.js (latest version, App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + SASS modules (`.module.scss`)
- **Icons**: Bootstrap Icons (`react-bootstrap-icons`)
- **HTTP Client**: Axios
- **Notifications**: SweetAlert2

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles (Tailwind directives + base styles)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── [page]/
│   │       └── page.tsx             # Route pages
│   ├── components/
│   │   └── [ComponentName]/
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.types.ts    # Props interface
│   │       └── ComponentName.module.scss # Component styles (if needed)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance configuration
│   │   │   └── endpoints/           # Grouped API calls by domain
│   │   │       ├── users.ts
│   │   │       └── expenses.ts
│   │   ├── hooks/                   # Custom React hooks
│   │   └── utils/                   # Helper functions
│   └── types/
│       └── index.ts                 # Shared type definitions
├── docs/
│   ├── components/
│   ├── utils/
│   ├── types/
│   └── postmortem/
├── .env.local                       # Local environment (git ignored)
├── .env.example                     # Environment template (committed)
└── package.json
```

---

## Component Rules

### Folder Structure

Every component lives in its own folder under `src/components/[ComponentName]/`:

- `ComponentName.tsx` - Component implementation.
- `ComponentName.types.ts` - Props interface.
- `ComponentName.module.scss` - Scoped styles (only if Tailwind alone is insufficient).

### Props Interface

Always define props in a separate `.types.ts` file:

```typescript
// Button/Button.types.ts
export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
```

### Component Implementation

- Use named exports (not default exports) for components.
- Destructure props in the function signature.
- Use the `@/` path alias for all imports.

```typescript
// Button/Button.tsx
import { ButtonProps } from './Button.types';

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

---

## Styling Rules

1. **Check `globals.css` first** before adding any new utility classes or base styles. Never duplicate what already exists.
2. **Use Tailwind CSS** as the primary styling approach for layout and common utilities.
3. **Create `.module.scss` files** only for component-specific styles that cannot be achieved with Tailwind.
4. **Never use inline styles** for values that repeat across components.
5. SASS modules are scoped to the component. Import as `styles` and reference via `styles.className`.

---

## API Layer Rules

### Axios Client (`lib/api/client.ts`)

- Create a single centralized Axios instance.
- Configure `baseURL` from `process.env.NEXT_PUBLIC_API_URL`.
- Configure `timeout` from `process.env.NEXT_PUBLIC_API_TIMEOUT` (default 10000ms).
- Add response interceptors for common error handling (401, 500, etc.).

### Endpoint Files (`lib/api/endpoints/[domain].ts`)

- Group API calls by domain (users, expenses, etc.).
- Export an object with methods matching CRUD operations.
- Type all request payloads and response data.
- Return `response.data` directly (unwrap Axios response).

```typescript
// lib/api/endpoints/users.ts
import { api } from '../client';
import { User, CreateUserPayload } from '@/types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserPayload) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
```

**NEVER call Axios directly in components.** Always go through the API layer.

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase folder + files | `Button/Button.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Types | camelCase or PascalCase | `index.ts`, `user.types.ts` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Pages (App Router) | lowercase with hyphens | `user-profile/page.tsx` |
| API endpoints | camelCase | `users.ts`, `expenses.ts` |

---

## Environment Variables

- Prefix all browser-accessible variables with `NEXT_PUBLIC_`.
- Required variables:
  - `NEXT_PUBLIC_API_URL` - Backend API base URL.
  - `NEXT_PUBLIC_API_TIMEOUT` - API timeout in milliseconds (optional, default 10000).
- Create `.env.example` with placeholder values (committed to git).
- Never commit `.env.local`.

| File | Purpose | Git |
|------|---------|-----|
| `.env.local` | Local development secrets | Ignored |
| `.env.example` | Template for team members | Committed |
| `.env.production` | Production values (if not using hosting env) | Ignored |

---

## Documentation Requirements

### Component Docs (`docs/components/COMPONENTNAME.md`)

For each component, document:
- Brief description.
- Props table (prop, type, required, default, description).
- Usage example.
- Notes on gotchas or important behavior.

### Utility Docs (`docs/utils/UTILITYNAME.md`)

For each utility function, document:
- Brief description.
- Parameters table.
- Return type and description.
- Usage example.

### Type Docs (`docs/types/TYPENAME.md`)

For each shared type, document:
- Brief description.
- Full type definition.
- Where and how it is used.

---

## When Creating Components

1. Check if a similar component already exists. Reuse or extend before creating new.
2. Create the full folder structure: `.tsx`, `.types.ts`, `.module.scss` (if needed).
3. Create or update documentation in `docs/components/`.
4. Review `globals.css` before adding any new styles.

## When Creating Pages

1. Use the App Router file convention (`page.tsx` inside a folder).
2. Lowercase with hyphens for route folder names.
3. Handle loading and error states.
