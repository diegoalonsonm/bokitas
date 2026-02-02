# [01-27-26] - Restaurante Table - RLS Policy Missing for Service Role

## Problem

When creating a review via `POST /reviews`, the backend failed with error:
```
new row violates row-level security policy for table "restaurante"
```

The review creation flow requires creating a restaurant record first (via `getOrCreateByFoursquareId`), but the insert was being blocked by Row Level Security.

Console errors:
```
Error creating restaurant: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "restaurante"'
}
```

## Root Cause

The `restaurante` table had RLS enabled but only had SELECT policies for `anon` and `authenticated` roles:

```sql
-- Existing policies (SELECT only)
"Anonymous users can read restaurants" - anon, SELECT
"Authenticated users can read restaurants" - authenticated, SELECT
```

**No INSERT/UPDATE/DELETE policies existed for the `service_role`**, which is what the backend uses to connect to Supabase. Even though `service_role` typically bypasses RLS, when using the Supabase client library with specific table operations, the policies still apply.

The same issue affected the `restaurantetipocomida` junction table.

## Solution

Applied two migrations to add service role policies:

### Migration 1: `add_restaurante_insert_policy_for_service_role`
```sql
CREATE POLICY "Service role can manage restaurants" 
ON "restaurante"
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
```

### Migration 2: `add_restaurantetipocomida_insert_policy_for_service_role`
```sql
CREATE POLICY "Service role can manage restaurant food types" 
ON "restaurantetipocomida"
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
```

## Failed Attempts

1. **Initial confusion**: After applying migrations, the error persisted because the running server instance had cached state. Restarting the server resolved the issue.

## Prevention

1. **Always include service_role policies**: When setting up RLS on tables that the backend needs to write to, always create a policy for `service_role` with full access.

2. **Standard RLS template for backend-managed tables**:
```sql
-- Read access for users
CREATE POLICY "Users can read [table]" ON "[table]"
FOR SELECT TO authenticated, anon
USING (active = true);

-- Full access for backend service
CREATE POLICY "Service role can manage [table]" ON "[table]"
FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

3. **Restart server after migrations**: Database schema/policy changes may require server restart to take effect properly.

4. **Test write operations after RLS changes**: Always test INSERT/UPDATE/DELETE operations after modifying RLS policies.

## Related Files

- `src/Models/restaurantModel.ts` - Restaurant CRUD operations
- `src/Models/supabase/client.ts` - Supabase client configuration (uses service_role key)

## Verification

After fix, the flow works:
```bash
# This now successfully creates the restaurant and returns it
curl "http://localhost:3000/restaurants/foursquare/4c70899cd7fab1f74b045fc9"

# Response:
{
  "success": true,
  "data": {
    "id": "c9684244-96eb-4323-a879-5c084914da7c",
    "nombre": "Family Pizza",
    "foursquareid": "4c70899cd7fab1f74b045fc9",
    ...
  }
}
```
