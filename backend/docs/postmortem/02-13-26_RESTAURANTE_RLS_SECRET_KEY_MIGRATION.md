# [02-13-26] - Restaurante Table - RLS Policy Violation Investigation

## Problem

When searching for a new restaurant to review, the backend failed with:
```
new row violates row-level security policy for table "restaurante"
```

`POST /rest/v1/restaurante` requests returned HTTP 403, while `GET` requests to the same table worked fine.

## Root Cause

The Supabase client was briefly updated to use the new `SUPABASE_SECRET_KEY` (`sb_secret_...` format) instead of the legacy `SUPABASE_SERVICE_ROLE_KEY` (JWT format). However, `sb_secret_` keys are **NOT valid JWTs** and cannot be used as `Authorization: Bearer` tokens by `@supabase/supabase-js`. PostgREST requires a JWT to resolve the Postgres role.

When PostgREST received the non-JWT `sb_secret_` token, it fell back to the `anon` role. The `anon` role has SELECT policies on `restaurante` (so GETs returned 200), but no INSERT/UPDATE/DELETE policies - causing write operations to fail with RLS violations.

### Key Evidence

- **Direct HTTP with service_role JWT** → Status 201 (success)
- **`@supabase/supabase-js` with service_role JWT** → Status 201 (success)
- **`@supabase/supabase-js` with `sb_secret_` key** → Status 403 (RLS violation)
- **API Logs**: `POST | 403` but `GET | 200` for the same table
- **RLS Policies**: Only `service_role` had write permissions; `anon`/`authenticated` only had read

### Why GETs worked but POSTs didn't

- `anon` role has a `SELECT` policy on `restaurante` → reads succeed
- `anon` role has NO `INSERT` policy → writes fail with 42501
- `service_role` has `rolbypassrls = true` but was never resolved because the token wasn't a valid JWT

## Solution

1. Reverted `src/Models/supabase/client.ts` to use `SUPABASE_SERVICE_ROLE_KEY` (JWT format)
2. Added `detectSessionInUrl: false` to the auth config per Supabase server-side best practices
3. Killed stale server process and restarted to ensure new code was loaded

### Important Learning

**`sb_secret_` keys CANNOT be used as a drop-in replacement for `service_role` JWT keys in `@supabase/supabase-js`.** The `sb_secret_` key is designed for the Supabase API Gateway layer, which mints a temporary JWT on the fly. The `@supabase/supabase-js` library sends the key directly to PostgREST as `Authorization: Bearer`, which expects a valid JWT. From the Supabase docs:

> "You cannot send a publishable or secret key in the Authorization: Bearer ... header... your request will be forwarded down to your project's database, but will be rejected as the value is not a JWT."

## Prevention

- **Never use `sb_secret_` keys with `@supabase/supabase-js`** — only use JWT-based `service_role` keys
- Always verify write operations (INSERT/UPDATE/DELETE) after key changes, not just reads
- Always restart the dev server after changing Supabase client configuration
- When debugging RLS issues, test with both raw HTTP and the library to isolate whether the issue is key-level or library-level

## Related Files

- `backend/src/Models/supabase/client.ts`
- `backend/.env`
- `backend/src/Models/restaurantModel.ts`
