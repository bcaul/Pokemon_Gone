import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
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
  }, [])

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
      <Router>
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
      <Router>
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
    <Router>
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
    <div className="flex-1 overflow-y-auto retro-green-background" style={{ minHeight: 0, maxHeight: '100%' }}>
      <div className="p-4 md:p-6 lg:p-8">
        <Collection />
      </div>
    </div>
  )
}

function SearchView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 retro-green-background">
      <SearchBar />
    </div>
  )
}

function ProfileView() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <Profile />
    </div>
  )
}

function VouchersView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 retro-green-background">
      <Vouchers />
    </div>
  )
}

export default App
