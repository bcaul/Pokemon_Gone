import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

/**
 * Hook to fetch nearby challenges
 */
export function useChallenges(latitude, longitude, radiusMeters = 2000) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper function to parse WKB hex string to coordinates (browser-compatible)
  const parseWKBHex = useCallback((hex) => {
    try {
      if (!hex || typeof hex !== 'string' || hex.length < 50) {
        return null
      }
      
      // WKB Extended format with SRID
      const endian = parseInt(hex.substring(0, 2), 16)
      const isLittleEndian = endian === 1
      const xHex = hex.substring(18, 34)
      const yHex = hex.substring(34, 50)
      
      const parseDouble = (hexStr, littleEndian) => {
        const buffer = new ArrayBuffer(8)
        const view = new DataView(buffer)
        for (let i = 0; i < 8; i++) {
          const byteIndex = littleEndian ? i : 7 - i
          view.setUint8(byteIndex, parseInt(hexStr.substr(i * 2, 2), 16))
        }
        return view.getFloat64(0, littleEndian)
      }
      
      const lon = parseDouble(xHex, isLittleEndian)
      const lat = parseDouble(yHex, isLittleEndian)
      
      if (isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
        return null
      }
      
      return { lon, lat }
    } catch (error) {
      return null
    }
  }, [])

  // Parse location helper
  const parseLocation = useCallback((location) => {
    if (!location) return null
    
    // Check if it's a WKB hex string
    if (typeof location === 'string' && (location.startsWith('0101') || location.length > 40)) {
      const coords = parseWKBHex(location)
      if (coords) return coords
    }
    
    // Check if it's an object with coordinates
    if (typeof location === 'object' && location.coordinates) {
      return { lon: location.coordinates[0], lat: location.coordinates[1] }
    }
    
    // Check if it's WKT format
    if (typeof location === 'string') {
      const match = location.match(/POINT\(([^)]+)\)/)
      if (match) {
        const coords = match[1].trim().split(/\s+/)
        if (coords.length >= 2) {
          return { lon: parseFloat(coords[0]), lat: parseFloat(coords[1]) }
        }
      }
    }
    
    return null
  }, [parseWKBHex])

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
        // Parse coordinates from location (WKB hex format) for RPC results
        const processedChallenges = rpcData.map(challenge => {
          const coords = parseLocation(challenge.location)
          if (coords) {
            return {
              ...challenge,
              longitude: coords.lon,
              latitude: coords.lat
            }
          }
          return null
        }).filter(challenge => challenge !== null && challenge.latitude && challenge.longitude)
        
        // RPC function now includes business_id, but we still need to fetch business details
        // Get all challenge IDs that have businesses
        const businessChallengeIds = processedChallenges
          .filter(c => c.business_id)
          .map(c => c.id)
        
        // Fetch business information for business challenges
        let businessDataMap = new Map()
        if (businessChallengeIds.length > 0) {
          const { data: enrichedChallenges, error: enrichError } = await supabase
            .from('challenges')
            .select(`
              id,
              business_id,
              prize_description,
              prize_expires_at,
              businesses:business_id (
                id,
                business_name,
                business_type,
                address
              ),
              creature_types:target_creature_type_id (name, rarity)
            `)
            .in('id', businessChallengeIds)

          if (!enrichError && enrichedChallenges) {
            // Create a map for quick lookup
            enrichedChallenges.forEach(challenge => {
              businessDataMap.set(challenge.id, challenge)
            })
          }
        }
        
        // Also fetch creature types for all challenges
        const allChallengeIds = processedChallenges.map(c => c.id)
        const { data: allChallengesWithTypes } = await supabase
          .from('challenges')
          .select(`
            id,
            creature_types:target_creature_type_id (name, rarity)
          `)
          .in('id', allChallengeIds)
        
        const creatureTypesMap = new Map()
        if (allChallengesWithTypes) {
          allChallengesWithTypes.forEach(challenge => {
            if (challenge.creature_types) {
              creatureTypesMap.set(challenge.id, challenge.creature_types)
            }
          })
        }
        
        // Merge business data into RPC results
        const challengesWithBusiness = processedChallenges.map(challenge => {
          const businessData = businessDataMap.get(challenge.id)
          // Identify business challenges - MUST have business_id (not null)
          const isBusinessChallenge = !!(challenge.business_id || businessData?.business_id)
          
          return {
            ...challenge,
            business_id: challenge.business_id || businessData?.business_id || null,
            prize_description: businessData?.prize_description || null,
            prize_expires_at: businessData?.prize_expires_at || null,
            businesses: businessData?.businesses || null,
            creature_types: creatureTypesMap.get(challenge.id) || null,
            // Mark as business challenge for easy identification
            isBusinessChallenge: isBusinessChallenge,
          }
        })
        
        // Sort business challenges first (already sorted by RPC, but ensure it)
        const sortedChallenges = challengesWithBusiness.sort((a, b) => {
          const aIsBusiness = !!a.business_id
          const bIsBusiness = !!b.business_id
          if (aIsBusiness && !bIsBusiness) return -1
          if (!aIsBusiness && bIsBusiness) return 1
          return (a.distance_meters || 0) - (b.distance_meters || 0)
        })
        
        setChallenges(sortedChallenges)
        setLoading(false)
        return
      }

      // Fallback: Get all active challenges and filter client-side
      const { data: allChallenges, error: queryError } = await supabase
        .from('challenges')
        .select(`
          *,
          creature_types:target_creature_type_id (name, rarity),
          businesses:business_id (
            id,
            business_name,
            business_type,
            address
          )
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
          
          // Identify business challenges - MUST have business_id (not null)
          // This is the DEFINITIVE way to identify business challenges
          const isBusinessChallenge = !!challenge.business_id
          
          // Debug logging for business challenge identification
          if (isBusinessChallenge) {
            console.log('🏢 BUSINESS CHALLENGE IDENTIFIED:', {
              id: challenge.id,
              name: challenge.name,
              business_id: challenge.business_id,
              business_name: challenge.businesses?.business_name || 'Unknown',
              prize: challenge.prize_description || 'No prize description'
            })
          }
          
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
            prize_expires_at: challenge.prize_expires_at || null,
            // Ensure creature_types is set
            creature_types: challenge.creature_types || null,
            // Mark as business challenge
            isBusinessChallenge: isBusinessChallenge,
          }
        })
        .filter(c => c !== null)
        .sort((a, b) => {
          // Sort business challenges FIRST (identified by business_id)
          const aIsBusiness = !!a.business_id
          const bIsBusiness = !!b.business_id
          
          if (aIsBusiness && !bIsBusiness) return -1
          if (!aIsBusiness && bIsBusiness) return 1
          
          // Then sort by distance
          return (a.distance_meters || 0) - (b.distance_meters || 0)
        })
      
      setChallenges(nearbyChallenges)
    } catch (err) {
      console.error('Error in fetchChallenges:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, radiusMeters, parseLocation])

  useEffect(() => {
    if (!latitude || !longitude) {
      setChallenges([])
      setLoading(false)
      return
    }

    fetchChallenges()
    
    // Refresh challenges every 2 minutes (realtime subscriptions handle immediate updates)
    // Reduced from 30s to save on Supabase API calls
    const interval = setInterval(fetchChallenges, 120000)
    return () => clearInterval(interval)
  }, [latitude, longitude, radiusMeters, fetchChallenges])

  return { challenges, loading, error, refetch: fetchChallenges }
}
