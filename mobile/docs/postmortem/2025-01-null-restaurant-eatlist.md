# Postmortem: Null Restaurant in Eatlist Causes App Crash

**Date:** 2025-01-XX  
**Severity:** High  
**Duration:** Unknown (until fix deployed)  
**Author:** Engineering Team

---

## Summary

The mobile app crashed when fetching a user's eatlist due to a `TypeError: Cannot read property 'id' of undefined` error. The `mapRestaurant` function was called with `undefined` when an eatlist entry had a missing or null `restaurante` field from the API response.

---

## Impact

- **User-facing:** App crash when navigating to eatlist screen
- **Affected users:** Any user with eatlist entries referencing deleted/null restaurants
- **Business impact:** Users unable to view their saved restaurants list

---

## Timeline

| Time | Event |
|------|-------|
| TBD | Error first observed in logs |
| TBD | Root cause identified |
| TBD | Fix implemented and deployed |

---

## Root Cause

The `getEatlist` function in `lib/api/endpoints/users.ts` assumed that every eatlist entry returned from the API would have a valid `restaurante` object. However, the API can return entries where `restaurante` is `null` or `undefined` (e.g., when a restaurant has been deleted from the database but the eatlist entry still exists).

**Problematic code:**
```typescript
data: response.data.map((entry) => ({
  // ...
  restaurant: mapRestaurant(entry.restaurante), // entry.restaurante can be undefined
})),
```

When `mapRestaurant` received `undefined`, it attempted to access `raw.id`, causing the TypeError.

---

## Resolution

Added a filter to exclude eatlist entries with missing restaurant data before mapping:

```typescript
data: response.data
  .filter((entry) => entry.restaurante != null)
  .map((entry) => ({
    // ...
    restaurant: mapRestaurant(entry.restaurante),
  })),
```

**File changed:** `lib/api/endpoints/users.ts`

---

## Lessons Learned

### What went well
- Stack trace clearly identified the source of the error
- Fix was straightforward once root cause was identified

### What went wrong
- No defensive coding for nullable nested API responses
- No validation layer between API responses and mapper functions
- Missing integration tests for edge cases with incomplete data

---

## Action Items

| Priority | Action | Owner | Status |
|----------|--------|-------|--------|
| High | Audit other API endpoints for similar null reference issues | TBD | Pending |
| High | Add null checks to all mapper functions | TBD | Pending |
| Medium | Investigate why API returns eatlist entries with null restaurants | Backend Team | Pending |
| Medium | Add cascade delete or cleanup job for orphaned eatlist entries | Backend Team | Pending |
| Low | Add integration tests for edge cases with missing nested data | TBD | Pending |
| Low | Consider adding runtime validation (e.g., Zod) for API responses | TBD | Pending |

---

## Related Files

- `lib/api/endpoints/users.ts` - Fixed
- `lib/utils/mappers.ts` - Contains `mapRestaurant` function (consider adding defensive checks)

---

## Prevention

To prevent similar issues in the future:

1. **Defensive mapping:** Mapper functions should validate input before accessing properties
2. **API contracts:** Document and enforce nullable fields in API responses
3. **Type guards:** Use TypeScript type guards to validate data shape at runtime
4. **Testing:** Add tests with malformed/incomplete API responses
