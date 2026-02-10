# [02-10-26] - [Eatlist] - Visited Flag Not Persisting After Login

## Problem

Restaurants marked as "visited" in the eatlist would correctly move from "Por visitar" to "Visitados" tab, but after logging out and logging back in, all restaurants would revert to the "Por visitar" tab. The state appeared to be only handled locally and reset on every session.

## Root Cause

Field naming mismatch between the backend API response and the mobile app's expected format:

- **Database column**: `flag` (boolean)
- **Backend was returning**: `flag`
- **Mobile app expected**: `hasbeenflag`

The mobile app's mapper at `mobile/lib/api/endpoints/eatlist.ts` was mapping `raw.hasbeenflag` to `hasBeenFlag`, but since the backend returned `flag` instead of `hasbeenflag`, this value was always `undefined` (falsy). 

The optimistic update in the Zustand store made the UI appear correct locally, but when data was fetched from the server after login, all entries had `hasBeenFlag: false/undefined`, causing all restaurants to appear in "Por visitar".

## Solution

Updated the backend to transform the database `flag` column to `hasbeenflag` in all API responses:

1. **Created `EatlistApiResponse` interface** in `src/types/entities/eatlist.types.ts`:
   - Uses `hasbeenflag` instead of `flag` to match mobile expectations
   - Added `id` field that mobile expects (using `idrestaurante` as unique identifier)

2. **Updated `EatlistModel` methods** in `src/Models/eatlistModel.ts`:
   - `getAll()`: Returns `hasbeenflag` mapped from `flag` column
   - `add()`: Returns `EatlistApiResponse` with `hasbeenflag`
   - `update()`: Returns `EatlistApiResponse` with `hasbeenflag`

## Failed Attempts

None - the root cause was identified correctly on the first investigation by tracing the data flow from database to mobile UI.

## Prevention

1. **Document API contracts explicitly**: Create shared type definitions or OpenAPI specs that both backend and mobile reference to ensure field naming consistency.

2. **Add integration tests**: Test that the API response format matches what the mobile client expects, especially for boolean flags that could silently fail as `undefined`.

3. **Use consistent naming conventions**: When the database uses one name (`flag`) and the client uses another (`hasbeenflag`), document this transformation clearly in the model layer.

4. **Log API responses during development**: When debugging state persistence issues, check the actual API response to verify field names match expectations.

## Related Files

- `backend/src/Models/eatlistModel.ts` - Added response transformation
- `backend/src/types/entities/eatlist.types.ts` - Added `EatlistApiResponse` interface
- `mobile/lib/api/endpoints/eatlist.ts` - Mobile mapper (already correct, expected `hasbeenflag`)
- `mobile/lib/stores/useEatlistStore.ts` - Zustand store with optimistic updates
