# Phase 1 - MVP Implementation Plan

> **Document**: Backend implementation plan for Bokitas Phase 1 (Core MVP)
>
> **Project**: Bokitas - A "Letterboxd for restaurants" app focused on Costa Rica
>
> **Created**: 2026-01-22
>
> **Status**: Approved

---

## Overview

This document outlines the implementation plan for Phase 1 of the Bokitas backend. The goal is to deliver a functional MVP with core features: authentication, user profiles, restaurant discovery, reviews, and eatlist management.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | Supabase Auth | Already integrated via `usuario.authId` -> `auth.users`. Built-in security, email verification, password reset. |
| Database Access | Supabase JS Client | Works with existing RLS policies. Cleaner integration than raw Sequelize. |
| Restaurant Search | Foursquare Places API | 10K free calls/month, restaurant-focused data, good for venue discovery. |
| Map Display | Frontend only (Mapbox/Leaflet) | Not a backend concern - frontend plots coordinates on map. |
| Restaurant Photos | User-generated only | Community-driven content like Letterboxd. Zero API cost. First review photo becomes restaurant cover. |
| Default Region | Costa Rica | Primary market focus. Searches default to CR when no coordinates provided. |

---

## Current Database State

- **Database**: Fully configured in Supabase with RLS enabled
- **Tables Ready**: `estado` (5), `usuario`, `restaurante`, `tipocomida` (20), `restaurantetipocomida`, `review`, `eatlist`
- **Backend Code**: Empty - needs full implementation

### Existing Status IDs (from `estado` table)

| Status | ID |
|--------|-----|
| Active | `9aca8808-a7a2-4d43-8be8-d341655caa3e` |
| Blocked | `fdec242e-0080-42d9-8307-98a72982d9ae` |
| Deleted | `dbed121f-7214-41be-ad06-c12c7ae0d7de` |
| Inactive | `31d61dcd-cb50-47f2-a0c2-d494ec358fd4` |
| Pending | `05e31c9e-093c-406a-bf6a-ec457f143e9c` |

---

## Database Schema Update Required

Add `foursquareid` column to `restaurante` table for caching and deduplication:

```sql
ALTER TABLE restaurante 
ADD COLUMN foursquareid VARCHAR(255) UNIQUE;
```

---

## Project Structure

```
backend/
├── Controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── restaurantController.js
│   ├── reviewController.js
│   ├── eatlistController.js
│   └── foodTypeController.js
│
├── Models/
│   ├── supabase/
│   │   └── client.js              # Supabase client initialization
│   ├── validations/
│   │   ├── authValidation.js
│   │   ├── userValidation.js
│   │   ├── restaurantValidation.js
│   │   ├── reviewValidation.js
│   │   └── eatlistValidation.js
│   ├── userModel.js
│   ├── restaurantModel.js
│   ├── reviewModel.js
│   ├── eatlistModel.js
│   └── foodTypeModel.js
│
├── Routes/
│   ├── authRouter.js
│   ├── userRouter.js
│   ├── restaurantRouter.js
│   ├── reviewRouter.js
│   ├── eatlistRouter.js
│   └── foodTypeRouter.js
│
├── Middleware/
│   ├── authMiddleware.js          # Verify Supabase JWT
│   └── errorMiddleware.js         # Global error handler
│
├── Services/
│   ├── foursquareService.js       # Foursquare API integration
│   └── storageService.js          # Supabase Storage helpers
│
├── Utils/
│   └── constants.js               # Status IDs, error messages
│
├── docs/
│   ├── entities/
│   ├── endpoints/
│   └── postmortem/
│
├── planning/
│   └── PHASE1_PLANNING.md
│
├── index.js
├── package.json
├── .env
├── .env.example
├── AGENTS.md
└── BACKEND.md
```

---

## Dependencies

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

---

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://kzzbsnpopncseymphchl.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Foursquare
FOURSQUARE_API_KEY=your-api-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Implementation Tasks

### Task 0: Project Setup (~1 hour)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 0.1 | Initialize npm project | Create `package.json` with ES Modules, scripts | 10 min |
| 0.2 | Install dependencies | All packages listed above | 5 min |
| 0.3 | Create folder structure | Controllers, Models, Routes, etc. | 10 min |
| 0.4 | Configure environment | Create `.env.example`, setup `.env` | 10 min |
| 0.5 | Setup Supabase client | Initialize client in `Models/supabase/client.js` | 15 min |
| 0.6 | Create entry point | Basic Express server with middleware in `index.js` | 15 min |
| 0.7 | Create utility constants | Status IDs, error codes in `Utils/constants.js` | 10 min |

---

### Task 1: Authentication Module (~3.5 hours)

Supabase Auth handles: Registration, login, logout, password reset, email verification.

Backend responsibilities: Verify JWT, create/sync `usuario` record, provide user info.

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register via Supabase Auth + create `usuario` record | Public |
| POST | `/auth/login` | Login via Supabase Auth, return session | Public |
| POST | `/auth/logout` | Sign out via Supabase Auth | Required |
| POST | `/auth/forgot-password` | Request password reset email | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| GET | `/auth/me` | Get current authenticated user info | Required |

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 1.1 | Auth middleware (verify Supabase JWT) | 30 min |
| 1.2 | Auth validation schemas (Zod) | 20 min |
| 1.3 | POST `/auth/register` | 45 min |
| 1.4 | POST `/auth/login` | 30 min |
| 1.5 | POST `/auth/logout` | 15 min |
| 1.6 | POST `/auth/forgot-password` | 20 min |
| 1.7 | POST `/auth/reset-password` | 20 min |
| 1.8 | GET `/auth/me` | 20 min |
| 1.9 | Documentation | 15 min |

---

### Task 2: User Module (~4.5 hours)

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/:id` | Get user profile (public info) | Public |
| PUT | `/users/:id` | Update own profile | Owner only |
| DELETE | `/users/:id` | Deactivate account (soft delete) | Owner only |
| POST | `/users/:id/photo` | Upload profile photo | Owner only |
| GET | `/users/:id/reviews` | Get user's reviews | Public |
| GET | `/users/:id/eatlist` | Get user's eatlist | Public |
| GET | `/users/:id/top4` | Get user's top 4 rated restaurants | Public |

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 2.1 | User model (CRUD operations) | 45 min |
| 2.2 | User validation schemas | 20 min |
| 2.3 | GET `/users/:id` | 25 min |
| 2.4 | PUT `/users/:id` | 30 min |
| 2.5 | DELETE `/users/:id` | 25 min |
| 2.6 | POST `/users/:id/photo` | 40 min |
| 2.7 | GET `/users/:id/reviews` | 25 min |
| 2.8 | GET `/users/:id/eatlist` | 25 min |
| 2.9 | GET `/users/:id/top4` | 30 min |
| 2.10 | Storage service helpers | 30 min |
| 2.11 | Documentation | 20 min |

---

### Task 3: Restaurant Module (~6 hours)

**Foursquare Service Features:**
- Search restaurants (Text Search)
- Get restaurant details
- Nearby restaurants (lat/lng + radius)
- Cache results in local DB when user interacts

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/restaurants` | List from local DB with filters | Public |
| GET | `/restaurants/search` | Search via Foursquare API | Public |
| GET | `/restaurants/nearby` | Nearby via Foursquare API | Public |
| GET | `/restaurants/:id` | Get restaurant from local DB | Public |
| GET | `/restaurants/:id/reviews` | Get restaurant's reviews | Public |
| POST | `/restaurants` | Save Foursquare result to local DB | Required |
| PUT | `/restaurants/:id` | Update restaurant info | Required |

**Query Parameters for `/restaurants`:**

| Param | Type | Description |
|-------|------|-------------|
| tipoComida | uuid | Filter by food type ID |
| lat | number | User's latitude |
| lng | number | User's longitude |
| radio | number | Radius in km (default: 10) |
| puntuacionMin | number | Minimum rating (1-5) |
| ordenar | string | Sort: `rating`, `distance`, `recent` |
| page | int | Page number (default: 1) |
| limit | int | Items per page (default: 20) |

**Note:** Searches default to Costa Rica when no `lat/lng` provided.

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 3.1 | Foursquare service (API client) | 60 min |
| 3.2 | Restaurant model (CRUD + search) | 45 min |
| 3.3 | Restaurant validation schemas | 20 min |
| 3.4 | GET `/restaurants` (with filters) | 45 min |
| 3.5 | GET `/restaurants/search` | 40 min |
| 3.6 | GET `/restaurants/nearby` | 40 min |
| 3.7 | GET `/restaurants/:id` | 25 min |
| 3.8 | GET `/restaurants/:id/reviews` | 25 min |
| 3.9 | POST `/restaurants` | 35 min |
| 3.10 | PUT `/restaurants/:id` | 25 min |
| 3.11 | Documentation | 25 min |

---

### Task 4: Review Module (~4 hours)

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reviews` | Create review | Required |
| GET | `/reviews/:id` | Get review details | Public |
| PUT | `/reviews/:id` | Update own review | Owner only |
| DELETE | `/reviews/:id` | Soft delete own review | Owner only |
| POST | `/reviews/:id/photos` | Upload review photos | Owner only |

**Photo Logic:**
- Review photos stored in Supabase Storage (`review-photos` bucket)
- First photo of first review becomes restaurant's `urlfotoperfil`
- Creates authentic, community-driven content (like Letterboxd)

**Rating Recalculation:**
- Triggered on review create/update/delete
- `restaurante.puntuacion` = AVG of all active review ratings for that restaurant

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 4.1 | Review model (CRUD operations) | 40 min |
| 4.2 | Review validation schemas | 20 min |
| 4.3 | POST `/reviews` | 35 min |
| 4.4 | GET `/reviews/:id` | 20 min |
| 4.5 | PUT `/reviews/:id` | 30 min |
| 4.6 | DELETE `/reviews/:id` | 25 min |
| 4.7 | POST `/reviews/:id/photos` | 35 min |
| 4.8 | Rating recalculation logic | 40 min |
| 4.9 | Restaurant cover photo logic | 30 min |
| 4.10 | Documentation | 20 min |

---

### Task 5: Eatlist Module (~2 hours)

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/eatlist` | Get current user's eatlist | Required |
| POST | `/eatlist` | Add restaurant to eatlist | Required |
| PUT | `/eatlist/:restaurantId` | Update visited flag | Required |
| DELETE | `/eatlist/:restaurantId` | Remove from eatlist | Required |

**Flag Values:**
- `visitado = false` → Want to visit
- `visitado = true` → Already visited

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 5.1 | Eatlist model (CRUD) | 35 min |
| 5.2 | Eatlist validation schemas | 15 min |
| 5.3 | GET `/eatlist` | 25 min |
| 5.4 | POST `/eatlist` | 30 min |
| 5.5 | PUT `/eatlist/:restaurantId` | 25 min |
| 5.6 | DELETE `/eatlist/:restaurantId` | 25 min |
| 5.7 | Documentation | 15 min |

---

### Task 6: Food Types Module (~45 min)

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/food-types` | List all food types | Public |

**Note:** 20 food types already seeded in database.

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 6.1 | FoodType model (read operations) | 20 min |
| 6.2 | GET `/food-types` | 15 min |
| 6.3 | Documentation | 10 min |

---

### Task 7: Supabase Storage Setup (~1 hour)

**Buckets to Create:**

| Bucket | Access | Max Size | Allowed Types |
|--------|--------|----------|---------------|
| profile-photos | Public | 5MB | image/jpeg, image/png, image/webp |
| review-photos | Public | 10MB | image/jpeg, image/png, image/webp |

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 7.1 | Create storage buckets | 15 min |
| 7.2 | Configure bucket policies | 20 min |
| 7.3 | Storage service helpers (upload, delete, getUrl) | 30 min |

---

### Task 8: Error Handling & Middleware (~1 hour)

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 8.1 | Global error handler middleware | 25 min |
| 8.2 | 404 handler for undefined routes | 10 min |
| 8.3 | Zod validation middleware | 20 min |

---

### Task 9: Testing & Documentation (~1 hour)

**Subtasks:**

| # | Task | Est. Time |
|---|------|-----------|
| 9.1 | API health check (all endpoints) | 30 min |
| 9.2 | Update BACKEND.md | 15 min |
| 9.3 | Update AGENTS.md project state | 10 min |

---

## API Response Standards

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Restaurant not found"
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not owner/admin) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Server Error |

---

## Foursquare Integration Strategy

**Flow:**

1. **User searches** → Call Foursquare API → Return results to frontend
2. **User interacts** (reviews, saves to eatlist) → Save restaurant to local DB with `foursquareid`
3. **Future lookups** → Check local DB first by `foursquareid` before calling API
4. **Benefit:** Reduces API calls over time as popular restaurants get cached

**API Limits:**
- 10,000 free calls/month on Pro endpoints (Search, Details, Autocomplete)
- Premium endpoints (Tips, Photos) require paid tier - not used in MVP

**Costa Rica Default:**
- When no `lat/lng` provided, searches use `near=Costa Rica` parameter
- Allows future expansion to other countries via parameters

---

## Sprint Plan

| Sprint | Days | Focus | Deliverables |
|--------|------|-------|--------------|
| 1 | 1-2 | Foundation | Express server, Supabase client, Auth module |
| 2 | 3-4 | Users & Storage | User profiles, photo uploads, storage buckets |
| 3 | 5-7 | Restaurants | Foursquare integration, search, filters |
| 4 | 8-9 | Reviews & Eatlist | Reviews CRUD, photos, rating calc, eatlist |
| 5 | 10 | Polish | Testing, documentation, error handling |

**Total Estimated Time: 10 working days**

---

## Cost Analysis

| Service | Monthly Cost |
|---------|-------------|
| Foursquare Places API (10K calls) | $0 |
| Supabase (free tier) | $0 |
| Mapbox Maps (frontend, 50K loads) | $0 |
| **Total** | **$0/month** |

---

## Success Criteria

Phase 1 is complete when:

- [ ] User can register and login via Supabase Auth
- [ ] User can view and update their profile
- [ ] User can upload profile photo
- [ ] User can search restaurants via Foursquare
- [ ] User can view restaurant details
- [ ] User can filter restaurants by food type, distance, rating
- [ ] User can create, update, delete reviews
- [ ] User can upload review photos
- [ ] First review photo becomes restaurant cover
- [ ] Restaurant ratings are calculated from reviews
- [ ] User can manage their eatlist (add, update, remove)
- [ ] All searches default to Costa Rica
- [ ] All endpoints documented
- [ ] Error handling is consistent

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Foursquare API quota (10K/month) | Medium | Aggressive caching, save to local DB on interaction |
| Supabase RLS conflicts | Medium | Test policies thoroughly, use service role for admin ops |
| Empty restaurant photos initially | Low | Accepted - community-driven content strategy |
| Costa Rica data coverage | Medium | Test Foursquare coverage, fallback to manual entry |

---

## Next Steps

1. Add Supabase credentials to `.env` file
2. Create all remaining folders and initial files for Task 0
3. Configure Supabase client properly
4. Complete remaining Task 0 subtasks (Models, Routes, Middleware, Services)
5. Begin Sprint 1 implementation

**Note:** Template `.env` file has been created for you to fill in with credentials.

**Progress:**
- [x] Task 0.1 - Initialize npm project - Done
- [x] Task 0.2 - Install dependencies - Done
- [x] Task 0.3 - Create folder structure - Done
- [x] Task 0.4 - Configure environment - Done
- [x] Task 0.5 - Setup Supabase client - Done
- [x] Task 0.6 - Create entry point - Done
- [x] Task 0.7 - Create utility constants - Done
- [ ] Task 0.8 - Add auth routes to entry point
- [ ] Task 1.1 - Auth middleware
- [ ] Task 1.2-1.9 - Auth controllers and routers
- [ ] Sprint 1-4 remaining tasks

---
*Document approved on 2026-01-22. Implementation may begin.*
