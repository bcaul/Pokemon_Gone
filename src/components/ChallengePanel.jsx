import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useChallenges } from '../hooks/useChallenges.js'
import { X, MapPin, Target, Trophy, TrendingUp, Store, Gift, CheckCircle, AlertCircle } from 'lucide-react'

export default function ChallengePanel({ latitude, longitude, onClose, onChallengeAccept, selectedChallenge: initialSelectedChallenge }) {
  const { challenges, loading, refetch: refetchChallenges } = useChallenges(latitude, longitude)
  const [selectedChallenge, setSelectedChallenge] = useState(initialSelectedChallenge || null)
  const [accepting, setAccepting] = useState(false)

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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
              // Check if this is a business challenge
              // A challenge is a business challenge if it has a business_id AND business data with a name
              const isBusinessChallenge = !!(challenge.business_id && challenge.businesses && challenge.businesses.business_name)
              
              return (
              <div
                key={challenge.id}
                className={`relative rounded-xl p-5 cursor-pointer transition-all ${
                  challenge.completed ? 'border-2 border-green-500/50 bg-green-500/10' :
                  isBusinessChallenge ? 'border-4 border-yellow-400 bg-gradient-to-br from-yellow-400/15 via-yellow-400/10 to-surface shadow-2xl shadow-yellow-400/20 ring-4 ring-yellow-400/30' :
                  challenge.accepted ? 'border-2 border-primary/50 bg-surface' : 'border-2 border-gray-700 bg-surface'
                } ${isBusinessChallenge ? 'hover:shadow-yellow-400/30 hover:ring-yellow-400/50' : 'hover:border-primary'}`}
                onClick={() => setSelectedChallenge(challenge)}
              >
                {/* Business Challenge Badge - Top Right */}
                {isBusinessChallenge && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/25 border-2 border-yellow-400/60 rounded-full shadow-lg">
                    <Store size={16} className="text-yellow-300" />
                    <span className="text-yellow-200 text-xs font-black tracking-wide">BUSINESS</span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    {/* Business Name - Prominent Header */}
                    {isBusinessChallenge && challenge.businesses && (
                      <div className="mb-3 flex items-center gap-2 px-4 py-2.5 bg-yellow-400/20 rounded-lg border-2 border-yellow-400/40 -ml-1">
                        <Store size={18} className="text-yellow-300" />
                        <div className="flex-1">
                          <p className="text-yellow-200 font-bold text-base leading-tight">
                            {challenge.businesses.business_name}
                          </p>
                          {challenge.businesses.business_type && (
                            <p className="text-yellow-300/80 text-xs capitalize mt-0.5">
                              {challenge.businesses.business_type}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-2xl">{getChallengeIcon(challenge.challenge_type)}</span>
                      <h3 className="text-lg font-bold text-white">{challenge.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)} bg-current/20`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                    {/* Requirements Section - Only for Business Challenges */}
                    {isBusinessChallenge && (
                      <div className="mb-4 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-yellow-400" />
                          <p className="text-yellow-300 font-bold text-sm">REQUIREMENTS</p>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-white">
                            <CheckCircle size={14} className="text-yellow-400" />
                            <span>
                              <span className="font-semibold">{challenge.target_value}</span>
                              {challenge.challenge_type === 'collect' 
                                ? ` ${challenge.creature_types ? challenge.creature_types.name : 'creature'}${challenge.target_value > 1 ? 's' : ''}` 
                                : challenge.challenge_type === 'walk' 
                                ? ' meters to walk'
                                : ' to complete'}
                            </span>
                          </div>
                          {challenge.radius_meters && (
                            <div className="flex items-center gap-2 text-white">
                              <MapPin size={14} className="text-yellow-400" />
                              <span>Within <span className="font-semibold">{formatDistance(challenge.radius_meters)}</span> radius</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white">
                            <MapPin size={14} className="text-yellow-400" />
                            <span>Location: <span className="font-semibold">{formatDistance(challenge.distance_meters || 0)}</span> away</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      {!isBusinessChallenge && challenge.park_id && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{challenge.park_id}</span>
                        </div>
                      )}
                      {!isBusinessChallenge && (
                        <>
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{formatDistance(challenge.distance_meters || 0)} away</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy size={14} />
                            <span>{challenge.reward_points} pts</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Prize Section - Large and Prominent for Business Challenges */}
                    {isBusinessChallenge && challenge.prize_description && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400/25 via-yellow-400/20 to-yellow-400/15 rounded-xl border-4 border-yellow-400/60 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="text-yellow-300" size={20} />
                          <p className="text-yellow-200 font-black text-base tracking-wide">🎁 PRIZE REWARD</p>
                        </div>
                        <p className="text-white font-bold text-lg mb-2 leading-snug">{challenge.prize_description}</p>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-yellow-400/40">
                          <Trophy size={16} className="text-yellow-300" />
                          <p className="text-yellow-200/90 text-sm font-semibold">
                            {challenge.reward_points} points + Voucher via email
                          </p>
                        </div>
                        <p className="text-yellow-200/80 text-xs mt-3">
                          ✓ Complete this challenge to receive your voucher via email!
                        </p>
                      </div>
                    )}

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
                  
                  {challenge.completed && (
                    <div className="ml-4 text-green-400">
                      <Trophy size={24} />
                    </div>
                  )}
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
        )}
      </div>
    </div>
  )
}

