# Food Type Endpoints

## GET /food-types

Get all active food types ordered alphabetically.

**Authentication**: Public

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Mexican",
      "idestado": "9aca8808-a7a2-4d43-8be8-d341655caa3e",
      "active": true,
      "createdat": "2026-01-22T00:00:00.000Z",
      "updatedat": "2026-01-22T00:00:00.000Z"
    }
  ]
}
```

---

## POST /food-types

Create a new food type.

**Authentication**: Required (Admin only in Phase 2)

**Request Body**:

```json
{
  "nombre": "Peruvian"
}
```

**Validation Rules**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| nombre | string | Yes | 2-100 characters |

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

## Notes

- Food types are returned alphabetically by `nombre`
- All queries filter by `active = true` (soft delete pattern)
- Duplicate food type names are rejected (case-insensitive check)
- The POST endpoint currently only requires authentication; admin role check will be added in Phase 2
