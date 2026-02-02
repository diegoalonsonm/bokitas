# Pending Tasks Implementation Plan

> **Created**: 2026-01-29
>
> **Purpose**: Detailed plan for completing remaining Phase 1 tasks
>
> **Status**: Ready for Implementation

---

## Overview

Based on the current codebase analysis, the following Phase 1 tasks remain to be completed:

### Already Implemented (Update Documentation Only)

1. **Restaurant rating calculation** - Already in `RestaurantModel.updateRating()` called from ReviewModel after create/update/delete operations
2. **First review photo as restaurant cover** - Already in `ReviewModel.updatePhoto()` (lines 229-232) - sets restaurant's `urlfotoperfil` if null
3. **Supabase Storage buckets** - Already created via Supabase Console

---

## Remaining Tasks

| # | Task | Type | Est. Time | Dependencies |
|---|--------|------|-----------|----------------|
| 1 | Create storage RLS policies | SQL/MCP | 10 min | None |
| 2 | Create error middleware with custom error classes | Code | 30 min | None |
| 3 | Create async handler utility | Code | 10 min | Task 2 |
| 4 | Create 404 handler for undefined routes | Code | 5 min | Task 2 |
| 5 | Add error middleware to index.ts | Code | 5 min | Task 2,4 |
| 6 | Refactor controllers to use async handler | Code | 45 min | Task 3,5 |
| 7 | Update planning documents | Docs | 5 min | Tasks 1-6 |

**Total Estimated Time: ~1.5 - 2 hours**

---

## Task 1: Storage RLS Policies (SQL Migration)

**What**: Create Row Level Security policies for existing storage buckets

**Buckets (Already Created):**
- `profile-pictures` (public, 5MB)
- `restaurant-reviews` (public, 10MB)

**SQL to Execute via Supabase MCP:**

```sql
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile-pictures bucket
CREATE POLICY "Users can upload profile photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = 'profile-photos' AND
  (storage.foldername(name))[2] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  owner_id::text = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  owner_id::text = (SELECT auth.uid()::text)
);

-- RLS Policies for restaurant-reviews bucket
CREATE POLICY "Users can upload review photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-reviews' AND
  (storage.foldername(name))[1] = 'review-photos'
);

CREATE POLICY "Users can update their own review photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'restaurant-reviews' AND
  owner_id::text = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can delete their own review photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'restaurant-reviews' AND
  owner_id::text = (SELECT auth.uid()::text)
);

-- Ensure SELECT is allowed on public buckets (should be default but verify)
CREATE POLICY "Public can view profile-pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Public can view restaurant-reviews"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-reviews');
```

**Migration Name:** `add_storage_rls_policies`

**Expected Result:** Authenticated users can upload/update/delete their own files in both buckets. Public SELECT access for viewing.

---

## Task 2: Error Middleware with Custom Error Classes

**File to Create:** `src/Middleware/errorMiddleware.ts`

### Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}
```

### Error Handler Middleware

```typescript
import type { Error, Request, Response, NextFunction } from 'express'
import { AppError } from './errorMiddleware.js'
import { ERROR_CODES } from '../Utils/constants.js'

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    })

    if (isDevelopment && !err.isOperational) {
      console.error('Operational Error:', err)
    }

    return
  }

  // Handle Zod validation errors
  if ('issues' in err && Array.isArray(err.issues)) {
    res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: err.issues[0]?.message || 'Validation error'
      }
    })
    return
  }

  // Handle Supabase/Postgres errors
  const supabaseError = err as { code?: string; details?: string }

  if (supabaseError.code) {
    const statusCode = getSupabaseStatusCode(supabaseError.code)

    res.status(statusCode).json({
      success: false,
      error: {
        code: supabaseError.code,
        message: isDevelopment ? supabaseError.message : getSupabaseMessage(supabaseError.code)
      }
    })

    if (isDevelopment) {
      console.error('Supabase Error:', supabaseError)
    }

    return
  }

  // Handle unknown errors
  console.error('Unhandled Error:', err)

  res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: isDevelopment ? err.message : 'An unexpected error occurred'
    }
  })
}

/**
 * Map Supabase error codes to HTTP status codes
 */
function getSupabaseStatusCode(code: string): number {
  const codeMap: Record<string, number> = {
    PGRST116: 404, // Column not found
    PGRST106: 400, // Not null violation
    PGRST104: 400, // Duplicate key
    '23505': 409, // Unique violation
    '23503': 403, // Foreign key violation
    '23514': 400, // Check violation
  }

  return codeMap[code] || 500
}

/**
 * Get user-friendly message for common Supabase errors
 */
function getSupabaseMessage(code: string): string {
  const messageMap: Record<string, string> = {
    PGRST116: 'Resource not found',
    PGRST106: 'Missing required field',
    PGRST104: 'Duplicate entry',
    '23505': 'Resource already exists',
    '23503': 'Invalid reference',
    '23514': 'Data validation failed',
  }

  return messageMap[code] || 'Database error'
}
```

### 404 Handler for Undefined Routes

```typescript
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  })
}
```

---

## Task 3: Async Handler Utility

**File:** Add to `src/Middleware/errorMiddleware.ts` (or separate as `src/Utils/asyncHandler.ts`)

```typescript
import type { Request, Response, NextFunction, RequestHandler } from 'express'

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

/**
 * Wrapper for async route handlers to catch errors and pass to error middleware
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

---

## Task 4 & 5: Update `src/index.ts`

Add middleware registration:

```typescript
import express, { type Express, type Request, type Response } from 'express'
import cors from 'cors'
import { config } from 'dotenv'

// Import routers
import authRouter from './Routes/authRouter.js'
import userRouter from './Routes/userRouter.js'
import restaurantRouter from './Routes/restaurantRouter.js'
import reviewRouter from './Routes/reviewRouter.js'
import eatlistRouter from './Routes/eatlistRouter.js'
import foodTypeRouter from './Routes/foodTypeRouter.js'

// Import error middleware
import { errorHandler, notFoundHandler } from './Middleware/errorMiddleware.js'

config()

const PORT: number = parseInt(process.env.PORT || '3000', 10)
const app: Express = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

// Routes
app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/restaurants', restaurantRouter)
app.use('/reviews', reviewRouter)
app.use('/eatlist', eatlistRouter)
app.use('/food-types', foodTypeRouter)

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

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

## Task 6: Refactor Controllers to Use Async Handler

### Current Pattern (Before Refactor)

Each controller method has:
- Manual try/catch block
- Manual error handling with res.status().json()
- Repetitive error response structure

### New Pattern (After Refactor)

Controllers will:
- Throw errors instead of handling them
- Use `asyncHandler` wrapper in routers
- Global error handler catches all errors

### Example Refactor: `reviewController.ts`

**Before (Current):**
```typescript
static async getById(req: GetReviewRequest, res: Response, _next: unknown): Promise<void> {
  try {
    const validation = validateReviewId({ id: req.params.id })

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: validation.error.errors[0].message
        }
      })
      return
    }

    const review = await ReviewModel.getById({ id: validation.data.id })

    if (!review) {
      res.status(404).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: ERROR_MESSAGES.REVIEW_NOT_FOUND
        }
      })
      return
    }

    res.status(200).json({
      success: true,
      data: review
    })
  } catch (err) {
    console.error('Get review by ID error:', err)
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: (err as Error).message
      }
    })
  }
}
```

**After (Refactored):**
```typescript
import { NotFoundError, ValidationError } from '../Middleware/errorMiddleware.js'

static async getById(req: GetReviewRequest, res: Response): Promise<void> {
  const validation = validateReviewId({ id: req.params.id })

  if (!validation.success) {
    throw new ValidationError(validation.error.errors[0].message)
  }

  const review = await ReviewModel.getById({ id: validation.data.id })

  if (!review) {
    throw new NotFoundError(ERROR_MESSAGES.REVIEW_NOT_FOUND)
  }

  res.status(200).json({
    success: true,
    data: review
  })
}
```

### Example Router Update: `reviewRouter.ts`

**Before (Current):**
```typescript
import { Router } from 'express'
import { ReviewController } from '../Controllers/reviewController.js'

const reviewRouter = Router()

reviewRouter.get('/:id', ReviewController.getById)
// ... more routes

export default reviewRouter
```

**After (Refactored):**
```typescript
import { Router } from 'express'
import { ReviewController } from '../Controllers/reviewController.js'
import { asyncHandler } from '../Middleware/errorMiddleware.js'

const reviewRouter = Router()

reviewRouter.get('/:id', asyncHandler(ReviewController.getById))
// ... more routes with asyncHandler

export default reviewRouter
```

### Controllers to Refactor

1. **authController.ts** - 8 methods (register, login, logout, forgotPassword, resetPassword, me)
2. **userController.ts** - 6 methods (getProfile, updateProfile, deleteProfile, uploadPhoto, getReviews, getEatlist, getTop4)
3. **restaurantController.ts** - 7 methods (getAll, getById, getByFoursquareId, create, update, search, nearby, getReviews, getTopRated)
4. **reviewController.ts** - 5 methods (create, getById, update, delete, uploadPhoto)
5. **eatlistController.ts** - 4 methods (getAll, add, update, remove)
6. **foodTypeController.ts** - 2 methods (getAll, create)

**Total Methods:** ~32 methods

### Refactoring Benefits

- **Less code**: Remove ~400+ lines of try/catch blocks
- **Consistency**: All errors handled uniformly
- **Maintainability**: Easier to add new error types
- **Type safety**: Errors are strongly typed
- **Testability**: Easier to unit test controllers

---

## Task 7: Update Planning Documents

### Files to Update

1. **`BACKEND.md`**
   - Mark "Set up Supabase Storage buckets" as ✅
   - Mark "Error handling is consistent" as ✅
   - Mark "Restaurant ratings are calculated from reviews" as ✅
   - Mark "First review photo becomes restaurant cover" as ✅
   - Add note about error middleware implementation

2. **`PHASE1_PLANNING.md`**
   - Mark Task 7.1-7.2 (Storage buckets) as ✅ (with note: already created manually)
   - Mark Task 7.3 (RLS policies) as ✅
   - Mark Task 8.1-8.3 (Error handling) as ✅
   - Update Success Criteria section

3. **`AGENTS.md`**
   - Update Project State section
   - Remove completed items from "Pending Items (Phase 1)"
   - Add error middleware to "Implemented Entities"
   - Update "Recent Changes" with today's date

---

## Execution Order

1. **Storage RLS policies** (Task 1) - Run SQL migration via Supabase MCP
2. **Error middleware** (Task 2 & 3) - Create `src/Middleware/errorMiddleware.ts`
3. **Update index.ts** (Task 4 & 5) - Register middleware
4. **Refactor controllers** (Task 6) - One controller at a time:
   - Start with `authController.ts` (smallest)
   - Then `foodTypeController.ts` (smallest)
   - Then `eatlistController.ts`
   - Then `reviewController.ts`
   - Then `userController.ts`
   - Then `restaurantController.ts` (largest)
5. **Update documentation** (Task 7) - Final step

---

## Notes

### Storage Bucket Configuration

Buckets are already created with these settings:
- **profile-pictures**: Public access, 5MB max size
- **restaurant-reviews**: Public access, 10MB max size

Only RLS policies need to be added.

### Error Handler Design Decisions

1. **Development vs Production**
   - Development: Full error details + stack traces
   - Production: Generic error messages (security)

2. **Supabase Error Handling**
   - Map common PGRST codes to meaningful messages
   - Keep code in response for debugging
   - Log full error in development mode

3. **Zod Validation Errors**
   - Extract first validation issue
   - Return as 400 with VALIDATION_ERROR code

4. **Operational Errors**
   - Thrown by application logic (expected errors)
   - Handled gracefully with appropriate status codes
   - Not logged as critical

### Controller Refactoring Approach

1. **Keep validation inside controllers** (per user preference)
2. **Throw custom error classes** (NotFoundError, ValidationError, etc.)
3. **Remove all try/catch blocks**
4. **Use asyncHandler wrapper in routers**
5. **Test each controller after refactor**
6. **Run typecheck** after each refactor

---

## Success Criteria

Implementation is complete when:

- [ ] Storage RLS policies are created and tested
- [ ] Error middleware catches all exceptions
- [ ] All routes return consistent error JSON format
- [ ] 404 handler returns proper format
- [ ] All controllers refactored to use asyncHandler
- [ ] All try/catch blocks removed from controllers
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Planning documents updated
- [ ] Documentation reflects completed status

---

## Rollback Plan

If issues arise during refactoring:

1. **Git branch**: Create `feature/error-middleware` branch
2. **Incremental commits**: One controller per commit
3. **Quick rollback**: Easy to revert individual controllers
4. **Test after each**: Run `npm run typecheck` after each controller

---

## Post-Implementation

After all tasks complete, the API will have:

✅ Consistent error handling across all endpoints
✅ Proper 404 responses for undefined routes
✅ RLS policies protecting storage uploads
✅ Cleaner, more maintainable controller code
✅ Better error messages for debugging
✅ Phase 1 fully documented as complete
