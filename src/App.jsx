import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, checkEnvVars } from './lib/supabase.js'
import Map from './components/Map.jsx'
import Collection from './components/Collection.jsx'
import SearchBar from './components/SearchBar.jsx'
import Profile from './components/Profile.jsx'
import Auth from './components/Auth.jsx'
import BottomNav from './components/BottomNav.jsx'
import BusinessAuth from './components/BusinessAuth.jsx'
import BusinessDashboard from './components/BusinessDashboard.jsx'
import Vouchers from './components/Vouchers.jsx'

function App() {
  // Check environment variables immediately
  const envCheck = checkEnvVars()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [configError] = useState(envCheck.error ? envCheck : null)

  useEffect(() => {
    // Don't initialize if there's a config error
    if (configError) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        checkUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Handle email verification from URL hash
    const handleEmailVerification = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken && type === 'recovery') {
        const { data: { session } } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (session) {
          setSession(session)
          checkUserRole(session.user.id)
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } else if (accessToken && refreshToken) {
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (session) {
          setSession(session)
          checkUserRole(session.user.id)
          window.history.replaceState({}, document.title, window.location.pathname)
        } else if (error) {
          console.error('Error setting session:', error)
        }
      }
    }

    handleEmailVerification()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session) {
        checkUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [configError])

  const checkUserRole = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      setUserRole(profile?.role || 'player')
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRole('player')
    } finally {
      setLoading(false)
    }
  }

  // Show configuration error if environment variables are missing
  if (configError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <div className="max-w-md w-full bg-surface rounded-lg p-6 border-2 border-red-500">
          <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Configuration Error</h1>
          <p className="text-text mb-4">{configError.message}</p>
          <div className="bg-background rounded p-4 mb-4">
            <p className="text-text text-sm font-mono mb-2">Missing variables:</p>
            <ul className="list-disc list-inside text-text text-sm space-y-1">
              {configError.missing.map((varName) => (
                <li key={varName} className="text-red-300">{varName}</li>
              ))}
            </ul>
          </div>
          <div className="bg-background rounded p-4">
            <p className="text-text text-sm mb-2">Please update your <code className="bg-black/30 px-1 rounded">.env</code> file in the root directory with:</p>
            <pre className="text-xs text-text bg-black/30 p-2 rounded overflow-x-auto">
{configError.missing.includes('VITE_SUPABASE_URL') && 'VITE_SUPABASE_URL=your_supabase_url\n'}
{configError.missing.includes('VITE_SUPABASE_ANON_KEY') && 'VITE_SUPABASE_ANON_KEY=your_anon_key\n'}
{configError.missing.includes('VITE_MAPBOX_TOKEN') && 'VITE_MAPBOX_TOKEN=your_mapbox_token\n'}
            </pre>
            <p className="text-text text-xs mt-2 text-yellow-300">
              ⚠️ Important: Variables MUST start with <code className="bg-black/30 px-1 rounded">VITE_</code> prefix to be accessible in Vite.
            </p>
          </div>
          <div className="bg-background rounded p-4 mt-4">
            <p className="text-text text-sm font-semibold mb-2">Steps to fix:</p>
            <ol className="list-decimal list-inside text-text text-sm space-y-1">
              <li>Open the <code className="bg-black/30 px-1 rounded">.env</code> file in the root directory</li>
              <li>Add the missing variables (one per line, no spaces around =)</li>
              <li>Make sure each variable starts with <code className="bg-black/30 px-1 rounded">VITE_</code></li>
              <li>Save the file</li>
              <li>Stop the dev server (Ctrl+C) and restart it with <code className="bg-black/30 px-1 rounded">npm run dev</code></li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text">Loading WanderBeasts...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/business" element={<BusinessAuth />} />
          <Route path="/business/*" element={<BusinessAuth />} />
          <Route path="*" element={<Auth />} />
        </Routes>
      </Router>
    )
  }

  // Business routes
  if (userRole === 'business') {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/business" element={<BusinessAuth />} />
          <Route path="/business/dashboard" element={<BusinessDashboard />} />
          <Route path="*" element={<Navigate to="/business/dashboard" replace />} />
        </Routes>
      </Router>
    )
  }

  // Player routes
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/collection" element={<CollectionView />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/vouchers" element={<VouchersView />} />
          <Route path="/business" element={<BusinessAuth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}

function MapView() {
  return (
    <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
      <Map />
    </div>
  )
}

function CollectionView() {
  return (
    <div className="flex-1 overflow-y-auto retro-green-background pb-24" style={{ minHeight: 0, maxHeight: '100%' }}>
      <div className="p-4 md:p-6 lg:p-8">
        <Collection />
      </div>
    </div>
  )
}

function SearchView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 retro-green-background pb-24">
      <SearchBar />
    </div>
  )
}

function ProfileView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24">
      <Profile />
    </div>
  )
}

function VouchersView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 retro-green-background pb-24">
      <Vouchers />
    </div>
  )
}

export default App
