import { useState, useEffect } from 'react'
import React from 'react'
import { supabase } from '../lib/supabase'
import { Users, Network, X } from 'lucide-react'

// Modal Component for showing users in a ring
const RingModal = ({ isOpen, onClose, users, ringName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gholink-blue to-gholink-cyan p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{ringName}</h2>
            <p className="text-white/90 text-sm">{users.length} connection{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* User Cards Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(user => (
              <div 
                key={user.id}
                className="bg-white border-3 border-gholink-blue/30 rounded-2xl p-4 hover:border-gholink-blue hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {user.display_name || `User ${user.referral_code?.slice(0, 6)}`}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-gholink-blue/10 text-gholink-blue rounded-full font-bold">
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Code:</span>
                    <span className="text-gray-900 font-bold font-mono">{user.referral_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Points:</span>
                    <span className="text-gholink-blue font-black">{user.points || 0}</span>
                  </div>
                  {user.children && user.children.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">Connections:</span>
                      <span className="text-gray-900 font-bold">{user.children.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Community Rings Chart Component
const CommunityRingsChart = ({ tree, onRingClick }) => {
  if (!tree) return null

  const centerSize = 160
  const ringWidth = 80
  const maxDepth = getMaxDepth(tree)

  function getMaxDepth(node, depth = 0) {
    if (!node.children || node.children.length === 0) return depth
    return Math.max(...node.children.map(child => getMaxDepth(child, depth + 1)))
  }

  function countNodes(node) {
    if (!node.children || node.children.length === 0) return 1
    return node.children.reduce((sum, child) => sum + countNodes(child), 0)
  }

  const renderWedge = (node, startAngle, angleSpan, depth) => {
    const radius = centerSize / 2 + (depth * ringWidth)
    const outerRadius = radius + ringWidth
    const midAngle = startAngle + angleSpan / 2
    const midRadius = (radius + outerRadius) / 2

    // Calculate text position (keep horizontal)
    const textX = midRadius * Math.cos((midAngle * Math.PI) / 180)
    const textY = midRadius * Math.sin((midAngle * Math.PI) / 180)
    
    // Keep text horizontal (no rotation)
    let textRotation = 0

    // Create SVG path for the wedge
    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angleSpan) * Math.PI) / 180

    const x1 = radius * Math.cos(startRad)
    const y1 = radius * Math.sin(startRad)
    const x2 = outerRadius * Math.cos(startRad)
    const y2 = outerRadius * Math.sin(startRad)
    const x3 = outerRadius * Math.cos(endRad)
    const y3 = outerRadius * Math.sin(endRad)
    const x4 = radius * Math.cos(endRad)
    const y4 = radius * Math.sin(endRad)

    const largeArc = angleSpan > 180 ? 1 : 0

    const pathData = `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${radius} ${radius} 0 ${largeArc} 0 ${x1} ${y1}
      Z
    `

    // Gholink-style colors with gradients matching the app theme
    const colorSets = [
      { fill: '#4FC3F7', stroke: '#29B6F6', darker: '#00BCD4' }, // gholink-blue
      { fill: '#81D4FA', stroke: '#4FC3F7', darker: '#29B6F6' }, // light blue
      { fill: '#4DD0E1', stroke: '#00BCD4', darker: '#0097A7' }, // cyan
      { fill: '#FF9600', stroke: '#F57C00', darker: '#E65100' }, // orange
      { fill: '#CE82FF', stroke: '#BA68C8', darker: '#AB47BC' }, // purple
      { fill: '#29B6F6', stroke: '#039BE5', darker: '#0277BD' }, // dark blue
    ]
    const colorSet = colorSets[depth % colorSets.length]

    // Format name to fit
    const name = node.display_name || node.name || `User ${node.referral_code?.slice(0, 4)}`
    const shortName = name.length > 15 ? name.substring(0, 13) + '...' : name

    return (
      <g key={node.id}>
        {/* Wedge with gradient */}
        <defs>
          <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorSet.fill} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colorSet.darker} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        <path
          d={pathData}
          fill={`url(#grad-${node.id})`}
          stroke="white"
          strokeWidth="3"
          className="cursor-pointer hover:opacity-100 transition-all"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          onClick={() => onNodeClick && onNodeClick(node.id)}
        />
        
        {/* Border accent */}
        <path
          d={pathData}
          fill="none"
          stroke={colorSet.stroke}
          strokeWidth="2"
          className="pointer-events-none"
          opacity="0.4"
        />
        
        {/* Text label with white background for readability */}
        {angleSpan > 8 && (
          <g transform={`translate(${textX}, ${textY}) rotate(${textRotation})`}>
            {/* White background pill */}
            <rect
              x="-35"
              y="-8"
              width="70"
              height="16"
              rx="8"
              fill="white"
              fillOpacity="1"
              className="pointer-events-none"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] font-black fill-gray-900 pointer-events-none"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {shortName}
            </text>
          </g>
        )}

        {/* Render children */}
        {node.children && node.children.length > 0 && (() => {
          let childStartAngle = startAngle
          return node.children.map(child => {
            const childNodes = countNodes(child)
            const totalNodes = countNodes(node)
            const childSpan = (angleSpan * childNodes) / totalNodes
            const wedge = renderWedge(child, childStartAngle, childSpan, depth + 1)
            childStartAngle += childSpan
            return wedge
          })
        })()}
      </g>
    )
  }

  const svgSize = centerSize + (maxDepth + 1) * ringWidth * 2
  const centerX = svgSize / 2
  const centerY = svgSize / 2

  return (
    <div className="flex items-center justify-center w-full py-8">
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="max-w-full"
        style={{ maxHeight: '600px' }}
      >
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Render all wedges */}
          {tree.children && tree.children.length > 0 && (() => {
            let startAngle = -90 // Start from top
            return tree.children.map(child => {
              const childNodes = countNodes(child)
              const totalNodes = tree.children.reduce((sum, c) => sum + countNodes(c), 0)
              const angleSpan = (360 * childNodes) / totalNodes
              const wedge = renderWedge(child, startAngle, angleSpan, 0)
              startAngle += angleSpan
              return wedge
            })
          })()}

          {/* Center circle - Current User */}
          <defs>
            <linearGradient id="gradient-center" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FC3F7" />
              <stop offset="100%" stopColor="#00BCD4" />
            </linearGradient>
            <filter id="shadow-center">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <circle
            cx="0"
            cy="0"
            r={centerSize / 2}
            fill="url(#gradient-center)"
            filter="url(#shadow-center)"
            className="cursor-pointer hover:scale-105 transition-transform"
            onClick={onCenterClick}
          />
          
          {/* White inner circle for contrast */}
          <circle
            cx="0"
            cy="0"
            r={centerSize / 2 - 4}
            fill="none"
            stroke="white"
            strokeWidth="3"
            opacity="0.3"
            className="pointer-events-none"
          />

          {/* User icon and text in center */}
          <g className="pointer-events-none">
            {/* Avatar background */}
            <circle cx="0" cy="-18" r="22" fill="white" fillOpacity="0.25" />
            
            {/* User icon */}
            <circle cx="0" cy="-18" r="18" fill="white" fillOpacity="0.9" />
            <text
              x="0"
              y="-12"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl"
            >
              👤
            </text>
            
            {/* "YOU" text */}
            <text
              x="0"
              y="12"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-black fill-white"
              style={{ fontFamily: 'Nunito, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              YOU
            </text>
            
            {/* Direct recruits count */}
            {tree.children && tree.children.length > 0 && (
              <>
                <rect
                  x="-28"
                  y="24"
                  width="56"
                  height="18"
                  rx="9"
                  fill="white"
                  fillOpacity="0.3"
                />
                <text
                  x="0"
                  y="33"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-white"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {tree.children.length} direct
                </text>
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  )
}

// Linear Upline Node Component
const UplineNode = ({ node, onNodeClick }) => {
  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(node.id)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-gholink-blue rounded-lg shadow-sm min-w-[130px] max-w-[150px] cursor-pointer hover:shadow-md hover:scale-105 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gholink-blue border-2 border-gholink-blue-dark flex items-center justify-center flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[9px] text-gray-900 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {node.display_name || node.name || `User ${node.referral_code?.slice(0, 4)}`}
          </div>
          <div className="text-[7px] text-gholink-blue font-semibold">
            {node.role}
          </div>
        </div>
      </div>
      {/* Connecting line */}
      <div className="w-0.5 h-6 bg-gholink-blue/30"></div>
    </div>
  )
}

export default function OrgChart() {
  const [loading, setLoading] = useState(true)
  const [focusedUserId, setFocusedUserId] = useState(null)
  const [uplineData, setUplineData] = useState([])
  const [downlineTree, setDownlineTree] = useState(null)
  const [error, setError] = useState(null)
  const [allTreeData, setAllTreeData] = useState([])
  const [showUpline, setShowUpline] = useState(false)

  useEffect(() => {
    initializeChart()
  }, [])

  useEffect(() => {
    if (focusedUserId && allTreeData.length > 0) {
      rebuildChart(focusedUserId)
    }
  }, [focusedUserId])

  const initializeChart = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      setFocusedUserId(user.id)
      await fetchOrgChart(user.id)
    } catch (err) {
      console.error('Error initializing org chart:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrgChart = async (userId) => {
    try {
      const { data: treeData, error: treeError } = await supabase.rpc('get_complete_referral_tree', {
        user_id: userId
      })
      if (treeError) throw treeError

      const userIds = treeData?.map(u => u.id) || []
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, referral_code')
        .in('id', userIds)

      const userDetailsMap = {}
      if (usersData && !usersError) {
        usersData.forEach(userData => {
          userDetailsMap[userData.id] = {
            name: userData.display_name || `User ${userData.referral_code?.slice(0, 4)}`,
            display_name: userData.display_name
          }
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      userDetailsMap[user.id] = {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        email: user.email
      }

      const enrichedTreeData = treeData?.map(node => ({
        ...node,
        name: userDetailsMap[node.id]?.name || `User ${node.referral_code?.slice(0, 4)}`,
        display_name: userDetailsMap[node.id]?.display_name || node.display_name,
        email: userDetailsMap[node.id]?.email
      }))

      setAllTreeData(enrichedTreeData || [])
      rebuildChart(userId, enrichedTreeData)
    } catch (err) {
      console.error('Error fetching org chart:', err)
      setError(err.message)
    }
  }

  const rebuildChart = (userId, treeData = allTreeData) => {
    const currentUserNode = treeData.find(u => u.id === userId)
    if (!currentUserNode) return

    // Build upline (limited to 3 levels)
    const upline = []
    let currentParentId = currentUserNode.parent_id
    let depth = 0
    while (currentParentId && depth < 3) {
      const parent = treeData.find(u => u.id === currentParentId)
      if (parent) {
        upline.push(parent)
        currentParentId = parent.parent_id
        depth++
      } else {
        break
      }
    }
    setUplineData(upline.reverse())

    // Build downline tree
    const downlineNodes = treeData.filter(u => 
      u.level >= currentUserNode.level && 
      (u.id === userId || isDescendant(u, userId, treeData))
    )
    
    const tree = buildTree(downlineNodes, userId)
    setDownlineTree(tree)
  }

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
    const nodeMap = {}
    nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] }
    })

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

  const handleNodeClick = (nodeId) => {
    setFocusedUserId(nodeId)
    setShowUpline(false)
  }

  const handleCenterClick = () => {
    setShowUpline(!showUpline)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading friend chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Friend Chart</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={initializeChart}
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Friend Chart</h1>
        <p className="text-sm md:text-lg text-gray-600">
          View your recruitment network - click any person to re-center the chart
        </p>
      </div>

      {/* Stats - Duolingo Style */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-gholink-blue/30">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-gholink-blue/10 rounded-xl md:rounded-2xl">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-gholink-blue" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-bold">Upline Levels</p>
              <p className="text-2xl md:text-3xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>{uplineData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-green-400">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-2xl">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-bold">Total Recruits</p>
              <p className="text-2xl md:text-3xl font-black text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{totalDownline}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-purple-400">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-purple-100 rounded-xl md:rounded-2xl">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600 font-bold">Direct Recruits</p>
              <p className="text-2xl md:text-3xl font-black text-purple-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {downlineTree?.children?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Radial Chart with Linear Upline */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gray-300">
        <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2 justify-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
          <Network className="w-5 h-5 md:w-6 md:h-6 text-gholink-blue" />
          <span>Friend Network</span>
        </h2>
        
        <div className="flex flex-col items-center">
          {/* Radial Sunburst Chart */}
          {downlineTree ? (
            <SunburstChart 
              tree={downlineTree}
              uplineData={uplineData}
              onNodeClick={handleNodeClick}
              onCenterClick={handleCenterClick}
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl w-full">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500 mb-1 text-base font-bold">No recruits yet</p>
              <p className="text-xs text-gray-400">Share your referral link to start building your network!</p>
            </div>
          )}
          
          {/* Upline Section Below Chart */}
          {uplineData.length > 0 && (
            <div className="w-full mt-6">
              {/* Toggle Button */}
              <button
                onClick={handleCenterClick}
                className="w-full bg-gradient-to-r from-gholink-blue to-gholink-cyan hover:from-gholink-blue/90 hover:to-gholink-cyan text-white py-3 md:py-3.5 px-4 rounded-2xl md:rounded-3xl font-black shadow-xl border-b-4 border-gholink-blue-dark hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {showUpline ? (
                  <>
                    <span className="text-lg">▼</span>
                    <span>Hide Your Upline</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">▲</span>
                    <span>View Your Upline</span>
                  </>
                )}
              </button>
              
              {/* Upline Display */}
              {showUpline && (
                <div className="mt-4 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue shadow-xl animate-fadeIn">
                  <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 justify-center">
                    <h3 className="text-lg md:text-2xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      Your Recruitment Chain
                    </h3>
                  </div>
                  
                  {/* Upline List */}
                  <div className="space-y-3 md:space-y-4">
                    {uplineData.map((person, index) => (
                      <div key={person.id} className="flex items-center gap-2 md:gap-3">
                        {/* Level indicator */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gholink-blue/10 border-3 border-gholink-blue flex items-center justify-center font-black text-gholink-blue text-xs md:text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {uplineData.length - index}
                          </div>
                          {index < uplineData.length - 1 && (
                            <div className="w-0.5 md:w-1 h-8 md:h-10 bg-gholink-blue/30"></div>
                          )}
                        </div>
                        
                        {/* Person card */}
                        <div 
                          onClick={() => handleNodeClick(person.id)}
                          className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-white border-3 md:border-4 border-gholink-blue/30 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                        >
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan border-2 md:border-3 border-gholink-blue-dark flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-xs md:text-sm text-gray-900 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
                              {person.display_name || person.name || `User ${person.referral_code?.slice(0, 4)}`}
                            </div>
                            <div className="text-[10px] md:text-xs text-gholink-blue font-bold">
                              {person.role}
                            </div>
                            <div className="text-[9px] md:text-[10px] text-gray-500 font-mono">
                              {person.referral_code}
                            </div>
                          </div>
                          <div className="hidden sm:block text-[10px] md:text-xs text-gholink-blue font-black">
                            Click to view →
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Final connector to YOU */}
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan border-3 border-gholink-blue-dark flex items-center justify-center font-black text-white text-xs md:text-sm">
                          ✓
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-br from-gholink-blue to-gholink-cyan border-3 md:border-4 border-gholink-blue-dark rounded-xl md:rounded-2xl shadow-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 border-2 md:border-3 border-white/30 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-xs md:text-sm text-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            YOU
                          </div>
                          <div className="text-[10px] md:text-xs text-white/80 font-bold">
                            Current View
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-300 flex flex-wrap gap-2 md:gap-4 justify-center text-[9px] md:text-xs font-bold">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan border border-gholink-blue-dark"></div>
            <span className="text-gray-700">Focused User</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gholink-blue-light border border-gholink-blue"></div>
            <span className="text-gray-700">Recruits (Click)</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gholink-blue border border-gholink-blue-dark"></div>
            <span className="text-gray-700">Upline (Button Below)</span>
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
