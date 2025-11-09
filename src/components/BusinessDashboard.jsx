import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Target, Gift, Users, LogOut, Settings, Store } from 'lucide-react'
import CreateChallenge from './CreateChallenge.jsx'
import BusinessChallenges from './BusinessChallenges.jsx'

export default function BusinessDashboard() {
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('challenges') // 'challenges', 'create', 'vouchers', 'settings'
  const [refreshKey, setRefreshKey] = useState(0) // Key to force refresh of BusinessChallenges
  const navigate = useNavigate()

  useEffect(() => {
    fetchBusiness()
  }, [])

  const fetchBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/business')
        return
      }

      // Verify user is a business
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'business') {
        navigate('/business')
        return
      }

      // Get business details
      const { data: businessData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setBusiness(businessData)
    } catch (error) {
      console.error('Error fetching business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/business')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text">Loading...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-text">Business not found</p>
          <button onClick={handleLogout} className="mt-4 text-primary hover:underline">
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col overflow-hidden">
      {/* Header with Enhanced Styling */}
      <div className="bg-gradient-to-r from-emerald-800/90 via-emerald-700/90 to-emerald-800/90 border-b-2 border-emerald-500/50 flex-shrink-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600/50 rounded-xl border-2 border-emerald-400/50 shadow-lg">
                <Store size={28} className="text-emerald-100" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">{business.business_name}</h1>
                <p className="text-emerald-200 text-sm font-semibold capitalize mt-1">{business.business_type}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-emerald-700/80 hover:bg-emerald-600/90 px-5 py-2.5 rounded-lg transition-colors border-2 border-emerald-500/50 shadow-lg text-white font-semibold"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs with Modern Styling */}
      <div className="bg-emerald-900/60 border-b-2 border-emerald-700/50 flex-shrink-0 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-5 py-3.5 border-b-[3px] transition-all whitespace-nowrap font-semibold rounded-t-lg ${
                activeTab === 'challenges'
                  ? 'border-emerald-400 text-emerald-100 bg-emerald-800/50 shadow-lg'
                  : 'border-transparent text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target size={20} />
                <span>My Challenges</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-5 py-3.5 border-b-[3px] transition-all whitespace-nowrap font-semibold rounded-t-lg ${
                activeTab === 'create'
                  ? 'border-emerald-400 text-emerald-100 bg-emerald-800/50 shadow-lg'
                  : 'border-transparent text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus size={20} />
                <span>Create Challenge</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-5 py-3.5 border-b-[3px] transition-all whitespace-nowrap font-semibold rounded-t-lg ${
                activeTab === 'vouchers'
                  ? 'border-emerald-400 text-emerald-100 bg-emerald-800/50 shadow-lg'
                  : 'border-transparent text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gift size={20} />
                <span>Vouchers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-3.5 border-b-[3px] transition-all whitespace-nowrap font-semibold rounded-t-lg ${
                activeTab === 'settings'
                  ? 'border-emerald-400 text-emerald-100 bg-emerald-800/50 shadow-lg'
                  : 'border-transparent text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings size={20} />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-emerald-950/50 to-emerald-900/50" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-7xl mx-auto px-6 py-8 min-h-full">
          {activeTab === 'challenges' && (
            <BusinessChallenges key={refreshKey} businessId={business.id} />
          )}
          {activeTab === 'create' && (
            <CreateChallenge 
              businessId={business.id} 
              onChallengeCreated={async () => {
                // Wait for database transaction to complete
                await new Promise(resolve => setTimeout(resolve, 1200))
                // Force refresh by changing key (remounts BusinessChallenges)
                setRefreshKey(prev => prev + 1)
                // Switch to challenges tab
                setTimeout(() => {
                  setActiveTab('challenges')
                }, 200)
              }} 
            />
          )}
          {activeTab === 'vouchers' && (
            <BusinessVouchers businessId={business.id} />
          )}
          {activeTab === 'settings' && (
            <BusinessSettings business={business} onUpdate={fetchBusiness} />
          )}
        </div>
      </div>
    </div>
  )
}

// Business Vouchers Component
function BusinessVouchers({ businessId }) {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVouchers()
  }, [businessId])

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          challenges (name, description),
          profiles:user_id (username)
        `)
        .eq('business_id', businessId)
        .order('issued_at', { ascending: false })

      if (error) throw error
      setVouchers(data || [])
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (voucherId) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', voucherId)

      if (error) throw error
      fetchVouchers()
    } catch (error) {
      console.error('Error redeeming voucher:', error)
      alert('Error redeeming voucher')
    }
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading vouchers...</div>
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Vouchers & Redemptions</h2>
      <div className="grid gap-4">
        {vouchers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No vouchers issued yet
          </div>
        ) : (
          vouchers.map((voucher) => (
            <div key={voucher.id} className="bg-surface rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-white font-semibold">Code: {voucher.voucher_code}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      voucher.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      voucher.status === 'redeemed' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {voucher.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-1">{voucher.prize_description}</p>
                  <p className="text-gray-400 text-sm mb-2">
                    Customer: {voucher.profiles?.username || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-sm mb-2">
                    Challenge: {voucher.challenges?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Issued: {new Date(voucher.issued_at).toLocaleDateString()}
                  </p>
                  {voucher.redeemed_at && (
                    <p className="text-gray-400 text-sm">
                      Redeemed: {new Date(voucher.redeemed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {voucher.status === 'active' && (
                  <button
                    onClick={() => handleRedeem(voucher.id)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    Mark as Redeemed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Business Settings Component
function BusinessSettings({ business, onUpdate }) {
  const [formData, setFormData] = useState({
    business_name: business.business_name,
    business_type: business.business_type,
    description: business.description || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', business.id)

      if (error) throw error
      alert('Settings saved!')
      onUpdate()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Business Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-2xl w-full">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
          <input
            type="text"
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
          <select
            value={formData.business_type}
            onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="restaurant">Restaurant</option>
            <option value="cafe">Cafe</option>
            <option value="shop">Shop</option>
            <option value="attraction">Attraction</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

