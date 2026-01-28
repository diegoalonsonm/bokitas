# Eatlist Endpoints

The eatlist module allows users to manage a personal list of restaurants they want to visit or have already visited.

---

## Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/eatlist` | Get current user's eatlist | Yes |
| GET | `/eatlist?visited=true` | Get visited restaurants only | Yes |
| GET | `/eatlist?visited=false` | Get want-to-visit only | Yes |
| POST | `/eatlist` | Add restaurant to eatlist | Yes |
| PUT | `/eatlist/:restaurantId` | Update visited flag | Yes |
| DELETE | `/eatlist/:restaurantId` | Remove from eatlist (soft delete) | Yes |

---

## GET /eatlist

Get the current user's eatlist with restaurant information.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| visited | string | No | Filter by visited status: `'true'` or `'false'` |

### Request

```bash
curl http://localhost:3000/eatlist \
  -H "Authorization: Bearer <token>"
```

### Response (200 OK)

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

### Filter by Visited Status

```bash
# Get only visited restaurants
curl "http://localhost:3000/eatlist?visited=true" \
  -H "Authorization: Bearer <token>"

# Get only want-to-visit restaurants
curl "http://localhost:3000/eatlist?visited=false" \
  -H "Authorization: Bearer <token>"
```

---

## POST /eatlist

Add a restaurant to the user's eatlist.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| restaurantId | string | Yes | UUID or Foursquare ID of the restaurant |
| flag | boolean | No | `true` = visited, `false` = want to visit (default: `false`) |

### Request

```bash
curl -X POST http://localhost:3000/eatlist \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":"<uuid-or-foursquare-id>","flag":false}'
```

### Response (201 Created)

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

### Response (409 Conflict)

When the restaurant is already in the user's eatlist:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Restaurant already in eatlist"
  }
}
```

### Notes

- If the `restaurantId` is a Foursquare ID (not a UUID), the restaurant will be automatically created in the database using data from the Foursquare API.
- If a restaurant was previously removed (soft deleted), adding it again will reactivate the entry with the new flag value.

---

## PUT /eatlist/:restaurantId

Update the visited flag of an eatlist entry.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| restaurantId | string (UUID) | Yes | Restaurant ID |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| flag | boolean | Yes | `true` = visited, `false` = want to visit |

### Request

```bash
curl -X PUT http://localhost:3000/eatlist/<restaurantId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"flag":true}'
```

### Response (200 OK)

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

### Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Eatlist entry not found"
  }
}
```

---

## DELETE /eatlist/:restaurantId

Remove a restaurant from the user's eatlist (soft delete).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| restaurantId | string (UUID) | Yes | Restaurant ID |

### Request

```bash
curl -X DELETE http://localhost:3000/eatlist/<restaurantId> \
  -H "Authorization: Bearer <token>"
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Removed from eatlist successfully"
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Eatlist entry not found"
  }
}
```

---

## Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 404 | NOT_FOUND | Restaurant or eatlist entry not found |
| 409 | CONFLICT | Restaurant already in eatlist |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## Data Model

### Eatlist Entry

| Field | Type | Description |
|-------|------|-------------|
| idusuario | string (UUID) | User ID |
| idrestaurante | string (UUID) | Restaurant ID |
| flag | boolean | `true` = visited, `false` = want to visit |
| active | boolean | Soft delete flag |
| createdat | string (ISO 8601) | Creation timestamp |
| updatedat | string (ISO 8601) | Last update timestamp |

### Eatlist Entry with Restaurant

Extends Eatlist Entry with:

| Field | Type | Description |
|-------|------|-------------|
| restaurante.id | string (UUID) | Restaurant ID |
| restaurante.nombre | string | Restaurant name |
| restaurante.urlfotoperfil | string \| null | Restaurant profile photo URL |
| restaurante.puntuacion | number \| null | Restaurant rating (1-5) |

---

## Related Files

- Types: `src/types/entities/eatlist.types.ts`
- API Types: `src/types/api/eatlist.api.types.ts`
- Validation: `src/Models/validations/eatlistValidation.ts`
- Model: `src/Models/eatlistModel.ts`
- Controller: `src/Controllers/eatlistController.ts`
- Router: `src/Routes/eatlistRouter.ts`
