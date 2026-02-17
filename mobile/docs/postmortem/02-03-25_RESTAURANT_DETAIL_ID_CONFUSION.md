# [02-03-25] - [Restaurant Detail] - [ID Type Confusion Between Foursquare and Local DB]

## Problem

Multiple issues on the restaurant detail screen:
1. Eatlist additions failed silently for restaurants found via search
2. Reviews failed to load for search-result restaurants
3. "In Eatlist" status displayed incorrectly
4. Toggle visited and remove from eatlist operations failed

## Root Cause

The application had a fundamental ID confusion issue:
1. **Search results from Foursquare** use Foursquare IDs (format: `fsq_xxx`)
2. **Local database** uses auto-generated UUIDs
3. The URL parameter `id` could be either type depending on how the user navigated
4. The code was using the URL parameter directly for all operations, assuming it was always a local database ID

```typescript
// Before (incorrect) - assumed id was always local DB ID
const isInEatlist = entries.some((e) => e.restaurantId === id);
await addToEatlist(id);
await restaurantsApi.getReviews(id, { limit: 10 });

// After (correct) - resolve to local DB ID first, then use restaurant.id
const isInEatlist = restaurant ? entries.some((e) => e.restaurantId === restaurant.id) : false;

// Fetch logic tries local ID first, then Foursquare ID
let restaurantRes = await restaurantsApi.getById(id);
if (!restaurantRes.success || !restaurantRes.data) {
  restaurantRes = await restaurantsApi.getByFoursquareId(id);
}

// Use the resolved restaurant.id for all operations
await addToEatlist(restaurant.id);
await restaurantsApi.getReviews(restaurant.id, { limit: 10 });
```

## Solution

1. Modified fetch logic to try local database ID first, then fall back to Foursquare ID lookup
2. Changed eatlist check to use `restaurant.id` (resolved local ID) instead of URL param
3. Updated all eatlist operations to use `restaurant.id`
4. Updated review fetching to use the resolved local database ID
5. Added null checks for `restaurant` before performing operations

## Failed Attempts

None documented, but the fix required understanding the full data flow from search → detail → eatlist.

## Prevention

- Document and enforce ID conventions across the application
- Use branded/nominal types to distinguish between different ID sources:
  ```typescript
  type LocalId = string & { __brand: 'LocalId' };
  type FoursquareId = string & { __brand: 'FoursquareId' };
  ```
- Consider a unified ID resolution layer/service
- Always use the canonical (database) ID for persistence operations
- Add E2E tests for the search → detail → eatlist flow

## Related Files

- `mobile/app/(tabs)/(home)/restaurant/[id].tsx`
- `mobile/lib/stores/useEatlistStore.ts`
- `mobile/lib/api/endpoints/restaurants.ts`
