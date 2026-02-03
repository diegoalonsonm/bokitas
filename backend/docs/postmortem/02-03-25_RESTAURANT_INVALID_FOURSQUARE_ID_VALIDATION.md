# [02-03-25] - [Restaurant] - [Invalid Foursquare ID Validation]

## Problem

Invalid Foursquare IDs like the literal strings "undefined" and "null" were passing validation and causing downstream API failures with confusing error messages.

## Root Cause

JavaScript's string coercion can convert `undefined` and `null` values to their literal string representations ("undefined", "null") when concatenated or interpolated into URLs. The existing validation only checked for empty strings but not these edge cases.

```typescript
// Before
fsqId: z.string({...}).min(1, 'Foursquare ID cannot be empty')

// After
fsqId: z.string({...})
  .min(1, 'Foursquare ID cannot be empty')
  .refine(val => val !== 'undefined' && val !== 'null', {
    message: 'Foursquare ID cannot be undefined or null'
  })
```

## Solution

Added a Zod `.refine()` validation rule to explicitly reject the literal string values "undefined" and "null" for Foursquare IDs, providing clear error messages.

## Prevention

- Always validate at multiple layers (frontend, API gateway, service layer)
- Be aware of JavaScript's type coercion behaviors
- Use strict null checks (`strictNullChecks: true` in tsconfig)
- Use proper optional chaining to prevent undefined propagation
- Add edge case tests for validation schemas

## Related Files

- `backend/src/Models/validations/restaurantValidation.ts`
