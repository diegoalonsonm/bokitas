# Postmortem: Missing Key Prop in Eatlist FlatList

**Date:** 2025-01-27  
**Severity:** Low (Warning, no functional impact)  
**Component:** `app/(tabs)/eatlist.tsx`  
**Status:** Resolved

## Summary

A React warning "Each child in a list should have a unique key prop" was appearing when navigating to the Eatlist screen. The warning originated from the FlatList component rendering eatlist entries.

## Impact

- Console warning displayed in development mode
- No functional impact on the application
- Potential performance implications due to React's reconciliation algorithm not being able to efficiently track list items

## Root Cause

The `keyExtractor` function in the FlatList was using `item.id` directly without handling cases where the `id` might be `undefined` or `null`:

```typescript
keyExtractor={(item) => item.id}
```

When `item.id` is `undefined`, React treats multiple items as having the same key (empty/undefined), triggering the warning.

## Timeline

1. User navigated to the Eatlist tab
2. FlatList rendered with entries from the API
3. One or more entries had an undefined/null `id` field
4. React threw a warning about missing unique keys

## Resolution

Updated the `keyExtractor` to provide a fallback key using the index when `item.id` is not available:

```typescript
keyExtractor={(item, index) => item.id ?? `eatlist-${index}`}
```

## Lessons Learned

1. **Always handle nullable fields in keyExtractors** - Even if the type definition says `id: string`, the runtime data from APIs may not always conform
2. **Provide fallback keys** - Using index as a fallback (while not ideal for dynamic lists) is better than having undefined keys
3. **Type definitions vs runtime reality** - The `EatlistEntry` type defines `id: string` but the API might return entries without IDs in edge cases

## Action Items

- [x] Fix the keyExtractor to handle undefined IDs
- [ ] Investigate API to ensure all eatlist entries return valid IDs
- [ ] Consider adding runtime validation for API responses
- [ ] Audit other FlatList/map usages in the codebase for similar issues

## Files Changed

- `app/(tabs)/eatlist.tsx` - Line 190: Updated keyExtractor with fallback
