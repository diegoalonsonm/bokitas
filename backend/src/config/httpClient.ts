import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { FOURSQUARE_API_URL, FOURSQUARE_API_VERSION } from './constants.js'

/**
 * Create a configured axios instance for Foursquare API
 * See: https://docs.foursquare.com/developer/reference/place-search
 */
export const foursquareClient: AxiosInstance = axios.create({
  baseURL: FOURSQUARE_API_URL,
  headers: {
    'Accept': 'application/json',
    'X-Places-Api-Version': FOURSQUARE_API_VERSION
  },
  timeout: 10000 // 10 seconds
})

// Request interceptor to add API key
foursquareClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiKey = process.env.FOURSQUARE_API_KEY
    if (!apiKey) {
      throw new Error('FOURSQUARE_API_KEY environment variable is not set')
    }
    // Foursquare requires "Bearer " prefix for authorization
    config.headers.Authorization = `Bearer ${apiKey}`
    
    // Log request for debugging (can be removed in production)
    console.log(`[Foursquare API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    
    return config
  },
  (error: AxiosError) => {
    console.error('[Foursquare API] Request error:', error.message)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
foursquareClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        `[Foursquare API] Error ${error.response.status}:`,
        error.response.data
      )
    } else if (error.request) {
      // Request made but no response received
      console.error('[Foursquare API] No response received:', error.message)
    } else {
      // Error in setting up the request
      console.error('[Foursquare API] Request setup error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default foursquareClient
