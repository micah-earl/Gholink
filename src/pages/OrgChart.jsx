import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, ChevronDown, ChevronRight, Network } from 'lucide-react'

const PedigreeNode = ({ node, isCurrentUser = false, isUpline = false }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node Card - Duolingo Style */}
      <div
        className={`relative px-6 py-4 rounded-3xl border-b-4 min-w-[240px] ${
          isCurrentUser
            ? 'bg-gradient-to-br from-gholink-blue to-gholink-blue-dark text-white border-gholink-blue-dark shadow-2xl scale-110'
            : isUpline
            ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 shadow-lg'
            : 'bg-white border-gray-400 shadow-lg hover:shadow-xl'
        } transition-all duration-200`}
      >
        <div className="flex items-start gap-3">
          <Users className={`w-6 h-6 mt-1 ${isCurrentUser ? 'text-white' : isUpline ? 'text-purple-600' : 'text-gholink-blue'}`} />
          <div className="flex-1">
            <div className={`font-black text-base ${isCurrentUser ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>
              {isCurrentUser ? 'You' : (node.display_name || node.name || `User ${node.referral_code?.slice(0, 4) || 'Unknown'}`)}
            </div>
            {node.email && (
              <div className={`text-xs mt-1 font-semibold ${isCurrentUser ? 'text-blue-100' : isUpline ? 'text-purple-700' : 'text-gray-600'}`}>
                {node.email}
              </div>
            )}
            <div className={`text-xs mt-1 font-semibold ${isCurrentUser ? 'text-blue-200' : isUpline ? 'text-purple-600' : 'text-gray-500'}`}>
              {node.role} • {node.referral_code}
            </div>
            {hasChildren && !isUpline && (
              <div className={`text-xs mt-2 font-bold ${isCurrentUser ? 'text-blue-200' : 'text-gray-600'}`}>
                ↓ {node.children.length} recruit{node.children.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        
        {/* Toggle button for downline */}
        {hasChildren && !isUpline && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 p-1.5 rounded-full border-3 ${
              isCurrentUser 
                ? 'bg-white text-gholink-blue border-white shadow-lg' 
                : 'bg-gholink-blue text-white border-gholink-blue shadow-lg'
            } hover:scale-110 transition-transform shadow-md`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Vertical connecting line to children */}
      {hasChildren && isExpanded && !isUpline && (
        <>
          <div className="w-0.5 h-8 bg-gray-300"></div>
          
          {/* Single child display (direct line only) */}
          {node.children.map((child, index) => (
            <div key={child.id}>
              <PedigreeNode node={child} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default function OrgChart() {
  const [loading, setLoading] = useState(true)
  const [uplineData, setUplineData] = useState([])
  const [downlineTree, setDownlineTree] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrgChart()
  }, [])

  const fetchOrgChart = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // Fetch the complete referral tree (upline and downline)
      const { data: treeData, error: treeError } = await supabase.rpc('get_complete_referral_tree', {
        user_id: user.id
      })
      if (treeError) throw treeError

      // Enrich tree data with display_name (already included from get_complete_referral_tree if updated)
      // Or fetch from users table if needed
      const userIds = treeData?.map(u => u.id) || []
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, referral_code')
        .in('id', userIds)

      // Build map of user details
      const userDetailsMap = {}
      if (usersData && !usersError) {
        usersData.forEach(userData => {
          userDetailsMap[userData.id] = {
            name: userData.display_name || `User ${userData.referral_code?.slice(0, 4)}`,
            display_name: userData.display_name
          }
        })
      }

      // Add current user's info
      userDetailsMap[user.id] = {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        email: user.email
      }

      // Enrich tree data with names
      const enrichedTreeData = treeData?.map(node => ({
        ...node,
        name: userDetailsMap[node.id]?.name || `User ${node.referral_code?.slice(0, 4)}`,
        display_name: userDetailsMap[node.id]?.display_name || node.display_name,
        email: userDetailsMap[node.id]?.email
      }))

      // Separate upline and downline
      const currentUserNode = enrichedTreeData?.find(u => u.id === user.id)
      if (!currentUserNode) {
        throw new Error('User not found in tree')
      }

      // Build upline (traverse parent_id backwards)
      const upline = []
      let currentParentId = currentUserNode.parent_id
      while (currentParentId) {
        const parent = enrichedTreeData.find(u => u.id === currentParentId)
        if (parent) {
          upline.push(parent)
          currentParentId = parent.parent_id
        } else {
          break
        }
      }
      setUplineData(upline.reverse()) // Reverse so top recruiter is first

      // Build downline tree (everything below current user)
      const downlineNodes = enrichedTreeData?.filter(u => 
        u.level >= currentUserNode.level && 
        (u.id === user.id || isDescendant(u, user.id, enrichedTreeData))
      ) || []
      
      const tree = buildTree(downlineNodes, user.id)
      setDownlineTree(tree)

    } catch (err) {
      console.error('Error fetching org chart:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check if a node is a descendant of a given ancestor
  const isDescendant = (node, ancestorId, allNodes) => {
    let currentParentId = node.parent_id
    while (currentParentId) {
      if (currentParentId === ancestorId) return true
      const parent = allNodes.find(n => n.id === currentParentId)
      currentParentId = parent?.parent_id
    }
    return false
  }

  const buildTree = (nodes, rootId) => {
    // Create a map of id -> node with children array
    const nodeMap = {}
    nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] }
    })

    // Find root and build tree structure
    let root = null
    nodes.forEach(node => {
      if (node.id === rootId) {
        root = nodeMap[node.id]
      } else if (node.parent_id && nodeMap[node.parent_id]) {
        nodeMap[node.parent_id].children.push(nodeMap[node.id])
      }
    })

    return root
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Org Chart</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchOrgChart}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  const totalDownline = downlineTree ? countNodes(downlineTree) - 1 : 0 // -1 to exclude self

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Organization Chart</h1>
        <p className="text-lg text-gray-600">
          View your complete recruiter lineage and your recruit network
        </p>
      </div>

      {/* Stats - Duolingo Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-gholink-blue/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gholink-blue/10 rounded-2xl">
              <Users className="w-6 h-6 text-gholink-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-bold">Upline Levels</p>
              <p className="text-3xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>{uplineData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-green-400">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-2xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-bold">Total Recruits</p>
              <p className="text-3xl font-black text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{totalDownline}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-6 border-b-8 border-purple-400">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-2xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-bold">Direct Recruits</p>
              <p className="text-3xl font-black text-purple-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {downlineTree?.children?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pedigree Chart - Duolingo Style */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-8 border-b-8 border-gray-300">
        <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-2 justify-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <Network className="w-8 h-8 text-gholink-blue" />
          Organization Pedigree Chart
        </h2>
        
        <div className="overflow-x-auto pb-8">
          <div className="flex flex-col items-center min-w-max px-4">
            {/* Upline Chain */}
            {uplineData.length > 0 && (
              <>
                {uplineData.map((person, index) => (
                  <div key={person.id} className="flex flex-col items-center">
                    <PedigreeNode node={person} isUpline={true} />
                    <div className="w-0.5 h-8 bg-purple-300"></div>
                  </div>
                ))}
              </>
            )}
            
            {/* Current User */}
            {downlineTree && (
              <PedigreeNode node={downlineTree} isCurrentUser={true} />
            )}
            
            {/* Empty state if no downline */}
            {!downlineTree && (
              <div className="text-center py-12 text-gray-500 mt-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No recruits yet</p>
                <p className="text-sm mt-2">Share your referral link to start building your team!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300"></div>
            <span className="text-gray-700">Upline (Your Recruiters)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-gholink-blue to-blue-600 border-2 border-gholink-blue"></div>
            <span className="text-gray-700">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-gray-300"></div>
            <span className="text-gray-700">Downline (Your Recruits)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to count total nodes in tree
function countNodes(node) {
  if (!node) return 0
  let count = 1
  if (node.children) {
    node.children.forEach(child => {
      count += countNodes(child)
    })
  }
  return count
}
