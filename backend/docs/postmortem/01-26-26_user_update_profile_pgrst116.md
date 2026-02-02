# 01-26-26 - User - Update Profile Failed with PGRST116

## Problem
PUT /users/:id returned a 500 error with Supabase `PGRST116` and message "Cannot coerce the result to a single JSON object" when updating a user profile.

## Root Cause
1. **Wrong identifier used in update filter**: The update used `.eq('id', id)` even though the path parameter is the auth user id (`auth.users.id`), while `usuario.id` is a separate UUID. This produced 0 rows.
2. **Column name mismatch**: The update payload mapped to `apellido` and `urlFotoPerfil`, but the `usuario` table uses `primerapellido` and `urlfotoperfil`.
3. **`.single()` on zero rows**: The update used `.single()` after `.select()`, which throws `PGRST116` when 0 rows are returned.

## Solution
1. **Filter by auth user id**: Changed update filter to `.eq('authid', id)`.
2. **Map to real column names**: Updated the update payload to use `primerapellido` and `urlfotoperfil`.
3. **Handle empty result safely**: Replaced `.single()` with `.maybeSingle()` and return a 404 when no record is updated.
4. **Standardized API field name**: Removed `apellido` from user update flow and documentation; use `primerapellido` only.

## Failed Attempts (if any)
- None

## Prevention
1. **Confirm DB column names** for Spanish schema before mapping API fields.
2. **Use authid for authenticated updates** to avoid mixing Auth IDs with table primary keys.
3. **Avoid `.single()` when 0 rows is possible** on updates; use `.maybeSingle()` plus explicit not-found handling.

## Related Files
- `src/Models/userModel.ts`
- `src/Controllers/userController.ts`
- `src/Models/validations/userValidation.ts`
- `src/types/api/user.api.types.ts`
- `docs/endpoints/user-endpoints.md`
