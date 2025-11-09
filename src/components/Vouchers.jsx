import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { sendVoucherEmail } from '../lib/email.js'
import { Gift, Mail, MapPin, Calendar } from 'lucide-react'

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVouchers()

    let subscription = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        subscription = supabase
          .channel(`user_vouchers_${user.id}`)
          .on('postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'vouchers',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchVouchers()
            }
          )
          .on('postgres_changes',
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'vouchers',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchVouchers()
            }
          )
          .subscribe()
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const fetchVouchers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          challenges (name, description),
          businesses (business_name, business_type, address)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })

      if (error) throw error
      setVouchers(data || [])
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async (voucher) => {
    try {
      await sendVoucherEmail(voucher.id)
      alert('✅ Email sent! Check your inbox for your voucher details.')
      fetchVouchers() // Refresh to update email_sent status
    } catch (error) {
      console.error('Error sending email:', error)
      
      // Check if email service is not configured
      if (error.message === 'EMAIL_NOT_CONFIGURED' || error.message?.includes('not configured')) {
        alert('📧 Email service is not set up yet. Your voucher details are shown below - you can use this as proof of your prize!\n\nVoucher Code: ' + voucher.voucher_code + '\nPrize: ' + voucher.prize_description)
      } else {
        alert('⚠️ Could not send email. Your voucher details are shown below - you can use this as proof of your prize!\n\nVoucher Code: ' + voucher.voucher_code + '\nPrize: ' + voucher.prize_description + '\n\nError: ' + (error.message || 'Unknown error'))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading vouchers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Vouchers</h1>
        <p className="text-gray-400">Redeem your rewards at participating businesses</p>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-400 text-lg">No vouchers yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Complete challenges from businesses to earn vouchers!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`bg-surface rounded-lg p-6 border-2 ${
                voucher.status === 'active'
                  ? 'border-primary shadow-lg shadow-primary/20'
                  : voucher.status === 'redeemed'
                  ? 'border-gray-600 opacity-75'
                  : 'border-gray-700 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="text-primary" size={24} />
                    <h3 className="text-xl font-bold text-white">{voucher.challenges?.name || 'Challenge Reward'}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      voucher.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : voucher.status === 'redeemed'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {voucher.status === 'active' ? 'Active' : voucher.status === 'redeemed' ? 'Redeemed' : 'Expired'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-primary/20 border border-primary/30 rounded-lg px-4 py-2">
                    <p className="text-primary text-xs font-semibold mb-1">Voucher Code</p>
                    <p className="text-white text-lg font-mono font-bold">{voucher.voucher_code}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="text-primary font-semibold mb-2">Prize</p>
                <p className="text-white text-lg">{voucher.prize_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Business</p>
                  <p className="text-white font-semibold">{voucher.businesses?.business_name || 'Unknown'}</p>
                  <p className="text-gray-400 capitalize">{voucher.businesses?.business_type}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Issued</p>
                  <p className="text-white">
                    {new Date(voucher.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {voucher.redemption_location && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-gray-800 rounded">
                  <MapPin size={20} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Redeem at:</p>
                    <p className="text-white">{voucher.redemption_location}</p>
                  </div>
                </div>
              )}

              {voucher.expires_at && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-400">
                    Expires: {new Date(voucher.expires_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {voucher.status === 'active' && (
                <div className="flex flex-col gap-2">
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3 mb-2">
                    <p className="text-yellow-200 text-sm font-semibold mb-1">🎁 Your Prize Verification</p>
                    <p className="text-white text-sm mb-2">{voucher.prize_description}</p>
                    <p className="text-yellow-200 text-xs">Use the voucher code above as proof when redeeming at {voucher.businesses?.business_name || 'the business'}</p>
                  </div>
                  <div className="flex gap-2">
                    {!voucher.email_sent && (
                      <button
                        onClick={() => handleResendEmail(voucher)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                      >
                        <Mail size={16} />
                        <span>Send Email with Voucher</span>
                      </button>
                    )}
                    {voucher.email_sent && (
                      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 border border-green-400/30 rounded-lg px-4 py-2">
                        <Mail size={16} />
                        <span>✅ Email sent on {new Date(voucher.email_sent_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {voucher.status === 'redeemed' && voucher.redeemed_at && (
                <p className="text-gray-400 text-sm">
                  Redeemed on {new Date(voucher.redeemed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

