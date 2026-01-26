// Foursquare API configuration constants
// Using standard Places API - see: https://docs.foursquare.com/developer/reference/place-search

export const FOURSQUARE_API_URL = 'https://places-api.foursquare.com'
export const FOURSQUARE_API_VERSION = '2025-06-17'

// Default search parameters
export const DEFAULT_SEARCH_NEAR = 'Costa Rica'
export const DEFAULT_SEARCH_RADIUS = 10000 // meters (10km)
export const DEFAULT_SEARCH_LIMIT = 20
export const MAX_SEARCH_LIMIT = 50

// Foursquare category IDs for restaurants
// See: https://docs.foursquare.com/data-products/docs/categories
export const FOURSQUARE_RESTAURANT_CATEGORY = '13000' // Food & Dining

// Costa Rica provinces for validation
export const COSTA_RICA_PROVINCES = [
  'San Jose',
  'Cartago', 
  'Heredia',
  'Alajuela',
  'Guanacaste',
  'Puntarenas',
  'Limon'
] as const

export type CostaRicaProvince = typeof COSTA_RICA_PROVINCES[number]
