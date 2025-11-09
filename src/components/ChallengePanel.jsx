import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useChallenges } from '../hooks/useChallenges.js'
import { X, MapPin, Target, Trophy, TrendingUp, Store, Gift, CheckCircle, AlertCircle } from 'lucide-react'

export default function ChallengePanel({ latitude, longitude, onClose, onChallengeAccept, selectedChallenge: initialSelectedChallenge }) {
  const { challenges, loading, refetch: refetchChallenges } = useChallenges(latitude, longitude)
  const [selectedChallenge, setSelectedChallenge] = useState(initialSelectedChallenge || null)
  const [accepting, setAccepting] = useState(false)
  
  // If a challenge is selected from marker click, show only the detail modal (not the list)
  const showDetailOnly = !!initialSelectedChallenge

  // Update selected challenge when prop changes
  useEffect(() => {
    if (initialSelectedChallenge) {
      setSelectedChallenge(initialSelectedChallenge)
    }
  }, [initialSelectedChallenge])

  const handleAcceptChallenge = async (challenge) => {
    try {
      setAccepting(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please sign in to accept challenges')
        return
      }

      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress_value: 0,
          completed: false,
        })

      if (error) {
        if (error.code === '23505') {
          alert('You have already accepted this challenge!')
        } else {
          console.error('Error accepting challenge:', error)
          alert('Failed to accept challenge. Please try again.')
        }
        return
      }

      if (onChallengeAccept) {
        onChallengeAccept(challenge)
      }

      // Refresh challenges to get updated progress
      if (refetchChallenges) {
        setTimeout(() => {
          refetchChallenges()
        }, 500)
      }

      // Update selected challenge to show accepted state
      setSelectedChallenge({ ...challenge, accepted: true, progress_value: 0 })
    } catch (error) {
      console.error('Error accepting challenge:', error)
      alert('Failed to accept challenge. Please try again.')
    } finally {
      setAccepting(false)
    }
  }

  const getChallengeIcon = (type) => {
    switch (type) {
      case 'collect':
        return '🎯'
      case 'walk':
        return '🚶'
      case 'explore':
        return '🗺️'
      default:
        return '📋'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'hard':
        return 'text-orange-400'
      case 'expert':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  // Filter out completed challenges - they should only appear in Profile
  const activeChallenges = challenges.filter(challenge => !challenge.completed)

  // Sort challenges: business challenges first, then by distance
  const sortedChallenges = [...activeChallenges].sort((a, b) => {
    // Check if challenge has business_id AND business data with a name
    const aIsBusiness = !!(a.business_id && a.businesses && a.businesses.business_name)
    const bIsBusiness = !!(b.business_id && b.businesses && b.businesses.business_name)
    
    // Business challenges first
    if (aIsBusiness && !bIsBusiness) return -1
    if (!aIsBusiness && bIsBusiness) return 1
    
    // Then sort by distance
    return (a.distance_meters || 0) - (b.distance_meters || 0)
  })

  // Find challenge in list if selectedChallenge is provided
  // Only show selected challenge if it's not completed
  const displayChallenges = selectedChallenge && !selectedChallenge.completed && !sortedChallenges.find(c => c.id === selectedChallenge.id)
    ? [selectedChallenge, ...sortedChallenges]
    : sortedChallenges

  // If showing detail only (from marker click), render just the detail modal
  if (showDetailOnly && selectedChallenge) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-surface rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{selectedChallenge.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Business Header - Large and Prominent */}
            {selectedChallenge.business_id && selectedChallenge.businesses && (
              <div className="p-5 bg-gradient-to-r from-yellow-400/20 to-yellow-400/10 rounded-xl border-4 border-yellow-400/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-400/30 rounded-lg">
                    <Store className="text-yellow-200" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-yellow-200 font-black text-lg">BUSINESS CHALLENGE</p>
                    <p className="text-yellow-300 font-bold text-xl mt-1">
                      {selectedChallenge.businesses.business_name}
                    </p>
                    {selectedChallenge.businesses.business_type && (
                      <p className="text-yellow-400/80 text-sm capitalize mt-0.5">
                        {selectedChallenge.businesses.business_type}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-gray-400 mb-3">{selectedChallenge.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded ${getDifficultyColor(selectedChallenge.difficulty)} bg-current/20`}>
                  {selectedChallenge.difficulty}
                </span>
                {!selectedChallenge.business_id && (
                  <>
                    <span>•</span>
                    <span>{formatDistance(selectedChallenge.distance_meters || 0)} away</span>
                    <span>•</span>
                    <span>{selectedChallenge.reward_points} points</span>
                  </>
                )}
              </div>
            </div>

            {/* Requirements Section - Detailed */}
            <div className="bg-surface/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-primary" size={18} />
                <p className="text-white font-bold text-base">Requirements</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Target</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedChallenge.target_value}
                    {selectedChallenge.challenge_type === 'walk' ? ' meters' :
                     selectedChallenge.challenge_type === 'collect' 
                      ? ` ${selectedChallenge.creature_types ? selectedChallenge.creature_types.name : 'creature'}${selectedChallenge.target_value > 1 ? 's' : ''}` 
                      : ''}
                  </span>
                </div>
                {selectedChallenge.radius_meters && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Area</span>
                    <span className="text-sm font-semibold text-white">
                      Within {formatDistance(selectedChallenge.radius_meters)} radius
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Location</span>
                  <span className="text-sm font-semibold text-white">
                    {formatDistance(selectedChallenge.distance_meters || 0)} away
                  </span>
                </div>
              </div>
              {selectedChallenge.accepted && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-semibold text-primary">
                      {selectedChallenge.progress_value || 0} / {selectedChallenge.target_value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((selectedChallenge.progress_value || 0) / selectedChallenge.target_value) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Prize Section - Large and Prominent */}
            {selectedChallenge.business_id && selectedChallenge.prize_description && (
              <div className="p-5 bg-gradient-to-r from-yellow-400/25 via-yellow-400/20 to-yellow-400/15 rounded-xl border-4 border-yellow-400/60 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="text-yellow-300" size={24} />
                  <p className="text-yellow-200 font-black text-lg tracking-wide">🎁 PRIZE REWARD</p>
                </div>
                <p className="text-white font-bold text-xl mb-3 leading-snug">{selectedChallenge.prize_description}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-yellow-400/40">
                  <Trophy className="text-yellow-300" size={18} />
                  <p className="text-yellow-200/90 text-base font-semibold">
                    {selectedChallenge.reward_points} points + Email Voucher
                  </p>
                </div>
                <div className="mt-3 p-3 bg-yellow-400/20 rounded-lg border border-yellow-400/40">
                  <p className="text-yellow-200/90 text-sm">
                    ✓ Complete this challenge to receive your voucher via email!
                  </p>
                  <p className="text-yellow-200/70 text-xs mt-1">
                    The voucher will be added to your Vouchers section automatically.
                  </p>
                </div>
              </div>
            )}

            {!selectedChallenge.accepted && !selectedChallenge.completed && (
              <button
                onClick={() => handleAcceptChallenge(selectedChallenge)}
                disabled={accepting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <Target size={18} />
                    Accept Challenge
                  </>
                )}
              </button>
            )}

            {selectedChallenge.accepted && !selectedChallenge.completed && (
              <div className="bg-primary/20 border border-primary/50 rounded-lg p-3 text-center">
                <p className="text-primary text-sm font-semibold">Challenge Accepted!</p>
                <p className="text-gray-400 text-xs mt-1">Complete it to earn {selectedChallenge.reward_points} points</p>
              </div>
            )}

            {selectedChallenge.completed && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="text-green-400" size={20} />
                  <p className="text-green-400 text-sm font-semibold">Challenge Completed!</p>
                </div>
                <p className="text-gray-400 text-xs mb-2">You earned {selectedChallenge.reward_points} points</p>
                {selectedChallenge.business_id && selectedChallenge.prize_description && (
                  <div className="mt-2 pt-2 border-t border-green-500/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Gift className="text-yellow-400" size={16} />
                      <p className="text-yellow-300 text-xs font-semibold">Voucher Added!</p>
                    </div>
                    <p className="text-gray-300 text-xs">
                      Check your Vouchers section to see your reward. An email confirmation has been sent!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, show the full challenge list (when opened from button)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Target className="text-primary" size={28} />
            Nearby Challenges
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading challenges...</p>
          </div>
        ) : displayChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">No challenges nearby</p>
            <p className="text-gray-500 text-sm">Explore new areas to find challenges!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayChallenges.map((challenge) => {
              // Check if this is a business challenge - MUST have business_id (not null)
              // A challenge is a business challenge if business_id IS NOT NULL
              const isBusinessChallenge = !!challenge.business_id
              
              // BUSINESS CHALLENGES - Prominent, Gold/Yellow, but more compact
              if (isBusinessChallenge) {
                return (
                  <div
                    key={challenge.id}
                    className="relative rounded-xl p-5 cursor-pointer transition-all transform hover:scale-[1.01] bg-gradient-to-br from-yellow-500/40 via-yellow-400/35 to-yellow-500/40 border-4 border-yellow-300 shadow-xl shadow-yellow-500/40 ring-2 ring-yellow-400/40"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    {/* Business Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400/60 to-yellow-500/50 border-2 border-yellow-200/80 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse z-10">
                      <Store size={14} className="text-yellow-50" />
                      <span className="text-yellow-50 text-xs font-black tracking-wider drop-shadow-md">BUSINESS</span>
                    </div>

                    {/* Company Header */}
                    <div className="mb-4 pr-20">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-400/50 via-yellow-500/45 to-yellow-400/50 rounded-xl border-4 border-yellow-200/70 shadow-lg">
                        <div className="p-2.5 bg-yellow-400/60 rounded-lg border-2 border-yellow-100/80 shadow-md">
                          <Store size={20} className="text-yellow-50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-yellow-50 font-black text-xl leading-tight drop-shadow-md mb-1 truncate">
                            {challenge.businesses?.business_name || 'Business Challenge'}
                          </p>
                          {challenge.businesses?.business_type && (
                            <p className="text-yellow-100 text-sm font-bold capitalize">
                              {challenge.businesses.business_type}
                            </p>
                          )}
                          {challenge.businesses?.address && (
                            <p className="text-yellow-100/90 text-xs mt-1 flex items-center gap-1 truncate">
                              <MapPin size={12} className="text-yellow-200 flex-shrink-0" />
                              <span className="truncate">{challenge.businesses.address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Challenge Info */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getChallengeIcon(challenge.challenge_type)}</span>
                        <h3 className="text-lg font-black text-white drop-shadow-sm">{challenge.name}</h3>
                      </div>
                      <p className="text-yellow-50/90 text-sm mb-3 leading-relaxed line-clamp-2">{challenge.description}</p>
                      
                      {/* Requirements */}
                      <div className="mb-4 p-3 bg-yellow-400/20 rounded-lg border-2 border-yellow-300/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-yellow-300" />
                          <p className="text-yellow-200 font-bold text-sm">REQUIREMENTS</p>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-white">
                            <CheckCircle size={14} className="text-yellow-300 flex-shrink-0" />
                            <span className="font-semibold">
                              {challenge.target_value}
                              {challenge.challenge_type === 'collect' 
                                ? ` ${challenge.creature_types ? challenge.creature_types.name : 'creature'}${challenge.target_value > 1 ? 's' : ''}` 
                                : challenge.challenge_type === 'walk' 
                                ? ' meters to walk'
                                : ' to complete'}
                            </span>
                          </div>
                          {challenge.radius_meters && (
                            <div className="flex items-center gap-2 text-white">
                              <MapPin size={14} className="text-yellow-300 flex-shrink-0" />
                              <span>Within <span className="font-semibold">{formatDistance(challenge.radius_meters)}</span> radius</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white">
                            <MapPin size={14} className="text-yellow-300 flex-shrink-0" />
                            <span><span className="font-semibold">{formatDistance(challenge.distance_meters || 0)}</span> away</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prize Section - Compact but Prominent */}
                    <div className="p-4 bg-gradient-to-br from-yellow-400/50 via-yellow-500/45 to-yellow-400/50 rounded-xl border-4 border-yellow-200/80 shadow-lg shadow-yellow-500/50 relative overflow-hidden mb-3">
                        <div className="absolute inset-0 opacity-15">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-yellow-400/70 rounded-lg border-2 border-yellow-100/90 shadow-md">
                              <Gift className="text-yellow-50" size={18} />
                            </div>
                            <p className="text-yellow-50 font-black text-base tracking-wide drop-shadow-md">🎁 PRIZE</p>
                          </div>
                          <p className="text-white font-bold text-lg mb-3 leading-tight drop-shadow-md line-clamp-2">
                            {challenge.prize_description || 'Special Reward from Business!'}
                          </p>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-yellow-200/50">
                            <Trophy size={18} className="text-yellow-100" />
                            <p className="text-yellow-50 text-sm font-bold">
                              {challenge.reward_points || 150} pts + Email Voucher
                            </p>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-400/30 rounded-lg border border-yellow-200/50">
                            <p className="text-yellow-50 text-xs font-semibold flex items-start gap-2 mb-1">
                              <CheckCircle size={14} className="text-yellow-100 flex-shrink-0 mt-0.5" />
                              <span>Complete to receive voucher via email with prize verification</span>
                            </p>
                            {challenge.prize_expires_at && (
                              <p className="text-yellow-100 text-xs mt-2 font-semibold">
                                Valid until {new Date(challenge.prize_expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                    {/* Progress if accepted */}
                    {challenge.accepted && (
                      <div className="mt-4 pt-4 border-t border-yellow-300/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-yellow-100 font-semibold">Progress</span>
                          <span className="text-sm font-black text-yellow-50">
                            {challenge.progress_value || 0} / {challenge.target_value}
                          </span>
                        </div>
                        <div className="w-full bg-yellow-900/40 rounded-full h-3 border border-yellow-300/50">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all shadow-md"
                            style={{
                              width: `${Math.min(((challenge.progress_value || 0) / challenge.target_value) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              // NORMAL CHALLENGES - Small and compact
              return (
                <div
                  key={challenge.id}
                  className={`relative rounded-lg p-4 cursor-pointer transition-all transform hover:scale-[1.01] ${
                    challenge.completed 
                      ? 'border-2 border-green-500/50 bg-green-500/10' 
                      : challenge.accepted 
                      ? 'border-2 border-primary/50 bg-surface/50' 
                      : 'border-2 border-gray-700/50 bg-surface/30'
                  } hover:border-primary`}
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">{getChallengeIcon(challenge.challenge_type)}</span>
                        <h3 className="text-base font-semibold text-white">{challenge.name}</h3>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)} bg-current/20`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {challenge.park_id && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{challenge.park_id}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{formatDistance(challenge.distance_meters || 0)} away</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy size={12} />
                          <span>{challenge.reward_points} pts</span>
                        </div>
                      </div>

                      {challenge.accepted && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Progress</span>
                            <span className="text-xs font-semibold text-primary">
                              {challenge.progress_value || 0} / {challenge.target_value}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(((challenge.progress_value || 0) / challenge.target_value) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Challenge Detail Modal */}
        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChallenge(null)}>
            <div
              className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedChallenge.name}</h3>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Business Header - Large and Prominent with Enhanced Styling */}
                {/* Show for ALL business challenges (identified by business_id) */}
                {selectedChallenge.business_id && (
                  <div className="p-6 bg-gradient-to-r from-yellow-400/30 via-yellow-500/25 to-yellow-400/30 rounded-xl border-4 border-yellow-300/70 shadow-2xl shadow-yellow-500/40">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-yellow-400/40 rounded-xl border-2 border-yellow-300/60">
                        <Store className="text-yellow-100" size={28} />
                      </div>
                      <div className="flex-1">
                        <p className="text-yellow-100 font-black text-lg tracking-wider drop-shadow-lg">🏢 BUSINESS CHALLENGE</p>
                        <p className="text-yellow-100 font-black text-2xl mt-2 drop-shadow-md">
                          {selectedChallenge.businesses.business_name}
                        </p>
                        {selectedChallenge.businesses.business_type && (
                          <p className="text-yellow-200/90 text-sm font-bold capitalize mt-1">
                            {selectedChallenge.businesses.business_type}
                          </p>
                        )}
                        {selectedChallenge.businesses.address && (
                          <p className="text-yellow-200/80 text-xs mt-2 flex items-center gap-1">
                            <MapPin size={14} />
                            {selectedChallenge.businesses.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 mb-3">{selectedChallenge.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${getDifficultyColor(selectedChallenge.difficulty)} bg-current/20`}>
                      {selectedChallenge.difficulty}
                    </span>
                    {!selectedChallenge.business_id && (
                      <>
                        <span>•</span>
                        <span>{formatDistance(selectedChallenge.distance_meters || 0)} away</span>
                        <span>•</span>
                        <span>{selectedChallenge.reward_points} points</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Requirements Section - Detailed */}
                <div className="bg-surface/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="text-primary" size={18} />
                    <p className="text-white font-bold text-base">Requirements</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Target</span>
                      <span className="text-sm font-semibold text-white">
                        {selectedChallenge.target_value}
                        {selectedChallenge.challenge_type === 'walk' ? ' meters' :
                         selectedChallenge.challenge_type === 'collect' 
                          ? ` ${selectedChallenge.creature_types ? selectedChallenge.creature_types.name : 'creature'}${selectedChallenge.target_value > 1 ? 's' : ''}` 
                          : ''}
                      </span>
                    </div>
                    {selectedChallenge.radius_meters && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Area</span>
                        <span className="text-sm font-semibold text-white">
                          Within {formatDistance(selectedChallenge.radius_meters)} radius
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Location</span>
                      <span className="text-sm font-semibold text-white">
                        {formatDistance(selectedChallenge.distance_meters || 0)} away
                      </span>
                    </div>
                  </div>
                  {selectedChallenge.accepted && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-primary">
                          {selectedChallenge.progress_value || 0} / {selectedChallenge.target_value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(((selectedChallenge.progress_value || 0) / selectedChallenge.target_value) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Prize Section - ALWAYS SHOW FOR BUSINESS CHALLENGES */}
                {selectedChallenge.business_id && (
                  <div className="p-6 bg-gradient-to-br from-yellow-400/30 via-yellow-500/25 to-yellow-400/20 rounded-2xl border-4 border-yellow-300/70 shadow-2xl shadow-yellow-500/40 relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-yellow-400/50 rounded-lg border border-yellow-300/60">
                          <Gift className="text-yellow-100" size={26} />
                        </div>
                        <p className="text-yellow-100 font-black text-xl tracking-wider drop-shadow-lg">🎁 PRIZE REWARD 🎁</p>
                      </div>
                      <p className="text-white font-black text-2xl mb-4 leading-tight drop-shadow-md">
                        {selectedChallenge.prize_description || 'Special Reward from Business!'}
                      </p>
                      <div className="flex items-center gap-3 mt-5 pt-5 border-t-2 border-yellow-300/50">
                        <Trophy size={22} className="text-yellow-200" />
                        <p className="text-yellow-100/95 text-lg font-bold">
                          {selectedChallenge.reward_points || 150} points + Email Voucher
                        </p>
                      </div>
                      <div className="mt-4 p-4 bg-yellow-400/20 rounded-xl border-2 border-yellow-300/40">
                        <p className="text-yellow-100 text-base font-semibold flex items-center gap-2 mb-2">
                          <CheckCircle size={18} className="text-yellow-200" />
                          Complete this challenge to receive your voucher via email with proof of prize!
                        </p>
                        <p className="text-yellow-200/80 text-sm">
                          You'll automatically receive an email with your voucher code and prize verification when you complete this challenge.
                        </p>
                        {selectedChallenge.businesses && selectedChallenge.businesses.address && (
                          <p className="text-yellow-200/90 text-sm mt-3 pt-3 border-t border-yellow-300/30">
                            <strong>Redeem at:</strong> {selectedChallenge.businesses.address}
                          </p>
                        )}
                        {selectedChallenge.prize_expires_at && (
                          <p className="text-yellow-200/70 text-xs mt-2">
                            Valid until {new Date(selectedChallenge.prize_expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedChallenge.accepted && !selectedChallenge.completed && (
                  <button
                    onClick={() => handleAcceptChallenge(selectedChallenge)}
                    disabled={accepting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {accepting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Target size={18} />
                        Accept Challenge
                      </>
                    )}
                  </button>
                )}

                {selectedChallenge.accepted && !selectedChallenge.completed && (
                  <div className="bg-primary/20 border border-primary/50 rounded-lg p-3 text-center">
                    <p className="text-primary text-sm font-semibold">Challenge Accepted!</p>
                    <p className="text-gray-400 text-xs mt-1">Complete it to earn {selectedChallenge.reward_points} points</p>
                  </div>
                )}

                {selectedChallenge.completed && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Trophy className="text-green-400" size={20} />
                      <p className="text-green-400 text-sm font-semibold">Challenge Completed!</p>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">You earned {selectedChallenge.reward_points} points</p>
                    {selectedChallenge.business_id && selectedChallenge.prize_description && (
                      <div className="mt-2 pt-2 border-t border-green-500/30">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Gift className="text-yellow-400" size={16} />
                          <p className="text-yellow-300 text-xs font-semibold">Voucher Added!</p>
                        </div>
                        <p className="text-gray-300 text-xs">
                          Check your Vouchers section to see your reward. An email confirmation has been sent!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

