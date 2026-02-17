# [02-03-25] - [Home] - [Nested VirtualizedList Warning]

## Problem

Console warning appeared: "VirtualizedLists should never be nested inside plain ScrollViews". This occurred on the home screen where featured restaurants were displayed.

## Root Cause

A `FlatList` was being used inside a `ScrollView` (the parent with RefreshControl). React Native warns against this because:
1. VirtualizedLists (FlatList, SectionList) manage their own scroll
2. Nesting them inside ScrollView breaks virtualization benefits
3. Can cause performance issues and unexpected scroll behavior

Since the featured restaurants list was limited to 5 items, the virtualization benefits of `FlatList` were unnecessary.

```tsx
// Before (incorrect)
<ScrollView refreshControl={...}>
  <FlatList
    data={topRestaurants.slice(0, 5)}
    horizontal
    ...
  />
</ScrollView>

// After (correct)
<ScrollView refreshControl={...}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {topRestaurants.slice(0, 5).map((item) => (
      <RestaurantCard key={item.id} ... />
    ))}
  </ScrollView>
</ScrollView>
```

## Solution

Replaced the nested `FlatList` with a horizontal `ScrollView` using `.map()` for the small, fixed list of featured restaurants.

## Prevention

- Use `FlatList` for long, dynamic lists that benefit from virtualization
- Use `ScrollView` with `.map()` for small, fixed lists (typically < 10 items)
- Avoid nesting VirtualizedLists inside ScrollViews
- Consider the actual data size when choosing list components

## Related Files

- `mobile/app/(tabs)/(home)/index.tsx`
