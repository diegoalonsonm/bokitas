# Eatlist Module Implementation Plan

> **Document**: Implementation plan for the Eatlist module
> 
> **Created**: 2026-01-27
> 
> **Status**: Ready for Implementation
> 
> **Estimated Time**: ~2 hours

---

## Overview

The eatlist module allows users to manage a personal list of restaurants they want to visit or have already visited. This is a core Phase 1 feature (Task 5 in PHASE1_PLANNING.md).

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API Field Naming | Use `flag` | Matches database column name exactly |
| Filtering | Add `?visited` query param | Allows filtering by visited/want-to-visit status |
| Duplicate Handling | Reactivate soft-deleted | Better UX - user can re-add previously removed restaurants |

---

## Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/eatlist` | Get current user's eatlist | Required |
| GET | `/eatlist?visited=true` | Get visited restaurants only | Required |
| GET | `/eatlist?visited=false` | Get want-to-visit only | Required |
| POST | `/eatlist` | Add restaurant to eatlist | Required |
| PUT | `/eatlist/:restaurantId` | Update visited flag | Required |
| DELETE | `/eatlist/:restaurantId` | Remove from eatlist (soft delete) | Required |

---

## Database Schema

**Table: `eatlist`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idusuario | UUID | PK, FK -> usuario | User ID |
| idrestaurante | UUID | PK, FK -> restaurante | Restaurant ID |
| flag | boolean | NOT NULL, DEFAULT false | true = visited, false = want to visit |
| active | boolean | DEFAULT true | Soft delete flag |
| createdat | TIMESTAMPTZ | DEFAULT now() | Date added |
| updatedat | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Notes:**
- Composite primary key on `(idusuario, idrestaurante)`
- Each user can only have one entry per restaurant

---

## Files to Create

| # | File | Est. Time | Description |
|---|------|-----------|-------------|
| 1 | `src/types/entities/eatlist.types.ts` | 10 min | Entity and param interfaces |
| 2 | `src/types/api/eatlist.api.types.ts` | 10 min | API request types |
| 3 | `src/Models/validations/eatlistValidation.ts` | 15 min | Zod validation schemas |
| 4 | `src/Models/eatlistModel.ts` | 35 min | Database CRUD operations |
| 5 | `src/Controllers/eatlistController.ts` | 25 min | HTTP handlers |
| 6 | `src/Routes/eatlistRouter.ts` | 5 min | Route definitions |
| 7 | `docs/endpoints/eatlist-endpoints.md` | 15 min | API documentation |

**Files to Update:**
- `src/index.ts` - Register eatlist router
- `src/Utils/constants.ts` - Add error messages

---

## Implementation Details

### 1. Entity Types (`src/types/entities/eatlist.types.ts`)

```typescript
export interface Eatlist {
  idusuario: string
  idrestaurante: string
  flag: boolean           // true = visited, false = want to visit
  active: boolean
  createdat: string
  updatedat: string
}

export interface EatlistWithRestaurant extends Eatlist {
  restaurante: {
    id: string
    nombre: string
    urlfotoperfil: string | null
    puntuacion: number | null
  }
}

export interface GetEatlistParams {
  userId: string
  visited?: boolean       // Optional filter
}

export interface AddToEatlistParams {
  userId: string
  restaurantId: string
  flag?: boolean          // Defaults to false
}

export interface UpdateEatlistParams {
  userId: string
  restaurantId: string
  flag: boolean
}

export interface RemoveFromEatlistParams {
  userId: string
  restaurantId: string
}

export interface CheckEatlistParams {
  userId: string
  restaurantId: string
}
```

---

### 2. API Types (`src/types/api/eatlist.api.types.ts`)

```typescript
import type { Request } from 'express'

export interface AddToEatlistBody {
  restaurantId: string    // UUID or Foursquare ID
  flag?: boolean
}

export interface UpdateEatlistBody {
  flag: boolean
}

export interface EatlistParams {
  restaurantId: string
}

export interface GetEatlistQuery {
  visited?: string        // 'true' or 'false' (string from query)
}

export type GetEatlistRequest = Request<Record<string, string>, unknown, unknown, GetEatlistQuery>
export type AddToEatlistRequest = Request<Record<string, string>, unknown, AddToEatlistBody>
export type UpdateEatlistRequest = Request<EatlistParams, unknown, UpdateEatlistBody>
export type RemoveFromEatlistRequest = Request<EatlistParams>
```

---

### 3. Validation Schemas (`src/Models/validations/eatlistValidation.ts`)

```typescript
import { z } from 'zod'

// Add to eatlist - restaurantId required, flag optional (defaults false)
const addToEatlistSchema = z.object({
  restaurantId: z.string({
    required_error: 'Restaurant ID is required',
    invalid_type_error: 'Restaurant ID must be a string'
  }).min(1, 'Restaurant ID cannot be empty'),
  flag: z.boolean().optional().default(false)
})

// Update eatlist - flag is required
const updateEatlistSchema = z.object({
  flag: z.boolean({
    required_error: 'Flag is required',
    invalid_type_error: 'Flag must be a boolean'
  })
})

// Restaurant ID path parameter - UUID format
const restaurantIdParamSchema = z.object({
  restaurantId: z.string({
    required_error: 'Restaurant ID is required'
  }).uuid('Invalid restaurant ID format')
})

// Query params for GET - visited filter
const getEatlistQuerySchema = z.object({
  visited: z.enum(['true', 'false']).optional()
    .transform(val => val === undefined ? undefined : val === 'true')
})
```

---

### 4. Model Methods (`src/Models/eatlistModel.ts`)

| Method | Description |
|--------|-------------|
| `getAll({ userId, visited })` | Get user's eatlist with restaurant info, optional filter |
| `add({ userId, restaurantId, flag })` | Add or reactivate entry |
| `update({ userId, restaurantId, flag })` | Update flag value |
| `remove({ userId, restaurantId })` | Soft delete entry |
| `findEntry({ userId, restaurantId, includeInactive })` | Check if entry exists |

**Key Logic for `add()`:**
1. Convert authId to userId via `UserModel.getUserIdByAuthId()`
2. Resolve restaurantId (UUID or Foursquare) via `RestaurantModel` pattern
3. Check if entry exists (active or not)
4. If exists with `active=false`: UPDATE to reactivate with new flag value
5. If exists with `active=true`: Return conflict error
6. Else: INSERT new entry

---

### 5. Controller Methods (`src/Controllers/eatlistController.ts`)

| Handler | HTTP | Response |
|---------|------|----------|
| `getAll` | `GET /eatlist` | 200 with list, 401 unauthorized |
| `add` | `POST /eatlist` | 201 created, 409 conflict, 404 restaurant not found |
| `update` | `PUT /eatlist/:restaurantId` | 200 success, 404 not found |
| `remove` | `DELETE /eatlist/:restaurantId` | 200 success, 404 not found |

---

### 6. Router (`src/Routes/eatlistRouter.ts`)

```typescript
import { Router } from 'express'
import { EatlistController } from '../Controllers/eatlistController.js'
import { authMiddleware } from '../Middleware/authMiddleware.js'

const eatlistRouter = Router()

// All routes require authentication
eatlistRouter.get('/', authMiddleware, EatlistController.getAll)
eatlistRouter.post('/', authMiddleware, EatlistController.add)
eatlistRouter.put('/:restaurantId', authMiddleware, EatlistController.update)
eatlistRouter.delete('/:restaurantId', authMiddleware, EatlistController.remove)

export default eatlistRouter
```

---

### 7. Constants Updates (`src/Utils/constants.ts`)

Add to ERROR_MESSAGES:
```typescript
EATLIST_NOT_FOUND: 'Eatlist entry not found',
EATLIST_ALREADY_EXISTS: 'Restaurant already in eatlist'
```

---

### 8. Index.ts Update

```typescript
import eatlistRouter from './Routes/eatlistRouter.js'
// ...
app.use('/eatlist', eatlistRouter)
```

---

## API Examples

### GET /eatlist

**Request:**
```bash
curl http://localhost:3000/eatlist \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "idusuario": "user-uuid",
      "idrestaurante": "restaurant-uuid",
      "flag": false,
      "active": true,
      "createdat": "2026-01-27T12:00:00Z",
      "updatedat": "2026-01-27T12:00:00Z",
      "restaurante": {
        "id": "restaurant-uuid",
        "nombre": "La Cocina",
        "urlfotoperfil": "https://storage.url/photo.jpg",
        "puntuacion": 4.5
      }
    }
  ]
}
```

### GET /eatlist?visited=true

**Request:**
```bash
curl "http://localhost:3000/eatlist?visited=true" \
  -H "Authorization: Bearer <token>"
```

### POST /eatlist

**Request:**
```bash
curl -X POST http://localhost:3000/eatlist \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":"<uuid-or-foursquare-id>","flag":false}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "idusuario": "user-uuid",
    "idrestaurante": "restaurant-uuid",
    "flag": false,
    "active": true,
    "createdat": "2026-01-27T12:00:00Z",
    "updatedat": "2026-01-27T12:00:00Z"
  }
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Restaurant already in eatlist"
  }
}
```

### PUT /eatlist/:restaurantId

**Request:**
```bash
curl -X PUT http://localhost:3000/eatlist/<restaurantId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"flag":true}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "idusuario": "user-uuid",
    "idrestaurante": "restaurant-uuid",
    "flag": true,
    "active": true,
    "createdat": "2026-01-27T12:00:00Z",
    "updatedat": "2026-01-27T14:00:00Z"
  }
}
```

### DELETE /eatlist/:restaurantId

**Request:**
```bash
curl -X DELETE http://localhost:3000/eatlist/<restaurantId> \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from eatlist successfully"
}
```

---

## Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 404 | NOT_FOUND | Restaurant or eatlist entry not found |
| 409 | CONFLICT | Restaurant already in eatlist |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## Testing Checklist

After implementation, verify:

- [ ] `GET /eatlist` returns user's list with restaurant info
- [ ] `GET /eatlist?visited=true` filters correctly
- [ ] `GET /eatlist?visited=false` filters correctly
- [ ] `POST /eatlist` adds new entry
- [ ] `POST /eatlist` reactivates soft-deleted entry
- [ ] `POST /eatlist` returns 409 for active duplicate
- [ ] `PUT /eatlist/:id` updates flag
- [ ] `DELETE /eatlist/:id` soft deletes
- [ ] All endpoints return 401 without auth token
- [ ] Foursquare IDs work for restaurantId (auto-creates restaurant)
- [ ] Type checking passes (`npm run typecheck`)

---

## Implementation Order

1. **Types** - `eatlist.types.ts`, `eatlist.api.types.ts`
2. **Validation** - `eatlistValidation.ts`
3. **Model** - `eatlistModel.ts` (core logic)
4. **Controller** - `eatlistController.ts`
5. **Router** - `eatlistRouter.ts`
6. **Integration** - Update `index.ts` and `constants.ts`
7. **Documentation** - `eatlist-endpoints.md`
8. **Testing** - Manual verification of all endpoints

---

## Related Files (Reference)

These existing files serve as implementation patterns:
- `src/types/entities/review.types.ts` - Entity type pattern
- `src/Models/reviewModel.ts` - Model pattern (especially `resolveRestaurantId`)
- `src/Controllers/reviewController.ts` - Controller pattern
- `src/Routes/reviewRouter.ts` - Router pattern
- `docs/endpoints/review-endpoints.md` - Documentation pattern

---

*Plan approved on 2026-01-27. Ready for implementation.*
