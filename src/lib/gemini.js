/**
 * Google Gemini API integration for AI hunting recommendations
 * 
 * IMPORTANT: To avoid costs, this will auto-disable after failures.
 * Set VITE_GEMINI_API_KEY in .env only if you want to use Gemini API.
 * If not set or disabled, default recommendations will be used (FREE).
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI = null

// Track failures and disable if consistently failing (prevents API costs)
let geminiFailureCount = 0
const MAX_FAILURES = 3 // Disable after 3 failures
let geminiDisabled = false

/**
 * Initialize Gemini API client
 */
function initGemini() {
  // If disabled due to failures, don't initialize
  if (geminiDisabled) {
    return null
  }
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') {
    // No API key - use defaults (FREE, no costs)
    return null
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }

  return genAI
}

/**
 * Get AI hunting recommendations based on user context
 * @param {Object} context - User context object
 * @param {number} context.latitude - User latitude
 * @param {number} context.longitude - User longitude
 * @param {string} context.cityName - City name
 * @param {string} context.country - Country code
 * @param {Array} context.nearbyParks - Array of nearby park names
 * @param {Array} context.availableCreatures - Array of available creature types
 * @param {Array} context.recentCatches - Array of recently caught creatures
 * @returns {Promise<Array<string>>} Array of recommendation strings
 */
export async function getHuntingRecommendations(context) {
  // If Gemini is disabled, use defaults immediately (NO API CALL = NO COST)
  if (geminiDisabled) {
    return getDefaultRecommendations(context)
  }
  
  try {
    const client = initGemini()
    if (!client) {
      // No API key or client - use defaults (FREE, no costs)
      return getDefaultRecommendations(context)
    }

    // Try to get model - if this fails, we'll disable Gemini
    let model
    try {
      // Try gemini-1.5-flash-latest first (correct format for v1 API)
      model = client.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
    } catch (modelError1) {
      try {
        // Try gemini-1.5-pro-latest
        model = client.getGenerativeModel({ model: 'gemini-1.5-pro-latest' })
      } catch (modelError2) {
        // Both failed - disable Gemini to prevent further costs
        geminiFailureCount++
        if (geminiFailureCount >= MAX_FAILURES) {
          geminiDisabled = true
          console.warn('⚠️ Gemini API disabled due to model errors. Using default recommendations (FREE). This prevents API costs.')
        }
        return getDefaultRecommendations(context)
      }
    }

    const prompt = `You are a helpful guide for a creature-hunting game similar to Pokemon GO.

User Context:
- Current location: ${context.cityName || 'Unknown'}, ${context.country || 'Unknown'}
- Time: ${new Date().toLocaleTimeString()}
- Nearby parks: ${context.nearbyParks?.join(', ') || 'None found'}
- Available creature types in this region: ${context.availableCreatures?.map(c => c.name).join(', ') || 'Various'}
- Recent catches: ${context.recentCatches?.slice(0, 3).map(c => c.name).join(', ') || 'None yet'}

Provide 2-3 SHORT, actionable hunting tips (max 30 words each). Be encouraging and specific about WHERE to go and WHEN. Include emoji.

Format each tip on a new line starting with an emoji.

Example format:
🌊 Head to ${context.nearbyParks?.[0] || 'the park'} before sunset - water creatures love the evening!
🏔️ Mountain types peak at dawn near landmarks
🦌 Forest creatures are most active in green spaces

Be creative and location-specific!`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Reset failure count on success
    geminiFailureCount = 0

    // Parse tips (split by newlines, filter empty)
    const tips = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.startsWith('🌊') || line.startsWith('🏔') || line.startsWith('🦌') || line.startsWith('🏙') || line.startsWith('⭐') || line.startsWith('🎯') || line.match(/^[🌊🏔🦌🏙⭐🎯🌳🦅🔥💧]/)))
      .slice(0, 3)

    return tips.length > 0 ? tips : getDefaultRecommendations(context)
  } catch (error) {
    // Track failures and disable if too many
    geminiFailureCount++
    console.warn(`Gemini API error (${geminiFailureCount}/${MAX_FAILURES}):`, error.message)
    
    if (geminiFailureCount >= MAX_FAILURES) {
      geminiDisabled = true
      console.warn('⚠️ Gemini API permanently disabled due to repeated failures. Using default recommendations (FREE). This prevents API costs.')
      console.warn('💡 To re-enable: Remove VITE_GEMINI_API_KEY from .env or fix the API key.')
    }
    
    // Always return defaults on error (NO RETRY = NO COST)
    return getDefaultRecommendations(context)
  }
}

/**
 * Get default recommendations when AI is unavailable
 * @param {Object} context - User context
 * @returns {Array<string>} Default recommendations
 */
function getDefaultRecommendations(context) {
  const tips = []

  if (context.nearbyParks && context.nearbyParks.length > 0) {
    tips.push(`🌳 Visit ${context.nearbyParks[0]} for boosted spawn rates!`)
  }

  if (context.availableCreatures && context.availableCreatures.length > 0) {
    const rareCreatures = context.availableCreatures.filter(c => ['rare', 'epic', 'legendary'].includes(c.rarity))
    if (rareCreatures.length > 0) {
      tips.push(`⭐ Look for ${rareCreatures[0].name} - they're rare in this area!`)
    }
  }

  tips.push('🎯 Move around to discover more creatures!')

  return tips
}

/**
 * Cache recommendations to avoid excessive API calls
 */
const recommendationCache = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 60 minutes (increased to save Gemini API calls)

/**
 * Get cached recommendations
 * @param {string} locationKey - Cache key based on location
 * @param {Object} context - User context
 * @returns {Promise<Array<string>>}
 */
export async function getCachedRecommendations(locationKey, context) {
  // If Gemini is disabled, skip cache and return defaults immediately (NO API CALL = NO COST)
  if (geminiDisabled) {
    return getDefaultRecommendations(context)
  }
  
  const cached = recommendationCache.get(locationKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.recommendations
  }

  // This will return defaults if Gemini is disabled or fails
  const recommendations = await getHuntingRecommendations(context)
  recommendationCache.set(locationKey, {
    recommendations,
    timestamp: Date.now(),
  })

  return recommendations
}

/**
 * Check if Gemini API is currently disabled
 * @returns {boolean}
 */
export function isGeminiDisabled() {
  return geminiDisabled || !import.meta.env.VITE_GEMINI_API_KEY
}

