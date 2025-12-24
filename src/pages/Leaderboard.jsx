import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

      // Fetch leaderboard from users table
      const { data, error } = await supabase
        .rpc('get_points_leaderboard', { limit_count: 50 })

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else {
        setLeaderboard(data || [])
      }

      setLoading(false)
    } catch (err) {
      console.error('Error:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
          <Trophy className="text-gholink-blue" size={40} />
          <h1 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Nunito, sans-serif' }}>Leaderboard</h1>
        </div>
        <p className="text-sm md:text-lg text-gray-600">Top recruiters ranked by points</p>
      </div>

      {/* Points Info */}
      <div className="bg-gradient-to-r from-gholink-blue-light to-gholink-blue rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border-b-4 md:border-b-8 border-gholink-blue-dark">
        <div className="flex items-start gap-2 md:gap-3">
          <Award className="text-white flex-shrink-0" size={22} />
          <div>
            <h3 className="font-black text-white mb-2 md:mb-3 text-base md:text-xl" style={{ fontFamily: 'Nunito, sans-serif' }}>How Points Work</h3>
            <ul className="text-xs md:text-sm text-white/95 space-y-1.5 md:space-y-2 font-semibold">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span><strong>New recruit</strong> gets <strong>1,000 points</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span><strong>Direct recruiter</strong> gets <strong>500 points</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>Points halve going up: <strong>250 → 125 → 62 → 31...</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                <span>Build deep networks to maximize points!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top 3 Podium - Duolingo Style Blue Theme */}
      {topThree.length > 0 && (
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 mb-4 md:mb-6 border-b-4 md:border-b-8 border-gholink-blue/30">
          <h2 className="text-xl md:text-3xl font-black text-center mb-6 md:mb-8 text-gholink-blue flex items-center justify-center gap-2 md:gap-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            <Trophy size={24} className="md:w-8 md:h-8" />
            <span className="hidden sm:inline">Top 3 Recruiters</span>
            <span className="sm:hidden">Top 3</span>
          </h2>
          <div className="flex items-end justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out_0.1s_both]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-gray-200 overflow-hidden">
                    {topThree[1].avatar_url ? (
                      <img src={topThree[1].avatar_url} alt={topThree[1].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🥈</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-sm">2</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-black text-base text-gray-800 mb-1 truncate w-full text-center px-2">
                  {topThree[1].id === currentUserId ? '👑 You' : (topThree[1].display_name || `User ${topThree[1].referral_code.slice(0, 6)}`)}
                </div>
                {/* Points */}
                <div className="text-sm text-gray-600 mb-3 font-bold">
                  {topThree[1].points.toLocaleString()} pts
                </div>
                {/* Podium */}
                <div className="w-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-2xl border-4 border-b-0 border-gray-400 shadow-xl relative overflow-hidden" style={{ height: '140px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-gray-500"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Medal className="text-white/40" size={70} />
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place - Gholink Blue */}
            {topThree[0] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-blue-dark border-4 border-white shadow-2xl flex items-center justify-center ring-4 ring-gholink-blue/30 overflow-hidden">
                    {topThree[0].avatar_url ? (
                      <img src={topThree[0].avatar_url} alt={topThree[0].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">👑</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gholink-blue-dark rounded-full border-3 border-white flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-lg">1</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-black text-xl text-gray-900 mb-1 truncate w-full text-center px-2">
                  {topThree[0].id === currentUserId ? '👑 You' : (topThree[0].display_name || `User ${topThree[0].referral_code.slice(0, 6)}`)}
                </div>
                {/* Points */}
                <div className="text-base text-gholink-blue mb-3 font-black">
                  {topThree[0].points.toLocaleString()} pts
                </div>
                {/* Podium - Tallest */}
                <div className="w-full bg-gradient-to-b from-gholink-blue to-gholink-blue-dark rounded-t-2xl border-4 border-b-0 border-gholink-blue shadow-2xl relative overflow-hidden" style={{ height: '180px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                  <div className="absolute inset-x-0 top-0 h-2 bg-gholink-blue-light"></div>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-gholink-blue-dark"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Trophy className="text-white/40" size={100} />
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out_0.2s_both]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-orange-200 overflow-hidden">
                    {topThree[2].avatar_url ? (
                      <img src={topThree[2].avatar_url} alt={topThree[2].display_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🥉</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-sm">3</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-black text-base text-gray-800 mb-1 truncate w-full text-center px-2">
                  {topThree[2].id === currentUserId ? '👑 You' : (topThree[2].display_name || `User ${topThree[2].referral_code.slice(0, 6)}`)}
                </div>
                {/* Points */}
                <div className="text-sm text-gray-600 mb-3 font-bold">
                  {topThree[2].points.toLocaleString()} pts
                </div>
                {/* Podium */}
                <div className="w-full bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-2xl border-4 border-b-0 border-orange-400 shadow-xl relative overflow-hidden" style={{ height: '120px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-orange-500"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Medal className="text-white/40" size={60} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Podium Base */}
          <div className="max-w-4xl mx-auto mt-0">
            <div className="h-3 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-xl border-x-2 border-b-2 border-gray-400"></div>
          </div>
        </div>
      )}

      {/* Leaderboard List - Rest of users */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border-b-4 md:border-b-8 border-gholink-blue/30">
        {restOfLeaderboard.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {restOfLeaderboard.map((user, index) => {
              const isCurrentUser = user.id === currentUserId
              const rank = index + 4

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-2 md:gap-4 p-3 md:p-5 transition-all ${
                    isCurrentUser ? 'bg-gradient-to-r from-gholink-blue to-gholink-blue-dark text-white scale-[1.02]' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg md:rounded-xl font-black text-base md:text-xl ${
                    isCurrentUser ? 'bg-white/20 text-white' : 'bg-gholink-blue/10 text-gholink-blue'
                  }`}>
                    #{rank}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                      <span className="font-black text-sm md:text-lg truncate">
                        {isCurrentUser ? '👑 You' : (user.display_name || `User ${user.referral_code.slice(0, 6)}`)}
                      </span>
                      <span className={`text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full font-bold ${
                        isCurrentUser ? 'bg-white/20 text-white' : 'bg-gholink-blue/10 text-gholink-blue'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className={`text-xs md:text-sm flex items-center gap-2 md:gap-4 ${
                      isCurrentUser ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      <span className="flex items-center gap-1 font-semibold">
                        <Users size={14} className="hidden md:inline" />
                        {user.direct_recruits} <span className="hidden sm:inline">direct</span>
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-semibold hidden sm:inline">{user.total_recruits} total</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className={`flex items-center gap-1.5 md:gap-3 ${
                    isCurrentUser ? 'bg-white/20' : 'bg-gholink-blue/10'
                  } px-2 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl`}>
                    <Trophy size={18} className={`${isCurrentUser ? 'text-white' : 'text-gholink-blue'} md:w-6 md:h-6`} />
                    <span className={`font-black text-lg md:text-2xl ${
                      isCurrentUser ? 'text-white' : 'text-gholink-blue'
                    }`}>
                      {user.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <Trophy className="mx-auto text-gray-300 mb-4" size={80} />
            <p className="text-gray-500 text-xl font-semibold mb-2">No users yet</p>
            <p className="text-sm text-gray-400">Start recruiting to appear on the leaderboard!</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 text-center border-b-4 md:border-b-8 border-gholink-blue/30 hover:border-gholink-blue transition-all">
            <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 font-bold">Total Users</p>
            <p className="text-2xl md:text-4xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>{leaderboard.length}</p>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 text-center border-b-4 md:border-b-8 border-gholink-blue/30 hover:border-gholink-blue transition-all">
            <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 font-bold">Total Points</p>
            <p className="text-2xl md:text-4xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {leaderboard.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 text-center border-b-4 md:border-b-8 border-gholink-blue/30 hover:border-gholink-blue transition-all">
            <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 font-bold">Top Recruiter</p>
            <p className="text-2xl md:text-4xl font-black text-gholink-blue" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {leaderboard[0]?.points.toLocaleString() || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
