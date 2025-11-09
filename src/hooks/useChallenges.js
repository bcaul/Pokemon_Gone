import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Hook to fetch nearby challenges
 */
export function useChallenges(latitude, longitude, radiusMeters = 2000) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try RPC function first, but we still need to enrich with business data
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_challenges', {
        user_lat: latitude,
        user_lon: longitude,
        search_radius_meters: radiusMeters,
      })

      if (!rpcError && rpcData && rpcData.length > 0) {
        // RPC function doesn't include business data, so we need to fetch it
        // Get all challenge IDs that might have businesses
        const challengeIds = rpcData.map(c => c.id)
        
        // Fetch full challenge data with business information
        const { data: enrichedChallenges, error: enrichError } = await supabase
          .from('challenges')
          .select(`
            id,
            business_id,
            prize_description,
            businesses:business_id (business_name, business_type),
            creature_types:target_creature_type_id (name, rarity)
          `)
          .in('id', challengeIds)

        if (!enrichError && enrichedChallenges) {
          // Merge business data into RPC results
          const challengesWithBusiness = rpcData.map(challenge => {
            const enriched = enrichedChallenges.find(e => e.id === challenge.id)
            return {
              ...challenge,
              business_id: enriched?.business_id || null,
              prize_description: enriched?.prize_description || null,
              businesses: enriched?.businesses || null,
              creature_types: enriched?.creature_types || null,
            }
          })
          
          setChallenges(challengesWithBusiness)
          setLoading(false)
          return
        }
        // If enrichment fails, fall through to fallback query
      }

      // Fallback: Get all active challenges and filter client-side
      const { data: allChallenges, error: queryError } = await supabase
        .from('challenges')
        .select(`
          *,
          creature_types:target_creature_type_id (name, rarity),
          businesses (business_name, business_type)
        `)
        .eq('active', true)
        .is('expires_at', null)
        .or('expires_at.gt.' + new Date().toISOString())

      if (queryError) {
        console.error('Error fetching challenges:', queryError)
        setError(queryError.message)
        setLoading(false)
        return
      }

      if (!allChallenges || allChallenges.length === 0) {
        setChallenges([])
        setLoading(false)
        return
      }

      // Parse locations and filter by distance
      const parseLocation = (location) => {
        if (!location) return null
        if (typeof location === 'object' && location.coordinates) {
          return { lon: location.coordinates[0], lat: location.coordinates[1] }
        }
        if (typeof location === 'string' && location.startsWith('0101')) {
          // WKB hex format - would need parsing
          return null
        }
        const match = location.match(/POINT\(([^)]+)\)/)
        if (match) {
          const coords = match[1].trim().split(/\s+/)
          if (coords.length >= 2) {
            return { lon: parseFloat(coords[0]), lat: parseFloat(coords[1]) }
          }
        }
        return null
      }

      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3
        const φ1 = (lat1 * Math.PI) / 180
        const φ2 = (lat2 * Math.PI) / 180
        const Δφ = ((lat2 - lat1) * Math.PI) / 180
        const Δλ = ((lon2 - lon1) * Math.PI) / 180
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      }

      // Get user's accepted challenges
      const { data: { user } } = await supabase.auth.getUser()
      let userChallenges = []
      if (user) {
        const { data: uc } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id)
        userChallenges = uc || []
      }

      // Filter and enrich challenges
      const nearbyChallenges = allChallenges
        .map(challenge => {
          const coords = parseLocation(challenge.location)
          if (!coords) return null

          const distance = calculateDistance(latitude, longitude, coords.lat, coords.lon)
          if (distance > radiusMeters) return null

          const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id)
          
          // Ensure business data is properly set
          const isBusinessChallenge = challenge.business_id && challenge.businesses
          
          return {
            ...challenge,
            longitude: coords.lon,
            latitude: coords.lat,
            distance_meters: distance,
            accepted: !!userChallenge,
            progress_value: userChallenge?.progress_value || 0,
            completed: userChallenge?.completed || false,
            // Explicitly ensure business_id and businesses are set
            business_id: challenge.business_id || null,
            businesses: challenge.businesses || null,
            prize_description: challenge.prize_description || null,
            // Ensure creature_types is set
            creature_types: challenge.creature_types || null,
          }
        })
        .filter(c => c !== null)
        .sort((a, b) => {
          // Sort business challenges first, then by distance
          const aIsBusiness = a.business_id && a.businesses
          const bIsBusiness = b.business_id && b.businesses
          
          if (aIsBusiness && !bIsBusiness) return -1
          if (!aIsBusiness && bIsBusiness) return 1
          
          return a.distance_meters - b.distance_meters
        })

      setChallenges(nearbyChallenges)
    } catch (err) {
      console.error('Error in fetchChallenges:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, radiusMeters])

  useEffect(() => {
    if (!latitude || !longitude) {
      setChallenges([])
      setLoading(false)
      return
    }

    fetchChallenges()
    
    // Refresh challenges every 30 seconds
    const interval = setInterval(fetchChallenges, 30000)
    return () => clearInterval(interval)
  }, [fetchChallenges])

  return { challenges, loading, error, refetch: fetchChallenges }
}

