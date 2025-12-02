import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, User, LogOut, Shield, Network } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { isAdmin } from '../lib/referrals'

const Sidebar = () => {
  const location = useLocation()
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔍 Checking admin for user:', user?.id)
      if (user) {
        const adminStatus = await isAdmin(user.id)
        console.log('✅ Admin status:', adminStatus)
        setShowAdmin(adminStatus)
      }
    } catch (err) {
      console.error('❌ Error checking admin:', err)
    }
  }

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/recruit', icon: Users, label: 'Recruit' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/org-chart', icon: Network, label: 'Org Chart' },
    { path: '/account', icon: User, label: 'Account' },
  ]

  if (showAdmin) {
    menuItems.push({ path: '/admin', icon: Shield, label: 'Admin' })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <img src="/logo.png" alt="Gholink" className="w-10 h-10 rounded-lg" onError={(e) => { e.target.src = '/logo.svg' }} />
          <h1 className="text-2xl font-bold text-gholink-blue">Gholink</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gholink-blue text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

