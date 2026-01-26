# [01-23-26] - User - GET users/:id Returns 404 for Valid GUIDs

## Problem
The `GET /users/:id` endpoint returned a 404 "User not found" error even when a valid GUID was passed through the URL. The Supabase query was returning null, causing the controller to return a 404 response.

## Root Cause
The `getById` method in `userModel.ts` was selecting database columns with incorrect names:

```typescript
// ❌ WRONG - Column names don't match database schema
.select('id, email, nombre, primerapellido, urlFotoPerfil, createdat, idestado, active')
```

The actual Supabase `usuario` table uses different column names:
- `correo` (not `email`)
- `primerapellido` (not `apellido`)
- `urlfotoperfil` (not `urlFotoPerfil`)

When the query ran with non-existent columns, Supabase returned an error, but the code was treating any error as "user not found" (returning null), which led to the misleading 404 response.

## Solution
Updated the `getById` method to:
1. Use correct database column names in the select statement
2. Transform the response data to match the TypeScript interface

```typescript
// ✅ CORRECT - Uses correct column names and transforms response
const { data, error } = await supabase
  .from('usuario')
  .select('id, correo, nombre, primerapellido, segundoapellido, urlfotoperfil, createdat, idestado, active')
  .eq('id', id)
  .eq('active', true)
  .single()

if (error || !data) {
  return null
}

const transformedData = {
  id: data.id,
  email: data.correo,
  nombre: data.nombre,
  primerapellido: data.primerapellido,
  segundoapellido: data.segundoapellido,
  urlFotoPerfil: data.urlfotoperfil,
  createdat: data.createdat,
  idestado: data.idestado,
  active: data.active
}

return transformedData as User
```

## Prevention
1. **Audit all Supabase queries**: Review all `.from()` calls to ensure column names match the actual database schema
2. **Document column name mappings**: Create a central mapping document showing TypeScript interface fields vs database column names
3. **Improve error logging**: When Supabase queries fail, log the actual error message instead of silently returning null
4. **Add unit tests**: Test database queries with actual column names to catch schema mismatches early

## Related Files
- `src/Models/userModel.ts:42-60` - Fixed getById method
- `src/Controllers/authController.ts:300` - Reference point showing correct column names in me endpoint
- `src/types/entities/user.types.ts` - TypeScript User interface definition
