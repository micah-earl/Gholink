import { useState, useEffect } from 'react'
import { Plus, Users, Clock, CheckCircle, Copy, Network, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import RecruitModal from '../components/ui/RecruitModal'
import InviteCard from '../components/ui/InviteCard'

const Recruit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recruits, setRecruits] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Referral system state
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [referralTree, setReferralTree] = useState([])
  const [copied, setCopied] = useState(false)
  const [directCount, setDirectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  useEffect(() => {
    loadRecruits()
    fetchReferralData()
  }, [])

  const loadRecruits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('recruits')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecruits(data || [])
    } catch (error) {
      console.error('Error loading recruits:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch referral data
  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        return
      }

      setUserData(userData)

      // Fetch referral tree
      const { data: treeData, error: treeError } = await supabase
        .rpc('get_referral_tree', { recruiter_id: user.id })

      if (treeError) {
        console.error('Error fetching referral tree:', treeError)
      } else {
        setReferralTree(treeData || [])
        
        const direct = treeData?.filter(u => u.parent_id === user.id).length || 0
        const total = (treeData?.length || 1) - 1
        
        setDirectCount(direct)
        setTotalCount(total)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleInviteSuccess = () => {
    loadRecruits()
    fetchReferralData()
  }

  // Copy referral link
  const copyReferralLink = () => {
    if (!userData?.referral_code) return
    
    const link = `${window.location.origin}/join/${userData.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Toggle tree node
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Build tree structure
  const buildTree = (data, parentId = null) => {
    return data
      .filter(node => node.parent_id === parentId)
      .map(node => ({
        ...node,
        children: buildTree(data, node.id)
      }))
  }

  // Render tree node
  const renderTreeNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isCurrentUser = node.id === user?.id

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-gholink-blue text-white' 
              : 'bg-gray-50 hover:bg-gray-100'
          } transition-colors`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className={`flex-shrink-0 ${isCurrentUser ? 'text-white' : 'text-gray-500'}`}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className="w-[18px]" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {isCurrentUser ? 'You' : `User ${node.referral_code.slice(0, 4)}`}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                isCurrentUser 
                  ? 'bg-white/20 text-white' 
                  : node.role === 'recruiter'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {node.role}
              </span>
            </div>
            <div className={`text-sm ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
              Code: {node.referral_code}
            </div>
          </div>

          {hasChildren && (
            <div className={`text-sm ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
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

  const pendingRecruits = recruits.filter(r => r.status === 'pending')
  const acceptedRecruits = recruits.filter(r => r.status === 'accepted')
  const referralLink = userData ? `${window.location.origin}/join/${userData.referral_code}` : ''
  const treeData = buildTree(referralTree, null)

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Recruit & Referrals</h1>
          <p className="text-gray-600 text-lg">Invite people to join your network and grow your team</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-br from-gholink-blue to-gholink-blue-dark text-white px-6 py-3 rounded-3xl font-bold shadow-xl border-b-4 border-gholink-blue-dark hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus size={20} />
          Invite Recruit
        </button>
      </div>

      {/* Referral Link Section */}
      {userData && (
        <div className="bg-gradient-to-r from-gholink-blue to-gholink-blue-dark rounded-3xl shadow-xl p-6 border-b-8 border-gholink-blue-dark mb-8">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Network size={24} />
            Your Referral Link
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-white/20 rounded-2xl bg-white/10 text-white font-mono text-sm backdrop-blur placeholder-white/50"
            />
            <button
              onClick={copyReferralLink}
              className="bg-white text-gholink-blue px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
              <Copy size={18} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-white/90 mt-3 font-semibold">
            Share this link to recruit new members. Your code: <span className="font-black text-white bg-white/20 px-2 py-1 rounded">{userData.referral_code}</span>
          </p>
        </div>
      )}

      {/* Stats Summary - Duolingo Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-gholink-blue/30 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-bold">Total Invites</p>
              <p className="text-4xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>{recruits.length}</p>
            </div>
            <div className="p-3 bg-gholink-blue/10 rounded-2xl">
              <Users className="text-gholink-blue" size={32} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-orange-400 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-bold">Pending</p>
              <p className="text-4xl font-black text-orange-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{pendingRecruits.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-2xl">
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-green-400 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-bold">Direct Recruits</p>
              <p className="text-4xl font-black text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{directCount}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-2xl">
              <Users className="text-green-600" size={32} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-gray-300 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-bold">Total Network</p>
              <p className="text-4xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>{totalCount}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-2xl">
              <Network className="text-gray-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-b-8 border-gholink-blue/30 mb-8">
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <div className="p-2 bg-gholink-blue/10 rounded-xl">
            <Network size={28} className="text-gholink-blue" />
          </div>
          Your Referral Tree
        </h3>
        
        {/* Recruiter's Link (if user was recruited) */}
        {userData?.parent_id && (
          <div className="mb-6 p-6 bg-gradient-to-r from-gholink-blue/10 to-gholink-blue/5 border-2 border-gholink-blue/30 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-gholink-blue" />
              <p className="text-sm font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>Recruited By</p>
            </div>
            <p className="text-sm text-gray-600 mb-3 font-semibold">
              You were recruited by: <span className="font-black text-gholink-blue">
                {referralTree.find(u => u.id === userData.parent_id)?.referral_code || 'Your Recruiter'}
              </span>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralTree.find(u => u.id === userData.parent_id)?.referral_code 
                  ? `${window.location.origin}/join/${referralTree.find(u => u.id === userData.parent_id)?.referral_code}`
                  : 'Loading...'}
                readOnly
                className="flex-1 px-3 py-2 border-2 border-gholink-blue/20 rounded-xl bg-white text-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => {
                  const parentCode = referralTree.find(u => u.id === userData.parent_id)?.referral_code
                  if (parentCode) {
                    navigator.clipboard.writeText(`${window.location.origin}/join/${parentCode}`)
                  }
                }}
                className="px-4 py-2 bg-gholink-blue text-white rounded-xl hover:bg-gholink-blue-dark transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
        )}
        
        {referralTree.length > 0 ? (
          <div className="space-y-2">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <Users className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 mb-2 text-xl font-bold">No recruits yet</p>
            <p className="text-sm text-gray-400">Share your referral link to start building your network!</p>
          </div>
        )}
      </div>

      {/* Pending Recruits */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Clock className="text-orange-600" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>Pending Invites</h2>
          <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-black">
            {pendingRecruits.length}
          </span>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingRecruits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRecruits.map((recruit) => (
              <InviteCard key={recruit.id} recruit={recruit} status="pending" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-16 border-b-8 border-gray-300 text-center">
            <Users className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 mb-2 text-xl font-bold">No pending invites</p>
            <p className="text-sm text-gray-400">Invite someone to get started!</p>
          </div>
        )}
      </div>

      {/* Accepted Recruits */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-xl">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>Accepted Recruits</h2>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-black">
            {acceptedRecruits.length}
          </span>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : acceptedRecruits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedRecruits.map((recruit) => (
              <InviteCard key={recruit.id} recruit={recruit} status="accepted" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-16 border-b-8 border-gray-300 text-center">
            <CheckCircle className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 mb-2 text-xl font-bold">No accepted recruits yet</p>
            <p className="text-sm text-gray-400">When someone accepts your invite, they'll appear here</p>
          </div>
        )}
      </div>

      <RecruitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  )
}

export default Recruit

