import { foursquareClient } from '../config/httpClient.js'
import { 
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
  /**
   * Search for restaurants using Foursquare Places API v3
   * Supports both coordinate-based and text-based location searches
   * 
   * API: https://api.foursquare.com/v3/places/search
   */
  static async searchPlaces(options: FoursquareSearchOptions): Promise<TransformedRestaurant[]> {
    const { query, lat, lng, radius, near, limit } = options

    // Build query parameters for v3 API
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

    try {
      const response = await foursquareClient.get<FoursquareSearchResponse>('/places/search', {
        params
      })

      // Transform results to our format
      return response.data.results.map(place => this.transformToRestaurant(place))
    } catch (error) {
      console.error('Foursquare search error:', error)
      throw error
    }
  }

  /**
   * Get detailed information for a specific place by Foursquare ID
   * 
   * API: https://api.foursquare.com/v3/places/{fsq_id}
   */
  static async getPlaceDetails(fsqId: string): Promise<TransformedRestaurant> {
    try {
      const response = await foursquareClient.get<FoursquarePlace>(`/places/${fsqId}`, {
        params: {
          fields: 'fsq_id,name,location,categories,geocodes,website,tel,rating,price,photos,description'
        }
      })

      return this.transformToRestaurant(response.data)
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
