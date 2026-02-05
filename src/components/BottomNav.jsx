import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  User, 
  LogOut, 
  Shield, 
  Network, 
  ShoppingBag, 
  Compass,
  MessageCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { isAdmin } from '../lib/referrals'

const BottomNav = () => {
  const location = useLocation()
  const [showAdmin, setShowAdmin] = useState(false)
  // Toggle state: false = content-focused nav (default), true = existing nav
  const [isExistingNav, setIsExistingNav] = useState(false)

  useEffect(() => {
    checkAdmin()
    // Load toggle state from localStorage if it exists
    const savedNavMode = localStorage.getItem('navMode')
    if (savedNavMode === 'existing') {
      setIsExistingNav(true)
    }
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const adminStatus = await isAdmin(user.id)
        setShowAdmin(adminStatus)
      }
    } catch (err) {
      console.error('Error checking admin:', err)
    }
  }

  // Mode 2: Existing navigation items
  const existingNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/recruit', icon: Users, label: 'Invite' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/org-chart', icon: Network, label: 'Friend Chart' },
    { path: '/account', icon: User, label: 'Account' },
  ]

  if (showAdmin) {
    existingNavItems.push({ path: '/admin', icon: Shield, label: 'Admin' })
  }

  // Mode 1: Content-focused navigation (Dashboard, Explore, Messaging)
  const contentNavItems = [
    { path: '/feed', icon: LayoutDashboard, label: 'Feed' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/account', icon: User, label: 'Account' },
  ]

  // Select current nav items based on mode
  const currentNavItems = isExistingNav ? existingNavItems : contentNavItems

  // Toggle between nav modes
  const handleLogoClick = () => {
    const newMode = !isExistingNav
    setIsExistingNav(newMode)
    // Persist toggle state
    localStorage.setItem('navMode', newMode ? 'existing' : 'content')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center h-20 px-2 py-2 max-w-screen-xl mx-auto">
        {/* Logo Toggle Button (Bottom-left) */}
        <button
          onClick={handleLogoClick}
          className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 mr-2 ${
            isExistingNav 
              ? 'bg-gholink-blue/10 hover:bg-gholink-blue/20' 
              : 'hover:bg-gray-100'
          }`}
          title={isExistingNav ? 'Switch to Content Nav' : 'Switch to Full Nav'}
        >
          <img 
            src="/logo.svg" 
            alt="Gholink" 
            className="w-8 h-8"
          />
        </button>

        {/* Navigation Items */}
        <div className="flex justify-around items-center flex-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200 ${
                  isActive
                    ? 'text-gholink-blue'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={24} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Sign Out Button (Right side) */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-14 h-14 rounded-xl hover:bg-red-50 text-red-600 transition-all duration-200 ml-2"
          title="Sign Out"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
