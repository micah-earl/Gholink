import { useState, useEffect } from 'react'
import React from 'react'
import { supabase } from '../lib/supabase'
import { Users, Network, X } from 'lucide-react'

// Modal Component for showing users in a ring
const RingModal = ({ isOpen, onClose, users, ringName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gholink-blue to-gholink-cyan p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{ringName}</h2>
            <p className="text-white/90 text-sm md:text-base">{users.length} connection{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* User Cards Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div 
                key={user.id}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-gray-200 hover:border-gholink-blue"
              >
                {/* Card Header with gradient background */}
                <div className="h-24 bg-gradient-to-br from-gholink-blue via-gholink-cyan to-gholink-blue-dark relative overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  {/* Role badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gholink-blue rounded-full text-xs font-black shadow-lg">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Profile Image - positioned to overlap header */}
                <div className="flex justify-center -mt-12 mb-3">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan border-4 border-white shadow-xl flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white"></div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-4 pb-4">
                  {/* Name */}
                  <h3 className="text-center font-black text-lg text-gray-900 mb-1 truncate" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {user.display_name || `User ${user.referral_code?.slice(0, 6)}`}
                  </h3>
                  
                  {/* Referral Code */}
                  <p className="text-center text-xs text-gray-500 font-mono mb-4 bg-gray-100 rounded-lg py-1 px-2">
                    {user.referral_code}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gholink-blue/10 to-gholink-cyan/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gholink-blue/20 flex items-center justify-center">
                          <span className="text-lg">🏆</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">Points</span>
                      </div>
                      <span className="text-lg font-black text-gholink-blue">{user.points || 0}</span>
                    </div>
                    
                    {user.childCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center">
                            <Users className="text-purple-600" size={16} />
                          </div>
                          <span className="text-sm font-bold text-gray-700">Network</span>
                        </div>
                        <span className="text-lg font-black text-purple-600">{user.childCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-gholink-blue/10 to-transparent rounded-tl-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Community Rings Chart Component
const CommunityRingsChart = ({ layers, onRingClick }) => {
  const centerSize = 100  // Smaller center
  const ringWidth = 50    // Smaller ring width
  const ringGap = 5       // Small gap between rings
  
  // Calculate SVG size based on number of layers
  const numLayers = layers.length
  const svgSize = centerSize + (numLayers * (ringWidth + ringGap) * 2) + 50

  // Color palette for rings - improved gradients
  const colors = [
    '#4FC3F7', // Inner Circle - bright blue
    '#29B6F6', // Second layer - medium blue
    '#03A9F4', // Third layer - vivid blue
    '#039BE5', // Fourth layer - deeper blue
    '#0288D1', // Fifth layer - rich blue
    '#0277BD', // Sixth layer - dark blue
  ]

  return (
    <div className="flex items-center justify-center w-full py-8">
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="max-w-full"
        style={{ maxHeight: '600px' }}
      >
        <g transform={`translate(${svgSize / 2}, ${svgSize / 2})`}>
          {/* Render rings from inside out */}
          {layers.map((layer, index) => {
            const radius = centerSize / 2 + (index * (ringWidth + ringGap)) + ringWidth / 2
            const color = colors[index % colors.length]
            
            return (
              <g key={index}>
                {/* Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={ringWidth}
                  className="cursor-pointer hover:opacity-80 transition-all"
                  onClick={() => onRingClick(layer.users, layer.name)}
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
                />
                {/* Ring Label */}
                <text
                  x="0"
                  y={-radius}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-black fill-white pointer-events-none"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {layer.name}
                </text>
                <text
                  x="0"
                  y={-radius + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-bold fill-white/90 pointer-events-none"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  ({layer.users.length})
                </text>
              </g>
            )
          })}

          {/* Center circle - YOU */}
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
          />
          
          <circle
            cx="0"
            cy="0"
            r={centerSize / 2 - 3}
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.3"
            className="pointer-events-none"
          />

          {/* User icon and text in center */}
          <g className="pointer-events-none">
            <circle cx="0" cy="-12" r="16" fill="white" fillOpacity="0.25" />
            <circle cx="0" cy="-12" r="13" fill="white" fillOpacity="0.9" />
            <text
              x="0"
              y="-7"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl"
            >
              👤
            </text>
            
            <text
              x="0"
              y="10"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-black fill-white"
              style={{ fontFamily: 'Nunito, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              YOU
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}

export default function OrgChart() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allTreeData, setAllTreeData] = useState([])
  const [layers, setLayers] = useState([]) // Dynamic layers
  const [totalReach, setTotalReach] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalUsers, setModalUsers] = useState([])
  const [modalTitle, setModalTitle] = useState('')
  const [uplineData, setUplineData] = useState([])
  const [showUpline, setShowUpline] = useState(false)
  const [currentUserData, setCurrentUserData] = useState(null)

  useEffect(() => {
    initializeChart()
  }, [])

  const initializeChart = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // Load current user data first
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setCurrentUserData(userData)

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
        .select('id, display_name, referral_code, avatar_url')
        .in('id', userIds)

      const userDetailsMap = {}
      if (usersData && !usersError) {
        usersData.forEach(userData => {
          userDetailsMap[userData.id] = {
            name: userData.display_name || `User ${userData.referral_code?.slice(0, 4)}`,
            display_name: userData.display_name,
            avatar_url: userData.avatar_url
          }
        })
      }

      const { data: { user } } = await supabase.auth.getUser()
      userDetailsMap[user.id] = {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'You',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        email: user.email,
        avatar_url: currentUserData?.avatar_url
      }

      const enrichedTreeData = treeData?.map(node => ({
        ...node,
        name: userDetailsMap[node.id]?.name || `User ${node.referral_code?.slice(0, 4)}`,
        display_name: userDetailsMap[node.id]?.display_name || node.display_name,
        email: userDetailsMap[node.id]?.email,
        avatar_url: userDetailsMap[node.id]?.avatar_url
      }))

      setAllTreeData(enrichedTreeData || [])
      organizeByCircles(userId, enrichedTreeData)
    } catch (err) {
      console.error('Error fetching org chart:', err)
      setError(err.message)
    }
  }

  const organizeByCircles = (userId, treeData = allTreeData) => {
    const currentUserNode = treeData.find(u => u.id === userId)
    if (!currentUserNode) return

    // Calculate the maximum depth in the tree
    const getDepthFromUser = (nodeId, depth = 1) => {
      const children = treeData.filter(u => u.parent_id === nodeId)
      if (children.length === 0) return depth
      return Math.max(...children.map(child => getDepthFromUser(child.id, depth + 1)))
    }

    const maxDepth = getDepthFromUser(userId)

    // Organize users by their level/depth
    const layersArray = []
    const layerNames = [
      'Inner Circle',      // People you personally invited
      'Outer Circle',      // People invited by your friends
      'Extended Network',  // Third layer
      'Community Reach',   // Fourth layer
      'Network Layer 5',   // Fifth layer
      'Network Layer 6'    // Sixth layer
    ]
    
    for (let level = 1; level <= maxDepth; level++) {
      const usersAtLevel = treeData.filter(u => {
        if (u.id === userId) return false
        // Check if this user is at the correct depth from userId
        const depth = getDistanceFromUser(u.id, userId, treeData)
        return depth === level
      })

      if (usersAtLevel.length > 0) {
        const usersWithCounts = usersAtLevel.map(person => ({
          ...person,
          childCount: treeData.filter(u => u.parent_id === person.id).length
        }))

        layersArray.push({
          name: layerNames[level - 1] || `Level ${level}`,
          users: usersWithCounts,
          level: level
        })
      }
    }

    setLayers(layersArray)
    setTotalReach(treeData.length - 1) // Exclude self

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
  }

  // Helper function to get distance from user
  const getDistanceFromUser = (nodeId, userId, treeData) => {
    let distance = 0
    let currentId = nodeId
    while (currentId !== userId && distance < 20) {
      const node = treeData.find(u => u.id === currentId)
      if (!node || !node.parent_id) return -1
      currentId = node.parent_id
      distance++
      if (currentId === userId) return distance
    }
    return -1
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

  const handleRingClick = (users, title) => {
    setModalUsers(users)
    setModalTitle(title)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community network...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Network</h3>
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

  return (
    <>
      <RingModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        users={modalUsers}
        ringName={modalTitle}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>Community Network</h1>
          <p className="text-sm md:text-lg text-gray-600">
            Your connections organized by circles - click any ring to view members
          </p>
        </div>

        {/* Stats - Community Style */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-gholink-blue/30">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-gholink-blue/10 rounded-xl md:rounded-2xl">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-gholink-blue" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-bold">Connections</p>
                <p className="text-2xl md:text-3xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>{layers[0]?.users.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-cyan-400">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-cyan-100 rounded-xl md:rounded-2xl">
                <Network className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-bold">Network Layers</p>
                <p className="text-2xl md:text-3xl font-black text-cyan-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{layers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 border-b-4 md:border-b-8 border-green-400">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-green-100 rounded-xl md:rounded-2xl">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 font-bold">Community Reach</p>
                <p className="text-2xl md:text-3xl font-black text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>{totalReach}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Radial Chart */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gray-300">
          <h2 className="text-lg md:text-2xl font-black text-gray-900 mb-4 flex items-center gap-2 justify-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Network className="w-5 h-5 md:w-6 md:h-6 text-gholink-blue" />
            <span>Your Network Layers</span>
          </h2>
          
          <div className="flex flex-col items-center">
            {layers.length > 0 ? (
              <CommunityRingsChart 
                layers={layers}
                onRingClick={handleRingClick}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl w-full">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 mb-1 text-base font-bold">No connections yet</p>
                <p className="text-xs text-gray-400">Share your referral link to start building your network!</p>
              </div>
            )}

            {/* Upline Section Below Chart */}
            {uplineData.length > 0 && (
              <div className="w-full mt-6">
                {/* Toggle Button */}
                <button
                  onClick={() => setShowUpline(!showUpline)}
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
                        Your Connection Path
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
                          <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-white border-3 md:border-4 border-gholink-blue/30 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan border-2 md:border-3 border-gholink-blue-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {person.avatar_url ? (
                                <img src={person.avatar_url} alt={person.display_name} className="w-full h-full object-cover" />
                              ) : (
                                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              )}
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
              <span className="text-gray-700">You (Center)</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gholink-blue-light border border-gholink-blue"></div>
              <span className="text-gray-700">Inner Circle (Your Invites)</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-cyan-300 border border-cyan-500"></div>
              <span className="text-gray-700">Outer Circle (Friend's Invites)</span>
            </div>
          </div>
        </div>
      </div>
    </>
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
