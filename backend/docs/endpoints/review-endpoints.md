# Review Endpoints

Review API endpoints for creating, updating, and managing restaurant reviews.

## Endpoints

### POST /reviews
Create a new review.

**Authentication:** Required

**Request Body:**
```json
{
  "restaurantId": "uuid-or-foursquare-id",
  "puntuacion": 5,
  "comentario": "Great food!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "comentario": "Great food!",
    "puntuacion": 5,
    "urlfotoreview": null,
    "idrestaurante": "restaurant-uuid",
    "idusuario": "user-uuid",
    "idestado": "status-uuid",
    "active": true,
    "createdat": "2026-01-27T12:00:00Z",
    "updatedat": "2026-01-27T12:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Restaurant not found

**Example:**
```bash
curl -X POST http://localhost:3000/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"restaurantId":"<id>","puntuacion":5,"comentario":"Great food"}'
```

---

### GET /reviews/:id
Get review details.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Review ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "comentario": "Great food!",
    "puntuacion": 5,
    "urlfotoreview": "https://storage.url/photo.jpg",
    "idrestaurante": "restaurant-uuid",
    "idusuario": "user-uuid",
    "idestado": "status-uuid",
    "active": true,
    "createdat": "2026-01-27T12:00:00Z",
    "updatedat": "2026-01-27T12:00:00Z",
    "usuario": {
      "id": "user-uuid",
      "nombre": "Juan",
      "primerapellido": "Perez",
      "urlfotoperfil": "https://storage.url/profile.jpg"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid review ID format
- `404 Not Found` - Review not found

**Example:**
```bash
curl http://localhost:3000/reviews/<reviewId>
```

---

### PUT /reviews/:id
Update an existing review (owner only).

**Authentication:** Required

**Request Body:**
```json
{
  "puntuacion": 4,
  "comentario": "Updated comment"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "comentario": "Updated comment",
    "puntuacion": 4,
    "urlfotoreview": null,
    "idrestaurante": "restaurant-uuid",
    "idusuario": "user-uuid",
    "idestado": "status-uuid",
    "active": true,
    "createdat": "2026-01-27T12:00:00Z",
    "updatedat": "2026-01-27T14:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Review not found

**Example:**
```bash
curl -X PUT http://localhost:3000/reviews/<reviewId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"puntuacion":4,"comentario":"Updated"}'
```

---

### DELETE /reviews/:id
Soft delete a review (owner only).

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid review ID format
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Review not found

**Example:**
```bash
curl -X DELETE http://localhost:3000/reviews/<reviewId> \
  -H "Authorization: Bearer <token>"
```

---

### POST /reviews/:id/photo
Upload a review photo (owner only).

**Authentication:** Required

**Request Body:** `multipart/form-data`
- `photo` (file) - Image file (JPEG, PNG, WebP, max 10MB)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "photoUrl": "https://storage.url/review-photo.jpg"
  },
  "message": "Review photo updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID, missing file, invalid file type, or file too large
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Review not found

**Example:**
```bash
curl -X POST http://localhost:3000/reviews/<reviewId>/photo \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/photo.jpg"
```

---

## Common Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```
