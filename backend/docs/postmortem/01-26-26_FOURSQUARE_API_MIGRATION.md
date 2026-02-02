# [01-26-26] - Foursquare API - Migration to Axios and API Configuration Fixes

## Problem

After migrating the Foursquare service from native `fetch()` to axios, all API requests were failing with 400 Bad Request errors. The integration was completely broken.

## Root Cause

Multiple configuration issues were identified:

1. **Missing API Version Header**: The Foursquare Places API requires an `X-Places-Api-Version` header. Without it, the API returned: `"Please provide a valid version."`

2. **Incorrect Authorization Format**: The API key was being sent without the `Bearer ` prefix. Foursquare requires: `Authorization: Bearer <API_KEY>`

3. **Invalid Field Names**: The `fields` parameter was using field names that are not supported in the current API version (`fsq_id`, `geocodes`). The API returned: `"Unexpected field(s): 'fsq_id,geocodes' provided."`

## Solution

### 1. Updated `src/config/constants.ts`

Added the API version constant:

```typescript
export const FOURSQUARE_API_URL = 'https://places-api.foursquare.com'
export const FOURSQUARE_API_VERSION = '2025-06-17'
```

### 2. Updated `src/config/httpClient.ts`

Fixed the axios client configuration:

```typescript
import { FOURSQUARE_API_URL, FOURSQUARE_API_VERSION } from './constants.js'

export const foursquareClient: AxiosInstance = axios.create({
  baseURL: FOURSQUARE_API_URL,
  headers: {
    'Accept': 'application/json',
    'X-Places-Api-Version': FOURSQUARE_API_VERSION  // Added version header
  },
  timeout: 10000
})

// In the request interceptor:
config.headers.Authorization = `Bearer ${apiKey}`  // Added "Bearer " prefix
```

### 3. Updated `src/Services/foursquareService.ts`

Removed the `fields` parameter from all API calls. The API returns all core fields by default.

**Before:**
```typescript
const params: FoursquareSearchParams = {
  categories: '13000',
  limit: Math.min(limit || DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT),
  fields: 'fsq_id,name,location,categories,distance,geocodes,website,tel,rating,price,photos'
}
```

**After:**
```typescript
const params: FoursquareSearchParams = {
  categories: '13000',
  limit: Math.min(limit || DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT)
  // Note: fields parameter removed - API returns all core fields by default
}
```

Same change applied to:
- `searchPlaces()` method
- `getPlaceDetails()` method
- `getNearbyPlaces()` method

## Failed Attempts

1. **First attempt**: Only added the Bearer prefix to Authorization header. Failed because the version header was still missing.

2. **Second attempt**: Added the version header but kept the `fields` parameter. Failed because `fsq_id` and `geocodes` are not valid field names in the current API version.

## Prevention

1. **Always check official API documentation** for required headers before integrating external APIs.

2. **Use the official SDK examples** as reference. Foursquare provides this example:
   ```typescript
   const options = {
     method: 'GET',
     url: 'https://places-api.foursquare.com/places/search',
     headers: {
       accept: 'application/json',
       'X-Places-Api-Version': '2025-06-17',
       authorization: 'Bearer <API_KEY>'
     }
   }
   ```

3. **Log full error responses** during development. The error messages (`"Please provide a valid version."` and `"Unexpected field(s)..."`) were key to identifying the issues.

4. **Start simple**: When integrating a new API, start without optional parameters (like `fields`) and add them incrementally once the basic call works.

5. **Document API version requirements**: External APIs change frequently. Document the API version being used so future developers know what version the code was written for.

## Related Files

- `src/config/constants.ts` - API URL and version constants
- `src/config/httpClient.ts` - Axios client configuration
- `src/Services/foursquareService.ts` - Foursquare API service methods
- `src/types/external/foursquare.types.ts` - TypeScript types for API responses

## API Reference

- **Base URL**: `https://places-api.foursquare.com`
- **API Version**: `2025-06-17`
- **Required Headers**:
  - `X-Places-Api-Version: 2025-06-17`
  - `Authorization: Bearer <API_KEY>`
  - `Accept: application/json`

## Lessons Learned

- External API migrations require careful attention to authentication and header requirements
- API field names can change between versions - avoid hardcoding field lists when possible
- The Foursquare Places API returns all core fields by default, making the `fields` parameter unnecessary for most use cases
