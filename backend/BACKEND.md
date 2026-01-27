# Bokitas - Backend Development Guide

This document outlines the backend architecture, API endpoints, and development roadmap for the Bokitas application.

## Tech Stack

* **Language**: TypeScript (ES Modules, strict mode)
* **Framework**: Express.js
* **Runtime**: Node.js latest LTS
* **Database**: PostgreSQL (via Supabase)
* **Authentication**: Supabase Auth
* **Validation**: Zod
* **API Client**: Supabase JS Client
* **HTTP Client**: Axios (for external API calls)
* **External API**: Foursquare Places API

*Note: Backend migrated to TypeScript on 2026-01-23 following AGENTS.md standards.*
*Note: Foursquare integration migrated to Axios on 2026-01-26.*

---

## Database Schema

### Status Table (Lookup)

**Table: `estado`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| nombre | varchar | NOT NULL | Status name (Active, Inactive, Deleted) |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| active | boolean | DEFAULT true | Soft delete flag |

---

### User Tables

**Table: `usuario`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| authId | UUID | UNIQUE, FK -> auth.users | Supabase Auth user ID |
| nombre | varchar | NOT NULL | First name |
| primerApellido | varchar | NOT NULL | First last name |
| segundoApellido | varchar | | Second last name |
| correo | varchar | UNIQUE, NOT NULL | Email address |
| telefono | varchar | | Phone number |
| urlFotoPerfil | text | | Profile photo URL (Supabase Storage) |
| provincia | varchar | | Province/Region |
| bio | text | | User biography |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Account creation date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idEstado | UUID | FK -> estado | Account status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `usuarioFollow`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idSeguidor | UUID | PK, FK -> usuario | Follower user ID |
| idSeguido | UUID | PK, FK -> usuario | Followed user ID |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Follow date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idEstado | UUID | FK -> estado | Relationship status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `usuarioBlock`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idBloqueador | UUID | PK, FK -> usuario | Blocker user ID |
| idBloqueo | UUID | PK, FK -> usuario | Blocked user ID |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Block date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| active | boolean | DEFAULT true | Soft delete flag |

---

### Restaurant Tables

**Table: `restaurante`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| nombre | varchar | NOT NULL | Restaurant name |
| direccion | text | | Full address |
| latitud | decimal(10,8) | | GPS latitude |
| longitud | decimal(11,8) | | GPS longitude |
| urlFotoPerfil | text | | Main photo URL |
| urlPaginaRestaurante | text | | Website URL |
| puntuacion | decimal(3,2) | DEFAULT 0 | Average rating (calculated) |
| foursquareid | varchar | UNIQUE | Foursquare Places API ID |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Creation date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idEstado | UUID | FK -> estado | Restaurant status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `tipoComida`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| nombre | varchar | NOT NULL | Food type name |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Creation date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idEstado | UUID | FK -> estado | Status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `restauranteTipoComida`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idRestaurante | UUID | PK, FK -> restaurante | Restaurant ID |
| idTipoComida | UUID | PK, FK -> tipoComida | Food type ID |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Creation date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

---

### Review & Eatlist Tables

**Table: `review`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| comentario | text | | Review text |
| puntuacion | decimal(2,1) | NOT NULL, CHECK 1-5 | Rating (1-5) |
| urlFotoReview | text | | Review photo URL |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Review date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idRestaurante | UUID | FK -> restaurante | Restaurant reviewed |
| idUsuario | UUID | FK -> usuario | Review author |
| idEstado | UUID | FK -> estado | Review status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `eatlist`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idUsuario | UUID | PK, FK -> usuario | User ID |
| idRestaurante | UUID | PK, FK -> restaurante | Restaurant ID |
| flag | boolean | NOT NULL, DEFAULT false | true = visited, false = want to visit |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Date added |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| active | boolean | DEFAULT true | Soft delete flag |

---

### List Tables

**Table: `lista`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| nombre | varchar | NOT NULL | List name |
| esPrivada | boolean | DEFAULT true | Is list private |
| esColaborativa | boolean | DEFAULT false | Is list collaborative |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Creation date |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| idUsuarioCreador | UUID | FK -> usuario | List creator |
| idEstado | UUID | FK -> estado | List status |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `listaMiembro`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idLista | UUID | PK, FK -> lista | List ID |
| idUsuario | UUID | PK, FK -> usuario | Member user ID |
| rol | varchar | DEFAULT 'viewer' | Member role (owner, editor, viewer) |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Date added |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| active | boolean | DEFAULT true | Soft delete flag |

**Table: `listaItem`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| idLista | UUID | PK, FK -> lista | List ID |
| idRestaurante | UUID | PK, FK -> restaurante | Restaurant ID |
| idUsuarioCreador | UUID | FK -> usuario | User who added item |
| nota | text | | Personal note about restaurant |
| posicion | integer | | Order position in list |
| createdAt | TIMESTAMPTZ | DEFAULT now() | Date added |
| updatedAt | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| active | boolean | DEFAULT true | Soft delete flag |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| POST | `/auth/register` | Register new user | 1 |
| POST | `/auth/login` | User login | 1 |
| POST | `/auth/logout` | User logout | 1 |
| POST | `/auth/forgot-password` | Request password reset | 1 |
| POST | `/auth/reset-password` | Reset password with token | 1 |
| GET | `/auth/me` | Get current user info | 1 |

### Users

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/users/:id` | Get user profile | 1 |
| PUT | `/users/:id` | Update user profile | 1 |
| DELETE | `/users/:id` | Deactivate user account | 1 |
| POST | `/users/:id/photo` | Upload profile photo | 1 |
| GET | `/users/:id/reviews` | Get user's reviews | 1 |
| GET | `/users/:id/eatlist` | Get user's eatlist | 1 |
| GET | `/users/:id/top4` | Get user's top 4 restaurants | 1 |
| GET | `/users/:id/lists` | Get user's public lists | 1 |
| POST | `/users/:id/follow` | Follow a user | 2 |
| DELETE | `/users/:id/follow` | Unfollow a user | 2 |
| GET | `/users/:id/followers` | Get user's followers | 2 |
| GET | `/users/:id/following` | Get users being followed | 2 |
| POST | `/users/:id/block` | Block a user | 2 |
| DELETE | `/users/:id/block` | Unblock a user | 2 |
| GET | `/users/blocked` | Get blocked users list | 2 |

### Restaurants

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/restaurants` | List restaurants (with filters) | 1 |
| GET | `/restaurants/:id` | Get restaurant details | 1 |
| GET | `/restaurants/search` | Search restaurants (Foursquare API) | 1 |
| GET | `/restaurants/nearby` | Get nearby restaurants | 1 |
| GET | `/restaurants/:id/reviews` | Get restaurant reviews | 1 |
| GET | `/restaurants/top` | Get top rated restaurants | 1 |
| POST | `/restaurants` | Add restaurant to local DB | 1 |
| PUT | `/restaurants/:id` | Update restaurant info | 1 |

**Query Parameters for `/restaurants`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| tipoComida | int/int[] | Filter by food type ID(s) |
| distancia | number | Max distance in km (requires lat/lng) |
| lat | number | User's latitude |
| lng | number | User's longitude |
| puntuacionMin | number | Minimum rating |
| ordenar | string | Sort by: rating, distance, recent |
| page | int | Page number |
| limit | int | Items per page |

### Reviews

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| POST | `/reviews` | Create a review | 1 |
| GET | `/reviews/:id` | Get review details | 1 |
| PUT | `/reviews/:id` | Update a review | 1 |
| DELETE | `/reviews/:id` | Delete a review | 1 |
| POST | `/reviews/:id/photo` | Upload review photo | 1 |
| POST | `/reviews/:id/like` | Like a review | 2 |
| DELETE | `/reviews/:id/like` | Unlike a review | 2 |
| POST | `/reviews/:id/save` | Save a review | 2 |
| DELETE | `/reviews/:id/save` | Unsave a review | 2 |
| GET | `/reviews/saved` | Get saved reviews | 2 |
| GET | `/reviews/feed` | Get reviews from followed users | 2 |

### Eatlist

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/eatlist` | Get current user's eatlist | 1 |
| POST | `/eatlist` | Add restaurant to eatlist | 1 |
| PUT | `/eatlist/:restaurantId` | Update eatlist entry (visited/want) | 1 |
| DELETE | `/eatlist/:restaurantId` | Remove from eatlist | 1 |

### Lists

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/lists` | Get current user's lists | 2 |
| POST | `/lists` | Create a new list | 2 |
| GET | `/lists/:id` | Get list details with items | 2 |
| PUT | `/lists/:id` | Update list info | 2 |
| DELETE | `/lists/:id` | Delete a list | 2 |
| POST | `/lists/:id/items` | Add restaurant to list | 2 |
| PUT | `/lists/:id/items/:restaurantId` | Update list item (note, position) | 2 |
| DELETE | `/lists/:id/items/:restaurantId` | Remove restaurant from list | 2 |
| POST | `/lists/:id/members` | Add member to collaborative list | 2 |
| DELETE | `/lists/:id/members/:userId` | Remove member from list | 2 |
| PUT | `/lists/:id/members/:userId` | Update member role | 2 |
| GET | `/lists/shared` | Get lists shared with user | 2 |
| POST | `/lists/:id/share` | Generate share link | 2 |
| POST | `/lists/join/:shareCode` | Join list via share link | 2 |

### Food Types

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/food-types` | Get all food types | 1 |
| POST | `/food-types` | Create food type (admin) | 1 |

### Notifications (Phase 3)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/notifications` | Get user notifications | 3 |
| PUT | `/notifications/:id/read` | Mark notification as read | 3 |
| PUT | `/notifications/read-all` | Mark all as read | 3 |
| POST | `/notifications/register-token` | Register push token | 3 |

---

## Development Roadmap

### Phase 1 - Core MVP

#### Database Setup
- [x] Create Supabase project
- [x] Create `estado` table with initial statuses
- [x] Create `usuario` table
- [x] Create `restaurante` table
- [x] Create `tipoComida` table
- [x] Create `restauranteTipoComida` junction table
- [x] Create `review` table
- [x] Create `eatlist` table
- [x] Configure Row Level Security (RLS) policies
- [ ] Set up Supabase Storage buckets for images

#### Authentication Module
- [x] Set up authentication middleware (TypeScript)
- [x] Implement user registration endpoint
- [x] Implement login endpoint
- [x] Implement logout endpoint
- [x] Implement password reset flow
- [ ] Implement JWT token management

#### User Module
- [x] Implement get user profile endpoint (TypeScript)
- [x] Implement update user profile endpoint (TypeScript)
- [ ] Implement profile photo upload (Supabase Storage)
- [x] Implement get user's reviews endpoint (TypeScript)
- [x] Implement get user's eatlist endpoint (TypeScript)
- [x] Implement top 4 restaurants feature (TypeScript)

#### Restaurant Module
- [x] Integrate Foursquare Places API (axios client with proper headers)
- [x] Implement restaurant search endpoint (`GET /restaurants/search`)
- [x] Implement nearby restaurants endpoint (`GET /restaurants/nearby` via FoursquareService)
- [x] Implement restaurant details endpoint (`GET /restaurants/:id`)
- [x] Implement restaurant filters (food type, distance, rating)
- [x] Implement get/create by Foursquare ID (`GET /restaurants/foursquare/:fsqId`)
- [x] Implement restaurant reviews endpoint (`GET /restaurants/:id/reviews`)
- [x] Implement top restaurants endpoint (`GET /restaurants/top`)
- [x] Implement update restaurant endpoint (`PUT /restaurants/:id`)

#### Review Module
- [ ] Implement create review endpoint
- [ ] Implement get review endpoint
- [ ] Implement update review endpoint
- [ ] Implement delete review endpoint
- [ ] Implement review photo upload
- [ ] Implement restaurant rating calculation (trigger/function)

#### Eatlist Module
- [ ] Implement get eatlist endpoint
- [ ] Implement add to eatlist endpoint
- [ ] Implement update eatlist entry endpoint
- [ ] Implement remove from eatlist endpoint

#### Food Types Module
- [ ] Implement get all food types endpoint
- [ ] Seed initial food types data

---

### Phase 2 - Social Features

#### Database Updates
- [x] Create `usuarioFollow` table
- [x] Create `usuarioBlock` table
- [x] Create `lista` table
- [x] Create `listaMiembro` table
- [x] Create `listaItem` table
- [ ] Add review likes table (if needed)
- [ ] Add saved reviews table (if needed)
- [x] Update RLS policies for new tables

#### Follow System
- [ ] Implement follow user endpoint
- [ ] Implement unfollow user endpoint
- [ ] Implement get followers endpoint
- [ ] Implement get following endpoint
- [ ] Update user queries to respect blocks

#### Block System
- [ ] Implement block user endpoint
- [ ] Implement unblock user endpoint
- [ ] Implement get blocked users endpoint
- [ ] Add block filtering to all relevant queries (search, reviews, follows)

#### Review Social Features
- [ ] Implement like review endpoint
- [ ] Implement unlike review endpoint
- [ ] Implement save review endpoint
- [ ] Implement unsave review endpoint
- [ ] Implement get saved reviews endpoint
- [ ] Implement reviews feed from followed users

#### Lists Module
- [ ] Implement create list endpoint
- [ ] Implement get user's lists endpoint
- [ ] Implement get list details endpoint
- [ ] Implement update list endpoint
- [ ] Implement delete list endpoint
- [ ] Implement add item to list endpoint
- [ ] Implement update list item endpoint
- [ ] Implement remove item from list endpoint
- [ ] Implement add member to list endpoint
- [ ] Implement remove member from list endpoint
- [ ] Implement update member role endpoint
- [ ] Implement share link generation
- [ ] Implement join list via share link

#### Favorite Dishes
- [ ] Create favorite dishes table
- [ ] Implement add favorite dish endpoint
- [ ] Implement get popular dishes per restaurant

---

### Phase 3 - Advanced Features

#### Achievements System
- [ ] Design achievements schema
- [ ] Create achievements tables
- [ ] Implement achievement triggers
- [ ] Implement get user achievements endpoint

#### Push Notifications
- [ ] Set up Expo Push Notifications service
- [ ] Implement push token registration
- [ ] Implement notification preferences
- [ ] Create notification triggers (new follower, list invite, etc.)
- [ ] Implement get notifications endpoint
- [ ] Implement mark as read endpoints

#### Calendar Integration
- [ ] Design calendar events schema
- [ ] Implement create dining event endpoint
- [ ] Implement calendar sync (Google Calendar API)

---

## External Integrations

### Foursquare Places API

**Setup:**
1. Create Foursquare Developer account
2. Create a new project
3. Generate API key
4. Free tier: 10,000 calls/month

**Configuration (Updated 2026-01-26):**
- Base URL: `https://places-api.foursquare.com`
- API Version: `2025-06-17`
- Required Headers:
  - `X-Places-Api-Version: 2025-06-17`
  - `Authorization: Bearer <API_KEY>`
  - `Accept: application/json`

**Key endpoints implemented:**
- `GET /places/search` - Search for places (Text Search, Nearby Search)
- `GET /places/{fsq_id}` - Get place details
- `GET /places/{fsq_id}/photos` - Get place photos
- `GET /places/{fsq_id}/tips` - Get user tips/reviews
- `GET /places/match` - Match place by name/address
- `GET /places/nearby` - Find nearby places (Snap to Place)

**Caching Strategy:**
- Save restaurant to local DB when user interacts (reviews, eatlist)
- Check local DB by `foursquareid` before calling API
- Reduces API calls as popular restaurants get cached
- No expiration needed - user-driven updates

**Geographic Search:**
- Nearby: Use `ll` (lat,lng) + `radius` parameters
- Browse: Use `near` parameter (e.g., "Guanacaste, Costa Rica")
- Default: `near=Costa Rica` when no location provided

**Implementation Notes:**
- Uses Axios HTTP client via configured `foursquareClient`
- See `docs/endpoints/foursquare-service.md` for full documentation
- See `docs/postmortem/01-26-26_FOURSQUARE_API_MIGRATION.md` for migration details

### Supabase Storage

**Buckets to create:**
- `profile-photos` - User profile images
- `review-photos` - Review images

**Configuration:**
- Set appropriate file size limits
- Configure public/private access
- Set up image transformation policies

---

## Suggestions

### Security Enhancements
- [ ] Implement rate limiting on all endpoints
- [ ] Add request validation middleware
- [ ] Implement API key authentication for mobile app
- [ ] Set up CORS properly
- [ ] Add input sanitization

### Performance Improvements
- [ ] Implement Redis caching for frequently accessed data
- [ ] Add database indexes on common query fields
- [ ] Implement pagination on all list endpoints
- [ ] Set up connection pooling

### Additional Features
- [ ] **Report System**: Allow users to report inappropriate reviews/users
- [ ] **Restaurant Hours**: Add operating hours to restaurant data
- [ ] **Menu Items Table**: Track dishes with prices for better recommendations
- [ ] **Search History**: Save user search history for quick access
- [ ] **Analytics Dashboard**: Track popular restaurants, trending searches
- [ ] **Reservation Integration**: Partner with reservation platforms
- [ ] **Restaurant Verification**: Allow restaurant owners to claim and verify listings
- [ ] **Review Replies**: Allow restaurant owners to reply to reviews
- [ ] **Multi-language Support**: Spanish/English for Costa Rica market
- [ ] **Dietary Filters**: Vegetarian, vegan, gluten-free options
- [ ] **Price Range Filter**: $, $$, $$$, $$$$ categories
- [ ] **Accessibility Info**: Wheelchair access, parking availability
