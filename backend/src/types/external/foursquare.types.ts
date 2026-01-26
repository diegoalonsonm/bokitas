// Foursquare Places API v3 types
// Based on standard Foursquare Places API (api.foursquare.com/v3)
// See: https://docs.foursquare.com/developer/reference/place-search

export interface FoursquareSearchResponse {
  results: FoursquarePlace[]
  context?: {
    geo_bounds?: {
      circle?: {
        center: {
          latitude: number
          longitude: number
        }
        radius: number
      }
    }
  }
}

export interface FoursquarePlace {
  fsq_id: string
  name: string
  location: FoursquareLocation
  categories: FoursquareCategory[]
  distance?: number
  geocodes?: {
    main?: {
      latitude: number
      longitude: number
    }
    roof?: {
      latitude: number
      longitude: number
    }
  }
  link?: string
  timezone?: string
  website?: string
  tel?: string
  email?: string
  hours?: FoursquareHours
  hours_popular?: FoursquareHoursPopular[]
  rating?: number
  price?: number
  photos?: FoursquarePhoto[]
  tips?: FoursquareTip[]
  description?: string
  verified?: boolean
  closed_bucket?: string
}

export interface FoursquareLocation {
  address?: string
  address_extended?: string
  census_block?: string
  country?: string
  cross_street?: string
  dma?: string
  formatted_address?: string
  locality?: string
  neighborhood?: string[]
  po_box?: string
  post_town?: string
  postcode?: string
  region?: string
}

export interface FoursquareCategory {
  id: number
  name: string
  short_name?: string
  plural_name?: string
  icon?: {
    prefix: string
    suffix: string
  }
}

export interface FoursquareHours {
  display?: string
  is_local_holiday?: boolean
  open_now?: boolean
  regular?: FoursquareHoursRegular[]
}

export interface FoursquareHoursRegular {
  close?: string
  day?: number
  open?: string
}

export interface FoursquareHoursPopular {
  close?: string
  day?: number
  open?: string
}

export interface FoursquarePhoto {
  id: string
  created_at: string
  prefix: string
  suffix: string
  width: number
  height: number
}

export interface FoursquareTip {
  id: string
  created_at: string
  text: string
  agree_count?: number
  disagree_count?: number
}

// Search parameters for Foursquare Places API v3
// See: https://docs.foursquare.com/developer/reference/place-search
export interface FoursquareSearchParams {
  query?: string
  ll?: string // latitude,longitude format: "lat,lng"
  radius?: number // in meters, max 100000
  near?: string // location name (e.g., "San José, Costa Rica")
  limit?: number // max 50
  categories?: string // comma-separated category IDs
  sort?: 'RELEVANCE' | 'RATING' | 'DISTANCE' | 'POPULARITY'
  fields?: string // comma-separated field names to include in response
}

// Autocomplete API types
// See: https://docs.foursquare.com/developer/reference/places-api-overview
export interface FoursquareAutocompleteParams {
  query: string // Required - The search term to autocomplete
  ll?: string // Optional - Latitude,longitude to bias results (e.g., "40.7,-74")
  radius?: number // Optional - Radius in meters to limit results
  types?: string // Optional - Comma-separated types to include (place, geo, address, search)
  session_token?: string // Optional - Session token for billing purposes
  limit?: number // Optional - Max number of results
}

export interface FoursquareAutocompleteResponse {
  results: FoursquareAutocompleteResult[]
}

export interface FoursquareAutocompleteResult {
  type: 'place' | 'geo' | 'address' | 'search'
  text: FoursquareAutocompleteText
  place?: FoursquareAutocompletePlace
  geo?: FoursquareAutocompleteGeo
  address?: FoursquareAutocompleteAddress
  search?: FoursquareAutocompleteSearch
}

export interface FoursquareAutocompleteText {
  primary: string
  secondary?: string
  highlight?: FoursquareAutocompleteHighlight[]
}

export interface FoursquareAutocompleteHighlight {
  start: number
  length: number
}

export interface FoursquareAutocompletePlace {
  fsq_id: string
  name: string
  categories?: FoursquareCategory[]
  location?: FoursquareLocation
  geocodes?: {
    main?: {
      latitude: number
      longitude: number
    }
  }
}

export interface FoursquareAutocompleteGeo {
  name: string
  center?: {
    latitude: number
    longitude: number
  }
  bounds?: {
    ne: { latitude: number; longitude: number }
    sw: { latitude: number; longitude: number }
  }
}

export interface FoursquareAutocompleteAddress {
  address_id?: string
  text?: string
  center?: {
    latitude: number
    longitude: number
  }
}

export interface FoursquareAutocompleteSearch {
  query: string
}
