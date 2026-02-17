---
trigger: always_on
---

# Node.js Backend Rules

> These rules apply to backend projects using Node.js, Express, and TypeScript.
> This file complements `shared-rules.md` which MUST also be followed.

---

## Tech Stack

- **Runtime**: Node.js (latest LTS)
- **Framework**: Express.js
- **Language**: TypeScript (ES Modules, strict mode)
- **ORM**: Sequelize (raw queries with parameterized replacements)
- **Database**: SQL-based (MySQL, PostgreSQL, etc.)
- **Authentication**: JWT (`jsonwebtoken`) + `bcrypt`
- **Validation**: Zod
- **Email**: Nodemailer

---

## Project Structure

```
backend/
├── src/
│   ├── Controllers/                   # Request handlers
│   │   └── [entity]Controller.ts
│   ├── Models/                        # Data access & business logic
│   │   ├── database/
│   │   │   └── db.ts                  # Sequelize connection
│   │   ├── validations/
│   │   │   └── [entity]Validation.ts  # Zod schemas
│   │   ├── nodemailer/
│   │   │   └── index.ts               # Email configuration
│   │   └── [entity]Model.ts           # Entity data access
│   ├── Routes/                        # Express route definitions
│   │   └── [entity]Router.ts
│   ├── types/                         # TypeScript type definitions
│   │   ├── index.ts                   # Shared types (OperationResult, etc.)
│   │   ├── entities/
│   │   │   └── [entity].types.ts      # Entity interfaces + CRUD param interfaces
│   │   └── api/
│   │       └── [entity].api.types.ts  # Request body interfaces + typed Express requests
│   └── index.ts                       # App entry point & middleware
├── docs/
│   ├── entities/
│   ├── endpoints/
│   └── postmortem/
├── package.json
├── tsconfig.json
├── .env
└── .env.example
```

---

## Layer Architecture

```
Router -> Controller -> Model -> Database
```

- **Router**: Defines endpoints, maps HTTP verbs to controller methods. No logic.
- **Controller**: Handles request parsing, input validation, user resolution, response formatting. Calls Model methods.
- **Model**: Executes database queries via Sequelize raw queries. Contains data access logic only.

---

## File Naming

| Element | Convention | Example |
|---------|------------|---------|
| Controllers | camelCase + Controller | `expenseController.ts` |
| Models | camelCase + Model | `expenseModel.ts` |
| Routes | camelCase + Router | `expenseRouter.ts` |
| Validations | camelCase + Validation | `userValidation.ts` |
| Entity types | camelCase + .types | `expense.types.ts` |
| API types | camelCase + .api.types | `expense.api.types.ts` |

---

## Type Definitions

### Entity Types (`src/types/entities/[entity].types.ts`)

Define one file per entity containing:
- The entity interface (all DB columns).
- Parameter interfaces for each operation: `Create[Entity]Params`, `Update[Entity]Params`, `Delete[Entity]Params`, `Get[Entity]Params`, `GetAll[Entity]Params`.

```typescript
export interface Expense {
    id: string
    userId: string
    categoryId: number
    description: string
    amount: number
    date: string
    active: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface CreateExpenseParams {
    userId: string
    amount: number
    description: string
    date: string
    category: number
}
```

### API Types (`src/types/api/[entity].api.types.ts`)

Define request body interfaces and typed Express `Request` types:

```typescript
import type { Request } from 'express'

export interface CreateExpenseBody {
    email: string
    amount: number
    description: string
    category: number
}

export type CreateExpenseRequest = Request<{}, {}, CreateExpenseBody>
```

### Shared Types (`src/types/index.ts`)

Common types used across entities:

```typescript
export interface OperationResult {
    success: boolean
    message: string
}
```

---

## Model Rules

Models are classes with static async methods. Every model must:

- Import types from `types/` directory (never define types inline).
- Use parameterized queries with `:replacements` syntax.
- Generate UUIDs with `randomUUID()` from `crypto`.
- Always include `userId` parameter for security (user-scoped data).
- Filter all SELECT queries by `active = true`.
- Implement delete as `UPDATE ... SET active = false`, never `DELETE`.
- Set `active = true` on all INSERT operations.
- Return typed results with explicit `Promise<T>` return types.
- Log operations with `console.log` / `console.error`.

---

## Controller Rules

Controllers are classes with static async methods. Every controller must:

- Import and use typed request types from `types/api/`.
- Use `Promise<void>` return type (responses sent via `res`).
- Use `return` immediately after sending a response to prevent further execution.
- Resolve `userId` from `email` via `UserModel` before any entity operation.
- Validate all inputs before calling Model methods.
- Cast caught errors with `as Error` for type safety.
- Return appropriate HTTP status codes (see shared rules).

---

## Router Rules

- Define specific routes before generic ones (e.g., `/single/:id` before `/:email`).
- Group routes by HTTP method (GET, POST, PUT, DELETE).
- Use RESTful patterns:
  - `GET /:email` - Get all for user
  - `GET /single/:id` - Get one by ID
  - `POST /` - Create new
  - `PUT /:id` - Update existing
  - `DELETE /:id` - Soft delete
- Register all routers in `src/index.ts`.

---

## Validation (Zod)

- Define a Zod schema per entity in `src/Models/validations/[entity]Validation.ts`.
- Export a `validate[Entity]` function using `safeParse`.
- Export a `validatePartial[Entity]` function using `schema.partial().safeParse` for update operations.
- Export the inferred type: `export type [Entity]Input = z.infer<typeof schema>`.

---

## Database Connection

Use a centralized Sequelize instance in `src/Models/database/db.ts`:

- Configure via environment variables (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
- Configure connection pooling (`max: 5`, `min: 0`, `acquire: 30000`, `idle: 10000`).
- Export as `db.sequelize`.

---

## Entry Point (`src/index.ts`)

- Configure middleware: `express.json()`, `cors()`, `cookieParser()`.
- CORS must use environment variable for origin.
- Register all routers with descriptive base paths.
- Include a health check endpoint at `/`.

---

## SQL Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | lowercase plural | `users`, `expenses` |
| Columns | camelCase | `userId`, `categoryId`, `createdAt` |
| Primary keys | `id` (UUID) | `id CHAR(36)` |
| Foreign keys | `entityId` | `userId`, `categoryId` |
| Soft-delete flag | `active` | `active BOOLEAN DEFAULT true` |

---

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Use ES Modules (`"type": "module"` in `package.json`). All local imports must end with `.js` extension.

---

## Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

Run `npm run typecheck` to verify type safety after changes.

---

## When Creating a New Entity

Follow this order:

1. Create types in `src/types/entities/[entity].types.ts`
2. Create API types in `src/types/api/[entity].api.types.ts`
3. Create Model in `src/Models/[entity]Model.ts`
4. Create Controller in `src/Controllers/[entity]Controller.ts`
5. Create Router in `src/Routes/[entity]Router.ts`
6. Register router in `src/index.ts`
7. Create documentation in `docs/entities/` and `docs/endpoints/`
