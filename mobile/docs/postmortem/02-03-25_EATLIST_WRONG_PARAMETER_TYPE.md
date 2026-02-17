# [02-03-25] - [Eatlist] - [Wrong Parameter Type for API Calls]

## Problem

Toggle visited and remove from eatlist operations on the eatlist screen were failing silently. Items would appear to toggle or remove but would revert on refresh, or operations would fail with 404 errors.

## Root Cause

The eatlist screen was passing `entry.id` (the eatlist entry's own ID) to API operations, but the backend API expects `restaurantId` as the identifier. This is because the backend uses `restaurantId` as the primary lookup key for user-specific eatlist operations (a user can only have one eatlist entry per restaurant).

```typescript
// Before (incorrect)
const handleToggleVisited = async (entry: EatlistEntry) => {
  await updateFlag(entry.id, !entry.hasBeenFlag);  // Wrong: using entry.id
};

onPress: () => removeFromEatlist(entry.id),  // Wrong: using entry.id

// After (correct)
const handleToggleVisited = async (entry: EatlistEntry) => {
  await updateFlag(entry.restaurantId, !entry.hasBeenFlag);  // Correct: using restaurantId
};

onPress: () => removeFromEatlist(entry.restaurantId),  // Correct: using restaurantId
```

## Solution

Changed both `handleToggleVisited` and `handleRemove` functions to pass `entry.restaurantId` instead of `entry.id` to the store actions.

## Prevention

- Document API contracts clearly, including expected parameter types
- Use TypeScript to enforce parameter types at the store/API boundary
- Consider renaming parameters to be self-documenting (e.g., `removeByRestaurantId`)
- Add integration tests for all eatlist CRUD operations
- Review API documentation when implementing UI interactions

## Related Files

- `mobile/app/(tabs)/eatlist.tsx`
- `mobile/lib/stores/useEatlistStore.ts`
- `mobile/lib/api/endpoints/eatlist.ts`
