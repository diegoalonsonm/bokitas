# API Endpoints Documentation

Complete API reference for the Bokitas backend.

## Available Modules

| Module | Description | Endpoints |
|---------|-------------|------------|
| [Authentication](./auth-endpoints.md) | User registration, login, logout, password reset | 6 endpoints |
| [Users](./user-endpoints.md) | User profiles, photos, reviews, eatlist | 7 endpoints |
| [Reviews](./review-endpoints.md) | Review CRUD and photo upload | 5 endpoints |

---

## Quick Reference

### Authentication Flow
1. `POST /auth/register` - Create account
2. `POST /auth/login` - Get access token
3. Use `Authorization: Bearer <token>` header for protected endpoints
4. `POST /auth/logout` - Sign out

### User Management
- **Public:** View profiles, reviews, eatlist, top restaurants
- **Protected:** Update profile, upload photo, delete account

---

## Getting Started

1. Ensure backend is running: `npm run dev`
2. Base URL: `http://localhost:3000`
3. See individual module docs for endpoint details

---

## Common Patterns

### Authentication
Protected endpoints require:
```
Authorization: Bearer <your-jwt-token>
```

### File Upload
For photo uploads:
- Content-Type: `multipart/form-data`
- Form field: `photo` (user) or `photos` (review)

### Pagination
Use `page` and `limit` query parameters:
```
GET /users/:id/reviews?page=1&limit=20
```

---

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```
