# Restaurant Module Implementation Plan

> **Document**: Detailed implementation plan for the Restaurant module
>
> **Project**: Bokitas - A "Letterboxd for restaurants" app focused on Costa Rica
>
> **Created**: 2026-01-26
>
> **Status**: Planning

---

## Overview

This document provides a step-by-step implementation plan for the Restaurant module (Task 3 in PHASE1_PLANNING.md). The module integrates with Foursquare Places API for restaurant discovery and manages local restaurant data.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| External API | **Foursquare Places API** | 10K free calls/month, restaurant-focused, better venue categorization |
| Database Column | `foursquareid` | Already exists in schema (per PHASE1_PLANNING.md) |
| Restaurant Creation | Auto-save on user interaction | Restaurant saved to DB when user reviews or adds to eatlist |
| Food Type Mapping | Manual mapping with fallback | Map Foursquare categories to our 20 tipocomida UUIDs |
| Geographic Strategy | **Hybrid B+C** | User coordinates for "nearby" + text-based search for browsing (city/province) |

---

## Geographic Search Strategy

### Hybrid B+C Approach

1. **Nearby Search** (user provides coordinates):
   - Frontend sends `lat`, `lng`, `radius`
   - Foursquare API: `ll=9.9281,-84.0907&radius=10000`
   - Best for "restaurants near me"

2. **Browse/Discovery Search** (text-based):
   - Accept optional `city` or `province` parameter
   - Foursquare API: `near=Guanacaste, Costa Rica`
   - Best for exploring other areas

3. **Default Behavior**:
   - If no location params provided: `near=Costa Rica`
   - Foursquare handles geocoding

### Costa Rica Provinces Reference

| Province | Example Search Value |
|----------|---------------------|
| San Jose | `San Jose, Costa Rica` |
| Cartago | `Cartago, Costa Rica` |
| Heredia | `Heredia, Costa Rica` |
| Alajuela | `Alajuela, Costa Rica` |
| Guanacaste | `Guanacaste, Costa Rica` |
| Puntarenas | `Puntarenas, Costa Rica` |
| Limon | `Limon, Costa Rica` |

---

## Food Type Mapping (Foursquare -> tipocomida)

### Our 20 Food Types (from database)

| Name | UUID |
|------|------|
| American | `830db5c8-ecfe-4416-b307-f2c382cd2c39` |
| Barbecue | `18e40ccd-0d29-475c-91c4-67ebca9eb2c6` |
| Burgers | `18425637-89aa-4c00-8e69-6b84de2e12bc` |
| Chinese | `96209165-1bf0-4b82-94c8-c37fa301a55a` |
| Costa Rican | `23cb1708-e204-4c2b-9be0-4ebb8cc29dff` |
| French | `1a1b6210-e157-49eb-b495-c3bb5000d616` |
| Greek | `a6f90cc7-43cf-4cf1-967e-26627e6b102d` |
| Indian | `2e4be2e5-dd40-425f-94ad-a7b80cd8885b` |
| Italian | `209ff5dd-a2a0-44eb-8026-2b6183851f4f` |
| Japanese | `847f33e5-00ab-4a04-87c2-aed327c44c15` |
| Mediterranean | `bb12311f-0921-46cc-86af-b88d2336d8aa` |
| Mexican | `289d3b1e-ffdb-435e-99a3-97f913f537a7` |
| Middle Eastern | `b1d3f2c1-f9cb-4fac-aa05-dc2b97539273` |
| Pizza | `601a0791-1cc8-4832-9567-1f5b8746eecf` |
| Seafood | `e659fd7a-f80c-4a68-a42f-8666db007fdb` |
| Spanish | `3f869378-ea11-407f-9cd9-1dcf99a38452` |
| Sushi | `dd3bf7f1-b986-498b-a994-5aa7c3b60013` |
| Thai | `6d678d3e-300a-49f2-a03b-aa0c029191a0` |
| Vegan | `ececcb64-f1d4-4001-baef-69eaba7700f1` |
| Vegetarian | `a2ac5398-3b00-4088-acd3-d0c829189814` |

### Foursquare Category Mapping

Foursquare uses category IDs. Here's the mapping strategy:

```typescript
// src/config/foursquareCategoryMapping.ts

export const FOURSQUARE_CATEGORY_MAP: Record<string, string> = {
  // American
  '13003': '830db5c8-ecfe-4416-b307-f2c382cd2c39', // American Restaurant
  '13001': '830db5c8-ecfe-4416-b307-f2c382cd2c39', // Diner
  
  // Barbecue
  '13028': '18e40ccd-0d29-475c-91c4-67ebca9eb2c6', // BBQ Joint
  
  // Burgers
  '13031': '18425637-89aa-4c00-8e69-6b84de2e12bc', // Burger Joint
  '13057': '18425637-89aa-4c00-8e69-6b84de2e12bc', // Fast Food (fallback)
  
  // Chinese
  '13099': '96209165-1bf0-4b82-94c8-c37fa301a55a', // Chinese Restaurant
  '13072': '96209165-1bf0-4b82-94c8-c37fa301a55a', // Dim Sum
  
  // Costa Rican (Latin American categories)
  '13236': '23cb1708-e204-4c2b-9be0-4ebb8cc29dff', // Latin American
  '13064': '23cb1708-e204-4c2b-9be0-4ebb8cc29dff', // Caribbean (regional)
  
  // French
  '13148': '1a1b6210-e157-49eb-b495-c3bb5000d616', // French Restaurant
  '13029': '1a1b6210-e157-49eb-b495-c3bb5000d616', // Bistro
  
  // Greek
  '13156': 'a6f90cc7-43cf-4cf1-967e-26627e6b102d', // Greek Restaurant
  
  // Indian
  '13199': '2e4be2e5-dd40-425f-94ad-a7b80cd8885b', // Indian Restaurant
  
  // Italian
  '13236': '209ff5dd-a2a0-44eb-8026-2b6183851f4f', // Italian Restaurant
  '13064': '209ff5dd-a2a0-44eb-8026-2b6183851f4f', // Trattoria
  
  // Japanese
  '13263': '847f33e5-00ab-4a04-87c2-aed327c44c15', // Japanese Restaurant
  '13276': '847f33e5-00ab-4a04-87c2-aed327c44c15', // Ramen
  
  // Mediterranean
  '13302': 'bb12311f-0921-46cc-86af-b88d2336d8aa', // Mediterranean
  
  // Mexican
  '13303': '289d3b1e-ffdb-435e-99a3-97f913f537a7', // Mexican Restaurant
  '13307': '289d3b1e-ffdb-435e-99a3-97f913f537a7', // Taco Place
  
  // Middle Eastern
  '13309': 'b1d3f2c1-f9cb-4fac-aa05-dc2b97539273', // Middle Eastern
  '13191': 'b1d3f2c1-f9cb-4fac-aa05-dc2b97539273', // Falafel
  
  // Pizza
  '13064': '601a0791-1cc8-4832-9567-1f5b8746eecf', // Pizza Place
  
  // Seafood
  '13338': 'e659fd7a-f80c-4a68-a42f-8666db007fdb', // Seafood Restaurant
  '13334': 'e659fd7a-f80c-4a68-a42f-8666db007fdb', // Fish & Chips
  
  // Spanish
  '13352': '3f869378-ea11-407f-9cd9-1dcf99a38452', // Spanish Restaurant
  '13353': '3f869378-ea11-407f-9cd9-1dcf99a38452', // Tapas
  
  // Sushi
  '13363': 'dd3bf7f1-b986-498b-a994-5aa7c3b60013', // Sushi Restaurant
  
  // Thai
  '13352': '6d678d3e-300a-49f2-a03b-aa0c029191a0', // Thai Restaurant
  
  // Vegan
  '13377': 'ececcb64-f1d4-4001-baef-69eaba7700f1', // Vegan Restaurant
  
  // Vegetarian
  '13379': 'a2ac5398-3b00-4088-acd3-d0c829189814', // Vegetarian Restaurant
}

// Fallback: unmapped categories get no food type (null)
// Can be manually assigned later by reviewing restaurant
```

**Note**: Foursquare category IDs will be verified during implementation. The mapping file will be refined based on actual API responses.

---

## Implementation Tasks

### Task 0: Sync Documentation (~15 min)

Update `BACKEND.md` to align with `PHASE1_PLANNING.md`:

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 0.1 | Update External API section | Change Google Places to Foursquare | 5 min |
| 0.2 | Update database column reference | Change `googlePlaceId` to `foursquareid` | 5 min |
| 0.3 | Update caching strategy description | Reflect Foursquare approach | 5 min |

---

### Task 1: Environment Setup (~20 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 1.1 | Add Foursquare API key | Add `FOURSQUARE_API_KEY` to `.env` and `.env.example` | 5 min |
| 1.2 | Create constants file | Create `src/config/constants.ts` with API URL, default coordinates | 10 min |
| 1.3 | Create category mapping | Create `src/config/foursquareCategoryMapping.ts` | 5 min |

**Files to create/modify:**
- `.env` (add FOURSQUARE_API_KEY)
- `.env.example` (add FOURSQUARE_API_KEY template)
- `src/config/constants.ts` (new)
- `src/config/foursquareCategoryMapping.ts` (new)

**Constants to define:**
```typescript
// src/config/constants.ts
export const FOURSQUARE_API_URL = 'https://api.foursquare.com/v3'
export const DEFAULT_SEARCH_NEAR = 'Costa Rica'
export const DEFAULT_SEARCH_RADIUS = 10000 // meters
export const DEFAULT_SEARCH_LIMIT = 20
```

---

### Task 2: TypeScript Types (~30 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 2.1 | Create restaurant entity types | `src/types/entities/restaurant.types.ts` | 10 min |
| 2.2 | Create restaurant API types | `src/types/api/restaurant.api.types.ts` | 10 min |
| 2.3 | Create Foursquare types | `src/types/external/foursquare.types.ts` | 10 min |

**Files to create:**
- `src/types/entities/restaurant.types.ts`
- `src/types/api/restaurant.api.types.ts`
- `src/types/external/foursquare.types.ts`

**Key interfaces:**

```typescript
// src/types/entities/restaurant.types.ts
export interface Restaurant {
  id: string
  nombre: string
  direccion: string | null
  latitud: number | null
  longitud: number | null
  urlFotoPerfil: string | null
  urlPaginaRestaurante: string | null
  puntuacion: number
  foursquareid: string | null
  createdAt: string
  updatedAt: string
  idEstado: string
  active: boolean
}

export interface CreateRestaurantParams {
  nombre: string
  direccion?: string
  latitud?: number
  longitud?: number
  urlFotoPerfil?: string
  urlPaginaRestaurante?: string
  foursquareid?: string
  foodTypeIds?: string[] // tipocomida UUIDs
}

export interface RestaurantSearchParams {
  query?: string
  lat?: number
  lng?: number
  radius?: number
  near?: string // city/province for text-based search
  limit?: number
}

export interface RestaurantFilterParams {
  tipoComida?: string
  puntuacionMin?: number
  ordenar?: 'rating' | 'distance' | 'recent'
  page?: number
  limit?: number
}
```

---

### Task 3: Foursquare Category Mapping (~30 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 3.1 | Research Foursquare categories | Review Foursquare category taxonomy | 15 min |
| 3.2 | Create mapping file | Map categories to our 20 tipocomida UUIDs | 10 min |
| 3.3 | Create helper function | `mapFoursquareCategory(categoryId: string): string | null` | 5 min |

**File to create:**
- `src/config/foursquareCategoryMapping.ts`

---

### Task 4: Foursquare Service (~60 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 4.1 | Create service file | `src/Services/foursquareService.ts` | 10 min |
| 4.2 | Implement `searchPlaces()` | Search with query, location (coords OR near text) | 20 min |
| 4.3 | Implement `getPlaceDetails()` | Get full details by Foursquare ID | 15 min |
| 4.4 | Implement `transformToRestaurant()` | Convert Foursquare response to our Restaurant type | 15 min |

**File to create:**
- `src/Services/foursquareService.ts`

**Service methods:**

```typescript
// src/Services/foursquareService.ts
export class FoursquareService {
  // Search restaurants with coordinates OR text-based location
  static async searchPlaces(params: {
    query?: string
    lat?: number
    lng?: number
    radius?: number
    near?: string
    limit?: number
  }): Promise<FoursquarePlace[]>
  
  // Get detailed info for a specific place
  static async getPlaceDetails(fsqId: string): Promise<FoursquarePlace>
  
  // Transform Foursquare response to our Restaurant format
  static transformToRestaurant(place: FoursquarePlace): Partial<Restaurant>
  
  // Map Foursquare categories to our food types
  static mapCategoriesToFoodTypes(categories: FoursquareCategory[]): string[]
}
```

**Foursquare API endpoints to use:**
- `GET /places/search` - Search for places
- `GET /places/{fsq_id}` - Get place details

**Headers required:**
```typescript
headers: {
  'Authorization': process.env.FOURSQUARE_API_KEY,
  'Accept': 'application/json'
}
```

---

### Task 5: Restaurant Model (~45 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 5.1 | Create model file | `src/Models/restaurantModel.ts` | 5 min |
| 5.2 | Implement `getAll()` | List with filters (food type, rating, pagination) | 15 min |
| 5.3 | Implement `getById()` | Get single restaurant by ID | 5 min |
| 5.4 | Implement `getByFoursquareId()` | Check if restaurant exists by foursquareid | 5 min |
| 5.5 | Implement `create()` | Create restaurant from Foursquare data | 10 min |
| 5.6 | Implement `update()` | Update restaurant info | 5 min |

**File to create:**
- `src/Models/restaurantModel.ts`

**Key methods:**

```typescript
// src/Models/restaurantModel.ts
export class RestaurantModel {
  // Get all restaurants with filters
  static async getAll(filters: RestaurantFilterParams): Promise<Restaurant[]>
  
  // Get restaurant by internal ID
  static async getById(id: string): Promise<Restaurant | null>
  
  // Get restaurant by Foursquare ID (for deduplication)
  static async getByFoursquareId(foursquareid: string): Promise<Restaurant | null>
  
  // Create restaurant (called when user interacts)
  static async create(params: CreateRestaurantParams): Promise<Restaurant>
  
  // Update restaurant
  static async update(id: string, params: Partial<Restaurant>): Promise<Restaurant | null>
  
  // Get or create restaurant by Foursquare ID
  static async getOrCreate(foursquareid: string): Promise<Restaurant>
  
  // Link food types to restaurant
  static async linkFoodTypes(restaurantId: string, foodTypeIds: string[]): Promise<void>
}
```

---

### Task 6: Restaurant Validation (~20 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 6.1 | Create validation file | `src/Models/validations/restaurantValidation.ts` | 5 min |
| 6.2 | Create search schema | Validate search query params | 5 min |
| 6.3 | Create filter schema | Validate filter params | 5 min |
| 6.4 | Create create/update schema | Validate restaurant data | 5 min |

**File to create:**
- `src/Models/validations/restaurantValidation.ts`

**Zod schemas:**

```typescript
// src/Models/validations/restaurantValidation.ts
import { z } from 'zod'

export const searchRestaurantSchema = z.object({
  query: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(50000).optional(),
  near: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional()
}).refine(
  data => (data.lat && data.lng) || data.near || (!data.lat && !data.lng),
  { message: 'Provide both lat and lng, or use near parameter' }
)

export const filterRestaurantSchema = z.object({
  tipoComida: z.string().uuid().optional(),
  puntuacionMin: z.coerce.number().min(1).max(5).optional(),
  ordenar: z.enum(['rating', 'distance', 'recent']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20)
})

export const createRestaurantSchema = z.object({
  foursquareid: z.string().min(1, 'Foursquare ID is required')
})
```

---

### Task 7: Restaurant Controller (~90 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 7.1 | Create controller file | `src/Controllers/restaurantController.ts` | 5 min |
| 7.2 | `GET /restaurants` | List from local DB with filters | 15 min |
| 7.3 | `GET /restaurants/search` | Search via Foursquare API | 20 min |
| 7.4 | `GET /restaurants/:id` | Get single restaurant from local DB | 10 min |
| 7.5 | `GET /restaurants/foursquare/:fsqId` | Get or create from Foursquare | 15 min |
| 7.6 | `GET /restaurants/:id/reviews` | Get restaurant's reviews | 10 min |
| 7.7 | `GET /restaurants/top` | Get top rated in region | 10 min |
| 7.8 | `PUT /restaurants/:id` | Update restaurant | 5 min |

**File to create:**
- `src/Controllers/restaurantController.ts`

**Endpoint details:**

#### GET /restaurants/search

Search restaurants via Foursquare API.

**Query parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | No | Search query (e.g., "pizza") |
| lat | number | No* | Latitude |
| lng | number | No* | Longitude |
| radius | number | No | Radius in meters (default: 10000) |
| near | string | No* | Text location (e.g., "Guanacaste, Costa Rica") |
| limit | number | No | Results limit (default: 20, max: 50) |

*Either `lat`+`lng` OR `near` should be provided. If neither, defaults to `near=Costa Rica`.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "foursquareid": "4b5c...",
      "nombre": "Restaurante La Casona",
      "direccion": "Avenida Central, San Jose",
      "latitud": 9.9281,
      "longitud": -84.0907,
      "foodTypes": ["Costa Rican", "Latin American"],
      "distance": 1500
    }
  ],
  "meta": {
    "source": "foursquare",
    "count": 20
  }
}
```

#### GET /restaurants/foursquare/:fsqId

Get restaurant by Foursquare ID. If exists in local DB, return it. If not, fetch from Foursquare and create.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "foursquareid": "4b5c...",
    "nombre": "Restaurante La Casona",
    "isNew": true
  }
}
```

---

### Task 8: Restaurant Router (~15 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 8.1 | Create router file | `src/Routes/restaurantRouter.ts` | 5 min |
| 8.2 | Define routes | Wire up all endpoints | 5 min |
| 8.3 | Register in index.ts | Add restaurant router to app | 5 min |

**File to create:**
- `src/Routes/restaurantRouter.ts`

**Routes:**
```typescript
// src/Routes/restaurantRouter.ts
import { Router } from 'express'
import { RestaurantController } from '../Controllers/restaurantController.js'

const restaurantRouter = Router()

// Foursquare search (public)
restaurantRouter.get('/search', RestaurantController.search)

// Top rated restaurants (public)
restaurantRouter.get('/top', RestaurantController.getTop)

// Get or create by Foursquare ID (public)
restaurantRouter.get('/foursquare/:fsqId', RestaurantController.getByFoursquareId)

// Get restaurant reviews (public)
restaurantRouter.get('/:id/reviews', RestaurantController.getReviews)

// Get single restaurant (public)
restaurantRouter.get('/:id', RestaurantController.getById)

// List local restaurants with filters (public)
restaurantRouter.get('/', RestaurantController.getAll)

// Update restaurant (requires auth)
restaurantRouter.put('/:id', authMiddleware, RestaurantController.update)

export default restaurantRouter
```

---

### Task 9: Documentation (~25 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 9.1 | Create entity doc | `docs/entities/RESTAURANT.md` | 10 min |
| 9.2 | Create endpoint doc | `docs/endpoints/RESTAURANT.md` | 15 min |

**Files to create:**
- `docs/entities/RESTAURANT.md`
- `docs/endpoints/RESTAURANT.md`

---

### Task 10: Testing (~30 min)

| # | Task | Description | Est. Time |
|---|------|-------------|-----------|
| 10.1 | Test Foursquare API connection | Verify API key works | 5 min |
| 10.2 | Test search endpoints | Test with different location params | 10 min |
| 10.3 | Test category mapping | Verify food types are mapped correctly | 5 min |
| 10.4 | Test get/create flow | Test restaurant creation on interaction | 10 min |

**Test scenarios:**

1. **Search with coordinates (San Jose)**
   ```
   GET /restaurants/search?lat=9.9281&lng=-84.0907&query=pizza
   ```

2. **Search with text location (Guanacaste)**
   ```
   GET /restaurants/search?near=Guanacaste,Costa Rica&query=seafood
   ```

3. **Search with default (Costa Rica)**
   ```
   GET /restaurants/search?query=sushi
   ```

4. **Get/create by Foursquare ID**
   ```
   GET /restaurants/foursquare/4b5c...
   ```

5. **List local restaurants with filters**
   ```
   GET /restaurants?tipoComida=uuid&puntuacionMin=4&ordenar=rating
   ```

---

## File Structure After Implementation

```
backend/src/
├── config/
│   ├── constants.ts              # NEW: API URLs, defaults
│   └── foursquareCategoryMapping.ts  # NEW: Category -> tipocomida
│
├── Controllers/
│   └── restaurantController.ts   # NEW
│
├── Models/
│   ├── restaurantModel.ts        # NEW
│   └── validations/
│       └── restaurantValidation.ts  # NEW
│
├── Routes/
│   └── restaurantRouter.ts       # NEW
│
├── Services/
│   ├── foursquareService.ts      # NEW
│   └── storageService.ts         # Existing
│
└── types/
    ├── entities/
    │   └── restaurant.types.ts   # NEW
    ├── api/
    │   └── restaurant.api.types.ts  # NEW
    └── external/
        └── foursquare.types.ts   # NEW
```

---

## Estimated Total Time

| Task | Estimated Time |
|------|----------------|
| Task 0: Sync Documentation | 15 min |
| Task 1: Environment Setup | 20 min |
| Task 2: TypeScript Types | 30 min |
| Task 3: Category Mapping | 30 min |
| Task 4: Foursquare Service | 60 min |
| Task 5: Restaurant Model | 45 min |
| Task 6: Restaurant Validation | 20 min |
| Task 7: Restaurant Controller | 90 min |
| Task 8: Restaurant Router | 15 min |
| Task 9: Documentation | 25 min |
| Task 10: Testing | 30 min |
| **Total** | **~6 hours** |

---

## Dependencies

Add to `package.json` if not present:
```json
{
  "dependencies": {
    "node-fetch": "^3.3.0"  // Only if not using native fetch (Node 18+)
  }
}
```

**Note**: Node.js 18+ has native `fetch`. No additional HTTP client needed.

---

## Environment Variables

Add to `.env`:
```bash
# Foursquare
FOURSQUARE_API_KEY=your-foursquare-api-key
```

Add to `.env.example`:
```bash
# Foursquare
FOURSQUARE_API_KEY=your-foursquare-api-key
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Foursquare API quota (10K/month) | Medium | Save to local DB on user interaction, check local first |
| Foursquare category IDs change | Low | Create mapping update script, monitor API changes |
| Costa Rica data gaps | Medium | Allow manual restaurant creation as fallback |
| Unmapped food categories | Low | Return null, allow manual assignment later |

---

## Success Criteria

Restaurant module is complete when:

- [ ] Foursquare API integration works
- [ ] Search with coordinates returns results
- [ ] Search with text location (city/province) returns results
- [ ] Default search (Costa Rica) works
- [ ] Restaurants are saved to local DB on user interaction
- [ ] Food type mapping works for common categories
- [ ] All 7 endpoints are functional
- [ ] Documentation is complete

---

## Next Steps After Completion

1. **Review Module** (Task 4 in PHASE1_PLANNING.md)
   - Reviews trigger restaurant auto-save
   - Rating calculation updates `restaurante.puntuacion`

2. **Eatlist Module** (Task 5 in PHASE1_PLANNING.md)
   - Adding to eatlist triggers restaurant auto-save

---

*Document created on 2026-01-26. Ready for implementation.*
