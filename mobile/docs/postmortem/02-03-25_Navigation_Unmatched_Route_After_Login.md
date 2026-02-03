# [02-03-25] - Navigation - Unmatched Route After Login

## Problem

After logging in on physical iOS and Android devices, the app showed an "Unmatched Route" error with the message:

```
Page could not be found
URL: exp://192.168.100.2:8081/--/
```

The issue only occurred on physical devices, not on simulators or web. The app would successfully authenticate but fail to navigate to the home screen.

## Root Cause

The app was using Expo Router's **shared routes** syntax with a comma in the folder name: `(home,search)`. This syntax is designed for sharing routes between multiple tab navigators, but:

1. The comma in the folder name `(home,search)` was causing URL path resolution issues on physical devices
2. Physical devices have stricter URL handling compared to simulators
3. The shared routes syntax was unnecessarily complex since only the Home tab was using this group
4. The full path `/(tabs)/(home,search)/` with special characters was not being resolved correctly when redirecting after login

## Solution

Simplified the navigation structure by replacing `(home,search)` with a standard route group `(home)`:

1. **Created new folder structure** at `app/(tabs)/(home)/` with simplified naming
2. **Migrated all screens** from the old folder:
   - `_layout.tsx` - Stack navigator layout
   - `index.tsx` - Home screen (renamed from `home.tsx`)
   - `search.tsx` - Search screen
   - `map.tsx` - Map screen
   - `restaurant/[id].tsx` - Restaurant detail screen
   - `review/[id].tsx` - Review detail screen
   - `user/[id].tsx` - User profile screen

3. **Updated all navigation paths** across the codebase:
   - Changed `/(tabs)/(home,search)/` to `/(tabs)/(home)/`
   - Updated login redirect to use `/(tabs)` instead of complex paths
   - Updated app entry point redirect

4. **Deleted the old `(home,search)` folder** after migration

## Failed Attempts

None - the issue was identified and resolved on first attempt after understanding the root cause.

## Prevention

1. **Avoid special characters in route group names** - Use simple alphanumeric names like `(home)`, `(auth)`, `(tabs)` instead of complex patterns like `(home,search)`

2. **Test on physical devices early** - Simulators may not catch URL handling issues that occur on real devices

3. **Use the simplest routing structure possible** - Only use Expo Router's shared routes syntax `(group1,group2)` when actually sharing routes between multiple navigators

4. **Prefer explicit redirects** - Use simple paths like `/(tabs)` and let the default route handle the rest, rather than deep-linking to specific screens like `/(tabs)/(home)/index`

## Related Files

### Modified Files
- `app/_layout.tsx` - Root layout
- `app/index.tsx` - Entry point redirect
- `app/(auth)/login.tsx` - Post-login redirect
- `app/(tabs)/_layout.tsx` - Tab navigator configuration
- `components/reviews/ReviewCard.tsx` - Navigation paths
- `components/restaurants/RestaurantCard.tsx` - Navigation paths
- `app/(tabs)/eatlist.tsx` - Navigation paths
- `app/(tabs)/profile/index.tsx` - Navigation paths

### New Files (app/(tabs)/(home)/)
- `_layout.tsx`
- `index.tsx`
- `search.tsx`
- `map.tsx`
- `restaurant/[id].tsx`
- `review/[id].tsx`
- `user/[id].tsx`

### Deleted Files (app/(tabs)/(home,search)/)
- All files in this folder were deleted after migration

## Additional Notes

### Expo Router Group Syntax Reference

| Syntax | Purpose | Example |
|--------|---------|---------|
| `(name)` | Route group (URL hidden) | `(auth)`, `(tabs)` |
| `(name1,name2)` | Shared routes between groups | `(home,search)` - use sparingly |
| `[param]` | Dynamic route | `[id].tsx` |
| `_layout.tsx` | Layout component | Required for nested navigation |

### Testing Checklist After Navigation Changes

- [ ] Test login flow on iOS simulator
- [ ] Test login flow on Android emulator
- [ ] Test login flow on physical iOS device
- [ ] Test login flow on physical Android device
- [ ] Verify all tab navigation works
- [ ] Verify deep linking to detail screens works
- [ ] Clear Metro bundler cache before testing (`npx expo start --clear`)
