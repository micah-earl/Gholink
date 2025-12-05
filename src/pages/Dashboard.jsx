import { useState, useEffect } from 'react'
import { Trophy, Users, TrendingUp, Target, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import DashboardCard from '../components/ui/DashboardCard'
import ChainTrace from '../components/ui/ChainTrace'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [recruits, setRecruits] = useState([])
  const [chain, setChain] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user from users table with display_name from auth
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Add display_name from auth metadata
      if (userData) {
        userData.display_name = user.user_metadata?.display_name || user.email
        userData.email = user.email
      }

      setProfile(userData)

      // Load recruits using the updated get_referral_tree function
      const { data: treeData } = await supabase
        .rpc('get_referral_tree', { recruiter_id: user.id })

      // Filter to only direct children (level 1)
      const directRecruits = treeData?.filter(node => node.level === 1) || []
      setRecruits(directRecruits)

      // Load recruit chain (simplified - you'd need to traverse the tree)
      await loadRecruitChain(user.id)

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecruitChain = async (userId) => {
    // This is a simplified version - in production, you'd traverse the full tree
    try {
      const { data } = await supabase
        .from('recruits')
        .select(`
          *,
          recruiter:profiles!recruits_recruiter_id_fkey(display_name, email)
        `)
        .eq('recruit_id', userId)
        .limit(1)

      if (data && data.length > 0) {
        const recruiter = data[0].recruiter
        setChain([
          { name: recruiter?.display_name || recruiter?.email, email: recruiter?.email }
        ])
      }
    } catch (error) {
      console.error('Error loading chain:', error)
    }
  }

  const totalRecruits = recruits.length
  const acceptedRecruits = recruits.filter(r => r.status === 'accepted').length
  const pendingRecruits = recruits.filter(r => r.status === 'pending').length
  const inviteSuccessRate = totalRecruits > 0 
    ? Math.round((acceptedRecruits / totalRecruits) * 100) 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-gholink-blue">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}! 👋
        </h1>
        <p className="text-gray-600">Here's your recruiting overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Points"
          value={profile?.points?.toLocaleString() || '0'}
          icon={Trophy}
          subtitle="Keep recruiting!"
          className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white"
        />
        <DashboardCard
          title="Total Recruits"
          value={totalRecruits}
          icon={Users}
          subtitle={`${acceptedRecruits} accepted, ${pendingRecruits} pending`}
          className="bg-gradient-to-br from-gholink-blue to-gholink-blue-dark text-white"
        />
        <DashboardCard
          title="Success Rate"
          value={`${inviteSuccessRate}%`}
          icon={TrendingUp}
          subtitle="Invite acceptance rate"
        />
        <DashboardCard
          title="Action Items"
          value={pendingRecruits}
          icon={Target}
          subtitle="Pending invites to follow up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruit Chain Trace */}
        <div className="lg:col-span-2">
          <ChainTrace chain={chain} />
        </div>

        {/* Recent Activity Placeholder */}
        <div className="duolingo-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-gholink-blue font-semibold flex items-center gap-1 hover:underline">
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recruits.slice(0, 5).map((recruit) => (
              <div key={recruit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {recruit.invite_email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {recruit.status === 'accepted' ? 'Accepted' : 'Pending'} • {new Date(recruit.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  recruit.status === 'accepted' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {recruit.status}
                </span>
              </div>
            ))}
            {recruits.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No activity yet. Start recruiting to see your activity here!
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Chart Placeholder */}
        <div className="duolingo-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recruiting Growth</h3>
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gholink-blue/10 to-gholink-cyan/10 rounded-lg">
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

