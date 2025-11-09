import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

export default function BusinessAuth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('restaurant')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Sign up business account
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: businessName.trim(),
              role: 'business',
            },
          },
        })

        if (authError) throw authError

        if (data.user) {
          // Wait for profile to be created by trigger (might take a moment)
          let profileCreated = false
          let retries = 0
          const maxRetries = 10

          while (!profileCreated && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Check if profile exists
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, role')
              .eq('id', data.user.id)
              .single()

            if (profile && !profileError) {
              profileCreated = true
              
              // Update profile role to business
              const { error: roleError } = await supabase
                .from('profiles')
                .update({ role: 'business' })
                .eq('id', data.user.id)

              if (roleError) {
                console.error('Error updating role:', roleError)
                // Try to create profile manually if update fails
                if (roleError.code === 'PGRST116') {
                  // Profile doesn't exist, create it
                  const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: data.user.id,
                      username: businessName.trim(),
                      role: 'business',
                    })
                  
                  if (createError) {
                    console.error('Error creating profile:', createError)
                    throw new Error('Failed to create profile. Please try again.')
                  }
                } else {
                  throw new Error(`Failed to set business role: ${roleError.message}`)
                }
              }

              // Create business record
              const { error: businessError } = await supabase
                .from('businesses')
                .insert({
                  user_id: data.user.id,
                  business_name: businessName.trim(),
                  business_type: businessType,
                  email: email.trim(),
                })

              if (businessError) {
                console.error('Error creating business:', businessError)
                
                // Check if it's a duplicate (already exists)
                if (businessError.code === '23505') {
                  setMessage('Business account already exists! Please sign in instead.')
                  return
                }
                
                throw new Error(`Failed to create business profile: ${businessError.message}`)
              }

              setMessage('Business account created! Please check your email to verify your account.')
              break
            }
            
            retries++
          }

          if (!profileCreated) {
            // Profile still not created after retries, try manual creation
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: businessName.trim(),
                role: 'business',
              })

            if (createError) {
              console.error('Error creating profile manually:', createError)
              throw new Error('Account created but profile setup failed. Please contact support.')
            }

            // Now create business record
            const { error: businessError } = await supabase
              .from('businesses')
              .insert({
                user_id: data.user.id,
                business_name: businessName.trim(),
                business_type: businessType,
                email: email.trim(),
              })

            if (businessError) {
              console.error('Error creating business:', businessError)
              throw new Error(`Failed to create business profile: ${businessError.message}`)
            }

            setMessage('Business account created! Please check your email to verify your account.')
          }
        }
      } else {
        // Sign in
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials.')
          } else if (authError.message.includes('Email not confirmed')) {
            throw new Error('Please verify your email address. Check your inbox for the verification link.')
          }
          throw authError
        }

        if (!data.user) {
          throw new Error('Sign in failed. Please try again.')
        }

        // Wait a moment for profile to be available
        await new Promise(resolve => setTimeout(resolve, 300))

        // Check if user is a business
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          throw new Error('Unable to verify account type. Please try again.')
        }

        if (!profile || profile.role !== 'business') {
          await supabase.auth.signOut()
          throw new Error('This account is not a business account. Please use the player login.')
        }

        // Redirect to dashboard
        window.location.href = '/business/dashboard'
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">WanderBeasts</h1>
          <p className="text-gray-400">Business Portal</p>
        </div>

        <div className="bg-surface rounded-2xl p-6 shadow-xl">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isSignUp
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isSignUp
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Register Business
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your Business Name"
                    required={isSignUp}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="shop">Shop</option>
                    <option value="attraction">Attraction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="business@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : isSignUp ? 'Register Business' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          <a href="/" className="text-primary hover:underline">Back to Player App</a>
        </p>
      </div>
    </div>
  )
}

