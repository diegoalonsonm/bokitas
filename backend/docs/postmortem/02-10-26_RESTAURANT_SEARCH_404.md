# [02-10-26] - [Restaurant] - Search Results Navigation Returns 404

## Problem
When users searched for restaurants using the search bar and clicked on a result to view details, the app displayed a 404 error with the message "Restaurante no encontrado - No se pudieron cargar los detalles del restaurante." This only occurred for search results; restaurants accessed from the home view or eatlist worked correctly.

## Root Cause
The `FoursquareService.transformToRestaurant()` method was not including an `id` field in the transformed restaurant object. It only included `foursquareid`.

When the frontend received search results, the `mapRestaurant()` function mapped `raw.id` (which was `undefined`) to `restaurant.id`. Clicking on a search result card navigated to `/restaurant/undefined`, causing the 404 error.

The difference between search results and other views:
- **Home/Eatlist views**: Fetch from local database via `getAll()` or `getTop()` - restaurants have valid local database IDs
- **Search view**: Fetch from Foursquare API via `search()` - restaurants only had `foursquareid`, no `id` field

## Solution
Updated `src/Services/foursquareService.ts` to include the Foursquare ID as the `id` field in search results:

```typescript
// TransformedRestaurant interface
export interface TransformedRestaurant extends Omit<CreateRestaurantParams, 'foodTypeIds'> {
  id: string // Foursquare ID used as identifier for search results
  foursquareid: string
  foodTypeIds: string[]
  distance?: number
  categories: Array<{ id?: number; name: string }>
}

// transformToRestaurant method
return {
  id: place.fsq_place_id,  // Added this line
  foursquareid: place.fsq_place_id,
  nombre: place.name,
  // ... rest of fields
}
```

The frontend restaurant detail page already had the correct fallback logic to handle Foursquare IDs:
1. First tries `restaurantsApi.getById(id)` (local database lookup)
2. If not found, calls `restaurantsApi.getByFoursquareId(id)` (fetches from Foursquare and creates locally)

## Failed Attempts
None - root cause was identified on first investigation.

## Prevention
- When creating API responses that will be consumed by the frontend, ensure all required fields are present
- The `RawRestaurant` interface in the frontend defines `id` as required - backend responses should always include it
- Consider adding integration tests that verify search results can be navigated to successfully

## Related Files
- `src/Services/foursquareService.ts` - Fixed: Added `id` field to transformed restaurant
- `src/Controllers/restaurantController.ts` - Returns search results from FoursquareService
- `src/types/entities/restaurant.types.ts` - CreateRestaurantParams interface
