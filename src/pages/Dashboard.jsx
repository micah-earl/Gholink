import { useState, useEffect } from 'react'
import { Trophy, Users, TrendingUp, Target, ArrowUpRight, ChevronDown, ChevronRight, Network } from 'lucide-react'
import { supabase } from '../lib/supabase'
import DashboardCard from '../components/ui/DashboardCard'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [recruits, setRecruits] = useState([])
  const [chain, setChain] = useState([])
  const [loading, setLoading] = useState(true)
  const [referralTree, setReferralTree] = useState([])
  const [expandedNodes, setExpandedNodes] = useState(new Set())

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
      setReferralTree(treeData || [])

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

  // Build tree structure from flat array
  const buildTree = (nodes, rootId) => {
    const nodeMap = {}
    nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] }
    })

    const roots = []
    nodes.forEach(node => {
      if (node.parent_id === rootId) {
        roots.push(nodeMap[node.id])
      } else if (nodeMap[node.parent_id]) {
        nodeMap[node.parent_id].children.push(nodeMap[node.id])
      }
    })

    return roots
  }

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Render tree node
  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isCurrentUser = node.id === profile?.id

    return (
      <div key={node.id} style={{ marginLeft: `${level * 24}px` }} className="my-1">
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border-3 transition-all transform hover:scale-[1.02] ${
            isCurrentUser
              ? 'bg-gradient-to-r from-gholink-blue to-gholink-blue-dark text-white border-gholink-blue-dark shadow-lg'
              : 'bg-white hover:bg-gray-50 border-gray-300 shadow-md'
          }`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown size={20} className={isCurrentUser ? 'text-white' : 'text-gray-600'} />
              ) : (
                <ChevronRight size={20} className={isCurrentUser ? 'text-white' : 'text-gray-600'} />
              )}
            </button>
          )}

          <div className={`w-10 h-10 rounded-full ${
            isCurrentUser ? 'bg-white/20' : 'bg-gholink-blue/10'
          } flex items-center justify-center flex-shrink-0`}>
            <Users size={20} className={isCurrentUser ? 'text-white' : 'text-gholink-blue'} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-black ${isCurrentUser ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>
                {isCurrentUser ? 'You' : (node.display_name || `User ${node.referral_code?.slice(0, 4)}`)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                isCurrentUser 
                  ? 'bg-white/20 text-white' 
                  : node.role === 'recruiter'
                  ? 'bg-gholink-blue/20 text-gholink-blue'
                  : 'bg-green-100 text-green-700'
              }`}>
                {node.role}
              </span>
            </div>
            <div className={`text-sm font-semibold ${isCurrentUser ? 'text-white/90' : 'text-gray-500'}`}>
              Code: {node.referral_code} • {node.points || 0} pts
            </div>
          </div>

          {hasChildren && (
            <div className={`text-sm font-bold ${isCurrentUser ? 'text-white/90' : 'text-gray-600'} bg-gray-100 px-3 py-1 rounded-full`}>
              {node.children.length} recruit{node.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
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
      {/* Header with gradient background */}
      <div className="mb-6 md:mb-8 bg-gradient-to-r from-gholink-blue to-gholink-blue-dark rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border-b-4 md:border-b-8 border-gholink-blue-dark">
        <h1 className="text-2xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
        </h1>
        <p className="text-white/90 text-sm md:text-lg">Here's your recruiting overview</p>
      </div>

      {/* Stats Cards - Duolingo Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-gholink-blue to-gholink-blue-dark text-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue-dark transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl">
              <Trophy className="text-white" size={24} />
            </div>
          </div>
          <p className="text-xs md:text-sm text-white/80 mb-1 font-bold">Total Points</p>
          <p className="text-2xl md:text-4xl font-black mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {profile?.points?.toLocaleString() || '0'}
          </p>
          <p className="text-[10px] md:text-xs text-white/70">Keep recruiting!</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gray-300 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="p-2 md:p-3 bg-gholink-blue/10 rounded-xl md:rounded-2xl">
              <Users className="text-gholink-blue" size={24} />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1 font-bold">Total Recruits</p>
          <p className="text-2xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {totalRecruits}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500">{acceptedRecruits} accepted</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-green-400 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-2xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1 font-bold">Success Rate</p>
          <p className="text-2xl md:text-4xl font-black text-green-600 mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {inviteSuccessRate}%
          </p>
          <p className="text-[10px] md:text-xs text-gray-500">Acceptance rate</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-orange-400 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="p-2 md:p-3 bg-orange-100 rounded-xl md:rounded-2xl">
              <Target className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1 font-bold">Action Items</p>
          <p className="text-2xl md:text-4xl font-black text-orange-600 mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {pendingRecruits}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500">Pending invites</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 border-b-4 md:border-b-8 border-gholink-blue/30">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <div className="p-1.5 md:p-2 bg-gholink-blue/10 rounded-lg md:rounded-xl">
                <Network size={20} className="text-gholink-blue md:w-7 md:h-7" />
              </div>
              Your Referral Chain
            </h3>
            
            {referralTree.length > 0 ? (
              <div className="space-y-2">
                {buildTree(referralTree, profile?.id).map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Users className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 mb-2 text-xl font-bold">No recruits yet</p>
                <p className="text-sm text-gray-400">Share your referral link to start building your network!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue/30">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              <div className="p-1.5 md:p-2 bg-gholink-blue/10 rounded-lg md:rounded-xl">
                <Users className="text-gholink-blue" size={18} />
              </div>
              <span className="hidden sm:inline">Recent Activity</span>
              <span className="sm:hidden">Activity</span>
            </h3>
            <button className="text-xs md:text-sm text-gholink-blue font-bold flex items-center gap-1 hover:underline">
              <span className="hidden sm:inline">View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {recruits.slice(0, 5).map((recruit) => (
              <div key={recruit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gholink-blue/10 rounded-full flex items-center justify-center">
                    <Users size={18} className="text-gholink-blue" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {recruit.display_name || 'New Recruit'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(recruit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  recruit.role === 'recruited' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {recruit.role}
                </span>
              </div>
            ))}
            {recruits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats - Changed to Blue */}
        <div className="bg-gradient-to-br from-gholink-blue to-gholink-blue-dark rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue-dark text-white">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <TrendingUp size={20} />
            Network Growth
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur">
              <span className="font-semibold">Direct Recruits</span>
              <span className="text-2xl font-black">{recruits.filter(r => r.level === 1).length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur">
              <span className="font-semibold">Total Network</span>
              <span className="text-2xl font-black">{referralTree.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur">
              <span className="font-semibold">This Month</span>
              <span className="text-2xl font-black text-green-300">+{recruits.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

