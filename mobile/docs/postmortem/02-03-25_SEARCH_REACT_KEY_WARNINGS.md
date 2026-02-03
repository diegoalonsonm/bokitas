# [02-03-25] - [Search] - [React Key Prop Warnings]

## Problem

React warnings appeared in the console:
1. "Each child in a list should have a unique 'key' prop" for search history items
2. "Encountered two children with the same key" for restaurant search results

## Root Cause

Two separate key-related issues:

1. **Search History**: Using array index as key causes React reconciliation issues when items change order or are removed
   ```tsx
   // Before (incorrect)
   {searchHistory.map((item, index) => (
     <Pressable key={index} ...>
   ```

2. **Restaurant Results**: Some restaurants from search results may have undefined IDs before being persisted to the local database
   ```tsx
   // Before (incorrect)
   keyExtractor={(item) => item.id}  // item.id could be undefined
   ```

## Solution

1. **Search History**: Use content-based keys with a prefix to avoid collisions
   ```tsx
   // After (correct)
   {searchHistory.map((item) => (
     <Pressable key={`history-${item}`} ...>
   ```

2. **Restaurant Results**: Provide a fallback key using the index when ID is undefined
   ```tsx
   // After (correct)
   keyExtractor={(item, index) => item.id ?? `restaurant-${index}`}
   ```

## Prevention

- Never use array index as key for dynamic lists that can be reordered
- Use content-based keys when possible (e.g., unique text, IDs)
- Provide fallback keys for items that may have undefined IDs
- Prefix keys to avoid collisions between different list types
- Consider adding TypeScript types that make `id` required

## Related Files

- `mobile/app/(tabs)/(home)/search.tsx`
