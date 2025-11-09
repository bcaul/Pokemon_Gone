/**
 * Reverse geocoding utilities using Mapbox Geocoding API
 */

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

/**
 * Reverse geocode coordinates to get country code
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<string|null>} Country code (ISO 3166-1 alpha-2) or null
 */
export async function getCountryCode(latitude, longitude) {
  // Disable geocoding if it's consistently failing (saves API calls)
  if (geocodingDisabled) {
    return null
  }
  
  if (!MAPBOX_ACCESS_TOKEN) {
    return null
  }

  // Validate coordinates
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
      isNaN(latitude) || isNaN(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null
  }

  // Validate coordinates before making API call
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
      isNaN(latitude) || isNaN(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180) {
    console.warn('Invalid coordinates for country code lookup:', { latitude, longitude })
    return null
  }

  try {
    // Mapbox expects longitude,latitude
    const validLon = Math.max(-180, Math.min(180, longitude))
    const validLat = Math.max(-90, Math.min(90, latitude))
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${validLon},${validLat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=country&limit=1`
    
    const response = await fetch(url)

    if (!response.ok) {
      // Track failures and disable if consistently failing
      if (response.status === 422) {
        geocodingFailureCount++
        if (geocodingFailureCount >= MAX_FAILURES) {
          geocodingDisabled = true
          console.warn('Geocoding API disabled due to repeated failures. This saves API calls.')
        }
      }
      return null
    }

    const data = await response.json()
    // Reset failure count on success
    geocodingFailureCount = 0
    const features = data.features || []

    if (features.length > 0) {
      // Extract country code from feature properties
      const countryCode = features[0].properties?.short_code?.toUpperCase()
      return countryCode || null
    }

    return null
  } catch (error) {
    // Silently fail - geocoding is non-critical
    return null
  }
}

/**
 * Get location details (city, country, etc.)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<{city?: string, country?: string, countryCode?: string}>}
 */
export async function getLocationDetails(latitude, longitude) {
  // Disable geocoding if it's consistently failing (saves API calls)
  if (geocodingDisabled) {
    return {}
  }
  
  if (!MAPBOX_ACCESS_TOKEN) {
    return {}
  }

  // Validate coordinates
  if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
      isNaN(latitude) || isNaN(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    console.warn('Invalid coordinates for geocoding:', { latitude, longitude })
    return {}
  }

  try {
    // Mapbox requires separate calls when using limit with multiple types
    // Make two calls: one for place, one for country
    const validLon = Math.max(-180, Math.min(180, longitude))
    const validLat = Math.max(-90, Math.min(90, latitude))
    
    const [placeResponse, countryResponse] = await Promise.all([
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${validLon},${validLat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place&limit=1`
      ),
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${validLon},${validLat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=country&limit=1`
      )
    ])

    let city = null
    let country = null
    let countryCode = null

    // Parse place response
    if (placeResponse.ok) {
      const placeData = await placeResponse.json()
      const placeFeatures = placeData.features || []
      if (placeFeatures.length > 0) {
        const properties = placeFeatures[0].properties || {}
        city = properties.name || placeFeatures[0].text
      }
      // Reset failure count on success
      geocodingFailureCount = 0
    } else {
      // Track failures and disable if consistently failing
      if (placeResponse.status === 422) {
        geocodingFailureCount++
        if (geocodingFailureCount >= MAX_FAILURES) {
          geocodingDisabled = true
          console.warn('Geocoding API disabled due to repeated failures. This saves API calls.')
        }
      }
      const errorText = await placeResponse.text().catch(() => 'Unknown error')
      if (import.meta.env.DEV) {
        console.warn(`Geocoding API error (place): ${placeResponse.status}`, errorText)
      }
    }

    // Parse country response
    if (countryResponse.ok) {
      const countryData = await countryResponse.json()
      const countryFeatures = countryData.features || []
      if (countryFeatures.length > 0) {
        const properties = countryFeatures[0].properties || {}
        country = properties.name || countryFeatures[0].text
        countryCode = properties.short_code?.toUpperCase()
      }
      // Reset failure count on success
      geocodingFailureCount = 0
    } else {
      // Track failures and disable if consistently failing
      if (countryResponse.status === 422) {
        geocodingFailureCount++
        if (geocodingFailureCount >= MAX_FAILURES) {
          geocodingDisabled = true
          console.warn('Geocoding API disabled due to repeated failures. This saves API calls.')
        }
      }
      const errorText = await countryResponse.text().catch(() => 'Unknown error')
      if (import.meta.env.DEV) {
        console.warn(`Geocoding API error (country): ${countryResponse.status}`, errorText)
      }
    }

    return {
      city: city || null,
      country: country || null,
      countryCode: countryCode || null,
    }
  } catch (error) {
    // Don't log errors as errors - just warnings since this is non-critical
    if (error.message && !error.message.includes('422')) {
      console.warn('Error getting location details:', error.message)
    }
    return {}
  }
}

/**
 * Cache for country codes (to avoid excessive API calls)
 */
const countryCodeCache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours (countries don't change, cache longer to save API calls)

// Track geocoding failures to disable if consistently failing
let geocodingFailureCount = 0
const MAX_FAILURES = 5
let geocodingDisabled = false

/**
 * Get country code with caching
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<string|null>}
 */
export async function getCountryCodeCached(latitude, longitude) {
  // Round coordinates to ~50km precision for better caching (saves API calls)
  const cacheKey = `${Math.round(latitude * 10) / 10}_${Math.round(longitude * 10) / 10}`
  const cached = countryCodeCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.countryCode
  }

  const countryCode = await getCountryCode(latitude, longitude)
  if (countryCode) {
    countryCodeCache.set(cacheKey, {
      countryCode,
      timestamp: Date.now(),
    })
  }

  return countryCode
}

