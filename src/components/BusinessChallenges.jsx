import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { Target, Trash2, Edit, Eye } from 'lucide-react'

export default function BusinessChallenges({ businessId }) {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState(null)

  useEffect(() => {
    fetchChallenges()
  }, [businessId])

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creature_types:target_creature_type_id (name, rarity)
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
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
      <h2 className="text-2xl font-bold text-white mb-6">My Challenges</h2>
      
      {challenges.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No challenges created yet. Create your first challenge to get started!
        </div>
      ) : (
        <div className="grid gap-4">
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

  return (
    <div className="bg-surface rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">{challenge.name}</h3>
            <span className={`px-2 py-1 rounded text-xs ${
              challenge.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {challenge.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-300 mb-2">{challenge.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Type: {challenge.challenge_type}</span>
            <span>Target: {challenge.target_value}</span>
            {challenge.creature_types && (
              <span>Creature: {challenge.creature_types.name}</span>
            )}
            <span>Radius: {challenge.radius_meters}m</span>
          </div>
          {challenge.prize_description && (
            <div className="mt-3 p-3 bg-primary/20 rounded border border-primary/30">
              <p className="text-primary font-semibold text-sm mb-1">Prize:</p>
              <p className="text-white text-sm">{challenge.prize_description}</p>
            </div>
          )}
          <div className="mt-3 flex gap-4 text-sm">
            <span className="text-gray-400">Completions: <span className="text-white font-semibold">{completions}</span></span>
            <span className="text-gray-400">Vouchers Issued: <span className="text-white font-semibold">{vouchers}</span></span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onView(challenge)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={20} className="text-white" />
          </button>
          <button
            onClick={() => onDelete(challenge.id)}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            title="Delete Challenge"
          >
            <Trash2 size={20} className="text-red-400" />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Challenge Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{challenge.name}</h3>
            <p className="text-gray-300">{challenge.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white">{challenge.challenge_type}</p>
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
              <p className="text-white">{challenge.reward_points}</p>
            </div>
          </div>

          {challenge.prize_description && (
            <div className="p-4 bg-primary/20 rounded border border-primary/30">
              <p className="text-primary font-semibold mb-1">Prize</p>
              <p className="text-white">{challenge.prize_description}</p>
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

