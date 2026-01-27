# Review Module Implementation Plan

> **Document**: Detailed implementation plan for the Review module
>
> **Project**: Bokitas - A "Letterboxd for restaurants" app focused on Costa Rica
>
> **Created**: 2026-01-27
>
> **Status**: Ready for Implementation

---

## Overview

This document provides a step-by-step implementation plan for the Review module (Task 4 in PHASE1_PLANNING.md). The module allows users to create, read, update, and delete restaurant reviews with optional photos.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multiple reviews per user per restaurant | **Yes** | Letterboxd-style - allows tracking visits over time, logging each experience |
| Restaurant ID handling | **Both UUID and Foursquare ID** | Flexibility - auto-create restaurant from Foursquare if needed |
| Comment (comentario) | **Optional** | Users can leave rating-only reviews |
| Photos per review (MVP) | **1 photo max** | Simplicity for MVP, can expand later |
| Rating recalculation | **Automatic** | Triggered after every create/update/delete |
| Restaurant cover photo | **First review photo** | Community-driven content (like Letterboxd) |

---

## Current State Analysis

### What Already Exists

| Component | Location | Status |
|-----------|----------|--------|
| Database table `review` | Supabase | ✅ Ready (with RLS) |
| Entity documentation | `docs/entities/review.md` | ✅ Complete |
| `RestaurantModel.getReviews()` | `src/Models/restaurantModel.ts:351` | ✅ Working |
| `RestaurantModel.updateRating()` | `src/Models/restaurantModel.ts:404` | ✅ Working |
| `UserModel.getReviews()` | `src/Models/userModel.ts:171` | ✅ Working |
| `StorageService.uploadReviewPhoto()` | `src/Services/storageService.ts` | ✅ Working |
| Upload middleware | `src/Middleware/uploadMiddleware.ts` | ✅ Working |
| Error constants | `src/Utils/constants.ts` | ✅ `REVIEW_NOT_FOUND` exists |

### What Needs Implementation

| Component | File Path | Status |
|-----------|-----------|--------|
| Review Types | `src/types/entities/review.types.ts` | ❌ Not created |
| Review API Types | `src/types/api/review.api.types.ts` | ❌ Not created |
| Review Validation | `src/Models/validations/reviewValidation.ts` | ❌ Not created |
| Review Model | `src/Models/reviewModel.ts` | ❌ Not created |
| Review Controller | `src/Controllers/reviewController.ts` | ❌ Not created |
| Review Router | `src/Routes/reviewRouter.ts` | ❌ Not created |
| Endpoint Documentation | `docs/endpoints/review-endpoints.md` | ❌ Not created |

---

## Database Schema Reference

### Table: `review`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| comentario | text | NULL | Review comment text (optional) |
| puntuacion | numeric | NOT NULL, CHECK 1-5 | Rating (1-5) |
| urlfotoreview | text | NULL | Review photo URL (optional) |
| idrestaurante | UUID | FK -> restaurante | Restaurant reviewed |
| idusuario | UUID | FK -> usuario | Review author |
| idestado | UUID | FK -> estado | Review status |
| active | boolean | DEFAULT true | Soft delete flag |
| createdat | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updatedat | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reviews` | Create a review | Required |
| GET | `/reviews/:id` | Get review details | Public |
| PUT | `/reviews/:id` | Update own review | Owner only |
| DELETE | `/reviews/:id` | Soft delete own review | Owner only |
| POST | `/reviews/:id/photo` | Upload review photo | Owner only |

### Endpoint Details

#### POST /reviews - Create Review

**Authentication:** Required

**Request Body:**
```json
{
  "restaurantId": "uuid-or-foursquare-id",
  "puntuacion": 5,
  "comentario": "Great food! (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "puntuacion": 5,
    "comentario": "Great food!",
    "urlfotoreview": null,
    "idrestaurante": "restaurant-uuid",
    "idusuario": "user-uuid",
    "createdat": "2026-01-27T12:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid rating, missing restaurantId)
- `401` - Unauthorized (no auth token)
- `404` - Restaurant not found (invalid Foursquare ID)
- `500` - Server error

---

#### GET /reviews/:id - Get Review Details

**Authentication:** Public

**URL Params:** `id` - Review UUID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "puntuacion": 5,
    "comentario": "Great food!",
    "urlfotoreview": "https://storage.url/photo.jpg",
    "idrestaurante": "restaurant-uuid",
    "idusuario": "user-uuid",
    "createdat": "2026-01-27T12:00:00Z",
    "usuario": {
      "id": "user-uuid",
      "nombre": "Juan",
      "primerapellido": "Pérez",
      "urlfotoperfil": "https://storage.url/profile.jpg"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid review ID format
- `404` - Review not found
- `500` - Server error

---

#### PUT /reviews/:id - Update Review

**Authentication:** Required (Owner only)

**URL Params:** `id` - Review UUID

**Request Body:**
```json
{
  "puntuacion": 4,
  "comentario": "Updated comment (optional)"
}
```

*Note: At least one field must be provided.*

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "puntuacion": 4,
    "comentario": "Updated comment",
    "updatedat": "2026-01-27T14:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (no fields provided, invalid rating)
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Review not found
- `500` - Server error

---

#### DELETE /reviews/:id - Soft Delete Review

**Authentication:** Required (Owner only)

**URL Params:** `id` - Review UUID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**
- `400` - Invalid review ID format
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Review not found
- `500` - Server error

---

#### POST /reviews/:id/photo - Upload Review Photo

**Authentication:** Required (Owner only)

**URL Params:** `id` - Review UUID

**Request Body:** `multipart/form-data`
- `photo` - Image file (JPEG, PNG, WebP, max 10MB)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "photoUrl": "https://storage.supabase.co/bucket/reviews/photo.jpg"
  }
}
```

**Error Responses:**
- `400` - Invalid review ID, no file, invalid file type, file too large
- `401` - Unauthorized
- `403` - Forbidden (not the owner)
- `404` - Review not found
- `500` - Server error

---

## Implementation Tasks

### Task 1: TypeScript Types (~20 min)

#### 1.1 Create `src/types/entities/review.types.ts`

```typescript
// Review entity matching database schema
export interface Review {
  id: string
  comentario: string | null
  puntuacion: number
  urlfotoreview: string | null
  idrestaurante: string
  idusuario: string
  idestado: string | null
  active: boolean
  createdat: string
  updatedat: string
}

// Review with joined user info (for display)
export interface ReviewWithUser extends Review {
  usuario: {
    id: string
    nombre: string
    primerapellido: string
    urlfotoperfil: string | null
  }
}

// Review with joined restaurant info (for user's review list)
export interface ReviewWithRestaurant extends Review {
  restaurante: {
    id: string
    nombre: string
    urlfotoperfil: string | null
  }
}

// CRUD Parameters
export interface CreateReviewParams {
  restaurantId: string       // Internal UUID or Foursquare ID
  userId: string
  puntuacion: number
  comentario?: string | null
}

export interface UpdateReviewParams {
  id: string
  userId: string             // For ownership verification
  puntuacion?: number
  comentario?: string | null
}

export interface DeleteReviewParams {
  id: string
  userId: string             // For ownership verification
}

export interface GetReviewParams {
  id: string
}

export interface UploadReviewPhotoParams {
  id: string
  userId: string             // For ownership verification
}
```

#### 1.2 Create `src/types/api/review.api.types.ts`

```typescript
import type { Request } from 'express'

export interface CreateReviewBody {
  restaurantId: string       // Internal UUID or Foursquare ID
  puntuacion: number         // 1-5
  comentario?: string | null
}

export interface UpdateReviewBody {
  puntuacion?: number
  comentario?: string | null
}

export interface ReviewParams {
  id: string
}

// Typed request aliases
export type CreateReviewRequest = Request<object, unknown, CreateReviewBody>
export type UpdateReviewRequest = Request<ReviewParams, unknown, UpdateReviewBody>
export type GetReviewRequest = Request<ReviewParams>
export type DeleteReviewRequest = Request<ReviewParams>
export type UploadReviewPhotoRequest = Request<ReviewParams>
```

---

### Task 2: Review Validation (~15 min)

#### Create `src/Models/validations/reviewValidation.ts`

```typescript
import { z } from 'zod'

// Create review validation
export const createReviewSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  puntuacion: z.coerce.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comentario: z.string()
    .max(2000, 'Comment must be 2000 characters or less')
    .nullable()
    .optional()
})

// Update review validation
export const updateReviewSchema = z.object({
  puntuacion: z.coerce.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comentario: z.string()
    .max(2000, 'Comment must be 2000 characters or less')
    .nullable()
    .optional()
}).refine(
  data => data.puntuacion !== undefined || data.comentario !== undefined,
  { message: 'At least one field (puntuacion or comentario) must be provided' }
)

// Review ID param validation
export const reviewIdSchema = z.object({
  id: z.string().uuid('Invalid review ID format')
})

// Helper functions
export function validateCreateReview(data: unknown) {
  return createReviewSchema.safeParse(data)
}

export function validateUpdateReview(data: unknown) {
  return updateReviewSchema.safeParse(data)
}

export function validateReviewId(data: unknown) {
  return reviewIdSchema.safeParse(data)
}

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
```

---

### Task 3: Review Model (~45 min)

#### Create `src/Models/reviewModel.ts`

**Methods to implement:**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `create` | `CreateReviewParams` | `Review` | Create review, trigger rating update |
| `getById` | `id: string` | `ReviewWithUser \| null` | Get review with user info |
| `update` | `UpdateReviewParams` | `Review \| null` | Update review, trigger rating update |
| `softDelete` | `DeleteReviewParams` | `OperationResult` | Soft delete, trigger rating update |
| `updatePhoto` | `id, photoUrl` | `OperationResult` | Update review photo URL |
| `isOwner` | `reviewId, userId` | `boolean` | Check ownership |

**Key Implementation Details:**

1. **Restaurant ID Detection Logic:**
```typescript
// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveRestaurantId(restaurantId: string): Promise<string> {
  if (UUID_REGEX.test(restaurantId)) {
    // Internal UUID - verify it exists
    const restaurant = await RestaurantModel.getById({ id: restaurantId })
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }
    return restaurantId
  } else {
    // Foursquare ID - get or create
    const restaurant = await RestaurantModel.getOrCreateByFoursquareId(restaurantId)
    return restaurant.id
  }
}
```

2. **After every create/update/delete:**
```typescript
// Always recalculate restaurant rating
await RestaurantModel.updateRating(restaurantId)
```

3. **Restaurant cover photo logic (when uploading photo):**
```typescript
// Check if restaurant needs cover photo
const restaurant = await RestaurantModel.getById({ id: review.idrestaurante })
if (restaurant && !restaurant.urlfotoperfil) {
  await RestaurantModel.update({ 
    id: restaurant.id, 
    urlfotoperfil: photoUrl 
  })
}
```

---

### Task 4: Review Controller (~60 min)

#### Create `src/Controllers/reviewController.ts`

**Controller methods:**

| Method | Route | Description |
|--------|-------|-------------|
| `create` | POST /reviews | Create new review |
| `getById` | GET /reviews/:id | Get review details |
| `update` | PUT /reviews/:id | Update own review |
| `delete` | DELETE /reviews/:id | Soft delete own review |
| `uploadPhoto` | POST /reviews/:id/photo | Upload review photo |

**Controller Pattern (following existing codebase):**

```typescript
export class ReviewController {
  /**
   * POST /reviews
   * Create a new review
   */
  static async create(req: CreateReviewRequest, res: Response, _next: unknown): Promise<void> {
    try {
      // 1. Check authentication
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' }
        })
        return
      }

      // 2. Validate request body
      const validation = validateCreateReview(req.body)
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: { code: ERROR_CODES.VALIDATION_ERROR, message: validation.error.errors[0].message }
        })
        return
      }

      // 3. Create review
      const review = await ReviewModel.create({
        ...validation.data,
        userId: req.user.id
      })

      // 4. Return success
      res.status(201).json({
        success: true,
        data: review
      })
    } catch (err) {
      console.error('Create review error:', err)
      res.status(500).json({
        success: false,
        error: { code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: (err as Error).message }
      })
    }
  }
}
```

---

### Task 5: Review Router (~10 min)

#### Create `src/Routes/reviewRouter.ts`

```typescript
import { Router } from 'express'
import { ReviewController } from '../Controllers/reviewController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'
import { uploadSingle } from '../Middleware/uploadMiddleware.js'

const reviewRouter = Router()

// Public routes
reviewRouter.get('/:id', ReviewController.getById)

// Protected routes (require authentication)
reviewRouter.post('/', authMiddleware, ReviewController.create)
reviewRouter.put('/:id', authMiddleware, ReviewController.update)
reviewRouter.delete('/:id', authMiddleware, ReviewController.delete)
reviewRouter.post('/:id/photo', authMiddleware, uploadSingle('photo'), ReviewController.uploadPhoto)

export default reviewRouter
```

---

### Task 6: Register Router (~5 min)

#### Update `src/index.ts`

```typescript
// Add import
import reviewRouter from './Routes/reviewRouter.js'

// Add route registration (after existing routes)
app.use('/reviews', reviewRouter)
```

---

### Task 7: Documentation (~20 min)

#### Create `docs/endpoints/review-endpoints.md`

Document all endpoints with:
- HTTP method and path
- Authentication requirements
- Request body/params/query
- Success and error responses
- Example curl commands

---

### Task 8: Testing & Verification (~30 min)

**Test Scenarios:**

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Create review with internal restaurant UUID | Review created, rating updated |
| 2 | Create review with Foursquare ID (new restaurant) | Restaurant auto-created, review created |
| 3 | Create review with Foursquare ID (existing restaurant) | Review created for existing restaurant |
| 4 | Create second review for same restaurant by same user | Allowed (multiple reviews OK) |
| 5 | Create review without comment | Allowed (comentario is optional) |
| 6 | Create review with invalid rating (0 or 6) | 400 Validation error |
| 7 | Create review without auth | 401 Unauthorized |
| 8 | Get review by ID | Returns review with user info |
| 9 | Get non-existent review | 404 Not Found |
| 10 | Update own review (rating only) | Review updated, rating recalculated |
| 11 | Update own review (comment only) | Review updated |
| 12 | Update another user's review | 403 Forbidden |
| 13 | Update with no fields | 400 Validation error |
| 14 | Delete own review | Soft deleted, rating recalculated |
| 15 | Delete another user's review | 403 Forbidden |
| 16 | Upload photo to own review | Photo uploaded, URL saved |
| 17 | Upload photo (restaurant has no cover) | Review photo becomes restaurant cover |
| 18 | Upload photo to another user's review | 403 Forbidden |
| 19 | Upload invalid file type | 400 Invalid file type |
| 20 | Upload file > 10MB | 400 File too large |

---

## File Structure After Implementation

```
backend/src/
├── Controllers/
│   ├── authController.ts
│   ├── userController.ts
│   ├── restaurantController.ts
│   └── reviewController.ts        # NEW
│
├── Models/
│   ├── userModel.ts
│   ├── restaurantModel.ts
│   ├── reviewModel.ts             # NEW
│   ├── supabase/
│   │   └── client.ts
│   └── validations/
│       ├── authValidation.ts
│       ├── userValidation.ts
│       ├── restaurantValidation.ts
│       └── reviewValidation.ts    # NEW
│
├── Routes/
│   ├── authRouter.ts
│   ├── userRouter.ts
│   ├── restaurantRouter.ts
│   └── reviewRouter.ts            # NEW
│
├── types/
│   ├── entities/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── restaurant.types.ts
│   │   └── review.types.ts        # NEW
│   ├── api/
│   │   ├── auth.api.types.ts
│   │   ├── user.api.types.ts
│   │   ├── restaurant.api.types.ts
│   │   └── review.api.types.ts    # NEW
│   └── index.ts
│
└── index.ts                       # UPDATED (add review router)
```

---

## Estimated Timeline

| Task | Estimated Time |
|------|----------------|
| Task 1: TypeScript Types | 20 min |
| Task 2: Review Validation | 15 min |
| Task 3: Review Model | 45 min |
| Task 4: Review Controller | 60 min |
| Task 5: Review Router | 10 min |
| Task 6: Register Router | 5 min |
| Task 7: Documentation | 20 min |
| Task 8: Testing | 30 min |
| **Total** | **~3.5 hours** |

---

## Dependencies

All required dependencies already exist:

- ✅ `@supabase/supabase-js` - Database operations
- ✅ `zod` - Validation
- ✅ `multer` - File uploads
- ✅ `express` - Router/Controller
- ✅ `RestaurantModel` - Rating updates, get/create restaurant
- ✅ `StorageService` - Photo uploads
- ✅ `authMiddleware` - Authentication
- ✅ `uploadMiddleware` - File handling

---

## Success Criteria

Review module is complete when:

- [ ] All 5 endpoints are functional
- [ ] Users can create reviews with rating (1-5) and optional comment
- [ ] Users can create reviews using either internal UUID or Foursquare ID
- [ ] Multiple reviews per user per restaurant are allowed
- [ ] Restaurant rating is automatically recalculated after create/update/delete
- [ ] Users can upload one photo per review
- [ ] First review photo becomes restaurant cover if none exists
- [ ] Users can only update/delete their own reviews
- [ ] All validation errors return meaningful messages
- [ ] Documentation is complete
- [ ] All test scenarios pass

---

## Post-Implementation Tasks

After completing the Review module:

1. **Update PHASE1_PLANNING.md**:
   - Mark Task 4.1-4.10 as complete

2. **Update BACKEND.md**:
   - Mark Review Module endpoints as implemented

3. **Proceed to Eatlist Module** (Task 5 in PHASE1_PLANNING.md)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Invalid Foursquare ID | Medium | Catch API errors, return meaningful 404 |
| Rating calculation race condition | Low | Supabase handles concurrent updates |
| Large photo uploads timing out | Low | 10MB limit, chunked upload if needed later |
| Storage bucket permissions | Medium | Verify RLS policies on Supabase Storage |

---

*Document created on 2026-01-27. Ready for implementation.*
