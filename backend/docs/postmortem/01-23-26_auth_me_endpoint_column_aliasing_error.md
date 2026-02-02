# 01-23-26 - Auth - me Endpoint Failed Due to Incorrect Column Aliasing

## Problem
The GET /auth/me endpoint was returning error "Failed to fetch user" even when authenticated with a valid bearer token. The user record existed in the database, but the query was failing.

## Root Cause
The Supabase query in the `me` endpoint used incorrect column aliasing syntax:

```typescript
.select('id, correo as email, nombre, primerapellido, createdat, urlfotoperfil, idestado, active')
```

The `correo as email` syntax was being interpreted literally as `correoasemail` instead of properly aliasing the `correo` column to `email`. Supabase client doesn't support inline aliasing in the same way as SQL, and the aliased column name wasn't being recognized correctly in the response.

Additionally, the initial version of the query was querying by wrong primary key:
- Used `.eq('id', userId)` - but `usuario.id` is a separate UUID (not the auth user ID)
- Should use `.eq('authid', userId)` - the foreign key that references `auth.users.id`

## Solution
1. **Removed column aliasing**: Changed `select()` to use actual column name `correo` instead of `correo as email`:
   ```typescript
   .select('id, correo, nombre, primerapellido, createdat, urlfotoperfil, idestado, active')
   ```

2. **Fixed query filter**: Changed `.eq('id', userId)` to `.eq('authid', userId)` to correctly query by the auth user ID that comes from JWT token verification

3. **Enhanced error logging**: Added detailed console logging to see the actual Supabase error:
   ```typescript
   if (error) {
     console.error('Supabase query error:', error)
     throw new Error(`Failed to fetch user: ${error.message}`)
   }
   ```

## Failed Attempts
1. **Attempt 1 - Column name fixes**: Fixed `email` → `correo` and `id` → `authid` but used aliasing `correo as email`. This didn't resolve the issue because Supabase client wasn't recognizing the aliased column correctly.

2. **Attempt 2 - Confusion about error**: Initially thought the error was due to missing user record, but the actual issue was with query column syntax.

## Prevention
1. **Supabase query syntax**: When using Supabase JavaScript client, avoid SQL-style aliasing like `column as alias` in the `select()` method. Use actual column names and handle mapping in TypeScript/application code if needed.

2. **Column name verification**: Always double-check column names from the actual database schema (not assumptions):
   - Use `supabase_list_tables` to verify column names
   - Compare with database schema documentation
   - Spanish vs English naming conventions (e.g., `correo` not `email`, `primerapellido` not `lastName`)

3. **Foreign key vs primary key**: In tables that reference auth users:
   - `id` = primary key (auto-generated UUID)
   - `authid` = foreign key to `auth.users.id`
   - Queries from authenticated context should use `authid` for filtering

4. **Early error inspection**: When database queries fail, log the actual Supabase error object immediately rather than throwing a generic error message. This provides details like "column does not exist" vs "no rows returned".

## Related Files
- `src/Controllers/authController.ts` (me endpoint, lines 283-323)
- `src/Middleware/authMiddleware.ts` (JWT verification)
- Database table: `usuario` (columns: `id`, `authid`, `correo`, `nombre`, `primerapellido`)