import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { useLocation } from '../hooks/useLocation.js'
import { useLocationTracking } from '../hooks/useLocationTracking.js'
import { useCreatures } from '../hooks/useCreatures.js'
import { useChallenges } from '../hooks/useChallenges.js'
import { useGyms } from '../hooks/useGyms.js'
import { useGymTracking } from '../hooks/useGymTracking.js'
import { checkIfInParkCached } from '../lib/overpass.js'
import { generateSpawns } from '../lib/spawning.js'
import { generateChallengesNearParks, generateChallengesAtLocation } from '../lib/generateChallenges.js'
import { getCountryCodeCached } from '../lib/geocoding.js'
import { getCreatureSprite, getCreatureEmoji } from '../lib/creatureSprites.js'
import { Target, MapPin, Navigation2 } from 'lucide-react'
import CatchModal from './CatchModal.jsx'
import AIAssistant from './AIAssistant.jsx'
import ChallengePanel from './ChallengePanel.jsx'
import GymPanel from './GymPanel.jsx'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const { location, error: locationError } = useLocation(true, 2000) // Update every 2 seconds for smoother tracking
  const { creatures, loading: creaturesLoading } = useCreatures(
    location?.latitude,
    location?.longitude
  )
  const { challenges, loading: challengesLoading, refetch: refetchChallenges } = useChallenges(
    location?.latitude,
    location?.longitude
  )
  const { gyms } = useGyms(
    location?.latitude,
    location?.longitude,
    5000
  )
  
  // Track location for walking challenges
  useLocationTracking(location)
  
  // Track player at gyms for epic/legendary creature spawning
  useGymTracking(location, gyms)
  
  const [selectedCreature, setSelectedCreature] = useState(null)
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [selectedGym, setSelectedGym] = useState(null)
  const [inPark, setInPark] = useState(false)
  const [parkName, setParkName] = useState(null)
  const [caughtCreatureIds, setCaughtCreatureIds] = useState(new Set())
  const markersRef = useRef([])
  const challengeMarkersRef = useRef([])
  const gymMarkersRef = useRef([])
  const lastSpawnGenRef = useRef(0)
  const [spawnGenerating, setSpawnGenerating] = useState(false)
  const [showChallengePanel, setShowChallengePanel] = useState(false)
  const [showGymPanel, setShowGymPanel] = useState(false)
  const [generatingChallenges, setGeneratingChallenges] = useState(false)
  const lastChallengeGenRef = useRef(0)
  const mapLoadTimeoutRef = useRef(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    const mapboxStyle = import.meta.env.VITE_MAPBOX_STYLE || 'mapbox://styles/taramulhall/cmhqieqsu004201s56pwv93xw'
    
    // Clear any previous error
    setMapError(null)
    
    // Set a timeout to detect if map fails to load
    // This will only fire if the 'load' event hasn't fired (which clears the timeout)
    mapLoadTimeoutRef.current = setTimeout(() => {
      if (map.current) {
        setMapError('Map failed to load within 10 seconds. Please check your Mapbox token and network connection.')
        console.error('Map load timeout - map did not load within 10 seconds')
        setMapLoaded(false)
      }
    }, 10000) // 10 second timeout
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapboxStyle,
        center: [0, 0],
        zoom: 18, // Start more zoomed in
        pitch: 50, // Tilt map to see 3D buildings (0-60 degrees)
        bearing: 0, // Rotation (0 = north up)
        minZoom: 10, // Allow zooming out more
        maxZoom: 22, // Allow zooming in closer
        dragPan: false, // Disable panning/dragging
        dragRotate: true, // Allow rotation by right-click + drag (desktop)
        scrollZoom: true, // Enable scroll wheel zoom
        boxZoom: false, // Disable box zoom
        keyboard: false, // Disable keyboard navigation
        doubleClickZoom: true, // Enable double-click zoom
        touchZoomRotate: true, // Enable touch zoom and rotate
        touchPitch: true, // Enable touch pitch adjustment
      })

      map.current.on('load', () => {
        if (mapLoadTimeoutRef.current) {
          clearTimeout(mapLoadTimeoutRef.current)
          mapLoadTimeoutRef.current = null
        }
        setMapLoaded(true)
        setMapError(null)
        
        // Add GeolocateControl for better location handling
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
          trackUserLocation: true,
          showUserHeading: true,
          showAccuracyCircle: false,
        })
        
        map.current.addControl(geolocate, 'top-right')
        
        // Add navigation control for rotation and zoom buttons
        const nav = new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        })
        map.current.addControl(nav, 'top-right')
        
        // Listen for geolocate events
        geolocate.on('geolocate', (e) => {
          if (e.coords) {
            console.log('📍 GeolocateControl location:', {
              lat: e.coords.latitude,
              lng: e.coords.longitude,
              accuracy: e.coords.accuracy,
            })
          }
        })
        
        geolocate.on('error', (e) => {
          // Only log if it's not a permission denied error (common and expected)
          if (e.code !== 1) {
            console.warn('GeolocateControl error:', e.code, e.message)
          }
        })
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        if (mapLoadTimeoutRef.current) {
          clearTimeout(mapLoadTimeoutRef.current)
          mapLoadTimeoutRef.current = null
        }
        
        // Determine error message based on error type
        let errorMessage = 'Failed to load map. '
        if (e.error && e.error.message) {
          errorMessage += e.error.message
        } else if (!mapboxgl.accessToken) {
          errorMessage += 'Mapbox token is missing.'
        } else {
          errorMessage += 'Please check your Mapbox token and network connection.'
        }
        
        setMapError(errorMessage)
        setMapLoaded(false)
      })
    } catch (error) {
      console.error('Error initializing map:', error)
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current)
        mapLoadTimeoutRef.current = null
      }
      setMapError(`Failed to initialize map: ${error.message || 'Unknown error'}`)
      setMapLoaded(false)
    }

    return () => {
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current)
        mapLoadTimeoutRef.current = null
      }
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  const createUserLocationMarker = useCallback((heading) => {
    const el = document.createElement('div')
    el.className = 'user-location-marker'
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.position = 'relative'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
    
    const arrowSVG = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="transform-origin: 16px 16px;">
        <circle cx="16" cy="16" r="15" fill="#4ECDC4" stroke="#FFFFFF" stroke-width="2.5" opacity="0.95"/>
        <rect x="14" y="8" width="4" height="12" fill="#FFFFFF" rx="1"/>
        <path d="M 16 4 L 10 12 L 16 10 L 22 12 Z" 
              fill="#FFFFFF" 
              stroke="#1A1A2E" 
              stroke-width="0.3"
              stroke-linejoin="round"/>
      </svg>
    `
    el.innerHTML = arrowSVG
    const svgElement = el.querySelector('svg')
    
    const headingDegrees = heading !== null && heading !== undefined && !isNaN(heading) ? heading : 0
    svgElement.style.transform = `rotate(${headingDegrees}deg)`
    svgElement.style.transition = 'transform 0.5s ease-out'
    
    return el
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded || !location) return

    // Validate location data
    if (!location.latitude || !location.longitude || 
        isNaN(location.latitude) || isNaN(location.longitude) ||
        Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
      console.warn('Invalid location data:', location)
      return
    }

    const lng = location.longitude
    const lat = location.latitude

    // Create or update user marker FIRST - always show where user actually is
    if (!map.current._userMarker) {
      const markerElement = createUserLocationMarker(location.heading || 0)
      map.current._userMarker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center',
      })
        .setLngLat([lng, lat])
        .addTo(map.current)
    } else {
      // Update marker position immediately
      map.current._userMarker.setLngLat([lng, lat])
      
      // Update heading if available with smooth rotation
      const headingDegrees = location.heading !== null && location.heading !== undefined && !isNaN(location.heading)
        ? location.heading
        : 0
      const markerElement = map.current._userMarker.getElement()
      const svgElement = markerElement?.querySelector('svg')
      if (svgElement) {
        svgElement.style.transition = 'transform 0.3s ease-out'
        svgElement.style.transform = `rotate(${headingDegrees}deg)`
      }
    }

    // Calculate actual distance in meters using Haversine formula
    const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000 // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180
      const φ2 = (lat2 * Math.PI) / 180
      const Δφ = ((lat2 - lat1) * Math.PI) / 180
      const Δλ = ((lon2 - lon1) * Math.PI) / 180
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    // Check if we need to center the map
    const currentCenter = map.current.getCenter()
    const centerLat = currentCenter.lat
    const centerLng = currentCenter.lng
    
    // Calculate distance in meters
    const distanceMeters = calculateDistanceMeters(centerLat, centerLng, lat, lng)
    
    // Determine if this is the first location or if we've moved significantly
    const isFirstLocation = !map.current._hasCentered
    const hasMovedSignificantly = distanceMeters > 100 // 100 meters threshold
    
    // Always center on first location, or if we've moved more than 100m
    if (isFirstLocation || hasMovedSignificantly) {
      if (isFirstLocation) {
        // First location - jump immediately with 3D tilt and rotation
        // Use jumpTo for instant centering on first load (no animation delay)
        map.current.jumpTo({
          center: [lng, lat],
          zoom: 18, // Start more zoomed in
          pitch: 50, // Tilt to see 3D buildings
          bearing: 0, // North up
        })
        
        // Store user location for bounds checking
        map.current._lastUserLocation = { lat, lng }
        
        console.log('📍 Centering map on user location:', { 
          lat, 
          lng, 
          accuracy: location.accuracy,
          distanceFromOrigin: calculateDistanceMeters(0, 0, lat, lng)
        })
        
        // Then after a brief moment, do a smooth flyTo to confirm with pitch
        setTimeout(() => {
          if (map.current && map.current._hasCentered) {
            map.current.flyTo({
              center: [lng, lat],
              zoom: 18, // More zoomed in
              pitch: 50,
              bearing: 0,
              duration: 1000,
            })
          }
        }, 100)
      } else {
        // Subsequent updates - smooth following (keep current pitch and zoom)
        map.current.easeTo({
          center: [lng, lat],
          zoom: map.current.getZoom(), // Keep current zoom
          pitch: map.current.getPitch(), // Keep current pitch
          bearing: map.current.getBearing(), // Keep current bearing
          duration: 1000,
          easing: (t) => t * (2 - t), // Ease-out
        })
      }
      map.current._hasCentered = true
      map.current._lastCenterLocation = { lat, lng, timestamp: Date.now() }
      map.current._lastUserLocation = { lat, lng } // Update stored user location
    }

    // Check park status (throttled - reduced frequency to save API calls)
    const now = Date.now()
    if (!map.current._lastParkCheck || now - map.current._lastParkCheck > 30000) {
      checkParkStatus(lat, lng)
      map.current._lastParkCheck = now
    }
    
    // Generate spawns (throttled - reduced frequency to save database writes)
    const timeSinceLastSpawn = now - lastSpawnGenRef.current
    if (timeSinceLastSpawn > 120 * 1000 || lastSpawnGenRef.current === 0) {
      generateSpawnsForLocation(lat, lng)
      lastSpawnGenRef.current = now
    }
  }, [location, mapLoaded, createUserLocationMarker])

  // Also generate spawns periodically (every 5 minutes to reduce database writes)
  useEffect(() => {
    if (!location) return

    const interval = setInterval(() => {
      generateSpawnsForLocation(location.latitude, location.longitude)
      lastSpawnGenRef.current = Date.now()
    }, 5 * 60 * 1000) // 5 minutes (increased from 2 to save costs)

    return () => clearInterval(interval)
  }, [location])

  const checkParkStatus = async (lat, lon) => {
    const result = await checkIfInParkCached(lat, lon)
    setInPark(result.inPark)
    setParkName(result.parkName || null)
  }

  // Generate spawns for a location (async function)
  const generateSpawnsForLocation = async (lat, lon) => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      console.warn('Cannot generate spawns: invalid location', { lat, lon })
      return
    }

    setSpawnGenerating(true)
    try {
      const parkStatus = await checkIfInParkCached(lat, lon)
      const countryCode = await getCountryCodeCached(lat, lon)
      const spawnCount = await generateSpawns(lat, lon, 500, parkStatus.inPark, countryCode)
      
      // Debug info (optional - can be removed if not needed)
      if (import.meta.env.DEV) {
        console.log('Spawns generated:', {
          count: spawnCount,
          inPark: parkStatus.inPark,
          countryCode,
          location: { lat, lon }
        })
      }
    } catch (error) {
      console.error('Error generating spawns:', error)
    } finally {
      setSpawnGenerating(false)
    }
  }

  // Parse WKB hex string to coordinates (same as in spawning.js)
  const parseWKBHex = useCallback((hex) => {
    try {
      if (!hex || typeof hex !== 'string' || hex.length < 42) {
        return null
      }
      
      // WKB Extended format with SRID
      // Skip: 2 (endian) + 8 (type) + 8 (SRID) = 18 hex chars
      const xHex = hex.substring(18, 34) // Longitude (8 bytes)
      const yHex = hex.substring(34, 50) // Latitude (8 bytes)
      
      // Convert hex to Float64 (little endian)
      const parseDouble = (hexStr) => {
        const buffer = new ArrayBuffer(8)
        const view = new DataView(buffer)
        for (let i = 0; i < 8; i++) {
          view.setUint8(i, parseInt(hexStr.substr(i * 2, 2), 16))
        }
        return view.getFloat64(0, true)
      }
      
      const lon = parseDouble(xHex)
      const lat = parseDouble(yHex)
      
      if (isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
        return null
      }
      
      return [lon, lat]
    } catch (error) {
      console.error('Error parsing WKB hex:', error)
      return null
    }
  }, [])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }, [])

  // Parse PostGIS geography point
  const parseLocation = useCallback((location) => {
    // Handle WKB hex format (starts with "0101")
    if (typeof location === 'string' && location.startsWith('0101')) {
      const coords = parseWKBHex(location)
      if (coords) return coords
    }
    
    // Handle WKT string format: "POINT(lon lat)" or "SRID=4326;POINT(lon lat)"
    if (typeof location === 'string') {
      // Try to match POINT format
      const match = location.match(/POINT\(([^)]+)\)/)
      if (match) {
        const coords = match[1].trim().split(/\s+/)
        if (coords.length >= 2) {
          const lon = parseFloat(coords[0])
          const lat = parseFloat(coords[1])
          if (!isNaN(lon) && !isNaN(lat)) {
            return [lon, lat]
          }
        }
      }
      // Try to parse as WKT without POINT wrapper
      const wktMatch = location.match(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/)
      if (wktMatch) {
        const lon = parseFloat(wktMatch[1])
        const lat = parseFloat(wktMatch[2])
        if (!isNaN(lon) && !isNaN(lat)) {
          return [lon, lat]
        }
      }
    }
    
    // Handle object format from Supabase
    if (location && typeof location === 'object') {
      // Check for coordinates array [lon, lat]
      if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
        return [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])]
      }
      // Check for x/y properties (lon/lat)
      if (location.x !== undefined && location.y !== undefined) {
        return [parseFloat(location.x), parseFloat(location.y)]
      }
      // Check for lon/lat properties
      if (location.lon !== undefined && location.lat !== undefined) {
        return [parseFloat(location.lon), parseFloat(location.lat)]
      }
      // Check for lng/lat properties (common in some APIs)
      if (location.lng !== undefined && location.lat !== undefined) {
        return [parseFloat(location.lng), parseFloat(location.lat)]
      }
    }
    
    return [null, null]
  }, [parseWKBHex])

  // Update creature markers
  useEffect(() => {
    if (!map.current || !mapLoaded) {
      return
    }

    if (!creatures || creatures.length === 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      return
    }

    // Filter out caught creatures, gym spawns, and spawns too close to player
    const MIN_SPAWN_DISTANCE = 25 // Minimum distance in meters (prevent spawns on player icon)
    const availableCreatures = creatures.filter(spawn => {
      // Skip gym spawns - they're displayed on the gym marker itself
      if (spawn.gym_id) {
        return false
      }
      
      // Skip if already caught
      if (caughtCreatureIds.has(spawn.id)) {
        return false
      }
      
      // Skip if missing required data
      if (!spawn.creature_types || !spawn.location) {
        return false
      }
      
      // Skip if too close to player (prevent spawns on/too close to player icon)
      if (location) {
        // Get spawn coordinates
        let spawnLat, spawnLon
        if (spawn.latitude !== undefined && spawn.longitude !== undefined) {
          spawnLat = parseFloat(spawn.latitude)
          spawnLon = parseFloat(spawn.longitude)
        } else if (spawn.location) {
          // Parse from location if coordinates not directly available
          const coords = parseLocation(spawn.location)
          if (coords && Array.isArray(coords) && coords.length >= 2) {
            spawnLon = coords[0]
            spawnLat = coords[1]
          }
        }
        
        if (spawnLat !== undefined && spawnLon !== undefined && !isNaN(spawnLat) && !isNaN(spawnLon)) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            spawnLat,
            spawnLon
          )
          if (distance < MIN_SPAWN_DISTANCE) {
            return false
          }
        }
      }
      
      return true
    })

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each creature
    availableCreatures.forEach((spawn, index) => {
      if (!spawn.creature_types) {
        return
      }

      if (!spawn.location) {
        return
      }

      // Try to get coordinates from spawn object first (if query returned them directly)
      let lon, lat
      if (spawn.longitude !== undefined && spawn.latitude !== undefined) {
        lon = parseFloat(spawn.longitude)
        lat = parseFloat(spawn.latitude)
      } else {
        const coords = parseLocation(spawn.location)
        if (coords && Array.isArray(coords) && coords.length >= 2) {
          lon = coords[0]
          lat = coords[1]
        } else if (coords && coords.lon !== undefined && coords.lat !== undefined) {
          lon = coords.lon
          lat = coords.lat
        }
      }
      
      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        return
      }

      // Verify coordinates are reasonable (not 0,0 or extreme values)
      if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return
      }

      try {
        const markerElement = createMarkerElement(spawn.creature_types)
        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center',
        })
          .setLngLat([lon, lat])
          .addTo(map.current)

        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          if (!caughtCreatureIds.has(spawn.id)) {
            setSelectedCreature({
              ...spawn,
              latitude: lat,
              longitude: lon,
              location: spawn.location,
            })
          }
        })

        markersRef.current.push(marker)
      } catch (error) {
        console.error(`Error creating marker for spawn ${index}:`, error)
      }
    })
  }, [creatures, mapLoaded, caughtCreatureIds, location, parseLocation])

  const createMarkerElement = (creatureType) => {
    const el = document.createElement('div')
    el.className = 'creature-marker'
    
    el.style.width = '40px'
    el.style.height = '40px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = getRarityColor(creatureType.rarity)
    el.style.border = '3px solid #FFFFFF'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    
    const spriteUrl = getCreatureSprite(creatureType)
    
    if (spriteUrl && !spriteUrl.includes('{SPRITE_ID}')) {
      const img = document.createElement('img')
      img.alt = creatureType.name
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'contain'
      img.style.borderRadius = '50%'
      img.style.imageRendering = 'crisp-edges'
      if (!('imageRendering' in img.style)) {
        img.style.imageRendering = '-webkit-optimize-contrast'
      }
      img.loading = 'eager' // Load immediately
      
      // Set error handler FIRST (before src)
      let errorHandled = false
      img.onerror = () => {
        if (errorHandled) return // Prevent multiple error handlers
        errorHandled = true
        const emoji = getCreatureEmoji(creatureType.name)
        el.innerHTML = `<span style="font-size: 22px; line-height: 1; display: block;">${emoji}</span>`
      }
      
      // Add to DOM and set src
      el.appendChild(img)
      img.src = spriteUrl
    } else {
      // Fallback to emoji if no valid sprite URL
      const emoji = getCreatureEmoji(creatureType.name)
      el.innerHTML = `<span style="font-size: 22px; line-height: 1; display: block;">${emoji}</span>`
    }
    
    // Add subtle hover effect (visual only, no action)
    // CRITICAL: Keep border size constant (3px) to prevent position shifts
    // Changing border size changes element dimensions, causing Mapbox to reposition
    el.addEventListener('mouseenter', () => {
      // Only change shadow - keep border at 3px (same size)
      el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.8), 0 0 0 4px rgba(255,255,255,0.6)'
      // Keep border at 3px - don't change size!
      // Use outline for additional visual feedback without affecting size
      el.style.outline = '2px solid rgba(255,255,255,0.5)'
      el.style.outlineOffset = '-2px'
    })
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      el.style.outline = 'none'
      el.style.outlineOffset = '0'
    })
    
    // Add title for accessibility
    el.title = `Click to catch ${creatureType.name} (${creatureType.rarity})`
    
    return el
  }

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: '#aabda0',
      uncommon: '#beccc0',
      rare: '#7e9278',
      epic: '#6e7864',
      legendary: '#8b7355',
    }
    return colors[rarity] || colors.common
  }

  // Generate challenges near parks
  const generateChallengesForLocation = useCallback(async (lat, lon) => {
    const now = Date.now()
    // Throttle challenge generation (once per 5 minutes)
    if (now - lastChallengeGenRef.current < 5 * 60 * 1000) {
      return
    }

    try {
      setGeneratingChallenges(true)
      lastChallengeGenRef.current = now

      const challengesCreated = await generateChallengesNearParks(lat, lon, 5000)
      if (challengesCreated === 0) {
        await generateChallengesAtLocation(lat, lon, 8)
      }

      // Note: Challenges will refresh automatically via useChallenges hook
    } catch (error) {
      console.error('Error generating challenges:', error)
    } finally {
      setGeneratingChallenges(false)
    }
  }, [])

  useEffect(() => {
    if (!location || !mapLoaded || challengesLoading || generatingChallenges) return

    if (challenges && challenges.length === 0) {
      if (lastChallengeGenRef.current === 0) {
        // Delay auto-generation slightly to avoid blocking
        const timer = setTimeout(() => {
          generateChallengesForLocation(location.latitude, location.longitude)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [location, challenges, mapLoaded, challengesLoading, generatingChallenges, generateChallengesForLocation])

  // Create challenge marker element
  const createChallengeMarker = (challenge) => {
    const el = document.createElement('div')
    el.className = 'challenge-marker'
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = challenge.completed 
      ? 'rgba(34, 197, 94, 0.8)' 
      : challenge.accepted 
      ? 'rgba(59, 130, 246, 0.8)' 
      : 'rgba(234, 179, 8, 0.8)'
    el.style.border = '2px solid white'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    
    const icon = document.createElement('div')
    icon.style.fontSize = '18px'
    icon.innerHTML = challenge.completed ? '🏆' : '🎯'
    el.appendChild(icon)
    
    if (!challenge.accepted && !challenge.completed) {
      el.style.animation = 'pulse-challenge 2s infinite'
    }
    
    el.title = `${challenge.name} - ${challenge.difficulty}`
    return el
  }

  // Update challenge markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing challenge markers
    challengeMarkersRef.current.forEach(marker => marker.remove())
    challengeMarkersRef.current = []

    if (!challenges || challenges.length === 0) {
      return
    }

    // Filter out completed challenges - they should only appear in Profile
    const activeChallenges = challenges.filter(challenge => !challenge.completed)

    activeChallenges.forEach((challenge) => {
      if (!challenge.latitude || !challenge.longitude) {
        return
      }

      try {
        const challengeMarker = createChallengeMarker(challenge)
        const marker = new mapboxgl.Marker({
          element: challengeMarker,
          anchor: 'center',
        })
          .setLngLat([challenge.longitude, challenge.latitude])
          .addTo(map.current)

        challengeMarker.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelectedChallenge(challenge)
          setShowChallengePanel(true)
        })

        challengeMarkersRef.current.push(marker)
      } catch (error) {
        console.error('Error creating challenge marker:', error)
      }
    })

    return () => {
      challengeMarkersRef.current.forEach(marker => marker.remove())
      challengeMarkersRef.current = []
    }
  }, [challenges, mapLoaded])

  // Create RSVP badge marker (separate marker to avoid positioning issues)
  const createGymBadgeMarker = (rsvpCount) => {
    const badgeEl = document.createElement('div')
    badgeEl.className = 'gym-rsvp-badge-marker'
    badgeEl.textContent = rsvpCount > 99 ? '99+' : rsvpCount.toString()
    
    badgeEl.style.minWidth = '20px'
    badgeEl.style.height = '20px'
    badgeEl.style.borderRadius = '10px'
    badgeEl.style.backgroundColor = '#5B9BD5'
    badgeEl.style.border = '2px solid #FFFFFF'
    badgeEl.style.padding = '0 5px'
    badgeEl.style.fontSize = '11px'
    badgeEl.style.fontWeight = 'bold'
    badgeEl.style.color = '#FFFFFF'
    badgeEl.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.5)'
    badgeEl.style.display = 'flex'
    badgeEl.style.alignItems = 'center'
    badgeEl.style.justifyContent = 'center'
    badgeEl.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    badgeEl.style.lineHeight = '1'
    badgeEl.style.pointerEvents = 'none'
    badgeEl.style.whiteSpace = 'nowrap'
    badgeEl.style.zIndex = '1001'
    
    return badgeEl
  }
  
  // Calculate badge offset coordinates (15m northeast of gym)
  const calculateBadgeOffset = (latitude, longitude, offsetMeters = 15) => {
    const latOffset = offsetMeters / 111000
    const lonOffset = offsetMeters / (111000 * Math.cos(latitude * Math.PI / 180))
    return [longitude + lonOffset, latitude + latOffset]
  }

  // Create gym marker element
  const createGymMarker = async (gym) => {
    const el = document.createElement('div')
    el.className = 'gym-marker'
    
    el.style.width = '44px'
    el.style.height = '44px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = '#4A5568'
    el.style.border = '3px solid #5B9BD5'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
    
    // Get creatures at this gym
    const { getGymSpawns } = await import('../lib/gymSpawning.js')
    const gymSpawns = await getGymSpawns(gym.id)
    
    // Pick a consistent but varied creature based on gym ID to show variety across gyms
    // Sort spawns by a hash of gym ID + creature ID to ensure different ordering per gym
    let selectedCreature = null
    if (gymSpawns && gymSpawns.length > 0) {
      // Create a simple hash from gym ID for consistent selection
      const gymIdHash = gym.id.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
      }, 0)
      
      // Sort spawns by creature name to ensure consistent ordering, then offset by gym hash
      const sortedSpawns = [...gymSpawns].sort((a, b) => {
        const nameA = a.creature_types?.name || ''
        const nameB = b.creature_types?.name || ''
        return nameA.localeCompare(nameB)
      })
      
      // Use gym hash to pick different creature for each gym
      const index = Math.abs(gymIdHash) % sortedSpawns.length
      selectedCreature = sortedSpawns[index].creature_types
    }
    
    // Set background color
    const bgColor = selectedCreature ? getRarityColor(selectedCreature.rarity) : '#4A5568'
    el.style.backgroundColor = bgColor
    
    const rsvpCount = gym.rsvp_count || 0
    
    if (rsvpCount > 0) {
      el.setAttribute('data-rsvp-count', rsvpCount.toString())
    }
    
    if (rsvpCount >= 5) {
      el.style.borderColor = '#4A90E2'
      el.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.5), 0 0 0 2px rgba(74, 144, 226, 0.2)'
    }
    
    // Add creature sprite or emoji
    if (selectedCreature) {
      const spriteUrl = getCreatureSprite(selectedCreature)
      if (spriteUrl && !spriteUrl.includes('{SPRITE_ID}')) {
        const img = document.createElement('img')
        img.alt = selectedCreature.name
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'contain'
        img.style.borderRadius = '50%'
        img.style.imageRendering = 'crisp-edges'
        img.loading = 'eager'
        
        let errorHandled = false
        img.onerror = () => {
          if (errorHandled) return
          errorHandled = true
          const emoji = getCreatureEmoji(selectedCreature.name)
          el.innerHTML = `<span style="font-size: 20px; line-height: 1; display: block;">${emoji}</span>`
        }
        
        el.appendChild(img)
        img.src = spriteUrl
      } else {
        const emoji = getCreatureEmoji(selectedCreature.name)
        el.innerHTML = `<span style="font-size: 20px; line-height: 1; display: block;">${emoji}</span>`
      }
    } else {
      // No creature yet, show simple gym icon
      el.innerHTML = '<span style="font-size: 20px; line-height: 1; display: block;">🏋️</span>'
    }
    
    // Add hover effect
    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = '0 6px 24px rgba(0,0,0,0.8), 0 0 0 4px rgba(91, 155, 213, 0.6)'
      el.style.outline = '2px solid rgba(91, 155, 213, 0.5)'
      el.style.outlineOffset = '-2px'
    })
    el.addEventListener('mouseleave', () => {
      const shadow = rsvpCount >= 5 
        ? '0 2px 8px rgba(74, 144, 226, 0.5), 0 0 0 2px rgba(74, 144, 226, 0.2)'
        : '0 2px 8px rgba(0,0,0,0.3)'
      el.style.boxShadow = shadow
      el.style.outline = 'none'
      el.style.outlineOffset = '0'
    })
    
    // Show creature name in title
    const creatureInfo = selectedCreature 
      ? ` - ${selectedCreature.name}` 
      : ''
    el.title = `${gym.name} - ${rsvpCount} RSVPs${creatureInfo}`
    
    return el
  }

  const isUpdatingMarkersRef = useRef(false)
  const gymMarkersMapRef = useRef({})
  const gymBadgeMarkersMapRef = useRef({})

  // Update gym markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    if (isUpdatingMarkersRef.current) return

    isUpdatingMarkersRef.current = true

    // Create a stable set of gyms to process
    if (!gyms || gyms.length === 0) {
      // Clear all markers if no gyms (including badge markers)
      Object.values(gymMarkersMapRef.current).forEach((marker) => {
        try {
          marker.remove()
        } catch (e) {
          // Ignore errors
        }
      })
      Object.values(gymBadgeMarkersMapRef.current).forEach((badgeMarker) => {
        try {
          badgeMarker.remove()
        } catch (e) {
          // Ignore errors
        }
      })
      gymMarkersMapRef.current = {}
      gymBadgeMarkersMapRef.current = {}
      gymMarkersRef.current = []
      isUpdatingMarkersRef.current = false
      return
    }

    // Deduplicate by ID and location
    const gymIdsProcessed = {}
    const locationKeyMap = {}
    const uniqueGyms = []
    
    for (const gym of gyms) {
      if (!gym?.id) continue
      
      const lat = parseFloat(gym.latitude)
      const lon = parseFloat(gym.longitude)
      if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
        continue
      }
      
      const locationKey = `${lat.toFixed(6)},${lon.toFixed(6)}`
      if (gymIdsProcessed[gym.id] || locationKeyMap[locationKey]) {
        continue
      }
      
      gymIdsProcessed[gym.id] = true
      locationKeyMap[locationKey] = true
      uniqueGyms.push({ ...gym, latitude: lat, longitude: lon })
    }


    // Process markers: Update existing, add new, remove old
    const processMarkers = async () => {
      try {
        const currentGymIds = new Set(uniqueGyms.map(g => g.id))
        const markersToRemove = []

        // Remove markers for gyms that no longer exist
        Object.keys(gymMarkersMapRef.current).forEach((gymId) => {
          if (!currentGymIds.has(gymId)) {
            const marker = gymMarkersMapRef.current[gymId]
            try {
              marker.remove()
              markersToRemove.push(gymId)
            } catch (e) {}
            
            const badgeMarker = gymBadgeMarkersMapRef.current[gymId]
            if (badgeMarker) {
              try {
                badgeMarker.remove()
              } catch (e) {}
              delete gymBadgeMarkersMapRef.current[gymId]
            }
          }
        })

        markersToRemove.forEach(id => {
          delete gymMarkersMapRef.current[id]
          const index = gymMarkersRef.current.findIndex(m => m._gymId === id)
          if (index >= 0) {
            gymMarkersRef.current.splice(index, 1)
          }
        })

        // Create/update markers for each unique gym
        for (const gym of uniqueGyms) {
          const rsvpCount = gym.rsvp_count || 0
          
          if (gymMarkersMapRef.current[gym.id]) {
            const existingMarker = gymMarkersMapRef.current[gym.id]
            const markerElement = existingMarker.getElement()
            
            if (rsvpCount >= 5) {
              markerElement.style.borderColor = '#4A90E2'
              markerElement.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.5), 0 0 0 2px rgba(74, 144, 226, 0.2)'
            } else {
              markerElement.style.borderColor = '#5B9BD5'
              markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
            }
            
            markerElement.title = `${gym.name} - ${rsvpCount} RSVPs`
            
            // Update badge marker
            if (rsvpCount > 0) {
              const existingBadgeMarker = gymBadgeMarkersMapRef.current[gym.id]
              
              if (existingBadgeMarker) {
                const badgeElement = existingBadgeMarker.getElement()
                badgeElement.textContent = rsvpCount > 99 ? '99+' : rsvpCount.toString()
              } else {
                const badgeEl = createGymBadgeMarker(rsvpCount)
                const [badgeLon, badgeLat] = calculateBadgeOffset(gym.latitude, gym.longitude)
                
                const badgeMarker = new mapboxgl.Marker({
                  element: badgeEl,
                  anchor: 'center',
                  draggable: false
                })
                  .setLngLat([badgeLon, badgeLat])
                  .addTo(map.current)
                
                gymBadgeMarkersMapRef.current[gym.id] = badgeMarker
              }
            } else {
              const existingBadgeMarker = gymBadgeMarkersMapRef.current[gym.id]
              if (existingBadgeMarker) {
                try {
                  existingBadgeMarker.remove()
                } catch (e) {}
                delete gymBadgeMarkersMapRef.current[gym.id]
              }
            }
            
            continue
          }

          try {
            const gymMarkerEl = await createGymMarker(gym)
            gymMarkerEl.dataset.gymId = gym.id
            
            const marker = new mapboxgl.Marker({
              element: gymMarkerEl,
              anchor: 'center',
              draggable: false
            })
              .setLngLat([gym.longitude, gym.latitude])
              .addTo(map.current)
            
            marker._gymId = gym.id

            gymMarkerEl.addEventListener('click', (e) => {
              e.stopPropagation()
              e.preventDefault()
              setSelectedGym(gym)
              setShowGymPanel(true)
            })

            gymMarkersMapRef.current[gym.id] = marker
            gymMarkersRef.current.push(marker)
            
            // Create badge marker if RSVP count > 0
            const rsvpCount = gym.rsvp_count || 0
            if (rsvpCount > 0) {
              const badgeEl = createGymBadgeMarker(rsvpCount)
              const [badgeLon, badgeLat] = calculateBadgeOffset(gym.latitude, gym.longitude)
              
              const badgeMarker = new mapboxgl.Marker({
                element: badgeEl,
                anchor: 'center',
                draggable: false
              })
                .setLngLat([badgeLon, badgeLat])
                .addTo(map.current)
              
              gymBadgeMarkersMapRef.current[gym.id] = badgeMarker
            }
          } catch (error) {
            console.error('Error creating gym marker:', error, gym.name)
          }
        }
      } finally {
        isUpdatingMarkersRef.current = false
      }
    }

    processMarkers()
  }, [gyms, mapLoaded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const markersMap = gymMarkersMapRef.current
      const badgeMarkersMap = gymBadgeMarkersMapRef.current
      
      Object.values(markersMap).forEach(marker => {
        try { marker.remove() } catch (e) {}
      })
      
      Object.values(badgeMarkersMap).forEach(badgeMarker => {
        try { badgeMarker.remove() } catch (e) {}
      })
      
      gymMarkersMapRef.current = {}
      gymBadgeMarkersMapRef.current = {}
      gymMarkersRef.current = []
    }
  }, [])

  // Update selected challenge progress when challenges refresh (separate effect to avoid loops)
  useEffect(() => {
    if (!selectedChallenge || !challenges || challenges.length === 0) return
    
    const updatedChallenge = challenges.find(c => c.id === selectedChallenge.id)
    if (updatedChallenge) {
      // If challenge was just completed, close the panel (it will move to Profile)
      if (updatedChallenge.completed && !selectedChallenge.completed) {
        setSelectedChallenge(null)
        setShowChallengePanel(false)
        return
      }
      
      // Otherwise, update progress if it changed
      if (
        updatedChallenge.progress_value !== selectedChallenge.progress_value || 
        updatedChallenge.completed !== selectedChallenge.completed
      ) {
        setSelectedChallenge(updatedChallenge)
      }
    } else if (selectedChallenge.completed) {
      // Challenge is completed and no longer in the active challenges list
      // Close the panel
      setSelectedChallenge(null)
      setShowChallengePanel(false)
    }
  }, [challenges, selectedChallenge]) // Depend on both challenges and selectedChallenge

  const handleCloseModal = useCallback(() => {
    setSelectedCreature(null)
  }, [])

  const handleCreatureCaught = useCallback((creatureId) => {
    // Add to caught set to immediately remove from map
    setCaughtCreatureIds(prev => new Set([...prev, creatureId]))
    // Close the modal
    setSelectedCreature(null)
  }, [])

  const handleChallengeUpdate = useCallback(() => {
    // Refresh challenges immediately after a catch to update progress
    if (refetchChallenges) {
      // Add a small delay to ensure database has updated
      setTimeout(async () => {
        await refetchChallenges()
      }, 500)
    }
  }, [refetchChallenges])

  if (!mapboxgl.accessToken) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">Mapbox token not configured</p>
          <p className="text-gray-400 text-sm">Please add VITE_MAPBOX_TOKEN to your .env file</p>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center p-4 max-w-md">
          <p className="text-red-400 mb-2 font-semibold">Location Error</p>
          <p className="text-gray-300 text-sm mb-4">{locationError}</p>
          <div className="text-left text-gray-400 text-xs space-y-2 bg-surface/50 p-4 rounded-lg mb-4">
            <p><strong>Possible solutions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check browser location permissions (look for the location icon in your browser's address bar)</li>
              <li>Enable location services on your device</li>
              <li>Make sure you're using HTTPS (required for location access)</li>
              <li>Try moving to an area with better GPS signal or enable WiFi/cell tower location</li>
              <li>Check if other apps (like Google Maps) can access your location</li>
              <li>If indoors, try moving near a window or going outside</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show error message if map failed to load
  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center p-4 max-w-md">
          <p className="text-red-400 mb-2 font-semibold">Map Loading Error</p>
          <p className="text-gray-300 text-sm mb-4">{mapError}</p>
          <div className="text-left text-gray-400 text-xs space-y-2 bg-surface/50 p-4 rounded-lg">
            <p><strong>Possible solutions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check that VITE_MAPBOX_TOKEN is set in your .env file</li>
              <li>Verify your Mapbox token is valid and has proper permissions</li>
              <li>Check your internet connection</li>
              <li>Verify the Mapbox style URL is correct</li>
              <li>Check the browser console for detailed error messages</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setMapError(null)
              setMapLoaded(false)
              if (map.current) {
                map.current.remove()
                map.current = null
              }
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Show loading indicator while map is loading */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%', 
          height: '100%',
          zIndex: 0,
          backgroundColor: mapLoaded ? 'transparent' : '#5b695d'
        }} 
      />

      {/* Park boost indicator */}
      {inPark && mapLoaded && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top duration-500">
          <div className="relative bg-gradient-to-r from-emerald-500/95 via-emerald-600/95 to-green-600/95 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-emerald-300/60 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rounded-2xl blur-xl -z-10"></div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-2xl filter drop-shadow-lg">🌳</span>
                <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full -z-10"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base leading-tight text-white text-shadow-sm">{parkName || 'Park'}</span>
                <span className="text-xs opacity-95 font-semibold text-emerald-50 text-shadow-sm">Boosted Spawn Area</span>
              </div>
              <div className="ml-2 bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                <span className="text-xs font-bold">+2x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicators - Stacked on right */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 z-20 space-y-2.5">
          {creaturesLoading && (
            <div className="relative bg-gradient-to-br from-emerald-600/95 to-emerald-700/95 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400/50 animate-in fade-in slide-in-from-right duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-2xl blur-sm -z-10"></div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-200/30 border-t-emerald-100"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-emerald-300/50"></div>
                </div>
                <span className="text-sm font-semibold text-white text-shadow-sm">Searching creatures...</span>
              </div>
            </div>
          )}

          {generatingChallenges && (
            <div className="relative bg-gradient-to-br from-emerald-600/95 to-emerald-700/95 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400/50 animate-in fade-in slide-in-from-right duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-2xl blur-sm -z-10"></div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-200/30 border-t-emerald-100"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-emerald-300/50"></div>
                </div>
                <span className="text-sm font-semibold text-white text-shadow-sm">Creating challenges...</span>
              </div>
            </div>
          )}

          {spawnGenerating && (
            <div className="relative bg-gradient-to-br from-emerald-600/95 to-emerald-700/95 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400/50 animate-in fade-in slide-in-from-right duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent rounded-2xl blur-sm -z-10"></div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-200/30 border-t-emerald-100"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-emerald-300/50"></div>
                </div>
                <span className="text-sm font-semibold text-white text-shadow-sm">Generating spawns...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Challenges Button - Left side of map */}
      {mapLoaded && (
        <button
          className="absolute bottom-28 left-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-4 rounded-full shadow-2xl border-2 border-emerald-400/50 z-20 flex items-center gap-2 transition-all transform hover:scale-110"
          onClick={() => setShowChallengePanel(true)}
          title="View Challenges"
          aria-label="View nearby challenges"
        >
          <Target size={24} className="drop-shadow-lg" />
          {challenges && challenges.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
              {challenges.filter(c => !c.completed).length}
            </span>
          )}
        </button>
      )}

      {/* Gyms Button - Left side of map */}
      {mapLoaded && (
        <button
          className="absolute bottom-40 left-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-4 rounded-full shadow-2xl border-2 border-emerald-400/50 z-20 flex items-center gap-2 transition-all transform hover:scale-110"
          onClick={() => setShowGymPanel(true)}
          title="View Gyms"
          aria-label="View nearby gyms"
        >
          <MapPin size={24} className="drop-shadow-lg" />
          {gyms && gyms.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow-lg">
              {gyms.length}
            </span>
          )}
        </button>
      )}

      {/* Center on Location Button */}
      {mapLoaded && location && (
        <button
          className="absolute bottom-16 left-4 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-4 rounded-full shadow-2xl border-2 border-emerald-400/50 z-20 transition-all transform hover:scale-110"
          onClick={() => {
            if (map.current && location) {
              map.current.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 18,
                pitch: 50,
                bearing: 0,
                duration: 1500,
                essential: true,
              })
            }
          }}
          title="Center on My Location"
          aria-label="Center map on your current location"
        >
          <Navigation2 size={24} className="drop-shadow-lg" />
        </button>
      )}

      {/* AI Assistant */}
      {location && mapLoaded && (
        <AIAssistant
          latitude={location.latitude}
          longitude={location.longitude}
          inPark={inPark}
          parkName={parkName}
        />
      )}

      {/* Bottom spacing for navigation - reduced height */}
      {/* Spacing for floating bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"></div>

      {/* Catch Modal */}
      {selectedCreature && (
        <CatchModal
          creature={selectedCreature}
          userLocation={location}
          onClose={handleCloseModal}
          onCatch={handleCreatureCaught}
          onChallengeUpdate={handleChallengeUpdate}
        />
      )}

      {/* Challenge Panel */}
      {showChallengePanel && location && (
        <ChallengePanel
          latitude={location.latitude}
          longitude={location.longitude}
          selectedChallenge={selectedChallenge}
          onClose={() => {
            setShowChallengePanel(false)
            setSelectedChallenge(null)
          }}
          onChallengeAccept={(challenge) => {
            setSelectedChallenge(null)
            // Refresh challenges - the useChallenges hook will refetch automatically
          }}
        />
      )}

      {/* Gym Panel */}
      {showGymPanel && location && (
        <GymPanel
          latitude={location.latitude}
          longitude={location.longitude}
          selectedGym={selectedGym}
          onClose={() => {
            setShowGymPanel(false)
            setSelectedGym(null)
          }}
        />
      )}
    </div>
  )
}

