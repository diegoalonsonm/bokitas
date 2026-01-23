# AGENTS.md — Backend Development Standards (Node.js / Express / TypeScript)

> **Purpose**: Standardize AI-assisted backend development using Claude Code, Open Code, and Cursor.
> 
> **Scope**: This document applies to the `/backend` directory of the monorepo. Frontend standards are maintained separately in `/frontend`.

---

## Tech Stack

- **Runtime**: Node.js latest LTS
- **Framework**: Express.js
- **Language**: TypeScript (ES Modules, strict mode)
- **ORM**: Sequelize (raw queries with parameterized replacements)
- **Database**: SQL-based (MySQL, PostgreSQL, etc.)
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Email**: Nodemailer

---

## Monorepo Structure

```
project-root/
├── frontend/              # Separate standards (Next.js)
│   └── ...
├── backend/               # This document applies here
│   ├── src/
│   ├── docs/
│   ├── package.json
│   ├── tsconfig.json
│   └── AGENTS.md
└── README.md
```

---

## Backend Project Structure

```
backend/
├── src/
│   ├── Controllers/                   # Request handlers
│   │   └── [entity]Controller.ts
│   │
│   ├── Models/                        # Data access & business logic
│   │   ├── database/
│   │   │   └── db.ts                  # Sequelize connection
│   │   ├── validations/
│   │   │   └── [entity]Validation.ts  # Zod schemas
│   │   ├── nodemailer/
│   │   │   └── index.ts               # Email configuration
│   │   └── [entity]Model.ts           # Entity data access
│   │
│   ├── Routes/                        # Express route definitions
│   │   └── [entity]Router.ts
│   │
│   ├── types/                         # TypeScript type definitions
│   │   ├── index.ts                   # Shared types
│   │   ├── entities/                  # Entity-specific types
│   │   │   └── [entity].types.ts
│   │   └── api/                       # API request/response types
│   │       └── [entity].api.types.ts
│   │
│   └── index.ts                       # App entry point & middleware
│
├── docs/
│   ├── entities/                      # Entity documentation
│   ├── endpoints/                     # API endpoint documentation
│   └── postmortem/                    # Issue tracking
│
├── package.json
├── tsconfig.json
├── .env                               # Environment variables (git ignored)
├── .env.example                       # Environment template (committed)
└── AGENTS.md
```

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Routes (Router)                          │
│                 Defines API endpoints                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ calls
┌─────────────────────▼───────────────────────────────────────┐
│                  Controllers (Controller)                    │
│           Handles requests, validation, responses            │
└─────────────────────┬───────────────────────────────────────┘
                      │ calls
┌─────────────────────▼───────────────────────────────────────┐
│                    Models (Model)                            │
│              Executes database queries                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ calls
┌─────────────────────▼───────────────────────────────────────┘
│                      Database                                │
│              (MySQL, PostgreSQL, etc.)                       │
└─────────────────────────────────────────────────────────────┘
```

**Data flow**: `Router → Controller → Model → Database`

---

## Critical Rules

### Logical Deletes Only (No Physical Deletes)

**NEVER perform physical deletes.** All deletions must be logical (soft deletes) using the `active` flag.

```typescript
// ❌ WRONG - Physical delete
static async deleteExpense({ id, userId }: DeleteExpenseParams): Promise<void> {
    await db.sequelize.query(
        'DELETE FROM expense WHERE id = :id AND userId = :userId',
        { replacements: { id, userId }, type: QueryTypes.DELETE }
    )
}

// ✅ CORRECT - Logical delete
static async softDeleteExpense({ id, userId }: DeleteExpenseParams): Promise<OperationResult> {
    const [affectedRows] = await db.sequelize.query<ResultSetHeader>(
        'UPDATE expense SET active = false WHERE id = :id AND userId = :userId AND active = true',
        { replacements: { id, userId }, type: QueryTypes.UPDATE }
    )

    if (affectedRows === 0) {
        return { success: false, message: 'Expense not found or already deleted' }
    }

    return { success: true, message: 'Expense deleted successfully' }
}
```

**All GET queries must filter by `active = true`:**

```typescript
// ✅ CORRECT - Only return active records
static async getAllFromUser({ userId }: GetAllParams): Promise<Expense[]> {
    const expenses = await db.sequelize.query<Expense>(
        'SELECT * FROM expense WHERE userId = :userId AND active = true ORDER BY date DESC',
        { replacements: { userId }, type: QueryTypes.SELECT }
    )
    return expenses
}
```

---

## Conventions

### File Naming

| Element | Convention | Example |
|---------|------------|---------|
| Controllers | camelCase + Controller | `expenseController.ts` |
| Models | camelCase + Model | `expenseModel.ts` |
| Routes | camelCase + Router | `expenseRouter.ts` |
| Validations | camelCase + Validation | `userValidation.ts` |
| Types | camelCase + .types | `expense.types.ts` |

### Types (src/types/)

Define all types in the `types/` directory:

```typescript
// src/types/index.ts
export interface OperationResult {
    success: boolean
    message: string
}

export interface PaginationParams {
    page?: number
    limit?: number
}
```

```typescript
// src/types/entities/expense.types.ts
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

export interface UpdateExpenseParams {
    id: string
    userId: string
    amount?: number
    description?: string
    category?: number
    date?: string
}

export interface DeleteExpenseParams {
    id: string
    userId: string
}

export interface GetExpenseParams {
    id: string
    userId: string
}

export interface GetAllExpensesParams {
    userId: string
}
```

```typescript
// src/types/entities/user.types.ts
export interface User {
    id: string
    name: string
    lastName: string
    email: string
    password: string
    availableBudget: number
    createdAt?: Date
    updatedAt?: Date
}

export interface CreateUserParams {
    name: string
    lastName: string
    email: string
    password: string
}

export interface GetUserByEmailParams {
    email: string
}
```

```typescript
// src/types/api/expense.api.types.ts
import type { Request } from 'express'

export interface CreateExpenseBody {
    email: string
    amount: number
    description: string
    category: number
}

export interface UpdateExpenseBody {
    email: string
    amount?: number
    description?: string
    category?: number
    date?: string
}

export interface GetExpenseQuery {
    email: string
}

export interface ExpenseParams {
    id: string
    email?: string
}

export type CreateExpenseRequest = Request<{}, {}, CreateExpenseBody>
export type UpdateExpenseRequest = Request<ExpenseParams, {}, UpdateExpenseBody>
export type GetExpenseRequest = Request<ExpenseParams, {}, {}, GetExpenseQuery>
export type DeleteExpenseRequest = Request<ExpenseParams, {}, { email?: string }, { email?: string }>
```

### Models (src/Models/[entity]Model.ts)

Each model is a class with static async methods:

```typescript
// src/Models/expenseModel.ts
import { db } from './database/db.js'
import { QueryTypes } from 'sequelize'
import { randomUUID } from 'crypto'
import type { 
    Expense, 
    CreateExpenseParams, 
    UpdateExpenseParams, 
    DeleteExpenseParams,
    GetExpenseParams,
    GetAllExpensesParams 
} from '../types/entities/expense.types.js'
import type { OperationResult } from '../types/index.js'

export class ExpenseModel {
    /**
     * Get all expenses for a user
     */
    static async getAllFromUser({ userId }: GetAllExpensesParams): Promise<Expense[]> {
        const expenses = await db.sequelize.query<Expense>(
            'SELECT * FROM expense WHERE userId = :userId AND active = true ORDER BY date DESC',
            {
                replacements: { userId },
                type: QueryTypes.SELECT
            }
        )
        return expenses
    }

    /**
     * Get a single expense by ID
     */
    static async getExpenseById({ id, userId }: GetExpenseParams): Promise<Expense | null> {
        try {
            const expenses = await db.sequelize.query<Expense>(
                'SELECT * FROM expense WHERE id = :id AND userId = :userId AND active = true',
                {
                    replacements: { id, userId },
                    type: QueryTypes.SELECT
                }
            )
            return expenses.length > 0 ? expenses[0] : null
        } catch (err) {
            console.error('Error getting expense by ID:', err)
            throw err
        }
    }

    /**
     * Create a new expense
     */
    static async addExpense({ userId, amount, description, date, category }: CreateExpenseParams): Promise<Expense> {
        try {
            const id = randomUUID()

            await db.sequelize.query(
                `INSERT INTO expense (id, description, categoryId, amount, date, userId, active)
                 VALUES (:id, :description, :category, :amount, :date, :userId, true)`,
                {
                    replacements: { id, description, category, amount, date, userId },
                    type: QueryTypes.INSERT
                }
            )

            console.log('Expense created successfully with ID:', id)
            
            return { 
                id, 
                description, 
                amount, 
                date, 
                categoryId: category, 
                userId, 
                active: true 
            }
        } catch (err) {
            console.error('Error creating expense:', err)
            throw err
        }
    }

    /**
     * Update an existing expense
     */
    static async updateExpense({ id, userId, amount, description, category, date }: UpdateExpenseParams): Promise<OperationResult> {
        try {
            const updates: string[] = []
            const replacements: Record<string, unknown> = { id, userId }

            if (amount !== undefined && amount !== null) {
                updates.push('amount = :amount')
                replacements.amount = amount
            }

            if (description !== undefined && description !== null) {
                updates.push('description = :description')
                replacements.description = description
            }

            if (category !== undefined && category !== null) {
                updates.push('categoryId = :category')
                replacements.category = category
            }

            if (date !== undefined && date !== null) {
                updates.push('date = :date')
                replacements.date = date
            }

            if (updates.length === 0) {
                return { success: false, message: 'No fields to update' }
            }

            const query = `UPDATE expense SET ${updates.join(', ')} WHERE id = :id AND userId = :userId AND active = true`
            const [, affectedRows] = await db.sequelize.query(query, {
                replacements,
                type: QueryTypes.UPDATE
            })

            if (affectedRows === 0) {
                return { success: false, message: 'Expense not found or already deleted' }
            }

            console.log('Expense updated successfully:', id)
            return { success: true, message: 'Expense updated successfully' }
        } catch (err) {
            console.error('Error updating expense:', err)
            throw err
        }
    }

    /**
     * Soft delete an expense (set active = false)
     */
    static async softDeleteExpense({ id, userId }: DeleteExpenseParams): Promise<OperationResult> {
        try {
            const [, affectedRows] = await db.sequelize.query(
                'UPDATE expense SET active = false WHERE id = :id AND userId = :userId AND active = true',
                {
                    replacements: { id, userId },
                    type: QueryTypes.UPDATE
                }
            )

            if (affectedRows === 0) {
                return { success: false, message: 'Expense not found or already deleted' }
            }

            console.log('Expense soft deleted successfully:', id)
            return { success: true, message: 'Expense deleted successfully' }
        } catch (err) {
            console.error('Error soft deleting expense:', err)
            throw err
        }
    }
}
```

**Model conventions:**
- Use static async methods with proper return types
- Use parameterized queries with `:replacements` (never concatenate)
- Generate UUIDs with `randomUUID()` from `crypto`
- Always include `userId` parameter for security
- All SELECT queries filter by `active = true`
- Delete methods perform LOGICAL delete only
- Import types from `types/` directory
- Log operations with `console.log` / `console.error`

### Controllers (src/Controllers/[entity]Controller.ts)

Controllers handle HTTP requests and responses:

```typescript
// src/Controllers/expenseController.ts
import type { Request, Response } from 'express'
import { ExpenseModel } from '../Models/expenseModel.js'
import { UserModel } from '../Models/userModel.js'
import type { 
    CreateExpenseRequest, 
    UpdateExpenseRequest, 
    GetExpenseRequest,
    DeleteExpenseRequest 
} from '../types/api/expense.api.types.js'

export class ExpenseController {
    /**
     * GET /expenses/:email
     * Get all expenses for a user
     */
    static async getAllFromUser(req: Request<{ email: string }>, res: Response): Promise<void> {
        try {
            const { email } = req.params
            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                res.status(404).send('User not found')
                return
            }

            const expenses = await ExpenseModel.getAllFromUser({ userId })
            res.json(expenses)
        } catch (err) {
            const error = err as Error
            res.status(500).send('error: ' + error.message)
        }
    }

    /**
     * GET /expenses/single/:id?email=user@example.com
     * Get a single expense by ID
     */
    static async getExpenseById(req: GetExpenseRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { email } = req.query

            if (!email) {
                res.status(400).send('Email is required')
                return
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                res.status(404).send('User not found')
                return
            }

            const expense = await ExpenseModel.getExpenseById({ id, userId })

            if (!expense) {
                res.status(404).send('Expense not found')
                return
            }

            res.json(expense)
        } catch (err) {
            const error = err as Error
            res.status(500).send('error: ' + error.message)
        }
    }

    /**
     * POST /expenses
     * Create a new expense
     */
    static async addExpense(req: CreateExpenseRequest, res: Response): Promise<void> {
        try {
            const { email, amount, description, category } = req.body
            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                res.status(404).send('User not found')
                return
            }

            const date = new Date().toISOString().split('T')[0]
            const expense = await ExpenseModel.addExpense({ userId, amount, description, date, category })
            res.json(expense)
        } catch (err) {
            const error = err as Error
            res.status(500).send('error: ' + error.message)
        }
    }

    /**
     * PUT /expenses/:id
     * Update an existing expense
     */
    static async updateExpense(req: UpdateExpenseRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { email, amount, description, category, date } = req.body

            if (!email) {
                res.status(400).send('Email is required')
                return
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                res.status(404).send('User not found')
                return
            }

            // Validate amount if provided
            if (amount !== undefined && (isNaN(amount) || amount < 1)) {
                res.status(400).send('Amount must be at least 1')
                return
            }

            // Validate description if provided
            if (description !== undefined && (!description || description.trim().length < 3)) {
                res.status(400).send('Description must be at least 3 characters')
                return
            }

            // Validate category if provided
            if (category !== undefined && (!Number.isInteger(category) || category < 1)) {
                res.status(400).send('Invalid category ID')
                return
            }

            // Validate date if provided (should not be future date)
            if (date !== undefined) {
                const dateObj = new Date(date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                if (dateObj > today) {
                    res.status(400).send('Date cannot be in the future')
                    return
                }
            }

            const result = await ExpenseModel.updateExpense({
                id,
                userId,
                amount,
                description,
                category,
                date
            })

            if (!result.success) {
                res.status(404).send(result.message)
                return
            }

            res.json({ success: true, message: result.message })
        } catch (err) {
            const error = err as Error
            res.status(500).send('error: ' + error.message)
        }
    }

    /**
     * DELETE /expenses/:id
     * Soft delete an expense
     */
    static async deleteExpense(req: DeleteExpenseRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const email = req.body.email || req.query.email

            if (!email) {
                res.status(400).send('Email is required')
                return
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                res.status(404).send('User not found')
                return
            }

            const result = await ExpenseModel.softDeleteExpense({ id, userId })

            if (!result.success) {
                res.status(404).send(result.message)
                return
            }

            res.json({ success: true, message: result.message })
        } catch (err) {
            const error = err as Error
            res.status(500).send('error: ' + error.message)
        }
    }
}
```

**Controller conventions:**
- Use static async methods with typed parameters
- Type `req` and `res` using Express types or custom request types
- Use `Promise<void>` return type (response sent via `res`)
- Use `return` after sending response to prevent further execution
- Always resolve `userId` from `email` for security
- Validate inputs before calling Model
- Cast errors with `as Error` for type safety
- Return appropriate HTTP status codes:
  - `200` - Success (GET, PUT)
  - `201` - Created (POST) - optional, can use `200`
  - `400` - Bad request (validation errors)
  - `404` - Not found
  - `409` - Conflict (duplicate resource)
  - `500` - Server error

### Routes (src/Routes/[entity]Router.ts)

Routes define API endpoints:

```typescript
// src/Routes/expenseRouter.ts
import { Router } from 'express'
import { ExpenseController } from '../Controllers/expenseController.js'

const expenseRouter = Router()

// GET routes
expenseRouter.get('/lastFive/:email', ExpenseController.getLastFiveFromUser)
expenseRouter.get('/totalAmount/:email', ExpenseController.getTotalAmountFromUser)
expenseRouter.get('/amountByCategory/:email', ExpenseController.getAmountByCategory)
expenseRouter.get('/single/:id', ExpenseController.getExpenseById)
expenseRouter.get('/:email', ExpenseController.getAllFromUser)

// POST routes
expenseRouter.post('/', ExpenseController.addExpense)

// PUT routes
expenseRouter.put('/:id', ExpenseController.updateExpense)

// DELETE routes
expenseRouter.delete('/:id', ExpenseController.deleteExpense)

export default expenseRouter
```

**Router conventions:**
- Define specific routes before generic routes (e.g., `/single/:id` before `/:email`)
- Group routes by HTTP method
- Use RESTful patterns:
  - `GET /:email` - Get all for user
  - `GET /single/:id` - Get one by ID
  - `POST /` - Create new
  - `PUT /:id` - Update existing
  - `DELETE /:id` - Soft delete

### Database Connection (src/Models/database/db.ts)

```typescript
// src/Models/database/db.ts
import { Sequelize } from 'sequelize'
import { config } from 'dotenv'

config()

const sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // or 'postgres', 'sqlite', etc.
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
)

interface Database {
    sequelize: Sequelize
}

export const db: Database = {
    sequelize
}
```

### Validations (src/Models/validations/[entity]Validation.ts)

Use Zod for schema validation:

```typescript
// src/Models/validations/userValidation.ts
import { z } from 'zod'

const userSchema = z.object({
    name: z.string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string'
    }).min(2, 'Name must be at least 2 characters'),
    lastName: z.string({
        required_error: 'Last name is required',
        invalid_type_error: 'Last name must be a string'
    }).min(2, 'Last name must be at least 2 characters'),
    email: z.string({
        required_error: 'Email is required'
    }).email('Must be a valid email'),
    password: z.string({
        required_error: 'Password is required'
    }).min(6, 'Password must be at least 6 characters')
})

export type UserInput = z.infer<typeof userSchema>

export function validateUser(object: unknown): z.SafeParseReturnType<unknown, UserInput> {
    return userSchema.safeParse(object)
}

export function validatePartialUser(object: unknown): z.SafeParseReturnType<unknown, Partial<UserInput>> {
    return userSchema.partial().safeParse(object)
}
```

### Entry Point (src/index.ts)

```typescript
// src/index.ts
import express, { type Express, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'

// Import routers
import userRouter from './Routes/userRouter.js'
import expenseRouter from './Routes/expenseRouter.js'
import incomeRouter from './Routes/incomeRouter.js'

config()

const PORT: number = parseInt(process.env.PORT || '3000', 10)
const app: Express = express()

// Middleware
app.use(express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(cookieParser())

// Routes
app.use('/users', userRouter)
app.use('/expenses', expenseRouter)
app.use('/incomes', incomeRouter)

// Health check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).send('API is running')
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
```

---

## TypeScript Configuration

### tsconfig.json

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

### Package.json Scripts

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## SQL Best Practices

These practices apply regardless of the database provider:

### Table Design

- Every table **MUST** have an `active` column for logical deletes
- Use `UUID` / `CHAR(36)` for primary keys
- Include `createdAt` and `updatedAt` timestamps where appropriate

### Query Patterns

```sql
-- CREATE: Always set active = true
INSERT INTO expense (id, description, amount, userId, active)
VALUES (:id, :description, :amount, :userId, true);

-- READ: Always filter by active = true
SELECT * FROM expense WHERE userId = :userId AND active = true;
SELECT * FROM expense WHERE id = :id AND userId = :userId AND active = true;

-- UPDATE: Only update active records
UPDATE expense SET amount = :amount WHERE id = :id AND userId = :userId AND active = true;

-- DELETE: Never use DELETE, always use UPDATE
UPDATE expense SET active = false WHERE id = :id AND userId = :userId AND active = true;
```

### Naming Conventions (Database)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | lowercase plural | `users`, `expenses`, `categories` |
| Columns | camelCase | `userId`, `categoryId`, `createdAt` |
| Primary Keys | `id` | `id` (UUID) |
| Foreign Keys | entityId | `userId`, `categoryId` |
| Boolean flags | descriptive | `active`, `isVerified` |

---

## Naming Conventions Summary

| Element | Convention | Example |
|---------|------------|---------|
| Files | camelCase | `expenseController.ts` |
| Classes | PascalCase | `ExpenseController`, `ExpenseModel` |
| Interfaces | PascalCase | `Expense`, `CreateExpenseParams` |
| Type aliases | PascalCase | `CreateExpenseRequest` |
| Methods | camelCase | `getAllFromUser`, `softDeleteExpense` |
| Variables | camelCase | `userId`, `totalAmount` |
| Constants | UPPER_SNAKE_CASE | `PORT`, `JWT_SECRET` |
| Routes | lowercase with hyphens | `/expenses`, `/amount-by-category` |
| Database tables | lowercase | `users`, `expenses` |
| Database columns | camelCase | `userId`, `createdAt` |

---

## Documentation Requirements

### Entity Docs (`docs/entities/ENTITY.md`)

```markdown
# Entity Name

Brief description of the entity and its purpose.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string (UUID) | Yes | Primary key |
| userId | string (UUID) | Yes | Foreign key to users |
| amount | number | Yes | Transaction amount |
| active | boolean | Yes | Soft delete flag (false = deleted) |

## TypeScript Interface

\`\`\`typescript
interface Expense {
    id: string
    userId: string
    categoryId: number
    description: string
    amount: number
    date: string
    active: boolean
}
\`\`\`

## Relationships

- Belongs to User (userId)
- Belongs to Category (categoryId)

## Validation Rules

- amount: must be >= 1
- description: minimum 3 characters
```

### Endpoint Docs (`docs/endpoints/ENTITY.md`)

```markdown
# Expense Endpoints

## GET /expenses/:email
Get all expenses for a user.

**Response:** `200 OK`
\`\`\`json
[
  {
    "id": "uuid",
    "description": "Groceries",
    "amount": 50.00,
    "date": "2025-01-20",
    "categoryId": 1,
    "active": true
  }
]
\`\`\`

## POST /expenses
Create a new expense.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "amount": 50.00,
  "description": "Groceries",
  "category": 1
}
\`\`\`

**Response:** `200 OK`

## DELETE /expenses/:id
Soft delete an expense (sets active = false).

**Request Body or Query:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
  "success": true,
  "message": "Expense deleted successfully"
}
\`\`\`
```

### Postmortem Docs (`docs/postmortem/MM-DD-YY_ENTITY_ISSUE.md`)

```markdown
# [MM-DD-YY] - [Entity/Feature] - [Issue Summary]

## Problem
What went wrong and how it manifested.

## Root Cause
Why it happened (after investigation).

## Solution
What was done to fix it.

## Failed Attempts (if any)
- Attempt 1: Why it didn't work

## Prevention
How to avoid this in the future.

## Related Files
- `src/Models/expenseModel.ts`
- `src/Controllers/expenseController.ts`
- `src/types/entities/expense.types.ts`
```

---

## Environment Variables

Create a `.env` file (git ignored) and `.env.example` (committed):

```bash
# .env.example

# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_NAME=myapp
DB_USER=root
DB_PASSWORD=

# Authentication
JWT_SECRET=your-secret-key-at-least-32-characters

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Security notes:**
- Never commit `.env` file
- Use strong JWT secrets (32+ characters)
- Use app-specific passwords for email services

---

## AI Agent Instructions

### On Every Session Start
1. Read this file (`AGENTS.md`)
2. Check `docs/postmortem/` for recent issues
3. Review existing types in `src/types/` before creating new ones
4. Review existing Models before creating new ones
5. Remember: **ALL DELETES ARE LOGICAL** (active = false)

### When Creating a New Entity
1. Create types in `src/types/entities/[entity].types.ts`
   - Entity interface
   - CRUD parameter interfaces
2. Create API types in `src/types/api/[entity].api.types.ts`
   - Request body interfaces
   - Typed request types
3. Create Model in `src/Models/[entity]Model.ts`
   - Import types from `types/`
   - Include `active` field handling
   - All SELECT queries filter by `active = true`
   - Delete method uses UPDATE, not DELETE
4. Create Controller in `src/Controllers/[entity]Controller.ts`
   - Import types from `types/`
   - Type all request handlers
   - Resolve userId from email
   - Validate inputs
   - Handle errors with appropriate status codes
5. Create Router in `src/Routes/[entity]Router.ts`
   - Define RESTful endpoints
   - Specific routes before generic routes
6. Register router in `src/index.ts`
7. Create documentation in `docs/`

### When Fixing Bugs
1. Check postmortem folder for similar past issues
2. Run `npm run typecheck` to verify type safety
3. After fixing, create postmortem if:
   - Fix required multiple attempts
   - Issue was unexpected or confusing
   - Pattern could repeat elsewhere

### Documentation Updates
- **Entity created/updated/deleted** → Update `docs/entities/`
- **Endpoint created/updated/deleted** → Update `docs/endpoints/`
- **Bug fixed after struggle** → Create postmortem

---

## Default Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.9.3",
    "sequelize": "^6.37.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

---

## Project State

<!-- AI: Update this section as project evolves -->

### Current Status
- [x] Project initialized
- [x] TypeScript configured
- [x] Base structure created
- [ ] Core entities implemented
- [ ] Documentation complete

### Implemented Entities
- User (TypeScript) - CRUD operations, reviews, eatlist, top4
- Auth (TypeScript) - Register, login, logout, forgot password, reset password, me
- Authentication Middleware (TypeScript) - JWT verification with Supabase

### Recent Changes
- 2026-01-23: Migrated from JavaScript to TypeScript following AGENTS.md standards
- 2026-01-23: Created src/ directory structure with proper TypeScript types
- 2026-01-23: Implemented auth and user modules with full type safety
- 2026-01-23: Type checking passes successfully

### Known Issues
_None yet_

### Known Issues
_None yet_