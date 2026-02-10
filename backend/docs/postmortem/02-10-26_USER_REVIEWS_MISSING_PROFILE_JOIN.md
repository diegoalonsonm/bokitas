# [02-10-26] - [User] - Reviews Display "Anonimo" Instead of Profile Information

## Problem
When viewing a user's profile (either own or another user's), all reviews displayed "Anonimo" instead of the actual reviewer's name and profile information. This affected both the profile owner's reviews and reviews viewed on other users' profiles.

## Root Cause
The `UserModel.getReviews()` function in `src/Models/userModel.ts` was missing the Supabase foreign key joins needed to include the reviewer's profile information and restaurant data.

The broken query only selected basic review fields:
```typescript
const { data, error } = await supabase
  .from('review')
  .select('id, idusuario, puntuacion, comentario, createdat')
  .eq('idusuario', userId)
  // ...
```

Without the `usuario:idusuario(...)` join, the API response did not include the `usuario` object. The mobile app's `mapReview()` function in `mobile/lib/utils/mappers.ts` then set `user: undefined`, causing `ReviewCard.tsx` to fall back to displaying "Anonimo" via the logic `{review.user?.name || 'Anonimo'}`.

Additionally, the query was missing:
- `urlfotoreview` - review photos would not display
- `restaurante:idrestaurante(...)` join - restaurant info for `showRestaurant` mode in ReviewCard

Other models (`reviewModel.ts`, `restaurantModel.ts`) had correct queries with proper joins, but `userModel.ts` was implemented without them.

## Solution
Updated `src/Models/userModel.ts` `getReviews()` to include the necessary joins:

```typescript
const { data, error } = await supabase
  .from('review')
  .select(`
    id, idusuario, puntuacion, comentario, urlfotoreview, createdat, updatedat,
    usuario:idusuario(id, nombre, primerapellido, urlfotoperfil),
    restaurante:idrestaurante(id, nombre, urlfotoperfil)
  `)
  .eq('idusuario', userId)
  .eq('active', true)
  .order('createdat', { ascending: false })
  .range(offset, offset + limit - 1)
```

No frontend changes were required - the mobile `mapReview()` and `ReviewCard` already handled the `usuario` object correctly when present.

## Failed Attempts
None - root cause was identified on first investigation by comparing with working queries in other models.

## Prevention
- When implementing Supabase queries that will be consumed by the frontend, compare with similar existing queries in other models to ensure consistency
- The `mapReview()` function expects `usuario` and `restaurante` objects - any query returning reviews should include these joins
- Consider creating a shared constant or utility for the standard review select fields to ensure consistency across models

## Related Files
- `src/Models/userModel.ts` - Fixed: Added `usuario` and `restaurante` joins to `getReviews()`
- `src/Models/reviewModel.ts` - Reference: Has correct query with joins
- `src/Models/restaurantModel.ts` - Reference: Has correct query with joins
- `mobile/lib/utils/mappers.ts` - Maps `raw.usuario` to `review.user`
- `mobile/components/reviews/ReviewCard.tsx` - Displays `review.user?.name` with "Anonimo" fallback
