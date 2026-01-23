# User Endpoints

## Overview

User module handles user profile management, including viewing profiles, updating information, uploading photos, and retrieving user-related data (reviews, eatlist, top restaurants).

---

## Base URL
```
http://localhost:3000
```

---

## Endpoints

### 1. Get User Profile

**GET** `/users/:id`

Get a user's public profile information.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "nombre": "John",
    "apellido": "Doe",
    "urlFotoPerfil": "https://supabase-url.com/profile-photos/...",
    "createdat": "2026-01-22T10:30:00.000Z",
    "idestado": "9aca8808-a7a2-4d43-8be8-d341655caa3e"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Must be a valid UUID |
| 404 | NOT_FOUND | User not found |

---

### 2. Update User Profile

**PUT** `/users/:id`

Update the authenticated user's own profile.

**Authentication:** Required (JWT token in Authorization header)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID (must match authenticated user) |

**Request Body:**
```json
{
  "nombre": "John",
  "apellido": "Smith",
  "urlfotoperfil": "https://example.com/photo.jpg"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|--------------|
| nombre | string | No | Min 2 characters |
| apellido | string | No | Min 2 characters |
| urlfotoperfil | string | No | Valid URL |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Validation error details |
| 401 | UNAUTHORIZED | Invalid or expired token |
| 403 | FORBIDDEN | You do not have permission to perform this action |

---

### 3. Deactivate Account

**DELETE** `/users/:id`

Soft delete (deactivate) the authenticated user's own account.

**Authentication:** Required (JWT token in Authorization header)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID (must match authenticated user) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account deactivated successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Must be a valid UUID |
| 401 | UNAUTHORIZED | Invalid or expired token |
| 403 | FORBIDDEN | You do not have permission to perform this action |

---

### 4. Upload Profile Photo

**POST** `/users/:id/photo`

Upload a profile photo for the authenticated user.

**Authentication:** Required (JWT token in Authorization header)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID (must match authenticated user) |

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:** Form field named `photo` with the image file

**File Constraints:**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Maximum size: 5MB
- Automatically uploaded to `profile-pictures` bucket

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "urlFotoPerfil": "https://supabase-url.com/profile-pictures/user-id/timestamp.jpg"
  },
  "message": "Profile photo uploaded successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Must be a valid UUID or Profile photo is required |
| 400 | VALIDATION_ERROR | Invalid file type or File size exceeds limit of 5MB |
| 401 | UNAUTHORIZED | Invalid or expired token |
| 403 | FORBIDDEN | You do not have permission to perform this action |

---

### 5. Get User Reviews

**GET** `/users/:id/reviews`

Get paginated list of reviews written by a user.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-id-1",
      "idusuario": "550e8400-e29b-41d4-a716-446655440000",
      "puntuacion": 5,
      "comentario": "Amazing food!",
      "createdat": "2026-01-22T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20
  }
}
```

---

### 6. Get User Eatlist

**GET** `/users/:id/eatlist`

Get all restaurants in a user's eatlist.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "idusuario": "550e8400-e29b-41d4-a716-446655440000",
      "idrestaurante": "restaurant-id-1",
      "visitado": false,
      "createdat": "2026-01-22T10:30:00.000Z"
    },
    {
      "idusuario": "550e8400-e29b-41d4-a716-446655440000",
      "idrestaurante": "restaurant-id-2",
      "visitado": true,
      "createdat": "2026-01-22T10:35:00.000Z"
    }
  ]
}
```

---

### 7. Get User Top 4 Restaurants

**GET** `/users/:id/top4`

Get the user's top 4 highest-rated restaurants from their eatlist.

**Authentication:** Not required (public endpoint)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "restaurant-id-1",
      "nombre": "Amazing Restaurant",
      "urlfotoperfil": "https://example.com/photo.jpg",
      "puntuacion": 5.0
    },
    {
      "id": "restaurant-id-2",
      "nombre": "Great Place",
      "urlfotoperfil": "https://example.com/photo.jpg",
      "puntuacion": 4.5
    }
  ]
}
```

**Note:** Returns up to 4 restaurants, sorted by rating in descending order. Returns empty array if user has no restaurants in their eatlist.

---

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | User does not have permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate) |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Authentication

For protected endpoints (PUT, DELETE, POST photo), include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the `/auth/login` or `/auth/register` response.

---

## Testing Examples

### Using cURL

**Get User Profile:**
```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

**Update Profile:**
```bash
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Jane", "apellido": "Smith"}'
```

**Upload Profile Photo:**
```bash
curl -X POST http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000/photo \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

**Deactivate Account:**
```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- User email is visible in public profile data
- Profile photos are automatically uploaded to Supabase Storage
- Account deletion is a soft delete (sets `active = false` and status to deleted)
- All public endpoints return only active users
- Eatlist includes both "want to visit" and "visited" restaurants
- Top 4 restaurants are filtered by eatlist ownership, sorted by restaurant rating
