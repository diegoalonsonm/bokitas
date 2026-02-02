# 01-23-26 - Auth - primerapellido Not Saved During Registration

## Problem
When registering a new user via POST /auth/register, the `primerapellido` field was being sent in the request body and returned successfully in the response, but the database column `usuario.primerapellido` remained empty. The `usuario` table record was created by a database trigger, but the field was not being populated correctly.

## Root Cause
Two issues were identified:

1. **Column name mismatch**: The `usuario` table has a column named `primerapellido`, but the database trigger was incorrectly trying to insert into it using `apellido` field name.

2. **Incorrect trigger mapping**: The Supabase Auth trigger function had multiple errors:
   - Attempted to insert into `id` (not allowed in usuario table - has default `gen_random_uuid()`)
   - Attempted to insert into `email` column (should be `correo`)
   - Used integer `1` for `idestado` (requires UUID from `estado` table)
   - The metadata field mapping was incorrect or not matching the field names sent from the controller

The controller was correctly sending `primerapellido` in the `data` object to Supabase Auth, but the trigger function was not properly extracting this from `NEW.raw_user_meta_data->>'primerapellido'`.

## Solution
1. Updated the database trigger function to correctly map:
   - `authid` ← `NEW.id` (auth.users id)
   - `correo` ← `NEW.email`
   - `nombre` ← `NEW.raw_user_meta_data->>'nombre'`
   - `primerapellido` ← `NEW.raw_user_meta_data->>'primerapellido'`
   - `idestado` ← `'9aca8808-a7a2-4d43-8be8-d341655caa3e'::uuid` (Active state UUID)

2. Fixed TypeScript inconsistency in `src/types/api/auth.api.types.ts`:
   - Changed `apellido` to `primerapellido` in `RegisterBody` interface

3. Updated `src/Controllers/authController.ts`:
   - Changed `apellido` to `primerapellido` in the `me` endpoint SELECT query

## Failed Attempts
1. First attempt: Updated only the controller and types, assuming the trigger was correct. This caused TypeScript errors and didn't fix the database issue.

2. Second attempt: Updated trigger but used `email` instead of `correo` column and integer `1` instead of UUID for `idestado`. This caused "Database error saving new user" from Supabase Auth.

## Prevention
1. **Schema documentation**: Maintain a living document of database schema with column names and data types, especially for tables with non-English names (e.g., `primerapellido`, `segundoapellido`, `correo`).

2. **Trigger testing**: When creating/updating database triggers that copy data between tables, verify all column names and data types match the target table schema before deploying.

3. **State ID references**: Use valid UUIDs from reference tables (like `estado`) instead of integers, and document commonly used state IDs (e.g., Active = `9aca8808-a7a2-4d43-8be8-d341655caa3e`).

4. **Consistent naming**: Ensure field names are consistent across:
   - Frontend request body
   - Controller code
   - Supabase Auth metadata
   - Database triggers
   - API type definitions

## Related Files
- `src/Controllers/authController.ts`
- `src/types/api/auth.api.types.ts`
- `src/Models/validations/authValidation.ts`
- Database migration: `fix_auth_user_trigger_primerapellido`
- Database migration: `fix_auth_user_trigger_columns`