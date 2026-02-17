# [02-10-26] - [Search] - Restaurant Detail 404 from Search Results

## Problem
When users searched for restaurants using the search bar and tapped on a result card to view details, the app displayed a 404 error screen with the message "Restaurante no encontrado - No se pudieron cargar los detalles del restaurante." This issue only affected restaurants accessed from search results; restaurants accessed from the home view or eatlist worked correctly.

## Root Cause
The backend's `FoursquareService.transformToRestaurant()` method was not including an `id` field in the transformed restaurant object returned from search results. It only included `foursquareid`.

When the frontend received search results, the `mapRestaurant()` function in `lib/utils/mappers.ts` mapped `raw.id` to `restaurant.id`. Since `raw.id` was `undefined`, the `RestaurantCard` component navigated to `/restaurant/undefined`, which caused both API calls in the detail page to fail.

**Data flow comparison:**

| Source | API Endpoint | ID Field | Result |
|--------|--------------|----------|--------|
| Home/Eatlist | `getAll()`, `getTop()` | Local DB UUID | Works |
| Search | `search()` (Foursquare) | `undefined` | 404 Error |

## Solution
Backend fix in `src/Services/foursquareService.ts`:
- Added `id: place.fsq_place_id` to the transformed restaurant object
- Updated `TransformedRestaurant` interface to include `id: string`

Now search results include the Foursquare ID as the `id` field. The restaurant detail screen (`app/(tabs)/(home)/restaurant/[id].tsx`) already had correct fallback logic:

```typescript
// First, try to fetch by local database ID
let restaurantRes = await restaurantsApi.getById(id);

// If not found, the ID might be a Foursquare ID (from search results)
if (!restaurantRes.success || !restaurantRes.data) {
  restaurantRes = await restaurantsApi.getByFoursquareId(id);
}
```

## Failed Attempts
None - the issue was identified on first investigation by tracing the data flow from search results to navigation.

## Prevention
- Ensure backend API responses match the expected frontend types (e.g., `RawRestaurant` expects `id` as required)
- When integrating external APIs (Foursquare), verify that transformed responses include all fields needed by the frontend
- Consider adding E2E tests that cover the full search-to-detail navigation flow

## Related Files
- `lib/utils/mappers.ts` - `RawRestaurant` interface defines expected fields from API
- `lib/api/endpoints/restaurants.ts` - `search()` method that calls backend
- `components/restaurants/RestaurantCard.tsx` - Navigates using `restaurant.id`
- `app/(tabs)/(home)/restaurant/[id].tsx` - Detail page with fallback logic for Foursquare IDs
- `app/(tabs)/(home)/search.tsx` - Search screen that renders RestaurantCard components
