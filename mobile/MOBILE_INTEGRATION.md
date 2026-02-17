# 📱 Bokitas Backend Integration Guide for Mobile (Expo)

> **Version:** 1.0  
> **Last Updated:** January 2025  
> **Backend API Version:** Phase 1 (Core MVP Complete)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Technology Stack](#technology-stack)
4. [Authentication](#authentication)
5. [API Response Format](#api-response-format)
6. [Modules & Endpoints](#modules--endpoints)
   - [Auth Module](#auth-module)
   - [Users Module](#users-module)
   - [Restaurants Module](#restaurants-module)
   - [Reviews Module](#reviews-module)
   - [Eatlist Module](#eatlist-module)
   - [Food Types Module](#food-types-module)
7. [Data Types](#data-types)
8. [Error Handling](#error-handling)
9. [File Uploads](#file-uploads)
10. [Potential Issues & Mitigation](#potential-issues--mitigation)
11. [Environment Configuration](#environment-configuration)
12. [React Native/Expo Code Examples](#react-nativeexpo-code-examples)

---

## Overview

**Bokitas** is a restaurant discovery and review platform focused on Costa Rica. The backend provides:

- 🔐 User authentication (register, login, password reset)
- 👤 User profiles with photo upload
- 🍽️ Restaurant search via Foursquare API
- ⭐ Restaurant reviews with ratings (1-5)
- 📋 Personal eatlist (want to visit / visited)
- 🍕 Food type categorization

**Total Endpoints:** 27 (15 public, 12 protected)

---

## Quick Start

### Base URL

```
Development: http://localhost:4000
Production: https://your-api-domain.com
```

### Making Your First Request

```typescript
// Public endpoint - no auth required
const response = await fetch('http://localhost:3000/food-types');
const data = await response.json();
// { success: true, data: [...] }

// Protected endpoint - requires auth
const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## Technology Stack

| Layer | Technology | Notes for Mobile |
|-------|------------|-----------------|
| **Backend** | Node.js + Express | REST API |
| **Language** | TypeScript | Typed responses |
| **Database** | PostgreSQL (Supabase) | Real-time capable |
| **Auth** | Supabase Auth | JWT tokens |
| **File Storage** | Supabase Storage | Direct URLs |
| **External API** | Foursquare Places | Restaurant search |

### Important Notes for Mobile

- All IDs are **UUIDs** (strings, not integers)
- Timestamps are **ISO 8601** format
- Database column names are in **Spanish** (e.g., `nombre`, `puntuacion`)
- Soft deletes used (records have `active: boolean`)
- Ratings are integers from **1-5**

---

## Authentication

### How It Works

1. **Registration** creates a Supabase Auth user + `usuario` database record
2. **Login** returns `access_token` and `refresh_token`
3. **Protected routes** require `Authorization: Bearer <token>` header
4. **Tokens expire** - check `expires_at` before requests

### Token Structure

```typescript
interface AuthTokens {
  access_token: string;   // JWT for API requests
  refresh_token: string;  // For obtaining new access tokens
  expires_at: number;     // Unix timestamp (seconds)
}
```

### Token Storage (Expo)

> ⚠️ **IMPORTANT:** Always use secure storage for tokens!

```typescript
import * as SecureStore from 'expo-secure-store';

// Save tokens
await SecureStore.setItemAsync('access_token', tokens.access_token);
await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
await SecureStore.setItemAsync('expires_at', tokens.expires_at.toString());

// Retrieve tokens
const accessToken = await SecureStore.getItemAsync('access_token');

// Clear on logout
await SecureStore.deleteItemAsync('access_token');
await SecureStore.deleteItemAsync('refresh_token');
await SecureStore.deleteItemAsync('expires_at');
```

### Token Refresh Strategy

The backend doesn't expose a dedicated refresh endpoint. Options:

**Option 1: Re-authenticate** (Simplest)

```typescript
// When token expires, prompt user to re-login
if (isTokenExpired()) {
  navigation.navigate('Login');
}
```

**Option 2: Use Supabase Client Directly** (Recommended)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase client handles refresh automatically
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: storedRefreshToken
});

if (data.session) {
  // Save new tokens
  await saveTokens(data.session);
}
```

### Authentication Header Format

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`  // For protected routes only
};
```

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rating must be at least 1"
  }
}
```

### Pagination

When applicable, use query parameters:

- Default `page`: 1
- Default `limit`: 20
- Example: `?page=2&limit=10`

---

## Modules & Endpoints

### Auth Module

Base path: `/auth`

---

#### POST `/auth/register`

Create a new user account.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  email: string;          // Valid email format
  password: string;       // Min 6 characters
  nombre: string;         // First name, min 2 chars
  primerapellido: string; // Last name, min 2 chars
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "nombre": "John",
    "primerapellido": "Doe"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid email/password format |
| 409 | `CONFLICT` | Email already registered |

---

#### POST `/auth/login`

Authenticate user and get tokens.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "auth-uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_at": 1737856200
    }
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `UNAUTHORIZED` | Invalid email or password |

---

#### POST `/auth/logout`

Sign out user and invalidate session.

| Property | Value |
|----------|-------|
| **Auth Required** | ⚠️ Token in header (not validated by middleware) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST `/auth/forgot-password`

Request password reset email.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  email: string;
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent if email exists"
}
```

---

#### POST `/auth/reset-password`

Reset password using token from email.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  email: string;
  token: string;    // From reset email, min 6 chars
  password: string; // New password, min 6 chars
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### GET `/auth/me`

Get current authenticated user's profile.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "correo": "user@example.com",
    "nombre": "John",
    "primerapellido": "Doe",
    "segundoapellido": null,
    "urlfotoperfil": "https://...",
    "createdat": "2024-01-01T00:00:00Z",
    "idestado": "9aca8808-a7a2-4d43-8be8-d341655caa3e",
    "active": true
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `UNAUTHORIZED` | Invalid or expired token |
| 404 | `NOT_FOUND` | User not found |

---

### Users Module

Base path: `/users`

---

#### GET `/users/:id`

Get user's public profile.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nombre": "John",
    "primerapellido": "Doe",
    "segundoapellido": null,
    "urlFotoPerfil": "https://...",
    "createdat": "2024-01-01T00:00:00Z",
    "idestado": "uuid"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 404 | `NOT_FOUND` | User not found |

---

#### PUT `/users/:id`

Update user profile (own profile only).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID (must match authenticated user) |

**Request Body:**

```typescript
{
  nombre?: string;
  primerapellido?: string;
  segundoapellido?: string | null;
  urlfotoperfil?: string;
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 403 | `FORBIDDEN` | Cannot update other users |
| 404 | `NOT_FOUND` | User not found |

---

#### DELETE `/users/:id`

Deactivate account (soft delete).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID (must match authenticated user) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Account deactivated"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 403 | `FORBIDDEN` | Cannot delete other users |

---

#### POST `/users/:id/photo`

Upload profile photo.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `multipart/form-data` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID (must match authenticated user) |

**Form Data:**

| Field | Type | Max Size | Allowed Types |
|-------|------|----------|---------------|
| `photo` | File | 5MB | JPEG, PNG, WebP |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "urlFotoPerfil": "https://..."
  },
  "message": "Profile photo uploaded successfully"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Photo required / invalid file type |
| 403 | `FORBIDDEN` | Cannot upload for other users |

---

#### GET `/users/:id/reviews`

Get all reviews by a user (paginated).

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID |

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20
  }
}
```

---

#### GET `/users/:id/eatlist`

Get user's eatlist.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": [...]
}
```

---

#### GET `/users/:id/top4`

Get user's top 4 rated restaurants.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": [...]
}
```

---

### Restaurants Module

Base path: `/restaurants`

---

#### GET `/restaurants`

List restaurants with filters (from local database).

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `tipoComida` | string | - | Food type filter |
| `puntuacionMin` | number | - | Minimum rating (1-5) |
| `ordenar` | string | - | Sort: `rating`, `distance`, `recent` |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `lat` | number | - | Latitude (for distance sort) |
| `lng` | number | - | Longitude (for distance sort) |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Restaurant Name",
      "direccion": "123 Street, City",
      "latitud": 9.9281,
      "longitud": -84.0907,
      "urlfotoperfil": "https://...",
      "puntuacion": 4.5,
      "foursquareid": "fsq-id"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### GET `/restaurants/search`

Search restaurants via Foursquare API.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Query Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | No | Search term |
| `lat` | number | With `lng` | Latitude |
| `lng` | number | With `lat` | Longitude |
| `radius` | number | No | Search radius (meters) |
| `near` | string | No | Location name (alt to lat/lng) |
| `limit` | number | No | Max results (default: 50) |

> ⚠️ **Note:** Results come directly from Foursquare (not local DB). Restaurant is saved locally when user interacts (review, eatlist).

**Success Response (200):**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 10,
    "source": "foursquare"
  }
}
```

---

#### GET `/restaurants/top`

Get top-rated restaurants.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `near` | string | - | Optional location filter |
| `limit` | number | 10 | Number of results |

**Success Response (200):**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "count": 10
  }
}
```

---

#### GET `/restaurants/foursquare/:fsqId`

Get or create restaurant by Foursquare ID. If restaurant doesn't exist locally, it's fetched from Foursquare and saved.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `fsqId` | string | Foursquare place ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Restaurant Name",
    "foursquareid": "fsq-id",
    ...
  }
}
```

---

#### GET `/restaurants/:id`

Get restaurant by local database ID.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Restaurant ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Restaurant Name",
    "direccion": "123 Street",
    "latitud": 9.9281,
    "longitud": -84.0907,
    "urlfotoperfil": "https://...",
    "urlpaginarestaurante": "https://...",
    "puntuacion": 4.5,
    "foursquareid": "fsq-id",
    "createdat": "2024-01-01T00:00:00Z",
    "updatedat": "2024-01-01T00:00:00Z",
    "active": true
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 404 | `NOT_FOUND` | Restaurant not found |

---

#### GET `/restaurants/:id/reviews`

Get reviews for a restaurant (paginated).

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Restaurant ID |

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "comentario": "Great food!",
      "puntuacion": 5,
      "urlfotoreview": "https://...",
      "createdat": "2024-01-01T00:00:00Z",
      "usuario": {
        "id": "uuid",
        "nombre": "John",
        "primerapellido": "Doe",
        "urlfotoperfil": "https://..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

#### PUT `/restaurants/:id`

Update restaurant information.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Restaurant ID |

**Request Body:**

```typescript
{
  nombre?: string;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  urlfotoperfil?: string | null;
  urlpaginarestaurante?: string | null;
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Restaurant updated"
}
```

---

### Reviews Module

Base path: `/reviews`

---

#### GET `/reviews/:id`

Get review by ID.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Review ID |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "comentario": "Great food!",
    "puntuacion": 5,
    "urlfotoreview": "https://...",
    "idrestaurante": "uuid",
    "idusuario": "uuid",
    "active": true,
    "createdat": "2024-01-01T00:00:00Z",
    "updatedat": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 404 | `NOT_FOUND` | Review not found |

---

#### POST `/reviews`

Create a new review.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  restaurantId: string;  // UUID
  puntuacion: number;    // 1-5 (integer)
  comentario?: string;   // Max 2000 chars, optional
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "puntuacion": 5,
    "comentario": "Amazing!",
    "idrestaurante": "uuid",
    "idusuario": "uuid",
    "createdat": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Rating must be 1-5 |
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | Restaurant/User not found |

---

#### PUT `/reviews/:id`

Update a review (owner only).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Review ID |

**Request Body:**

```typescript
{
  puntuacion?: number;  // 1-5
  comentario?: string;  // Max 2000 chars
}
```

> At least one field required.

**Success Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | At least one field required |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Not review owner |
| 404 | `NOT_FOUND` | Review not found |

---

#### DELETE `/reviews/:id`

Delete a review (soft delete, owner only).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Review ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review deleted"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Not review owner |
| 404 | `NOT_FOUND` | Review not found |

---

#### POST `/reviews/:id/photo`

Upload photo for a review (owner only).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `multipart/form-data` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `id` | UUID | Review ID |

**Form Data:**

| Field | Type | Max Size | Allowed Types |
|-------|------|----------|---------------|
| `photo` | File | 10MB | JPEG, PNG, WebP |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "photoUrl": "https://..."
  },
  "message": "Review photo uploaded successfully"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Photo required / invalid type |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Not review owner |
| 404 | `NOT_FOUND` | Review not found |

---

### Eatlist Module

Base path: `/eatlist`

The eatlist is a personal list of restaurants a user wants to visit or has visited.

- `flag: false` = Want to visit
- `flag: true` = Already visited

---

#### GET `/eatlist`

Get current user's eatlist.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `visited` | `'true'` \| `'false'` | Filter by visited status |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "idusuario": "uuid",
      "idrestaurante": "uuid",
      "flag": false,
      "active": true,
      "createdat": "2024-01-01T00:00:00Z",
      "restaurante": {
        "id": "uuid",
        "nombre": "Restaurant Name",
        "urlfotoperfil": "https://...",
        "puntuacion": 4.5
      }
    }
  ]
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | User not found |

---

#### POST `/eatlist`

Add restaurant to eatlist.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  restaurantId: string;  // UUID or Foursquare ID
  flag?: boolean;        // true = visited, false = want to visit (default)
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "idusuario": "uuid",
    "idrestaurante": "uuid",
    "flag": false,
    "createdat": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid restaurant ID |
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | User not found |
| 409 | `CONFLICT` | Restaurant already in eatlist |

---

#### PUT `/eatlist/:restaurantId`

Update eatlist entry (mark visited/unvisited).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `restaurantId` | UUID | Restaurant ID |

**Request Body:**

```typescript
{
  flag: boolean;  // true = visited, false = want to visit
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Flag is required |
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | Eatlist entry not found |

---

#### DELETE `/eatlist/:restaurantId`

Remove from eatlist (soft delete).

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |

**Path Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `restaurantId` | UUID | Restaurant ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Removed from eatlist"
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid ID format |
| 401 | `UNAUTHORIZED` | Authentication required |
| 404 | `NOT_FOUND` | Eatlist entry not found |

---

### Food Types Module

Base path: `/food-types`

---

#### GET `/food-types`

Get all active food types.

| Property | Value |
|----------|-------|
| **Auth Required** | ❌ No |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nombre": "Mexican" },
    { "id": "uuid", "nombre": "Italian" },
    { "id": "uuid", "nombre": "Japanese" },
    { "id": "uuid", "nombre": "Chinese" },
    { "id": "uuid", "nombre": "American" },
    { "id": "uuid", "nombre": "Costa Rican" }
  ]
}
```

> There are approximately 20 predefined food types.

---

#### POST `/food-types`

Create a new food type.

| Property | Value |
|----------|-------|
| **Auth Required** | ✅ Yes |
| **Content-Type** | `application/json` |

**Request Body:**

```typescript
{
  nombre: string;
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nombre": "Thai"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Name is required |
| 401 | `UNAUTHORIZED` | Authentication required |
| 409 | `CONFLICT` | Food type already exists |

---

## Data Types

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;
  nombre: string;                // First name
  primerapellido: string;        // First surname
  segundoapellido?: string;      // Second surname (optional)
  urlFotoPerfil?: string;        // Profile photo URL
  createdat?: string;            // ISO 8601 timestamp
  idestado: string;              // Status UUID
  active: boolean;
}
```

### Restaurant

```typescript
interface Restaurant {
  id: string;                          // UUID
  nombre: string;                      // Name
  direccion: string | null;            // Address
  latitud: number | null;              // Latitude
  longitud: number | null;             // Longitude
  urlfotoperfil: string | null;        // Photo URL
  urlpaginarestaurante: string | null; // Website URL
  puntuacion: number;                  // Average rating (1-5)
  foursquareid: string | null;         // Foursquare ID
  createdat: string;                   // ISO 8601
  updatedat: string;                   // ISO 8601
  idestado: string;                    // Status UUID
  active: boolean;
  foodTypes?: FoodType[];              // When joined
}
```

### Review

```typescript
interface Review {
  id: string;                    // UUID
  comentario: string | null;     // Review text
  puntuacion: number;            // Rating (1-5)
  urlfotoreview: string | null;  // Photo URL
  idrestaurante: string;         // Restaurant UUID
  idusuario: string;             // User UUID
  idestado: string | null;       // Status UUID
  active: boolean;
  createdat: string;             // ISO 8601
  updatedat: string;             // ISO 8601
}

interface ReviewWithUser extends Review {
  usuario: {
    id: string;
    nombre: string;
    primerapellido: string;
    urlfotoperfil: string | null;
  };
}

interface ReviewWithRestaurant extends Review {
  restaurante: {
    id: string;
    nombre: string;
    urlfotoperfil: string | null;
  };
}
```

### Eatlist

```typescript
interface Eatlist {
  idusuario: string;             // User UUID
  idrestaurante: string;         // Restaurant UUID
  flag: boolean;                 // true = visited, false = want to visit
  active: boolean;
  createdat: string;             // ISO 8601
  updatedat: string;             // ISO 8601
}

interface EatlistWithRestaurant extends Eatlist {
  restaurante: {
    id: string;
    nombre: string;
    urlfotoperfil: string | null;
    puntuacion: number | null;
  };
}
```

### FoodType

```typescript
interface FoodType {
  id: string;      // UUID
  nombre: string;  // Name
}
```

### Status Constants

The `idestado` field references these status UUIDs:

| Status | UUID | Description |
|--------|------|-------------|
| ACTIVO | `9aca8808-a7a2-4d43-8be8-d341655caa3e` | Active |
| BLOQUEADO | `fdec242e-0080-42d9-8307-98a72982d9ae` | Blocked |
| ELIMINADO | `dbed121f-7214-41be-ad06-c12c7ae0d7de` | Deleted |
| INACTIVO | `31d61dcd-cb50-47f2-a0c2-d494ec358fd4` | Inactive |
| PENDIENTE | `05e31c9e-093c-406a-bf6a-ec457f143e9c` | Pending |

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Common Error Messages

| Message | When |
|---------|------|
| "Invalid email or password" | Wrong credentials on login |
| "User not found" | User doesn't exist |
| "Email already registered" | Duplicate email on register |
| "Restaurant not found" | Invalid restaurant ID |
| "Review not found" | Invalid review ID |
| "Eatlist entry not found" | Restaurant not in user's eatlist |
| "Restaurant already in eatlist" | Duplicate eatlist entry |
| "Invalid or expired token" | Bad/expired JWT |
| "You do not have permission to perform this action" | Not resource owner |
| "Missing authorization header" | No auth header on protected route |

### Error Handling Example

```typescript
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!data.success) {
    switch (data.error.code) {
      case 'UNAUTHORIZED':
        // Clear tokens and redirect to login
        await clearTokens();
        navigation.navigate('Login');
        break;
      case 'VALIDATION_ERROR':
        // Show validation message to user
        Alert.alert('Error', data.error.message);
        break;
      case 'NOT_FOUND':
        // Handle missing resource
        Alert.alert('Not Found', data.error.message);
        break;
      case 'FORBIDDEN':
        // User doesn't have permission
        Alert.alert('Access Denied', data.error.message);
        break;
      case 'CONFLICT':
        // Resource already exists
        Alert.alert('Already Exists', data.error.message);
        break;
      default:
        // Generic error
        Alert.alert('Error', 'Something went wrong');
    }
    throw new Error(data.error.message);
  }
  
  return data.data;
}
```

---

## File Uploads

### Configuration

| Type | Max Size | Allowed Formats | Storage Bucket |
|------|----------|-----------------|----------------|
| Profile Photo | 5MB | JPEG, PNG, WebP | `profile-pictures` |
| Review Photo | 10MB | JPEG, PNG, WebP | `restaurant-reviews` |

### Upload Example (Expo)

```typescript
import * as ImagePicker from 'expo-image-picker';

async function uploadProfilePhoto(userId: string, accessToken: string) {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to photos');
    return;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return;

  const uri = result.assets[0].uri;
  const filename = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  // Create form data
  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: filename,
    type,
  } as any);

  // Upload
  const response = await fetch(`${API_URL}/users/${userId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      // Don't set Content-Type - let fetch handle it for multipart
    },
    body: formData,
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error.message);
  }
  
  return data.data.urlFotoPerfil;
}
```

### Camera Upload Example

```typescript
async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow camera access');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
}
```

---

## Potential Issues & Mitigation

### 1. Token Expiration

**Issue:** Access tokens expire (typically 1 hour).

**Mitigation:**

```typescript
function isTokenExpired(expiresAt: number): boolean {
  const bufferSeconds = 60; // 1 minute buffer
  return Date.now() / 1000 >= expiresAt - bufferSeconds;
}

// Before each API call
async function ensureValidToken() {
  const expiresAt = await SecureStore.getItemAsync('expires_at');
  if (expiresAt && isTokenExpired(parseInt(expiresAt))) {
    // Either refresh token or re-authenticate
    await refreshOrRelogin();
  }
}
```

### 2. Network Errors

**Issue:** Requests may fail due to network issues.

**Mitigation:**

```typescript
import NetInfo from '@react-native-community/netinfo';

async function safeApiCall<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    throw new Error('No internet connection');
  }

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

### 3. Foursquare API Rate Limits

**Issue:** Free tier has 10,000 requests/month limit.

**Mitigation:**

- Cache search results locally using AsyncStorage or MMKV
- Use local DB restaurants when possible (`/restaurants` instead of `/restaurants/search`)
- Debounce search input (300ms minimum)
- Show cached results while fetching new ones

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function searchWithCache(query: string, location: string) {
  const cacheKey = `search_${query}_${location}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const isStale = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes
    
    if (!isStale) {
      return data;
    }
  }
  
  const results = await api.get(`/restaurants/search?query=${query}&near=${location}`);
  
  await AsyncStorage.setItem(cacheKey, JSON.stringify({
    data: results,
    timestamp: Date.now(),
  }));
  
  return results;
}
```

### 4. Image Upload Failures

**Issue:** Large images may fail or timeout.

**Mitigation:**

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

async function compressImage(uri: string, maxWidth = 1200): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  
  return result.uri;
}

// Use before upload
const compressedUri = await compressImage(originalUri);
```

### 5. UUID Handling

**Issue:** All IDs are UUIDs, not integers.

**Mitigation:**

```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

// Validate before API calls
if (!isValidUUID(restaurantId)) {
  throw new Error('Invalid restaurant ID format');
}
```

### 6. Soft Deletes

**Issue:** Deleted resources have `active: false`, not removed from DB.

**Mitigation:**

- Backend filters inactive records by default
- If you see unexpected data, check the `active` field
- Don't rely on record count for totals - use `meta.total` from pagination

### 7. Spanish Column Names

**Issue:** Response fields use Spanish names.

**Mitigation:**

```typescript
// Create mapping utilities
interface UserMapped {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  profilePhotoUrl?: string;
}

function mapUser(raw: any): UserMapped {
  return {
    id: raw.id,
    email: raw.correo || raw.email,
    firstName: raw.nombre,
    lastName: raw.primerapellido,
    secondLastName: raw.segundoapellido,
    profilePhotoUrl: raw.urlfotoperfil || raw.urlFotoPerfil,
  };
}

function mapRestaurant(raw: any) {
  return {
    id: raw.id,
    name: raw.nombre,
    address: raw.direccion,
    latitude: raw.latitud,
    longitude: raw.longitud,
    photoUrl: raw.urlfotoperfil,
    websiteUrl: raw.urlpaginarestaurante,
    rating: raw.puntuacion,
    foursquareId: raw.foursquareid,
  };
}
```

### 8. Handling Pagination

**Issue:** Large lists need proper pagination handling.

**Mitigation:**

```typescript
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await api.get<T[]>(`${endpoint}?page=${page}&limit=50`);
    allItems.push(...(response.data || []));
    
    hasMore = response.meta ? page < response.meta.totalPages : false;
    page++;
  }
  
  return allItems;
}

// Or use infinite scroll
function useInfiniteList<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const response = await api.get<T[]>(`${endpoint}?page=${page}`);
    
    setItems(prev => [...prev, ...(response.data || [])]);
    setHasMore(response.meta ? page < response.meta.totalPages : false);
    setPage(p => p + 1);
    setLoading(false);
  };

  return { items, loadMore, hasMore, loading };
}
```

### 9. Concurrent Requests

**Issue:** Making too many simultaneous requests.

**Mitigation:**

```typescript
// Use Promise.all wisely
async function loadDashboard(userId: string) {
  const [user, reviews, eatlist, topRestaurants] = await Promise.all([
    api.get(`/users/${userId}`),
    api.get(`/users/${userId}/reviews?limit=5`),
    api.get(`/users/${userId}/eatlist`),
    api.get('/restaurants/top?limit=10'),
  ]);
  
  return { user, reviews, eatlist, topRestaurants };
}
```

### 10. Deep Linking with Restaurant IDs

**Issue:** Sharing restaurants might use Foursquare ID or local UUID.

**Mitigation:**

```typescript
// Handle both ID types
async function getRestaurant(id: string) {
  if (isValidUUID(id)) {
    // Local database ID
    return api.get(`/restaurants/${id}`);
  } else {
    // Assume Foursquare ID
    return api.get(`/restaurants/foursquare/${id}`);
  }
}
```

---

## Environment Configuration

### Required Environment Variables (Mobile)

> ⚠️ The mobile app should **NOT** use the service role key. Use the anon key instead.

```typescript
// config/env.ts
export const ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...', // Public anon key
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000'
    : 'https://your-production-api.com',
};
```

### Using Expo Constants

```typescript
// app.config.ts
export default {
  expo: {
    name: 'Bokitas',
    slug: 'bokitas',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    },
  },
};
```

```typescript
// Usage in app
import Constants from 'expo-constants';

const { 
  supabaseUrl, 
  supabaseAnonKey, 
  apiBaseUrl 
} = Constants.expoConfig?.extra ?? {};
```

### .env file (for Expo)

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## React Native/Expo Code Examples

### API Service Setup

```typescript
// services/api.ts
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

class ApiService {
  private async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync('access_token');
  }

  private async isTokenValid(): Promise<boolean> {
    const expiresAt = await SecureStore.getItemAsync('expires_at');
    if (!expiresAt) return false;
    return Date.now() / 1000 < parseInt(expiresAt) - 60;
  }

  private async getHeaders(requiresAuth: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      if (!await this.isTokenValid()) {
        throw new Error('Token expired');
      }
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    return response.json();
  }

  async post<T>(
    endpoint: string, 
    body: any, 
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async put<T>(
    endpoint: string, 
    body: any, 
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async delete<T>(
    endpoint: string, 
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  }

  async uploadFile<T>(
    endpoint: string,
    file: { uri: string; name: string; type: string },
    fieldName: string = 'photo'
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    
    const formData = new FormData();
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return response.json();
  }
}

export const api = new ApiService();
```

### Auth Service

```typescript
// services/auth.ts
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface LoginResponse {
  user: { id: string; email: string };
  session: AuthTokens;
}

interface User {
  id: string;
  correo: string;
  nombre: string;
  primerapellido: string;
  segundoapellido?: string;
  urlfotoperfil?: string;
  createdat: string;
  idestado: string;
  active: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  primerapellido: string;
}

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    // Save tokens securely
    const { session } = response.data;
    await this.saveTokens(session);

    // Get full user profile
    return this.getCurrentUser();
  }

  async register(data: RegisterData): Promise<{ id: string; email: string }> {
    const response = await api.post<{ id: string; email: string }>('/auth/register', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed');
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {}, true);
    } catch (error) {
      // Continue with local logout even if API fails
      console.warn('Logout API call failed:', error);
    }

    await this.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me', true);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get user');
    }

    return response.data;
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('access_token');
    const expiresAt = await SecureStore.getItemAsync('expires_at');
    
    if (!token || !expiresAt) return false;

    const isExpired = Date.now() / 1000 >= parseInt(expiresAt) - 60;
    return !isExpired;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await api.post('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send reset email');
    }
  }

  async resetPassword(email: string, token: string, password: string): Promise<void> {
    const response = await api.post('/auth/reset-password', { email, token, password });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset password');
    }
  }

  private async saveTokens(session: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync('access_token', session.access_token);
    await SecureStore.setItemAsync('refresh_token', session.refresh_token);
    await SecureStore.setItemAsync('expires_at', session.expires_at.toString());
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('expires_at');
  }
}

export const authService = new AuthService();
```

### Restaurant Service

```typescript
// services/restaurants.ts
import { api } from './api';

interface Restaurant {
  id: string;
  nombre: string;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  urlfotoperfil: string | null;
  urlpaginarestaurante: string | null;
  puntuacion: number;
  foursquareid: string | null;
  createdat: string;
  updatedat: string;
  active: boolean;
}

interface SearchParams {
  query?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  near?: string;
  limit?: number;
}

interface FilterParams {
  tipoComida?: string;
  puntuacionMin?: number;
  ordenar?: 'rating' | 'distance' | 'recent';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class RestaurantService {
  async search(params: SearchParams): Promise<Restaurant[]> {
    const queryString = this.buildQueryString(params);
    const response = await api.get<Restaurant[]>(`/restaurants/search?${queryString}`);
    return response.data || [];
  }

  async getAll(params: FilterParams = {}): Promise<PaginatedResponse<Restaurant>> {
    const queryString = this.buildQueryString(params);
    const response = await api.get<Restaurant[]>(`/restaurants?${queryString}`);
    return {
      data: response.data || [],
      meta: response.meta || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }

  async getById(id: string): Promise<Restaurant> {
    const response = await api.get<Restaurant>(`/restaurants/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Restaurant not found');
    }
    return response.data;
  }

  async getByFoursquareId(fsqId: string): Promise<Restaurant> {
    const response = await api.get<Restaurant>(`/restaurants/foursquare/${fsqId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Restaurant not found');
    }
    return response.data;
  }

  async getTopRated(limit: number = 10): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>(`/restaurants/top?limit=${limit}`);
    return response.data || [];
  }

  async getReviews(restaurantId: string, page: number = 1, limit: number = 20) {
    const response = await api.get(`/restaurants/${restaurantId}/reviews?page=${page}&limit=${limit}`);
    return {
      data: response.data || [],
      meta: response.meta,
    };
  }

  async update(id: string, data: Partial<Restaurant>): Promise<void> {
    const response = await api.put(`/restaurants/${id}`, data, true);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update restaurant');
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    return new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();
  }
}

export const restaurantService = new RestaurantService();
```

### Review Service

```typescript
// services/reviews.ts
import { api } from './api';

interface Review {
  id: string;
  comentario: string | null;
  puntuacion: number;
  urlfotoreview: string | null;
  idrestaurante: string;
  idusuario: string;
  createdat: string;
  updatedat: string;
  active: boolean;
}

interface CreateReviewData {
  restaurantId: string;
  puntuacion: number;
  comentario?: string;
}

interface UpdateReviewData {
  puntuacion?: number;
  comentario?: string;
}

class ReviewService {
  async getById(id: string): Promise<Review> {
    const response = await api.get<Review>(`/reviews/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Review not found');
    }
    return response.data;
  }

  async create(data: CreateReviewData): Promise<Review> {
    const response = await api.post<Review>('/reviews', data, true);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create review');
    }
    return response.data;
  }

  async update(id: string, data: UpdateReviewData): Promise<Review> {
    const response = await api.put<Review>(`/reviews/${id}`, data, true);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update review');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    const response = await api.delete(`/reviews/${id}`, true);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete review');
    }
  }

  async uploadPhoto(reviewId: string, imageUri: string): Promise<string> {
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const response = await api.uploadFile<{ photoUrl: string }>(
      `/reviews/${reviewId}/photo`,
      { uri: imageUri, name: filename, type },
      'photo'
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to upload photo');
    }

    return response.data.photoUrl;
  }
}

export const reviewService = new ReviewService();
```

### Eatlist Service

```typescript
// services/eatlist.ts
import { api } from './api';

interface EatlistEntry {
  idusuario: string;
  idrestaurante: string;
  flag: boolean;
  active: boolean;
  createdat: string;
  updatedat: string;
  restaurante?: {
    id: string;
    nombre: string;
    urlfotoperfil: string | null;
    puntuacion: number | null;
  };
}

class EatlistService {
  async getAll(visited?: boolean): Promise<EatlistEntry[]> {
    let endpoint = '/eatlist';
    if (visited !== undefined) {
      endpoint += `?visited=${visited}`;
    }
    
    const response = await api.get<EatlistEntry[]>(endpoint, true);
    return response.data || [];
  }

  async getWantToVisit(): Promise<EatlistEntry[]> {
    return this.getAll(false);
  }

  async getVisited(): Promise<EatlistEntry[]> {
    return this.getAll(true);
  }

  async add(restaurantId: string, visited: boolean = false): Promise<EatlistEntry> {
    const response = await api.post<EatlistEntry>('/eatlist', {
      restaurantId,
      flag: visited,
    }, true);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to add to eatlist');
    }

    return response.data;
  }

  async markAsVisited(restaurantId: string): Promise<EatlistEntry> {
    return this.updateFlag(restaurantId, true);
  }

  async markAsWantToVisit(restaurantId: string): Promise<EatlistEntry> {
    return this.updateFlag(restaurantId, false);
  }

  async updateFlag(restaurantId: string, visited: boolean): Promise<EatlistEntry> {
    const response = await api.put<EatlistEntry>(
      `/eatlist/${restaurantId}`,
      { flag: visited },
      true
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update eatlist');
    }

    return response.data;
  }

  async remove(restaurantId: string): Promise<void> {
    const response = await api.delete(`/eatlist/${restaurantId}`, true);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to remove from eatlist');
    }
  }
}

export const eatlistService = new EatlistService();
```

### React Hook Examples

```typescript
// hooks/useRestaurantSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { restaurantService } from '../services/restaurants';

interface Restaurant {
  id: string;
  nombre: string;
  puntuacion: number;
  urlfotoperfil: string | null;
}

export function useRestaurantSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string, lat?: number, lng?: number) => {
    if (!searchQuery.trim() && !lat) {
      setRestaurants([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await restaurantService.search({
        query: searchQuery,
        lat,
        lng,
        limit: 20,
      });
      setRestaurants(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  return {
    query,
    setQuery,
    restaurants,
    loading,
    error,
    search,
  };
}
```

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  correo: string;
  nombre: string;
  primerapellido: string;
  urlfotoperfil?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  primerapellido: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function register(data: RegisterData) {
    await authService.register(data);
    // Don't auto-login after register - user needs to verify email or login manually
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## Endpoint Summary Table

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| | **Auth** | | |
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, get tokens |
| POST | `/auth/logout` | ⚠️ | Logout |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password with token |
| GET | `/auth/me` | ✅ | Get current user |
| | **Users** | | |
| GET | `/users/:id` | ❌ | Get user profile |
| PUT | `/users/:id` | ✅ | Update profile |
| DELETE | `/users/:id` | ✅ | Deactivate account |
| POST | `/users/:id/photo` | ✅ | Upload profile photo |
| GET | `/users/:id/reviews` | ❌ | Get user's reviews |
| GET | `/users/:id/eatlist` | ❌ | Get user's eatlist |
| GET | `/users/:id/top4` | ❌ | Get user's top 4 |
| | **Restaurants** | | |
| GET | `/restaurants` | ❌ | List with filters |
| GET | `/restaurants/search` | ❌ | Search via Foursquare |
| GET | `/restaurants/top` | ❌ | Get top rated |
| GET | `/restaurants/foursquare/:fsqId` | ❌ | Get by Foursquare ID |
| GET | `/restaurants/:id` | ❌ | Get by ID |
| GET | `/restaurants/:id/reviews` | ❌ | Get restaurant reviews |
| PUT | `/restaurants/:id` | ✅ | Update restaurant |
| | **Reviews** | | |
| GET | `/reviews/:id` | ❌ | Get review |
| POST | `/reviews` | ✅ | Create review |
| PUT | `/reviews/:id` | ✅ | Update review |
| DELETE | `/reviews/:id` | ✅ | Delete review |
| POST | `/reviews/:id/photo` | ✅ | Upload review photo |
| | **Eatlist** | | |
| GET | `/eatlist` | ✅ | Get user's eatlist |
| POST | `/eatlist` | ✅ | Add to eatlist |
| PUT | `/eatlist/:restaurantId` | ✅ | Update entry |
| DELETE | `/eatlist/:restaurantId` | ✅ | Remove from eatlist |
| | **Food Types** | | |
| GET | `/food-types` | ❌ | List food types |
| POST | `/food-types` | ✅ | Create food type |

**Legend:**
- ✅ = Auth required
- ❌ = Public endpoint
- ⚠️ = Token sent but not validated by middleware

---

## Additional Resources

- **Backend Documentation:** `BACKEND.md` (project root)
- **Entity Details:** `docs/entities/*.md`
- **Endpoint Details:** `docs/endpoints/*.md`
- **Known Issues & Solutions:** `docs/postmortem/*.md`

---

## Changelog

### v1.0 (January 2025)
- Initial documentation for Phase 1 MVP
- 27 endpoints documented
- 6 modules covered
- React Native/Expo code examples included
