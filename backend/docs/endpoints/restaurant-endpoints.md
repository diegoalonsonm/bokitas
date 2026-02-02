# Restaurant Endpoints

Restaurant API endpoints for searching, listing, and managing restaurants.

## Overview

The restaurant module provides two data sources:
1. **Local Database** - Restaurants that users have interacted with (reviewed, added to eatlist)
2. **Foursquare API** - External search for discovering new restaurants

## Endpoints

### GET /restaurants
List restaurants from the local database with filters and pagination.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| tipoComida | uuid | No | - | Filter by food type ID |
| puntuacionMin | number | No | - | Minimum rating (1-5) |
| ordenar | string | No | recent | Sort order: `rating`, `distance`, `recent` |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 50) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Restaurante Example",
      "direccion": "San José, Costa Rica",
      "latitud": 9.9281,
      "longitud": -84.0907,
      "urlfotoperfil": "https://example.com/photo.jpg",
      "urlpaginarestaurante": "https://restaurant.com",
      "foursquareid": "4b5e662af964a52063e628e3",
      "puntuacion": 4.5,
      "idestado": "uuid",
      "active": true,
      "createdat": "2025-01-20T00:00:00Z",
      "updatedat": "2025-01-20T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET /restaurants/search
Search for restaurants via Foursquare API. Returns external data, not saved to DB.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | No | Search query (e.g., "pizza", "sushi") |
| lat | number | No* | Latitude (-90 to 90) |
| lng | number | No* | Longitude (-180 to 180) |
| radius | number | No | Search radius in meters (max 50000) |
| near | string | No* | Location name (e.g., "San José", "Heredia") |
| limit | number | No | Max results (default 20, max 50) |

*Note: Provide either `lat`+`lng` together OR `near`. If neither provided, defaults to "Costa Rica".

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "foursquareid": "4b5e662af964a52063e628e3",
      "nombre": "Pizza Hut",
      "direccion": "Avenida Central, San José, Costa Rica",
      "latitud": 9.9281,
      "longitud": -84.0907,
      "urlfotoperfil": "https://fastly.4sqi.net/img/general/original/123.jpg",
      "urlpaginarestaurante": "https://pizzahut.cr",
      "foodTypeIds": ["uuid-pizza", "uuid-fast-food"],
      "distance": 250,
      "categories": [
        { "id": 13064, "name": "Pizzeria" }
      ]
    }
  ],
  "meta": {
    "count": 20,
    "source": "foursquare"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid parameters (e.g., lat without lng)
- `500 Internal Server Error` - Foursquare API error

---

### GET /restaurants/top
Get top rated restaurants from the local database.

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | number | No | 10 | Number of results (max 50) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Best Restaurant",
      "puntuacion": 4.9,
      ...
    }
  ],
  "meta": {
    "count": 10
  }
}
```

---

### GET /restaurants/foursquare/:fsqId
Get or create a restaurant by Foursquare ID. If the restaurant doesn't exist in the local DB, it fetches details from Foursquare and creates a new record.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fsqId | string | Yes | Foursquare place ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Restaurant Name",
    "direccion": "San José, Costa Rica",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "urlfotoperfil": "https://example.com/photo.jpg",
    "urlpaginarestaurante": "https://restaurant.com",
    "foursquareid": "4b5e662af964a52063e628e3",
    "puntuacion": 0,
    "foodTypes": [
      { "id": "uuid", "nombre": "Pizza" },
      { "id": "uuid", "nombre": "Italiana" }
    ],
    "active": true,
    "createdat": "2025-01-20T00:00:00Z",
    "updatedat": "2025-01-20T00:00:00Z"
  }
}
```

**Use Case:** When a user wants to review or add a restaurant from search results to their eatlist, call this endpoint first to ensure the restaurant exists in the local DB.

---

### GET /restaurants/:id
Get a single restaurant by local database ID.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Restaurant ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Restaurant Name",
    "direccion": "San José, Costa Rica",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "urlfotoperfil": "https://example.com/photo.jpg",
    "urlpaginarestaurante": "https://restaurant.com",
    "foursquareid": "4b5e662af964a52063e628e3",
    "puntuacion": 4.2,
    "foodTypes": [
      { "id": "uuid", "nombre": "Mexicana" }
    ],
    "active": true,
    "createdat": "2025-01-20T00:00:00Z",
    "updatedat": "2025-01-20T00:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - Restaurant not found

---

### GET /restaurants/:id/reviews
Get reviews for a specific restaurant with pagination.

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Restaurant ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 50) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "idusuario": "uuid",
      "puntuacion": 4,
      "comentario": "Great food!",
      "urlfotoreview": "https://example.com/review-photo.jpg",
      "createdat": "2025-01-20T00:00:00Z",
      "usuario": {
        "id": "uuid",
        "nombre": "John",
        "primerapellido": "Doe",
        "urlfotoperfil": "https://example.com/profile.jpg"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid UUID format
- `404 Not Found` - Restaurant not found

---

### PUT /restaurants/:id
Update restaurant information.

**Authentication:** Required (JWT)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | uuid | Yes | Restaurant ID |

**Request Body:**
```json
{
  "nombre": "Updated Name",
  "direccion": "New Address",
  "latitud": 9.9281,
  "longitud": -84.0907,
  "urlfotoperfil": "https://example.com/new-photo.jpg",
  "urlpaginarestaurante": "https://newwebsite.com"
}
```

All fields are optional. Only provided fields will be updated.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Restaurant updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or no fields to update
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Restaurant not found

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

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Usage Patterns

### Discovering Restaurants (Search Flow)
1. User searches: `GET /restaurants/search?query=pizza&near=San Jose`
2. User selects a restaurant from results
3. Before review/eatlist: `GET /restaurants/foursquare/:fsqId` (creates local record)
4. Create review or add to eatlist using the returned local `id`

### Browsing Local Restaurants
1. List restaurants: `GET /restaurants?ordenar=rating&limit=20`
2. View details: `GET /restaurants/:id`
3. View reviews: `GET /restaurants/:id/reviews`

### Location-Based Search
```
# Nearby search (with coordinates)
GET /restaurants/search?lat=9.9281&lng=-84.0907&radius=5000&query=coffee

# City/Province search
GET /restaurants/search?near=Heredia&query=sushi
```
