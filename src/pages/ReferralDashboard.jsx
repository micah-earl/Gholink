import { useState, useEffect } from 'react'
import { Copy, Users, Network, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Referral Dashboard Component
 * 
 * Displays:
 * 1. User's referral code and shareable link
 * 2. Statistics (direct recruits, total recruits)
 * 3. Full referral tree visualization
 */
const ReferralDashboard = () => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [referralTree, setReferralTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [directCount, setDirectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedNodes, setExpandedNodes] = useState(new Set())

  useEffect(() => {
    fetchUserData()
  }, [])

  // Fetch current user and their referral data
  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Get current user
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
        setLoading(false)
        return
      }

      setUserData(userData)

      // Fetch referral tree using RPC
      const { data: treeData, error: treeError } = await supabase
        .rpc('get_referral_tree', { recruiter_id: user.id })

      if (treeError) {
        console.error('Error fetching referral tree:', treeError)
      } else {
        setReferralTree(treeData || [])
        
        // Calculate counts
        const direct = treeData?.filter(u => u.parent_id === user.id).length || 0
        const total = (treeData?.length || 1) - 1 // Exclude self
        
        setDirectCount(direct)
        setTotalCount(total)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    if (!userData?.referral_code) return
    
    const link = `${window.location.origin}/join/${userData.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Toggle tree node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  // Build tree structure from flat array
  const buildTree = (data, parentId = null, currentLevel = 0) => {
    return data
      .filter(node => node.parent_id === parentId)
      .map(node => ({
        ...node,
        children: buildTree(data, node.id, currentLevel + 1)
      }))
  }

  // Render tree node recursively
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
          {/* Expand/Collapse Button */}
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

          {/* User Info */}
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

          {/* Children Count */}
          {hasChildren && (
            <div className={`text-sm ${isCurrentUser ? 'text-white/80' : 'text-gray-500'}`}>
              {node.children.length} recruit{node.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue"></div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No referral data found</p>
      </div>
    )
  }

  const referralLink = `${window.location.origin}/join/${userData.referral_code}`
  const treeData = buildTree(referralTree, null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
        <p className="text-gray-600">Share your referral link and grow your network</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Referral Code Card */}
        <div className="bg-white rounded-duolingo shadow-duolingo p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gholink-blue/10 rounded-lg">
              <Network className="text-gholink-blue" size={24} />
            </div>
            <h3 className="font-semibold text-gray-700">Your Referral Code</h3>
          </div>
          <p className="text-3xl font-bold text-gholink-blue mb-3">{userData.referral_code}</p>
          <button
            onClick={copyReferralLink}
            className="w-full duolingo-button flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Direct Recruits */}
        <div className="bg-white rounded-duolingo shadow-duolingo p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-700">Direct Recruits</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{directCount}</p>
          <p className="text-sm text-gray-500 mt-1">People you directly recruited</p>
        </div>

        {/* Total Network */}
        <div className="bg-white rounded-duolingo shadow-duolingo p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Network className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-700">Total Network</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalCount}</p>
          <p className="text-sm text-gray-500 mt-1">Your entire referral tree</p>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-duolingo shadow-duolingo p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Share Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-duolingo bg-gray-50 text-gray-700 font-mono text-sm"
          />
          <button
            onClick={copyReferralLink}
            className="duolingo-button flex items-center gap-2"
          >
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="bg-white rounded-duolingo shadow-duolingo p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Referral Tree</h3>
        
        {referralTree.length > 0 ? (
          <div className="space-y-2">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-2">No recruits yet</p>
            <p className="text-sm text-gray-400">Share your referral link to start building your network!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferralDashboard
