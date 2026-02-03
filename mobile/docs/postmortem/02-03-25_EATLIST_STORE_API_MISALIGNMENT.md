# [02-03-25] - [Eatlist Store] - [API Parameter Misalignment]

## Problem

All eatlist modification operations (remove, update flag) were failing. The optimistic updates would appear to work but then rollback when the API call failed.

## Root Cause

The Zustand store was designed with the assumption that operations use `entryId` (the eatlist entry's own ID), but the backend API is designed around `restaurantId`. This is because a user can only have one eatlist entry per restaurant, so `restaurantId` is the natural key for lookups.

```typescript
// Before (incorrect) - Store interface
removeFromEatlist: (entryId: string) => Promise<void>;
updateFlag: (entryId: string, visited: boolean) => Promise<void>;

// Before (incorrect) - Implementation
removeFromEatlist: async (entryId: string) => {
  set((state) => ({
    entries: state.entries.filter((e) => e.id !== entryId),  // Filtering by entry.id
  }));
  const response = await eatlistApi.remove(entryId);  // API expects restaurantId
}
```

## Solution

Refactored the store to accept `restaurantId` instead of `entryId`:

```typescript
// After (correct) - Store interface
removeFromEatlist: (restaurantId: string) => Promise<void>;
updateFlag: (restaurantId: string, visited: boolean) => Promise<void>;

// After (correct) - Implementation
removeFromEatlist: async (restaurantId: string) => {
  set((state) => ({
    entries: state.entries.filter((e) => e.restaurantId !== restaurantId),
  }));
  const response = await eatlistApi.remove(restaurantId);
}

updateFlag: async (restaurantId: string, visited: boolean) => {
  set((state) => ({
    entries: state.entries.map((e) =>
      e.restaurantId === restaurantId ? { ...e, hasBeenFlag: visited } : e
    ),
  }));
  const response = await eatlistApi.updateFlag(restaurantId, visited);
}
```

## Prevention

- Design API contracts before implementing frontend stores
- Generate TypeScript types from API schemas to catch mismatches
- Use API documentation (OpenAPI/Swagger) as the source of truth
- Test optimistic updates against actual API behavior
- Add integration tests that verify store actions work with the real API
- Review backend API requirements when designing store interfaces

## Related Files

- `mobile/lib/stores/useEatlistStore.ts`
- `mobile/lib/api/endpoints/eatlist.ts`
- `mobile/app/(tabs)/eatlist.tsx`
- `mobile/app/(tabs)/(home)/restaurant/[id].tsx`
