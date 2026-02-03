# [02-03-25] - [Eatlist] - [Wrong Column Name in Query]

## Problem

The eatlist query in the user model was returning `undefined` for the visited status field. Users could not see whether they had marked restaurants as visited or not.

## Root Cause

The database schema uses `flag` as the column name for tracking visited status, but the code was incorrectly referencing `visitado` (Spanish for "visited"). This was a naming inconsistency between the database schema and application code.

```typescript
// Before (incorrect)
.select('idusuario, idrestaurante, visitado, createdat')

// After (correct)
.select('idusuario, idrestaurante, flag, createdat')
```

## Solution

Updated the select query in `userModel.ts` to use the correct column name `flag` instead of `visitado`.

## Prevention

- Use TypeScript types generated from the database schema to catch column name mismatches at compile time
- Consider using an ORM or query builder with type safety
- Maintain consistent naming conventions across database and application code
- Add unit tests that validate query results include expected fields

## Related Files

- `backend/src/Models/userModel.ts`
