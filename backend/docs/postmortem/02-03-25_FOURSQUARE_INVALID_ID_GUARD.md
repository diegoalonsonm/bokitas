# [02-03-25] - [Foursquare] - [Invalid ID Guard in Service Layer]

## Problem

Invalid Foursquare IDs were being passed to the external Foursquare API, wasting API quota and returning confusing error messages that were hard to debug.

## Root Cause

Even though validation exists at the route level, the service method `getPlaceDetails` could be called from other internal services without passing through route validation. There was no defense-in-depth protection at the service layer.

```typescript
// Added guard clause
static async getPlaceDetails(fsqId: string): Promise<TransformedRestaurant> {
  // Validate fsqId to prevent API calls with invalid IDs
  if (!fsqId || fsqId === 'undefined' || fsqId === 'null') {
    throw new Error(`Invalid Foursquare ID: ${fsqId}`)
  }
  // ... rest of the method
}
```

## Solution

Added a guard clause at the beginning of `getPlaceDetails` to validate the Foursquare ID before making an external API call. This provides clear, actionable error messages and protects API quotas.

## Prevention

- Implement defense-in-depth validation at multiple layers
- Fail fast with descriptive error messages
- Protect external API quotas from invalid requests
- Add unit tests for service methods with invalid inputs
- Consider creating a dedicated ID validation utility function

## Related Files

- `backend/src/Services/foursquareService.ts`
