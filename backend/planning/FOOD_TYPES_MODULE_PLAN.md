# Food Types Module - Implementation Plan

> **Document**: Implementation plan for the Food Types module
>
> **Project**: Bokitas Backend
>
> **Created**: 2026-01-28
>
> **Status**: Approved

---

## Overview

The Food Types module is a **simple read-only module** (for Phase 1) that allows clients to retrieve all available food type categories.

| Aspect | Details |
|--------|---------|
| Estimated time | ~45 minutes |
| Database | Already seeded with 20 food types in `tipocomida` table |
| Complexity | Low |

---

## Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/food-types` | List all food types | Public |
| POST | `/food-types` | Create food type | Admin only |

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| POST /food-types access | Admin only | Prevents spam and maintains data quality |
| GET /food-types pagination | No pagination | Small fixed dataset (~20 items), simpler implementation |

---

## Files to Create

| File | Purpose | Est. Time |
|------|---------|-----------|
| `src/types/entities/foodType.types.ts` | Entity and parameter interfaces | 5 min |
| `src/types/api/foodType.api.types.ts` | API request types | 3 min |
| `src/Models/validations/foodTypeValidation.ts` | Zod validation schemas | 5 min |
| `src/Models/foodTypeModel.ts` | Supabase data access layer | 10 min |
| `src/Controllers/foodTypeController.ts` | Request handlers | 10 min |
| `src/Routes/foodTypeRouter.ts` | Route definitions | 3 min |
| `docs/endpoints/foodtype-endpoints.md` | API documentation | 5 min |

## Files to Update

| File | Change |
|------|--------|
| `src/index.ts` | Register the foodTypeRouter |
| `src/Utils/constants.ts` | Add error messages |

---

## Implementation Tasks

### Task 6.1: FoodType Model (20 min)

| # | Task | Est. Time |
|---|------|-----------|
| 6.1.1 | Create `src/types/entities/foodType.types.ts` | 5 min |
| 6.1.2 | Create `src/types/api/foodType.api.types.ts` | 3 min |
| 6.1.3 | Create `src/Models/validations/foodTypeValidation.ts` | 5 min |
| 6.1.4 | Create `src/Models/foodTypeModel.ts` | 7 min |

**Type definitions:**

```typescript
// src/types/entities/foodType.types.ts
export interface FoodType {
  id: string
  nombre: string
  idestado: string | null
  active: boolean
  createdat: string
  updatedat: string
}

export interface CreateFoodTypeParams {
  nombre: string
}

export interface GetAllFoodTypesParams {
  activeOnly?: boolean
}
```

**Model methods:**

- `FoodTypeModel.getAll()` - Fetch all active food types ordered alphabetically by `nombre`
- `FoodTypeModel.create()` - Insert new food type with UUID, timestamps, active flag
- `FoodTypeModel.existsByName()` - Check for duplicate names (case-insensitive)

---

### Task 6.2: GET /food-types Endpoint (15 min)

| # | Task | Est. Time |
|---|------|-----------|
| 6.2.1 | Create `src/Controllers/foodTypeController.ts` | 7 min |
| 6.2.2 | Create `src/Routes/foodTypeRouter.ts` | 3 min |
| 6.2.3 | Update `src/index.ts` - register router | 2 min |
| 6.2.4 | Update `src/Utils/constants.ts` - add error messages | 3 min |

**Controller methods:**

- `FoodTypeController.getAll()` - Public endpoint, returns all food types
- `FoodTypeController.create()` - Protected endpoint (admin), validates and creates

**Router configuration:**

- `GET /` - Public, maps to `getAll`
- `POST /` - Protected with `authMiddleware`, maps to `create`

> **Note**: Admin check deferred to Phase 2. Currently only requires authentication.

---

### Task 6.3: Documentation (10 min)

| # | Task | Est. Time |
|---|------|-----------|
| 6.3.1 | Create `docs/endpoints/foodtype-endpoints.md` | 10 min |

---

## API Contract

### GET /food-types

**Description**: List all active food types

**Authentication**: Public

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Mexican",
      "active": true,
      "createdat": "2026-01-22T00:00:00.000Z",
      "updatedat": "2026-01-22T00:00:00.000Z"
    }
  ]
}
```

---

### POST /food-types

**Description**: Create a new food type

**Authentication**: Required (Admin only in Phase 2)

**Request Body**:

```json
{
  "nombre": "Peruvian"
}
```

**Validation Rules**:

- `nombre`: Required, string, 2-100 characters

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Peruvian",
    "idestado": "9aca8808-a7a2-4d43-8be8-d341655caa3e",
    "active": true,
    "createdat": "2026-01-28T00:00:00.000Z",
    "updatedat": "2026-01-28T00:00:00.000Z"
  }
}
```

**Error Responses**:

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Food type name is required |
| 400 | VALIDATION_ERROR | Food type name must be at least 2 characters |
| 401 | UNAUTHORIZED | Authentication required |
| 409 | CONFLICT | Food type already exists |
| 500 | INTERNAL_SERVER_ERROR | Error message |

---

## File Tree After Implementation

```
src/
├── Controllers/
│   └── foodTypeController.ts    # NEW
├── Models/
│   ├── validations/
│   │   └── foodTypeValidation.ts # NEW
│   └── foodTypeModel.ts          # NEW
├── Routes/
│   └── foodTypeRouter.ts         # NEW
├── types/
│   ├── entities/
│   │   └── foodType.types.ts     # NEW
│   └── api/
│       └── foodType.api.types.ts # NEW
├── Utils/
│   └── constants.ts              # UPDATE (add error messages)
└── index.ts                      # UPDATE (register router)

docs/
└── endpoints/
    └── foodtype-endpoints.md     # NEW
```

---

## Implementation Notes

### 1. Admin Middleware

The POST endpoint currently only requires authentication. When admin roles are implemented in Phase 2, add an admin middleware check:

```typescript
// Future Phase 2 implementation
foodTypeRouter.post('/', authMiddleware, adminMiddleware, FoodTypeController.create)
```

### 2. Case-Insensitive Duplicate Check

The `existsByName()` method should use case-insensitive comparison to prevent duplicates like "Mexican" and "mexican":

```typescript
static async existsByName(nombre: string): Promise<boolean> {
  const { data } = await supabase
    .from('tipocomida')
    .select('id')
    .ilike('nombre', nombre)
    .eq('active', true)
    .limit(1)

  return !!data && data.length > 0
}
```

### 3. Ordering

Food types will be returned alphabetically by `nombre` for consistent UI display.

### 4. Soft Delete Pattern

Following the codebase standard, all queries filter by `active = true`.

---

## Database Reference

**Table**: `tipocomida`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| nombre | varchar | NOT NULL | Food type name |
| idestado | UUID | FK -> estado | Status reference |
| active | boolean | DEFAULT true | Soft delete flag |
| createdat | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updatedat | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Pre-seeded data**: 20 food types already exist in the database.

---

## Success Criteria

- [ ] GET /food-types returns all active food types
- [ ] POST /food-types creates new food type (requires auth)
- [ ] Duplicate food type names are rejected (409 Conflict)
- [ ] All queries filter by `active = true`
- [ ] Documentation is complete
- [ ] Type checking passes (`npm run typecheck`)

---

*Document created on 2026-01-28.*
