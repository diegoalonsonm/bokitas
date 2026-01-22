# AGENTS.md — Backend Development Standards (Node.js / Express)

> **Purpose**: Standardize AI-assisted backend development using Claude Code, Open Code, and Cursor.
> 
> **Scope**: This document applies to the `/backend` directory of the monorepo. Frontend standards are maintained separately in `/frontend`.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
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
│   ├── Controllers/
│   ├── Models/
│   ├── Routes/
│   ├── docs/
│   ├── index.js
│   ├── package.json
│   └── AGENTS.md
└── README.md
```

---

## Backend Project Structure

```
backend/
├── Controllers/                   # Request handlers
│   └── [entity]Controller.js
│
├── Models/                        # Data access & business logic
│   ├── database/
│   │   └── db.js                  # Sequelize connection
│   ├── validations/
│   │   └── [entity]Validation.js  # Zod schemas
│   ├── nodemailer/
│   │   └── index.js               # Email configuration
│   └── [entity]Model.js           # Entity data access
│
├── Routes/                        # Express route definitions
│   └── [entity]Router.js
│
├── docs/
│   ├── entities/                  # Entity documentation
│   ├── endpoints/                 # API endpoint documentation
│   └── postmortem/                # Issue tracking
│
├── index.js                       # App entry point & middleware
├── package.json
├── .env                           # Environment variables (git ignored)
├── .env.example                   # Environment template (committed)
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

```javascript
// ❌ WRONG - Physical delete
static async deleteExpense({ id, userId }) {
    await db.sequelize.query(
        'DELETE FROM expense WHERE id = :id AND userId = :userId',
        { replacements: { id, userId }, type: db.sequelize.QueryTypes.DELETE }
    )
}

// ✅ CORRECT - Logical delete
static async softDeleteExpense({ id, userId }) {
    const result = await db.sequelize.query(
        'UPDATE expense SET active = false WHERE id = :id AND userId = :userId AND active = true',
        { replacements: { id, userId }, type: db.sequelize.QueryTypes.UPDATE }
    )

    if (result[0] === 0) {
        return { success: false, message: 'Expense not found or already deleted' }
    }

    return { success: true, message: 'Expense deleted successfully' }
}
```

**All GET queries must filter by `active = true`:**

```javascript
// ✅ CORRECT - Only return active records
static async getAllFromUser({ userId }) {
    const expenses = await db.sequelize.query(
        'SELECT * FROM expense WHERE userId = :userId AND active = true ORDER BY date DESC',
        { replacements: { userId }, type: db.sequelize.QueryTypes.SELECT }
    )
    return expenses
}
```

---

## Conventions

### File Naming

| Element | Convention | Example |
|---------|------------|---------|
| Controllers | camelCase + Controller | `expenseController.js` |
| Models | camelCase + Model | `expenseModel.js` |
| Routes | camelCase + Router | `expenseRouter.js` |
| Validations | camelCase + Validation | `userValidation.js` |

### Models (Models/[entity]Model.js)

Each model is a class with static async methods:

```javascript
// Models/expenseModel.js
import { db } from './database/db.js'
import { randomUUID } from 'crypto'

export class ExpenseModel {
    /**
     * Get all expenses for a user
     * @param {Object} params
     * @param {string} params.userId - User UUID
     * @returns {Array} Array of expenses
     */
    static async getAllFromUser({ userId }) {
        const expenses = await db.sequelize.query(
            'SELECT * FROM expense WHERE userId = :userId AND active = true ORDER BY date DESC',
            {
                replacements: { userId },
                type: db.sequelize.QueryTypes.SELECT
            }
        )
        return expenses
    }

    /**
     * Get a single expense by ID
     * @param {Object} params
     * @param {string} params.id - Expense UUID
     * @param {string} params.userId - User UUID (for security)
     * @returns {Object|null} Expense or null if not found
     */
    static async getExpenseById({ id, userId }) {
        try {
            const expense = await db.sequelize.query(
                'SELECT * FROM expense WHERE id = :id AND userId = :userId AND active = true',
                {
                    replacements: { id, userId },
                    type: db.sequelize.QueryTypes.SELECT
                }
            )
            return expense.length > 0 ? expense[0] : null
        } catch (err) {
            console.error('Error getting expense by ID:', err)
            throw err
        }
    }

    /**
     * Create a new expense
     * @param {Object} params
     * @param {string} params.userId - User UUID
     * @param {number} params.amount - Expense amount
     * @param {string} params.description - Expense description
     * @param {string} params.date - Date (YYYY-MM-DD)
     * @param {number} params.category - Category ID
     * @returns {Object} Created expense
     */
    static async addExpense({ userId, amount, description, date, category }) {
        try {
            const id = randomUUID()

            await db.sequelize.query(
                `INSERT INTO expense (id, description, categoryId, amount, date, userId, active)
                 VALUES (:id, :description, :category, :amount, :date, :userId, true)`,
                {
                    replacements: { id, description, category, amount, date, userId },
                    type: db.sequelize.QueryTypes.INSERT
                }
            )

            console.log('Expense created successfully with ID:', id)
            return { id, description, amount, date, categoryId: category, userId, active: true }
        } catch (err) {
            console.error('Error creating expense:', err)
            throw err
        }
    }

    /**
     * Update an existing expense
     * @param {Object} params
     * @param {string} params.id - Expense UUID
     * @param {string} params.userId - User UUID (for security)
     * @param {number} [params.amount] - New amount
     * @param {string} [params.description] - New description
     * @param {number} [params.category] - New category ID
     * @param {string} [params.date] - New date
     * @returns {Object} Update result
     */
    static async updateExpense({ id, userId, amount, description, category, date }) {
        try {
            const updates = []
            const replacements = { id, userId }

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
            const result = await db.sequelize.query(query, {
                replacements,
                type: db.sequelize.QueryTypes.UPDATE
            })

            if (result[0] === 0) {
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
     * @param {Object} params
     * @param {string} params.id - Expense UUID
     * @param {string} params.userId - User UUID (for security)
     * @returns {Object} Delete result
     */
    static async softDeleteExpense({ id, userId }) {
        try {
            const result = await db.sequelize.query(
                'UPDATE expense SET active = false WHERE id = :id AND userId = :userId AND active = true',
                {
                    replacements: { id, userId },
                    type: db.sequelize.QueryTypes.UPDATE
                }
            )

            if (result[0] === 0) {
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
- Use static async methods
- Use parameterized queries with `:replacements` (never concatenate)
- Generate UUIDs with `randomUUID()` from `crypto`
- Always include `userId` parameter for security
- All SELECT queries filter by `active = true`
- Delete methods perform LOGICAL delete only
- Include JSDoc comments for all methods
- Log operations with `console.log` / `console.error`

### Controllers (Controllers/[entity]Controller.js)

Controllers handle HTTP requests and responses:

```javascript
// Controllers/expenseController.js
import { ExpenseModel } from '../Models/expenseModel.js'
import { UserModel } from '../Models/userModel.js'

export class ExpenseController {
    /**
     * GET /expenses/:email
     * Get all expenses for a user
     */
    static async getAllFromUser(req, res) {
        try {
            const email = req.params.email
            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                return res.status(404).send('User not found')
            }

            const expenses = await ExpenseModel.getAllFromUser({ userId })
            res.json(expenses)
        } catch (err) {
            res.status(500).send('error: ' + err.message)
        }
    }

    /**
     * GET /expenses/single/:id?email=user@example.com
     * Get a single expense by ID
     */
    static async getExpenseById(req, res) {
        try {
            const { id } = req.params
            const email = req.query.email

            if (!email) {
                return res.status(400).send('Email is required')
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                return res.status(404).send('User not found')
            }

            const expense = await ExpenseModel.getExpenseById({ id, userId })

            if (!expense) {
                return res.status(404).send('Expense not found')
            }

            res.json(expense)
        } catch (err) {
            res.status(500).send('error: ' + err.message)
        }
    }

    /**
     * POST /expenses
     * Create a new expense
     */
    static async addExpense(req, res) {
        try {
            const { email, amount, description, category } = req.body
            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                return res.status(404).send('User not found')
            }

            const date = new Date().toISOString().split('T')[0]
            const expense = await ExpenseModel.addExpense({ userId, amount, description, date, category })
            res.json(expense)
        } catch (err) {
            res.status(500).send('error: ' + err.message)
        }
    }

    /**
     * PUT /expenses/:id
     * Update an existing expense
     */
    static async updateExpense(req, res) {
        try {
            const { id } = req.params
            const { email, amount, description, category, date } = req.body

            if (!email) {
                return res.status(400).send('Email is required')
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                return res.status(404).send('User not found')
            }

            // Validate amount if provided
            if (amount !== undefined && (isNaN(amount) || amount < 1)) {
                return res.status(400).send('Amount must be at least 1')
            }

            // Validate description if provided
            if (description !== undefined && (!description || description.trim().length < 3)) {
                return res.status(400).send('Description must be at least 3 characters')
            }

            // Validate category if provided
            if (category !== undefined && (!Number.isInteger(category) || category < 1)) {
                return res.status(400).send('Invalid category ID')
            }

            // Validate date if provided (should not be future date)
            if (date !== undefined) {
                const dateObj = new Date(date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                if (dateObj > today) {
                    return res.status(400).send('Date cannot be in the future')
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
                return res.status(404).send(result.message)
            }

            res.json({ success: true, message: result.message })
        } catch (err) {
            res.status(500).send('error: ' + err.message)
        }
    }

    /**
     * DELETE /expenses/:id
     * Soft delete an expense
     */
    static async deleteExpense(req, res) {
        try {
            const { id } = req.params
            const email = req.body.email || req.query.email

            if (!email) {
                return res.status(400).send('Email is required')
            }

            const userId = await UserModel.getUserIdByEmail({ email })

            if (!userId) {
                return res.status(404).send('User not found')
            }

            const result = await ExpenseModel.softDeleteExpense({ id, userId })

            if (!result.success) {
                return res.status(404).send(result.message)
            }

            res.json({ success: true, message: result.message })
        } catch (err) {
            res.status(500).send('error: ' + err.message)
        }
    }
}
```

**Controller conventions:**
- Use static async methods
- Always resolve `userId` from `email` for security
- Validate inputs before calling Model
- Return appropriate HTTP status codes:
  - `200` - Success (GET, PUT)
  - `201` - Created (POST) - optional, can use `200`
  - `400` - Bad request (validation errors)
  - `404` - Not found
  - `409` - Conflict (duplicate resource)
  - `500` - Server error
- Include JSDoc comments with route info
- Accept `email` from `req.body`, `req.query`, or `req.params` as appropriate

### Routes (Routes/[entity]Router.js)

Routes define API endpoints:

```javascript
// Routes/expenseRouter.js
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

### Database Connection (Models/database/db.js)

```javascript
// Models/database/db.js
import { Sequelize } from 'sequelize'
import { config } from 'dotenv'

config()

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
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

export const db = {}
db.sequelize = sequelize
```

### Validations (Models/validations/[entity]Validation.js)

Use Zod for schema validation:

```javascript
// Models/validations/userValidation.js
import z from 'zod'

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

export function validateUser({ object }) {
    return userSchema.safeParse(object)
}

export function validatePartialUser({ object }) {
    return userSchema.partial().safeParse(object)
}
```

### Entry Point (index.js)

```javascript
// index.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'

// Import routers
import userRouter from './Routes/userRouter.js'
import expenseRouter from './Routes/expenseRouter.js'
import incomeRouter from './Routes/incomeRouter.js'

config()

const PORT = process.env.PORT || 3000
const app = express()

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
app.get('/', (req, res) => {
    res.status(200).send('API is running')
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
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
| Files | camelCase | `expenseController.js` |
| Classes | PascalCase | `ExpenseController`, `ExpenseModel` |
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
| id | UUID | Yes | Primary key |
| userId | UUID | Yes | Foreign key to users |
| amount | number | Yes | Transaction amount |
| active | boolean | Yes | Soft delete flag (false = deleted) |

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
- `Models/expenseModel.js`
- `Controllers/expenseController.js`
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
3. Review existing Models before creating new ones
4. Remember: **ALL DELETES ARE LOGICAL** (active = false)

### When Creating a New Entity
1. Create Model in `Models/[entity]Model.js`
   - Include `active` field handling
   - All SELECT queries filter by `active = true`
   - Delete method uses UPDATE, not DELETE
2. Create Controller in `Controllers/[entity]Controller.js`
   - Resolve userId from email
   - Validate inputs
   - Handle errors with appropriate status codes
3. Create Router in `Routes/[entity]Router.js`
   - Define RESTful endpoints
   - Specific routes before generic routes
4. Register router in `index.js`
5. Create documentation in `docs/`

### When Fixing Bugs
1. Check postmortem folder for similar past issues
2. After fixing, create postmortem if:
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
    "nodemon": "^3.1.0"
  }
}
```

### Package.json Configuration

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  }
}
```

---

## Project State

<!-- AI: Update this section as the project evolves -->

### Current Status
- [ ] Project initialized
- [ ] Base structure created
- [ ] Core entities implemented
- [ ] Documentation complete

### Implemented Entities
_List entities here as they are created_

### Recent Changes
_None yet_

### Known Issues
_None yet_