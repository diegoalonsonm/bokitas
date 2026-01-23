# [01-23-26] - Auth Register Endpoint - Field Name Change and Database Query Update

## Problem
The register endpoint had inconsistent field names and was relying on Supabase Auth response user data instead of fetching from the database, which caused potential data synchronization issues.

## Root Cause
1. Field naming inconsistency: Used `primerapellido` in some places but should use `apellido` for consistency
2. Direct dependency on Supabase Auth response: Was returning user data from `signUpData.user` without verifying it existed in the database
3. Missing environment variable: Was using `SUPABASE_SERVICE_ROLE_KEY` which should be `SUPABASE_ANON_KEY` for client-side operations

## Solution
1. **Standardized field naming**: Changed all instances of `primerapellido` to `apellido` throughout the register flow
2. **Database-first approach**: Instead of returning `signUpData.user`, now fetches user data directly from the `usuario` table using Supabase query
3. **Updated environment variable**: Changed from `SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_ANON_KEY`
4. **Removed auth options**: Removed `autoRefreshToken: false` and `persistSession: false` options from Supabase client initialization

### Changes Made

#### authController.ts
- Changed field extraction from `primerapellido` to `apellido`
- Updated validation call with new field name
- Changed Supabase signUp call to not extract `signUpData.user` immediately
- Added database query to fetch user record from `usuario` table
- Updated error handling to check both `userError` and `user` existence
- Changed response to return data from database query instead of Supabase Auth response

#### supabase/client.ts
- Changed environment variable from `SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_ANON_KEY`
- Removed `autoRefreshToken: false` and `persistSession: false` from client options
- Simplified client initialization to use default auth behavior

#### authValidation.ts
- Updated Zod schema field name from `primerapellido` to `apellido`

## Failed Attempts
- None

## Prevention
1. Always verify database records after creating users instead of relying on async Auth response data
2. Use consistent field naming across all validation schemas and controllers
3. Use appropriate Supabase client key type (ANON_KEY for client operations, SERVICE_ROLE_KEY for server operations)
4. Review and update documentation when field names change

## Related Files
- `src/Controllers/authController.ts`
- `src/Models/supabase/client.ts`
- `src/Models/validations/authValidation.ts`
