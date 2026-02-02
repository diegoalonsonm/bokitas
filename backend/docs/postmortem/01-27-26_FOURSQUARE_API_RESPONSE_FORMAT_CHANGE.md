# [01-27-26] - Foursquare API - Response Format Changes Breaking Search Endpoint

## Problem

Two issues were identified with the `/restaurants/search` endpoint:

1. **Missing Foursquare ID**: The search response was not returning the `foursquareid` field, making it impossible for clients to use the ID to create restaurants or reviews.

2. **Missing coordinates and empty data**: The response showed `latitud: null`, `longitud: null`, and empty `categories` array despite the Foursquare API returning valid data.

Example broken response:
```json
{
  "nombre": "Family Pizza",
  "direccion": "Curridabat, San José",
  "latitud": null,
  "longitud": null,
  "urlfotoperfil": null,
  "urlpaginarestaurante": null,
  "foodTypeIds": [],
  "distance": 708,
  "categories": [{ "name": "Pizzeria" }]
}
```

## Root Cause

The Foursquare Places API response format changed from what was originally documented:

1. **ID field renamed**: `fsq_id` → `fsq_place_id`
2. **Coordinates moved**: From `geocodes.main.latitude/longitude` → direct `latitude/longitude` fields
3. **Category IDs changed**: From numeric `id` → string `fsq_category_id`

Our types and transformation logic were based on the old API format.

## Solution

### 1. Updated `src/types/external/foursquare.types.ts`

Changed `FoursquarePlace` interface:
```typescript
// Before
export interface FoursquarePlace {
  fsq_id: string
  geocodes?: {
    main?: { latitude: number; longitude: number }
  }
  // ...
}

// After
export interface FoursquarePlace {
  fsq_place_id: string
  latitude?: number
  longitude?: number
  geocodes?: {
    main?: { latitude: number; longitude: number }
  }
  // ...
}
```

Changed `FoursquareCategory` interface:
```typescript
// Before
export interface FoursquareCategory {
  id: number
  name: string
  // ...
}

// After
export interface FoursquareCategory {
  id?: number
  fsq_category_id?: string
  name: string
  // ...
}
```

### 2. Updated `src/Services/foursquareService.ts`

Fixed `transformToRestaurant()` method:
```typescript
// Before
const latitude = place.geocodes?.main?.latitude ?? null
const longitude = place.geocodes?.main?.longitude ?? null
// ...
return {
  foursquareid: place.fsq_id,
  // ...
}

// After
const latitude = place.latitude ?? place.geocodes?.main?.latitude ?? null
const longitude = place.longitude ?? place.geocodes?.main?.longitude ?? null
// ...
return {
  foursquareid: place.fsq_place_id,
  // ...
}
```

### 3. Updated `src/config/foursquareCategoryMapping.ts`

Made category mapping handle both old numeric IDs and new string IDs with name-based fallback:
```typescript
// Before
export function mapFoursquareCategory(
  categoryId: number,
  categoryName?: string
): string | null

// After
export function mapFoursquareCategory(
  categoryId: number | undefined,
  categoryName?: string
): string | null
```

Added "pizzeria" keyword to `CATEGORY_NAME_KEYWORDS` for better name-based matching.

## Failed Attempts

1. **Attempted to use `fields` parameter**: Tried specifying `fields=fsq_id,geocodes,...` in API request, but API returned error: `"Unexpected field(s): 'fsq_id,geocodes' provided."` - confirming these field names no longer exist.

## Prevention

1. **Don't assume API field names are stable**: External APIs can rename fields between versions. Always verify against live API responses.

2. **Add debug logging during development**: The console log of raw API responses helped identify the exact field name changes.

3. **Use fallback patterns**: When possible, check multiple field locations (e.g., `place.latitude ?? place.geocodes?.main?.latitude`).

4. **Test with live API regularly**: Automated tests against live endpoints can catch format changes early.

## Related Files

- `src/types/external/foursquare.types.ts` - API response type definitions
- `src/Services/foursquareService.ts` - API client and transformation logic
- `src/config/foursquareCategoryMapping.ts` - Category ID to food type mapping

## Actual API Response (2026-01-27)

```json
{
  "results": [{
    "fsq_place_id": "4c70899cd7fab1f74b045fc9",
    "latitude": 9.918162479663362,
    "longitude": -84.0339223262753,
    "categories": [{
      "fsq_category_id": "4bf58dd8d48988d1ca941735",
      "name": "Pizzeria"
    }],
    "location": {
      "formatted_address": "Curridabat, San José"
    },
    "name": "Family Pizza",
    "distance": 708
  }]
}
```
