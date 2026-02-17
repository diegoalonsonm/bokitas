# [02-03-25] - [Search] - [Duplicate Restaurants in Pagination]

## Problem

When loading more search results (pagination), duplicate restaurant entries appeared in the list. This caused:
1. React key warnings (duplicate keys)
2. Visual duplication in search results
3. Incorrect result counts displayed to users

## Root Cause

The search hook was simply appending new results to the existing array without checking for duplicates. Pagination or API response overlap could return the same restaurant in multiple pages.

```typescript
// Before (incorrect)
if (reset) {
  setRestaurants(response.data);
} else {
  setRestaurants((prev) => [...prev, ...response.data!]);  // No deduplication
}
```

## Solution

Added deduplication logic using a Set for O(1) lookup performance:

```typescript
// After (correct)
if (reset) {
  setRestaurants(response.data);
} else {
  // Deduplicate by ID to avoid key warnings
  setRestaurants((prev) => {
    const existingIds = new Set(prev.map((r) => r.id));
    const newItems = response.data!.filter((r) => !existingIds.has(r.id));
    return [...prev, ...newItems];
  });
}
```

## Prevention

- Never trust pagination to return non-overlapping results
- Always deduplicate on the client side when aggregating paginated data
- Use Set for O(1) lookup performance in deduplication
- Add unit tests for pagination logic including edge cases
- Consider using a Map or normalized state for list data

## Related Files

- `mobile/lib/hooks/useRestaurantSearch.ts`
