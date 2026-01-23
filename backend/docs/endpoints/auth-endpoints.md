# Authentication Endpoints

## Overview

Authentication module handles user registration, login, logout, password reset, and session management using Supabase Auth.

---

## Base URL
```
http://localhost:3000
```

---

## Endpoints

### 1. Register User

**POST** `/auth/register`

Register a new user account with email and password.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nombre": "John",
  "apellido": "Doe"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|--------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 characters |
| nombre | string | Yes | Min 2 characters |
| apellido | string | Yes | Min 2 characters |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "nombre": "John",
    "apellido": "Doe"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Validation error details |
| 409 | CONFLICT | Email already registered |

---

### 2. Login

**POST** `/auth/login`

Authenticate a user and return session token.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "email_confirmed_at": "2026-01-22T10:30:00.000Z",
      "created_at": "2026-01-22T10:30:00.000Z",
      "updated_at": "2026-01-22T10:30:00.000Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_at": 1737856200
    }
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Validation error details |
| 401 | UNAUTHORIZED | Invalid email or password |

**Note:** Use the `access_token` in the `Authorization` header for subsequent requests to protected endpoints.

---

### 3. Logout

**POST** `/auth/logout`

Sign out the current user session.

**Authentication:** Required (JWT token in Authorization header)

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Missing authorization header |

---

### 4. Forgot Password

**POST** `/auth/forgot-password`

Request a password reset email for an account.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent if email exists"
}
```

**Note:** Always returns success even if email doesn't exist (security best practice). The email will contain a reset link pointing to `${CORS_ORIGIN}/auth/reset-password`.

---

### 5. Reset Password

**POST** `/auth/reset-password`

Reset password using token from email link.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-here",
  "password": "NewSecurePass123!"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| token | string | Yes | Token from password reset email |
| password | string | Yes | New password (min 8 characters) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Validation error details |

---

### 6. Get Current User

**GET** `/auth/me`

Get information about the currently authenticated user.

**Authentication:** Required (JWT token in Authorization header)

**Request Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "nombre": "John",
    "apellido": "Doe",
    "createdat": "2026-01-22T10:30:00.000Z",
    "urlfotoperfil": "https://supabase-url.com/profile-photos/...",
    "idestado": "9aca8808-a7a2-4d43-8be8-d341655caa3e",
    "active": true
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | User not authenticated or token invalid |

---

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| CONFLICT | 409 | Resource conflict (e.g., email already exists) |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Authentication Flow

1. **Register:** POST `/auth/register` → Returns user data
2. **Login:** POST `/auth/login` → Returns `access_token` and `refresh_token`
3. **Use Token:** Include `Authorization: Bearer <access_token>` header in subsequent requests
4. **Refresh:** Use `/auth/login` again with credentials to get new tokens (token refresh via Supabase client)
5. **Logout:** POST `/auth/logout` → Invalidates session

---

## Testing Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "nombre": "John",
    "apellido": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Current User:**
```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Forgot Password:**
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "token": "reset-token-from-email",
    "password": "NewSecurePass456!"
  }'
```

---

## Notes

- Registration creates both Supabase Auth user and `usuario` record
- User is created with status "Pending" by default
- Password reset link redirects to frontend URL configured in environment (`CORS_ORIGIN`)
- Access tokens have expiration time; handle refresh in your frontend application
- Email confirmation is handled by Supabase Auth (configured in Supabase dashboard)
- The `/auth/me` endpoint requires valid JWT and returns extended user profile data from `usuario` table
