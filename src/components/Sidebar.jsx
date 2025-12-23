import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, User, LogOut, Shield, Network, ShoppingBag, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { isAdmin } from '../lib/referrals'

const Sidebar = () => {
  const location = useLocation()
  const [showAdmin, setShowAdmin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    { path: '/recruit', icon: Users, label: 'Invite' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/org-chart', icon: Network, label: 'Friend Chart' },
    { path: '/account', icon: User, label: 'Account' },
  ]

  if (showAdmin) {
    menuItems.push({ path: '/admin', icon: Shield, label: 'Admin' })
  }

  // Mobile: First 3 items shown, rest in hamburger menu
  const mobileMainItems = menuItems.slice(0, 3)
  const mobileMenuItems = menuItems.slice(3)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
        <div className="flex flex-col h-full w-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <img src="/logo.svg" alt="Gholink" className="w-10 h-10 rounded-lg" />
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-20 px-2 py-2">
          {/* Main visible items (Dashboard, Recruit, Shop) */}
          {mobileMainItems.map((item) => {
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
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={26} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200 relative ${
              mobileMenuOpen ? 'text-gholink-blue' : 'text-gray-500'
            }`}
          >
            {mobileMenuOpen ? (
              <X size={26} className="stroke-[2.5]" />
            ) : (
              <Menu size={26} className="stroke-2" />
            )}
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute bottom-20 right-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50 min-w-[200px]">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                      isActive
                        ? 'bg-gholink-blue text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleSignOut()
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="font-semibold text-sm">Logout</span>
              </button>
            </div>
          </>
        )}
      </nav>
    </>
  )
}

export default Sidebar

