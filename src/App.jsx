import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Feed from './pages/Feed'
import Recruit from './pages/Recruit'
import Leaderboard from './pages/Leaderboard'
import OrgChart from './pages/OrgChart'
import Shop from './pages/Shop'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Landing from './pages/Landing'
import ReferralLanding from './pages/ReferralLanding'
import EmailConfirmation from './pages/EmailConfirmation'
import Admin from './pages/Admin/Admin'
import Recruiters from './pages/Admin/Recruiters'
import Account from './pages/Account'
import Explore from './pages/Explore'
import Messages from './pages/Messages'

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
        <Route path="/" element={session ? <Navigate to="/feed" replace /> : <Landing />} />
        <Route 
          path="/signin" 
          element={session ? <Navigate to="/feed" replace /> : <SignIn />} 
        />
        <Route 
          path="/signup" 
          element={session ? <Navigate to="/feed" replace /> : <SignUp />} 
        />
        <Route 
          path="/email-confirmation" 
          element={<EmailConfirmation />} 
        />
        <Route 
          path="/join/:referral_code" 
          element={session ? <Navigate to="/feed" replace /> : <ReferralLanding />} 
        />
        <Route
          path="/feed"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Feed />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
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
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
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
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Leaderboard />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/org-chart"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <OrgChart />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Admin />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/recruiters"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Recruiters />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/shop"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Shop />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/account"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Account />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/explore"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Explore />
                </main>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/messages"
          element={
            session ? (
              <div className="flex min-h-screen bg-gray-50">
                <BottomNav />
                <main className="flex-1 p-4 md:p-8 pb-24">
                  <Messages />
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

