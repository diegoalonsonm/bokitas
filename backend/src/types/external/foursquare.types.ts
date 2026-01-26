// Foursquare Places API types
// Based on Foursquare Places API v3

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

// Search parameters for Foursquare API
export interface FoursquareSearchParams {
  query?: string
  ll?: string // latitude,longitude
  radius?: number
  near?: string
  limit?: number
  categories?: string // comma-separated category IDs
  sort?: 'RELEVANCE' | 'RATING' | 'DISTANCE' | 'POPULARITY'
  fields?: string // comma-separated field names
}
