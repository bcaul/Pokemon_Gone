import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { LogOut, Trophy, Target, Zap, Star, Gift, Store, MapPin, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [challengesLoading, setChallengesLoading] = useState(true)
  const navigate = useNavigate()
  const subscriptionRef = useRef(null)

  const fetchCompletedChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch completed challenges with full challenge and business details
      const { data: userChallenges, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges (
            id,
            name,
            description,
            challenge_type,
            target_value,
            reward_points,
            difficulty,
            business_id,
            prize_description,
            businesses:business_id (
              business_name,
              business_type
            ),
            creature_types:target_creature_type_id (
              name,
              rarity
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Transform the data to a more usable format
      const completed = (userChallenges || [])
        .filter(uc => uc.challenges) // Only include if challenge exists
        .map(uc => ({
          ...uc.challenges,
          completed_at: uc.completed_at,
          progress_value: uc.progress_value,
          user_challenge_id: uc.id,
        }))

      setCompletedChallenges(completed)
    } catch (error) {
      console.error('Error fetching completed challenges:', error)
    } finally {
      setChallengesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchCompletedChallenges()

    // Subscribe to profile updates for real-time points updates
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      subscriptionRef.current = supabase
        .channel('profile_points')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, 
          (payload) => {
            // Update points when profile is updated
            if (payload.new.points !== undefined) {
              setProfile(prev => prev ? ({ ...prev, points: payload.new.points }) : null)
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_challenges',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // If a challenge was just completed, refresh completed challenges
            if (payload.new.completed === true && (payload.old.completed === false || payload.old.completed === null)) {
              fetchCompletedChallenges()
            }
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [fetchCompletedChallenges])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Get stats
      const { data: catches } = await supabase
        .from('catches')
        .select('creature_type_id, cp_level, creature_types(rarity)')
        .eq('user_id', user.id)

      // Calculate stats
      const totalCatches = catches?.length || 0
      const uniqueSpecies = new Set(catches?.map(c => c.creature_type_id) || []).size
      const highestCP = catches?.length > 0 ? Math.max(...catches.map(c => c.cp_level)) : 0
      const averageCP = catches?.length > 0
        ? Math.round(catches.reduce((sum, c) => sum + c.cp_level, 0) / catches.length)
        : 0

      // Count by rarity
      const rarityCounts = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      }

      catches?.forEach(catchItem => {
        const rarity = catchItem.creature_types?.rarity
        if (rarity && rarityCounts.hasOwnProperty(rarity)) {
          rarityCounts[rarity]++
        }
      })

      setProfile(profileData)
      setStats({
        totalCatches,
        uniqueSpecies,
        highestCP,
        averageCP,
        rarityCounts,
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-white text-shadow-lg">Profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-surface hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white text-shadow-md">{profile?.username || 'User'}</h2>
            <p className="text-gray-300 text-sm font-medium text-shadow-sm">
              Member since {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Points Display - Prominent */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-white" size={24} />
              <p className="text-white/95 text-sm font-semibold text-shadow-sm uppercase tracking-wider">Challenge Points</p>
            </div>
            <p className="text-5xl font-extrabold text-white text-shadow-lg">{profile?.points || 0}</p>
            <p className="text-white/80 text-xs mt-1 font-medium text-shadow-sm">Earned from completing challenges</p>
          </div>
          <Trophy className="text-white/20" size={48} />
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-primary" size={20} />
                <p className="text-gray-300 text-sm font-semibold text-shadow-sm">Total Catches</p>
              </div>
              <p className="text-3xl font-extrabold text-white text-shadow-md">{stats.totalCatches}</p>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-accent" size={20} />
                <p className="text-gray-400 text-sm">Unique Species</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.uniqueSpecies}</p>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-legendary" size={20} />
                <p className="text-gray-400 text-sm">Highest CP</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.highestCP}</p>
            </div>

            <div className="bg-surface rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-secondary" size={20} />
                <p className="text-gray-400 text-sm">Average CP</p>
              </div>
              <p className="text-3xl font-bold text-white">{stats.averageCP}</p>
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div className="bg-surface rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-extrabold text-white mb-4 text-shadow-md">Collection by Rarity</h3>
            <div className="space-y-3">
              {Object.entries(stats.rarityCounts).map(([rarity, count]) => (
                <div key={rarity} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{rarity}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(count / stats.totalCatches) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-white font-bold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Progress */}
          <div className="bg-surface rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Collection Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Completion</span>
                  <span className="text-white font-bold">
                    {stats.uniqueSpecies}/50 ({Math.round((stats.uniqueSpecies / 50) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{
                      width: `${(stats.uniqueSpecies / 50) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Completed Challenges Section */}
      <div className="bg-surface rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Completed Challenges</h3>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
            {completedChallenges.length}
          </span>
        </div>

        {challengesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading completed challenges...</p>
          </div>
        ) : completedChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">No completed challenges yet</p>
            <p className="text-gray-500 text-sm">Complete challenges to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedChallenges.map((challenge) => {
              const isBusinessChallenge = !!(challenge.business_id && challenge.businesses && challenge.businesses.business_name)
              
              return (
                <div
                  key={challenge.id}
                  className={`bg-surface border-2 rounded-lg p-4 ${
                    isBusinessChallenge 
                      ? 'border-yellow-400/50 bg-yellow-400/5' 
                      : 'border-green-500/50 bg-green-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {isBusinessChallenge && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-md">
                            <Store size={12} className="text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-bold">BUSINESS</span>
                          </div>
                        )}
                        <span className="text-xl">{getChallengeIcon(challenge.challenge_type)}</span>
                        <h4 className="text-lg font-bold text-white">{challenge.name}</h4>
                        <CheckCircle className="text-green-400" size={18} />
                      </div>

                      {isBusinessChallenge && challenge.businesses && (
                        <div className="mb-2 flex items-center gap-2 px-3 py-1 bg-yellow-400/15 rounded-md border border-yellow-400/30">
                          <Store size={12} className="text-yellow-400" />
                          <span className="text-yellow-300 font-semibold text-sm">
                            {challenge.businesses.business_name}
                          </span>
                        </div>
                      )}

                      <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Target size={14} />
                          <span>
                            {challenge.target_value}
                            {challenge.challenge_type === 'collect' 
                              ? ` ${challenge.creature_types?.name || 'creature'}${challenge.target_value > 1 ? 's' : ''}`
                              : challenge.challenge_type === 'walk' 
                              ? ' meters'
                              : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy size={14} />
                          <span>{challenge.reward_points} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>✓</span>
                          <span>Completed {new Date(challenge.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isBusinessChallenge && challenge.prize_description && (
                        <div className="mt-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Gift className="text-yellow-400" size={14} />
                            <p className="text-yellow-300 font-bold text-xs">PRIZE EARNED</p>
                          </div>
                          <p className="text-white text-sm font-semibold">{challenge.prize_description}</p>
                          <p className="text-yellow-200/70 text-xs mt-1">
                            Check your Vouchers section to redeem
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

