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
  FoursquareSearchParams,
  FoursquarePhoto,
  FoursquareTip,
  FoursquarePhotosParams,
  FoursquareTipsParams,
  FoursquareMatchParams,
  FoursquareMatchResponse,
  FoursquareNearbyParams,
  FoursquareNearbyResponse
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
  categories: Array<{ id?: number; name: string }>
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

    // Build query parameters for Places API
    const params: FoursquareSearchParams = {
      categories: '13000', // Food & Dining
      limit: Math.min(limit || DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT)
      // Note: fields parameter removed - API returns all core fields by default
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
    // Validate fsqId to prevent API calls with invalid IDs
    if (!fsqId || fsqId === 'undefined' || fsqId === 'null') {
      throw new Error(`Invalid Foursquare ID: ${fsqId}`)
    }

    try {
      const response = await foursquareClient.get<FoursquarePlace>(`/places/${fsqId}`)

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
    // Get coordinates - API returns them directly or in geocodes
    const latitude = place.latitude ?? place.geocodes?.main?.latitude ?? null
    const longitude = place.longitude ?? place.geocodes?.main?.longitude ?? null

    // Build formatted address
    const address = place.location?.formatted_address ||
      [place.location?.address, place.location?.locality, place.location?.region]
        .filter(Boolean)
        .join(', ') || null

    // Map Foursquare categories to our food types
    const categories = place.categories.map(cat => ({ id: cat.id, name: cat.name })) as Array<{ id: number | undefined; name: string }>
    const foodTypeIds = mapFoursquareCategories(categories)

    // Get first photo URL if available
    let photoUrl: string | null = null
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0]
      photoUrl = `${photo.prefix}original${photo.suffix}`
    }

    return {
      foursquareid: place.fsq_place_id,
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

  /**
   * Get photos for a specific place by Foursquare ID
   * 
   * API: https://api.foursquare.com/v3/places/{fsq_id}/photos
   */
  static async getPhotos(
    fsqId: string, 
    options: FoursquarePhotosParams = {}
  ): Promise<FoursquarePhoto[]> {
    try {
      const params: FoursquarePhotosParams = {
        limit: options.limit || 10,
        sort: options.sort || 'POPULAR'
      }

      if (options.classifications) {
        params.classifications = options.classifications
      }

      const response = await foursquareClient.get<FoursquarePhoto[]>(`/places/${fsqId}/photos`, {
        params
      })

      return response.data
    } catch (error) {
      console.error('Foursquare get photos error:', error)
      throw error
    }
  }

  /**
   * Get tips/reviews for a specific place by Foursquare ID
   * 
   * API: https://api.foursquare.com/v3/places/{fsq_id}/tips
   */
  static async getTips(
    fsqId: string,
    options: FoursquareTipsParams = {}
  ): Promise<FoursquareTip[]> {
    try {
      const params: FoursquareTipsParams = {
        limit: options.limit || 10,
        sort: options.sort || 'POPULAR'
      }

      const response = await foursquareClient.get<FoursquareTip[]>(`/places/${fsqId}/tips`, {
        params
      })

      return response.data
    } catch (error) {
      console.error('Foursquare get tips error:', error)
      throw error
    }
  }

  /**
   * Match a place by name and location to get its Foursquare ID
   * Useful for identifying a specific place when you have some of its details
   * 
   * API: https://api.foursquare.com/v3/places/match
   */
  static async matchPlace(options: FoursquareMatchParams): Promise<FoursquareMatchResponse> {
    try {
      const params: Record<string, string | undefined> = {
        name: options.name,
        fields: options.fields || 'fsq_id,name,location,categories'
      }

      if (options.address) params.address = options.address
      if (options.city) params.city = options.city
      if (options.state) params.state = options.state
      if (options.postalCode) params.postal_code = options.postalCode
      if (options.cc) params.cc = options.cc
      if (options.ll) params.ll = options.ll

      const response = await foursquareClient.get<FoursquareMatchResponse>('/places/match', {
        params
      })

      return response.data
    } catch (error) {
      console.error('Foursquare match place error:', error)
      throw error
    }
  }

  /**
   * Find nearby places using Foursquare's Snap to Place technology
   * Designed for POI tagging and check-in use cases
   * 
   * API: https://api.foursquare.com/v3/places/nearby
   */
  static async getNearbyPlaces(options: FoursquareNearbyParams): Promise<TransformedRestaurant[]> {
    try {
      const params: Record<string, string | number | undefined> = {
        ll: options.ll,
        limit: options.limit || 10
      }

      if (options.query) params.query = options.query
      if (options.hacc) params.hacc = options.hacc
      if (options.altitude) params.altitude = options.altitude

      const response = await foursquareClient.get<FoursquareNearbyResponse>('/places/nearby', {
        params
      })

      return response.data.results.map(place => this.transformToRestaurant(place))
    } catch (error) {
      console.error('Foursquare get nearby places error:', error)
      throw error
    }
  }
}
