import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import mapboxgl from 'mapbox-gl'
import { MapPin, X } from 'lucide-react'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function CreateChallenge({ businessId, onChallengeCreated }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [location, setLocation] = useState({ lat: 51.5074, lon: -0.1278 }) // Default to London
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    challenge_type: 'collect',
    target_value: 3,
    target_creature_type_id: null,
    radius_meters: 500,
    prize_description: '',
    prize_expires_at: '',
    reward_points: 150,
    difficulty: 'easy',
    expires_at: '',
  })
  const [creatureTypes, setCreatureTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch creature types
    fetchCreatureTypes()

    // Get user's current location for map center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.warn('Error getting location:', error)
          // Keep default London location
        }
      )
    }
  }, [])

  // Initialize map when container is ready (only once)
  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return

    let retries = 0
    const maxRetries = 20
    let initTimer = null

    // Function to initialize the map
    const initializeMap = () => {
      if (!mapContainer.current || map.current) return

      // Check if container has dimensions
      const container = mapContainer.current
      const rect = container.getBoundingClientRect()
      
      if (rect.width === 0 || rect.height === 0) {
        // Container not visible yet, try again
        if (retries < maxRetries) {
          retries++
          initTimer = setTimeout(initializeMap, 300)
        } else {
          console.warn('Map container not visible after retries. Container dimensions:', rect)
          setError('Map container not visible. Please scroll to the map section.')
        }
        return
      }

      try {
        // Use current location state
        const currentLocation = location

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [currentLocation.lon, currentLocation.lat],
          zoom: 14,
          attributionControl: false,
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

        map.current.on('load', () => {
          setMapLoaded(true)
          
          // Multiple resize calls to ensure map renders correctly
          const resize1 = setTimeout(() => {
            if (map.current) map.current.resize()
          }, 100)
          
          const resize2 = setTimeout(() => {
            if (map.current) map.current.resize()
          }, 300)
          
          const resize3 = setTimeout(() => {
            if (map.current) map.current.resize()
          }, 600)

          // Add initial marker
          const el = document.createElement('div')
          el.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
          marker.current = new mapboxgl.Marker(el)
            .setLngLat([currentLocation.lon, currentLocation.lat])
            .addTo(map.current)
        })

        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat
          setLocation({ lat, lon: lng })
          
          // Update marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat])
          } else {
            const el = document.createElement('div')
            el.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer'
            marker.current = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .addTo(map.current)
          }
        })

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e)
          setError(`Map error: ${e.error?.message || 'Unknown error'}`)
        })
      } catch (error) {
        console.error('Error initializing map:', error)
        setError(`Failed to initialize map: ${error.message}`)
      }
    }

    // Use IntersectionObserver to detect when container becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !map.current && mapContainer.current) {
          // Container is visible, initialize map
          initTimer = setTimeout(initializeMap, 300)
          observer.disconnect()
        }
      })
    }, {
      threshold: 0.1
    })

    if (mapContainer.current) {
      observer.observe(mapContainer.current)
    }

    // Fallback: also try after a delay
    const fallbackTimer = setTimeout(() => {
      if (!map.current && mapContainer.current) {
        initializeMap()
      }
    }, 1000)

    return () => {
      if (initTimer) clearTimeout(initTimer)
      clearTimeout(fallbackTimer)
      observer.disconnect()
      if (map.current) {
        map.current.remove()
        map.current = null
        setMapLoaded(false)
      }
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }
    }
  }, []) // Only run once on mount

  // Update map center and marker when location changes (after initial load)
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    try {
      const currentCenter = map.current.getCenter()
      const latDiff = Math.abs(currentCenter.lat - location.lat)
      const lonDiff = Math.abs(currentCenter.lng - location.lon)
      
      // If difference is significant, update map
      if (latDiff > 0.001 || lonDiff > 0.001) {
        map.current.flyTo({
          center: [location.lon, location.lat],
          zoom: map.current.getZoom(), // Keep current zoom
          duration: 1000,
        })

        if (marker.current) {
          marker.current.setLngLat([location.lon, location.lat])
        }
      }
    } catch (error) {
      console.warn('Error updating map center:', error)
    }
  }, [location.lat, location.lon, mapLoaded])

  // Handle map resize when container becomes visible or resizes
  useEffect(() => {
    if (!map.current || !mapLoaded || !mapContainer.current) return

    // Function to resize map
    const resizeMap = () => {
      if (map.current) {
        try {
          map.current.resize()
        } catch (error) {
          console.warn('Error resizing map:', error)
        }
      }
    }

    // Use ResizeObserver to detect when container size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          resizeMap()
        }
      }
    })

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current)
    }

    // Resize after a delay to catch any layout changes
    const resizeTimer1 = setTimeout(resizeMap, 500)
    const resizeTimer2 = setTimeout(resizeMap, 1000)

    // Also resize when window resizes
    window.addEventListener('resize', resizeMap)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(resizeTimer1)
      clearTimeout(resizeTimer2)
      window.removeEventListener('resize', resizeMap)
    }
  }, [mapLoaded])

  const fetchCreatureTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('creature_types')
        .select('id, name, rarity')
        .order('name')

      if (error) throw error
      setCreatureTypes(data || [])
    } catch (error) {
      console.error('Error fetching creature types:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create challenge using RPC function
      const { data: challengeId, error } = await supabase.rpc('create_challenge_at_location', {
        p_lat: location.lat,
        p_lon: location.lon,
        p_challenge_name: formData.name,
        p_challenge_type: formData.challenge_type,
        p_creature_type_name: formData.target_creature_type_id 
          ? creatureTypes.find(ct => ct.id === formData.target_creature_type_id)?.name 
          : null,
        p_target_value: formData.target_value,
        p_radius_meters: formData.radius_meters,
      })

      if (error) throw error

      // Update challenge with business details and prize
      const updateData = {
        business_id: businessId,
        prize_description: formData.prize_description,
        reward_points: formData.reward_points,
        difficulty: formData.difficulty,
      }

      if (formData.prize_expires_at) {
        updateData.prize_expires_at = new Date(formData.prize_expires_at).toISOString()
      }

      if (formData.expires_at) {
        updateData.expires_at = new Date(formData.expires_at).toISOString()
      }

      if (formData.description) {
        updateData.description = formData.description
      }

      const { error: updateError } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId)

      if (updateError) throw updateError

      alert('Challenge created successfully!')
      if (onChallengeCreated) {
        onChallengeCreated()
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        challenge_type: 'collect',
        target_value: 3,
        target_creature_type_id: null,
        radius_meters: 500,
        prize_description: '',
        prize_expires_at: '',
        reward_points: 150,
        difficulty: 'easy',
        expires_at: '',
      })
    } catch (error) {
      console.error('Error creating challenge:', error)
      setError(error.message || 'Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Challenge</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Challenge Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="e.g., Catch 5 Creatures at Park"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            rows={3}
            placeholder="Describe your challenge..."
          />
        </div>

        {/* Challenge Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Type *
          </label>
          <select
            value={formData.challenge_type}
            onChange={(e) => setFormData({ ...formData, challenge_type: e.target.value, target_creature_type_id: null })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            <option value="collect">Collect Creatures</option>
            <option value="walk">Walk Distance</option>
          </select>
        </div>

        {/* Target Value */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {formData.challenge_type === 'collect' ? 'Number of Creatures to Catch' : 'Distance to Walk (meters)'} *
          </label>
          <input
            type="number"
            value={formData.target_value}
            onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="1"
            required
          />
        </div>

        {/* Creature Type (if collect challenge) */}
        {formData.challenge_type === 'collect' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Creature Type (leave empty for any creature)
            </label>
            <select
              value={formData.target_creature_type_id || ''}
              onChange={(e) => setFormData({ ...formData, target_creature_type_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">Any Creature</option>
              {creatureTypes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} ({ct.rarity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Location Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Location * (Click on map to set location)
          </label>
          <div 
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative" 
            style={{ height: '400px', minHeight: '400px', width: '100%' }}
          >
            <div 
              ref={mapContainer} 
              className="w-full h-full" 
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10 pointer-events-none">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading map...</p>
                  {!mapboxgl.accessToken && (
                    <p className="text-red-400 text-sm mt-2">
                      Mapbox token not configured
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Latitude: {location.lat.toFixed(6)}, Longitude: {location.lon.toFixed(6)}
          </p>
          {!mapboxgl.accessToken && mapLoaded && (
            <p className="text-red-400 text-sm mt-2">
              Warning: Mapbox token not configured. Please set VITE_MAPBOX_TOKEN in your .env file.
            </p>
          )}
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Radius (meters) *
          </label>
          <input
            type="number"
            value={formData.radius_meters}
            onChange={(e) => setFormData({ ...formData, radius_meters: parseFloat(e.target.value) || 500 })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="50"
            max="5000"
            required
          />
          <p className="text-gray-400 text-sm mt-1">
            Players must complete the challenge within this radius of the location
          </p>
        </div>

        {/* Prize Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prize Description * (What the player gets)
          </label>
          <textarea
            value={formData.prize_description}
            onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            rows={2}
            placeholder="e.g., Free side dish at our restaurant"
            required
          />
          <p className="text-gray-400 text-sm mt-1">
            This will be sent to players via email when they complete the challenge
          </p>
        </div>

        {/* Prize Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prize Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            value={formData.prize_expires_at}
            onChange={(e) => setFormData({ ...formData, prize_expires_at: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>

        {/* Challenge Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Challenge Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            value={formData.expires_at}
            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>

        {/* Reward Points */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reward Points *
          </label>
          <input
            type="number"
            value={formData.reward_points}
            onChange={(e) => setFormData({ ...formData, reward_points: parseInt(e.target.value) || 100 })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="1"
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Difficulty *
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Challenge...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  )
}

