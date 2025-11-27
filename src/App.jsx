import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Recruit from './pages/Recruit'
import Leaderboards from './pages/Leaderboards'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import ReferralLanding from './pages/ReferralLanding'
import EmailConfirmation from './pages/EmailConfirmation'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets up the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-gholink-blue">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route 
          path="/signin" 
          element={session ? <Navigate to="/dashboard" replace /> : <SignIn />} 
        />
        <Route 
          path="/signup" 
          element={session ? <Navigate to="/dashboard" replace /> : <SignUp />} 
        />
        <Route 
          path="/email-confirmation" 
          element={<EmailConfirmation />} 
        />
        <Route 
          path="/join/:referral_code" 
          element={session ? <Navigate to="/dashboard" replace /> : <ReferralLanding />} 
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                  <Dashboard />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/recruit"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                  <Recruit />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/leaderboard"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 ml-64 p-8">
                  <Leaderboards />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App

