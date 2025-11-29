import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, ChevronDown, ChevronRight, Network } from 'lucide-react'

const PedigreeNode = ({ node, isCurrentUser = false, isUpline = false }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={`relative px-6 py-4 rounded-xl border-2 min-w-[240px] ${
          isCurrentUser
            ? 'bg-gradient-to-br from-gholink-blue to-blue-600 text-white border-gholink-blue shadow-xl scale-110'
            : isUpline
            ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 shadow-md'
            : 'bg-white border-gray-300 shadow-md hover:shadow-lg'
        } transition-all duration-200`}
      >
        <div className="flex items-start gap-3">
          <Users className={`w-6 h-6 mt-1 ${isCurrentUser ? 'text-white' : isUpline ? 'text-purple-600' : 'text-gholink-blue'}`} />
          <div className="flex-1">
            <div className={`font-bold text-base ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
              {isCurrentUser ? 'You' : (node.name || `User ${node.referral_code?.slice(0, 4) || 'Unknown'}`)}
            </div>
            {node.email && (
              <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : isUpline ? 'text-purple-700' : 'text-gray-600'}`}>
                {node.email}
              </div>
            )}
            <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : isUpline ? 'text-purple-600' : 'text-gray-500'}`}>
              {node.role} • {node.referral_code}
            </div>
            {hasChildren && !isUpline && (
              <div className={`text-xs mt-2 font-medium ${isCurrentUser ? 'text-blue-200' : 'text-gray-600'}`}>
                ↓ {node.children.length} recruit{node.children.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        
        {/* Toggle button for downline */}
        {hasChildren && !isUpline && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 p-1.5 rounded-full border-2 ${
              isCurrentUser 
                ? 'bg-white text-gholink-blue border-white' 
                : 'bg-gray-100 text-gray-600 border-gray-300'
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

      // Fetch user names and emails from profiles table
      const userIds = treeData?.map(u => u.id) || []
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds)

      // Build map of user details
      const userDetailsMap = {}
      if (profiles && !profilesError) {
        profiles.forEach(profile => {
          userDetailsMap[profile.id] = {
            name: profile.display_name || profile.email?.split('@')[0] || 'Unknown User',
            email: profile.email
          }
        })
      }

      // Add current user's info
      userDetailsMap[user.id] = {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
        email: user.email
      }

      // Enrich tree data with names
      const enrichedTreeData = treeData?.map(node => ({
        ...node,
        name: userDetailsMap[node.id]?.name || `User ${node.referral_code?.slice(0, 4)}`,
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Chart</h1>
        <p className="text-gray-600">
          View your complete recruiter lineage and your recruit network
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-gholink-blue" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upline Levels</p>
              <p className="text-2xl font-bold text-gray-900">{uplineData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Recruits</p>
              <p className="text-2xl font-bold text-gray-900">{totalDownline}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Direct Recruits</p>
              <p className="text-2xl font-bold text-gray-900">
                {downlineTree?.children?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pedigree Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2 justify-center">
          <Network className="w-6 h-6 text-gholink-blue" />
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
