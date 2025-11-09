import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Target, Trash2, Edit, Eye, X, Gift, Trophy, Users, TrendingUp, Store, MapPin, Calendar } from 'lucide-react'

export default function BusinessChallenges({ businessId }) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState(null)

  useEffect(() => {
    if (businessId) {
      fetchChallenges()
    }
  }, [businessId])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creature_types:target_creature_type_id (name, rarity),
          businesses:business_id (
            id,
            business_name,
            business_type,
            address,
            email,
            phone
          )
        `)
        .eq('business_id', businessId)
        // Don't filter by active - show all challenges for the business so they can manage them
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching challenges:', error)
        throw error
      }
      
      setChallenges(data || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
      setChallenges([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return

    try {
      const { error } = await supabase
        .from('challenges')
        .update({ active: false })
        .eq('id', challengeId)

      if (error) throw error
      fetchChallenges()
    } catch (error) {
      console.error('Error deleting challenge:', error)
      alert('Error deleting challenge')
    }
  }

  const getCompletionsCount = async (challengeId) => {
    const { count } = await supabase
      .from('challenge_completions')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId)
    return count || 0
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading challenges...</div>
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">My Challenges</h2>
        <p className="text-emerald-200/80 text-sm">Manage your business challenges and track completions</p>
      </div>
      
      {challenges.length === 0 ? (
        <div className="text-center py-16 bg-emerald-900/30 rounded-2xl border-2 border-emerald-700/50">
          <Target className="mx-auto text-emerald-400/50 mb-4" size={48} />
          <p className="text-emerald-200 text-lg font-semibold mb-2">No challenges created yet</p>
          <p className="text-emerald-300/70 text-sm">Create your first challenge to attract customers!</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onDelete={handleDelete}
              onView={(challenge) => setSelectedChallenge(challenge)}
            />
          ))}
        </div>
      )}

      {selectedChallenge && (
        <ChallengeDetails
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  )
}

function ChallengeCard({ challenge, onDelete, onView }) {
  const [completions, setCompletions] = useState(0)
  const [vouchers, setVouchers] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [challenge.id])

  const fetchStats = async () => {
    const { count: completionsCount } = await supabase
      .from('challenge_completions')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challenge.id)

    const { count: vouchersCount } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challenge.id)

    setCompletions(completionsCount || 0)
    setVouchers(vouchersCount || 0)
  }

  // Check if this is a business challenge
  const isBusinessChallenge = challenge.business_id && challenge.businesses
  
  return (
    <div className={`rounded-xl p-6 border-2 shadow-xl hover:shadow-2xl transition-all ${
      isBusinessChallenge
        ? 'bg-gradient-to-br from-yellow-500/20 via-yellow-400/15 to-yellow-500/20 border-yellow-400/60 hover:border-yellow-300/80'
        : 'bg-gradient-to-br from-emerald-800/40 via-emerald-900/30 to-emerald-800/40 border-emerald-600/50 hover:border-emerald-500/70'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Business Header - Prominent for Business Challenges */}
          {isBusinessChallenge && challenge.businesses && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-400/30 via-yellow-500/25 to-yellow-400/30 rounded-xl border-2 border-yellow-300/60 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400/40 rounded-lg border border-yellow-300/50">
                  <Store size={20} className="text-yellow-100" />
                </div>
                <div className="flex-1">
                  <p className="text-yellow-100 font-black text-lg drop-shadow-md">{challenge.businesses.business_name}</p>
                  {challenge.businesses.business_type && (
                    <p className="text-yellow-200/80 text-xs font-semibold capitalize mt-1">{challenge.businesses.business_type}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className={`p-2 rounded-lg border ${
              isBusinessChallenge
                ? 'bg-yellow-400/30 border-yellow-300/50'
                : 'bg-emerald-600/50 border-emerald-400/50'
            }`}>
              <Target size={20} className={isBusinessChallenge ? 'text-yellow-100' : 'text-emerald-100'} />
            </div>
            <h3 className="text-xl font-black text-white drop-shadow-md">{challenge.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              challenge.active 
                ? isBusinessChallenge
                  ? 'bg-yellow-500/40 text-yellow-100 border-2 border-yellow-400/60'
                  : 'bg-emerald-500/30 text-emerald-100 border-2 border-emerald-400/50'
                : 'bg-gray-500/30 text-gray-300 border-2 border-gray-500/50'
            }`}>
              {challenge.active ? '✓ Active' : 'Inactive'}
            </span>
            {isBusinessChallenge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/25 text-yellow-200 border-2 border-yellow-400/50">
                🏢 BUSINESS CHALLENGE
              </span>
            )}
          </div>
          <p className={`mb-4 leading-relaxed ${
            isBusinessChallenge ? 'text-yellow-100/90' : 'text-emerald-100/90'
          }`}>{challenge.description}</p>
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 ${
            isBusinessChallenge ? 'bg-yellow-400/5 rounded-lg p-2' : ''
          }`}>
            <div className={`rounded-lg p-3 border ${
              isBusinessChallenge
                ? 'bg-yellow-400/15 border-yellow-400/30'
                : 'bg-emerald-900/40 border-emerald-700/50'
            }`}>
              <p className={`text-xs mb-1 ${
                isBusinessChallenge ? 'text-yellow-300/80' : 'text-emerald-300/80'
              }`}>Type</p>
              <p className="text-white font-semibold text-sm capitalize">{challenge.challenge_type}</p>
            </div>
            <div className={`rounded-lg p-3 border ${
              isBusinessChallenge
                ? 'bg-yellow-400/15 border-yellow-400/30'
                : 'bg-emerald-900/40 border-emerald-700/50'
            }`}>
              <p className={`text-xs mb-1 ${
                isBusinessChallenge ? 'text-yellow-300/80' : 'text-emerald-300/80'
              }`}>Target</p>
              <p className="text-white font-semibold text-sm">{challenge.target_value}</p>
            </div>
            {challenge.creature_types && (
              <div className={`rounded-lg p-3 border ${
                isBusinessChallenge
                  ? 'bg-yellow-400/15 border-yellow-400/30'
                  : 'bg-emerald-900/40 border-emerald-700/50'
              }`}>
                <p className={`text-xs mb-1 ${
                  isBusinessChallenge ? 'text-yellow-300/80' : 'text-emerald-300/80'
                }`}>Creature</p>
                <p className="text-white font-semibold text-sm">{challenge.creature_types.name}</p>
              </div>
            )}
            <div className={`rounded-lg p-3 border ${
              isBusinessChallenge
                ? 'bg-yellow-400/15 border-yellow-400/30'
                : 'bg-emerald-900/40 border-emerald-700/50'
            }`}>
              <p className={`text-xs mb-1 ${
                isBusinessChallenge ? 'text-yellow-300/80' : 'text-emerald-300/80'
              }`}>Radius</p>
              <p className="text-white font-semibold text-sm">{challenge.radius_meters}m</p>
            </div>
          </div>
          
          {/* Prize Section - Enhanced for Business Challenges */}
          {challenge.prize_description && (
            <div className={`mt-4 p-5 rounded-xl border-2 shadow-xl ${
              isBusinessChallenge
                ? 'bg-gradient-to-br from-yellow-400/30 via-yellow-500/25 to-yellow-400/30 border-yellow-300/70 shadow-yellow-500/40'
                : 'bg-gradient-to-r from-yellow-400/20 via-yellow-500/15 to-yellow-400/20 border-yellow-400/40'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg border ${
                  isBusinessChallenge
                    ? 'bg-yellow-400/50 border-yellow-300/60'
                    : 'bg-yellow-400/30 border-yellow-300/50'
                }`}>
                  <Gift size={20} className="text-yellow-100" />
                </div>
                <p className="text-yellow-100 font-black text-base drop-shadow-md">🎁 PRIZE REWARD</p>
              </div>
              <p className={`font-bold mb-3 ${
                isBusinessChallenge ? 'text-white text-lg' : 'text-white'
              }`}>{challenge.prize_description}</p>
              {isBusinessChallenge && challenge.businesses && challenge.businesses.address && (
                <div className="mt-3 pt-3 border-t border-yellow-300/40 flex items-center gap-2">
                  <MapPin size={16} className="text-yellow-200" />
                  <p className="text-yellow-200/90 text-sm">{challenge.businesses.address}</p>
                </div>
              )}
              {challenge.prize_expires_at && (
                <div className="mt-3 pt-3 border-t border-yellow-300/40 flex items-center gap-2">
                  <Calendar size={16} className="text-yellow-200" />
                  <p className="text-yellow-200/90 text-sm">
                    Valid until {new Date(challenge.prize_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Reward Points */}
          <div className={`mt-3 p-3 rounded-lg border ${
            isBusinessChallenge
              ? 'bg-yellow-400/10 border-yellow-400/30'
              : 'bg-emerald-900/30 border-emerald-700/40'
          }`}>
            <div className="flex items-center gap-2">
              <Trophy size={16} className={isBusinessChallenge ? 'text-yellow-300' : 'text-emerald-300'} />
              <p className={`text-sm font-semibold ${
                isBusinessChallenge ? 'text-yellow-200' : 'text-emerald-200'
              }`}>
                Reward: <span className="text-white font-bold">{challenge.reward_points} points</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-6">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-emerald-300" />
              <span className="text-emerald-200 text-sm">
                <span className="font-bold text-white">{completions}</span> completions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-yellow-300" />
              <span className="text-emerald-200 text-sm">
                <span className="font-bold text-white">{vouchers}</span> vouchers
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onView(challenge)}
            className="p-3 bg-emerald-600/60 hover:bg-emerald-500/70 rounded-lg transition-colors border-2 border-emerald-400/50 shadow-lg"
            title="View Details"
          >
            <Eye size={20} className="text-emerald-100" />
          </button>
          <button
            onClick={() => onDelete(challenge.id)}
            className="p-3 bg-red-500/30 hover:bg-red-500/40 rounded-lg transition-colors border-2 border-red-400/50 shadow-lg"
            title="Delete Challenge"
          >
            <Trash2 size={20} className="text-red-300" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ChallengeDetails({ challenge, onClose }) {
  const [completions, setCompletions] = useState([])

  useEffect(() => {
    fetchCompletions()
  }, [challenge.id])

  const fetchCompletions = async () => {
    const { data } = await supabase
      .from('challenge_completions')
      .select(`
        *,
        profiles:user_id (username, email)
      `)
      .eq('challenge_id', challenge.id)
      .order('completed_at', { ascending: false })

    setCompletions(data || [])
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-900/95 to-emerald-950/95 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-emerald-600/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-white drop-shadow-lg">Challenge Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-800/50 rounded-lg transition-colors border-2 border-emerald-600/50"
          >
            <X size={24} className="text-emerald-100" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Business Header in Details */}
          {challenge.business_id && challenge.businesses && (
            <div className="p-5 bg-gradient-to-r from-yellow-400/30 via-yellow-500/25 to-yellow-400/30 rounded-xl border-2 border-yellow-300/60 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-400/40 rounded-lg border border-yellow-300/50">
                  <Store size={24} className="text-yellow-100" />
                </div>
                <div>
                  <p className="text-yellow-100 font-black text-xl drop-shadow-md">{challenge.businesses.business_name}</p>
                  {challenge.businesses.business_type && (
                    <p className="text-yellow-200/80 text-sm font-semibold capitalize mt-1">{challenge.businesses.business_type}</p>
                  )}
                  {challenge.businesses.address && (
                    <p className="text-yellow-200/70 text-xs mt-2 flex items-center gap-1">
                      <MapPin size={12} />
                      {challenge.businesses.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{challenge.name}</h3>
            <p className="text-gray-300">{challenge.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white capitalize">{challenge.challenge_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Target</p>
              <p className="text-white">{challenge.target_value}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Difficulty</p>
              <p className="text-white capitalize">{challenge.difficulty}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reward Points</p>
              <p className="text-white font-bold">{challenge.reward_points}</p>
            </div>
          </div>

          {/* Enhanced Prize Section in Details */}
          {challenge.prize_description && (
            <div className="p-5 bg-gradient-to-br from-yellow-400/30 via-yellow-500/25 to-yellow-400/30 rounded-xl border-2 border-yellow-300/70 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-400/50 rounded-lg border border-yellow-300/60">
                  <Gift size={20} className="text-yellow-100" />
                </div>
                <p className="text-yellow-100 font-black text-lg">🎁 PRIZE REWARD</p>
              </div>
              <p className="text-white font-bold text-lg mb-3">{challenge.prize_description}</p>
              {challenge.businesses && challenge.businesses.address && (
                <div className="mt-3 pt-3 border-t border-yellow-300/40 flex items-center gap-2">
                  <MapPin size={16} className="text-yellow-200" />
                  <p className="text-yellow-200/90 text-sm">Redeem at: {challenge.businesses.address}</p>
                </div>
              )}
              {challenge.prize_expires_at && (
                <div className="mt-3 pt-3 border-t border-yellow-300/40 flex items-center gap-2">
                  <Calendar size={16} className="text-yellow-200" />
                  <p className="text-yellow-200/90 text-sm">
                    Valid until {new Date(challenge.prize_expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Completions ({completions.length})</h4>
            <div className="space-y-2">
              {completions.length === 0 ? (
                <p className="text-gray-400">No completions yet</p>
              ) : (
                completions.map((completion) => (
                  <div key={completion.id} className="bg-gray-800 rounded p-3">
                    <p className="text-white">{completion.profiles?.username || 'Unknown'}</p>
                    <p className="text-gray-400 text-sm">
                      Completed: {new Date(completion.completed_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

