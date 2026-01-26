import { 
  FOURSQUARE_API_URL, 
  DEFAULT_SEARCH_NEAR, 
  DEFAULT_SEARCH_RADIUS,
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT 
} from '../config/constants.js'
import { mapFoursquareCategories } from '../config/foursquareCategoryMapping.js'
import type { 
  FoursquareSearchResponse, 
  FoursquarePlace,
  FoursquareSearchParams 
} from '../types/external/foursquare.types.js'
import type { CreateRestaurantParams } from '../types/entities/restaurant.types.js'

export interface FoursquareSearchOptions {
  query?: string
  lat?: number
  lng?: number
  radius?: number
  near?: string
  limit?: number
}

export interface TransformedRestaurant extends Omit<CreateRestaurantParams, 'foodTypeIds'> {
  foursquareid: string
  foodTypeIds: string[]
  distance?: number
  categories: Array<{ id: number; name: string }>
}

export class FoursquareService {
  private static readonly apiKey = process.env.FOURSQUARE_API_KEY

  /**
   * Build headers for Foursquare API requests
   */
  private static getHeaders(): HeadersInit {
    if (!this.apiKey) {
      throw new Error('FOURSQUARE_API_KEY environment variable is not set')
    }
    return {
      'Authorization': this.apiKey,
      'Accept': 'application/json'
    }
  }

  /**
   * Search for restaurants using Foursquare Places API
   * Supports both coordinate-based and text-based location searches
   */
  static async searchPlaces(options: FoursquareSearchOptions): Promise<TransformedRestaurant[]> {
    const { query, lat, lng, radius, near, limit } = options

    // Build query parameters
    const params: FoursquareSearchParams = {
      categories: '13000', // Food & Dining
      limit: Math.min(limit || DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT),
      fields: 'fsq_id,name,location,categories,distance,geocodes,website,tel,rating,price,photos'
    }

    // Add search query if provided
    if (query) {
      params.query = query
    }

    // Determine location strategy
    if (lat !== undefined && lng !== undefined) {
      // Coordinate-based search
      params.ll = `${lat},${lng}`
      params.radius = radius || DEFAULT_SEARCH_RADIUS
      params.sort = 'DISTANCE'
    } else if (near) {
      // Text-based location search
      params.near = near.includes('Costa Rica') ? near : `${near}, Costa Rica`
      params.sort = 'RELEVANCE'
    } else {
      // Default to Costa Rica
      params.near = DEFAULT_SEARCH_NEAR
      params.sort = 'RELEVANCE'
    }

    // Build URL with query string
    const url = new URL(`${FOURSQUARE_API_URL}/places/search`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Foursquare API error:', response.status, errorText)
        throw new Error(`Foursquare API error: ${response.status}`)
      }

      const data: FoursquareSearchResponse = await response.json()
      
      // Transform results to our format
      return data.results.map(place => this.transformToRestaurant(place))
    } catch (error) {
      console.error('Foursquare search error:', error)
      throw error
    }
  }

  /**
   * Get detailed information for a specific place by Foursquare ID
   */
  static async getPlaceDetails(fsqId: string): Promise<TransformedRestaurant> {
    const url = new URL(`${FOURSQUARE_API_URL}/places/${fsqId}`)
    url.searchParams.append('fields', 'fsq_id,name,location,categories,geocodes,website,tel,rating,price,photos,description')

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Foursquare API error:', response.status, errorText)
        throw new Error(`Foursquare API error: ${response.status}`)
      }

      const place: FoursquarePlace = await response.json()
      return this.transformToRestaurant(place)
    } catch (error) {
      console.error('Foursquare get details error:', error)
      throw error
    }
  }

  /**
   * Transform a Foursquare place response to our restaurant format
   */
  static transformToRestaurant(place: FoursquarePlace): TransformedRestaurant {
    // Get coordinates from geocodes
    const latitude = place.geocodes?.main?.latitude ?? null
    const longitude = place.geocodes?.main?.longitude ?? null

    // Build formatted address
    const address = place.location?.formatted_address || 
      [place.location?.address, place.location?.locality, place.location?.region]
        .filter(Boolean)
        .join(', ') || null

    // Map Foursquare categories to our food types
    const categories = place.categories.map(cat => ({ id: cat.id, name: cat.name }))
    const foodTypeIds = mapFoursquareCategories(categories)

    // Get first photo URL if available
    let photoUrl: string | null = null
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0]
      photoUrl = `${photo.prefix}original${photo.suffix}`
    }

    return {
      foursquareid: place.fsq_id,
      nombre: place.name,
      direccion: address,
      latitud: latitude,
      longitud: longitude,
      urlfotoperfil: photoUrl,
      urlpaginarestaurante: place.website || null,
      foodTypeIds,
      distance: place.distance,
      categories
    }
  }

  /**
   * Search restaurants near a specific location (convenience method)
   */
  static async searchNearby(
    lat: number, 
    lng: number, 
    options: { query?: string; radius?: number; limit?: number } = {}
  ): Promise<TransformedRestaurant[]> {
    return this.searchPlaces({
      lat,
      lng,
      query: options.query,
      radius: options.radius,
      limit: options.limit
    })
  }

  /**
   * Search restaurants in a city/province (convenience method)
   */
  static async searchInLocation(
    locationName: string,
    options: { query?: string; limit?: number } = {}
  ): Promise<TransformedRestaurant[]> {
    return this.searchPlaces({
      near: locationName,
      query: options.query,
      limit: options.limit
    })
  }
}
