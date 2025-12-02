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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="text-yellow-500" size={48} />
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-gray-600">Top recruiters ranked by points</p>
      </div>

      {/* Points Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-duolingo shadow-duolingo p-6 border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <Award className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How Points Work</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>New recruit</strong> gets <strong>1,000 points</strong></li>
              <li>• <strong>Direct recruiter</strong> gets <strong>1,000 points</strong></li>
              <li>• Points halve going up: <strong>500 → 250 → 125 → 62...</strong></li>
              <li>• Build deep networks to maximize points!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Top 3 Podium - Duolingo Style */}
      {topThree.length > 0 && (
        <div className="bg-white rounded-duolingo shadow-duolingo p-8 mb-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🏆 Top Recruiters</h2>
          <div className="flex items-end justify-center gap-3 max-w-3xl mx-auto">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out_0.1s_both]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🥈</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">2</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-bold text-sm text-gray-700 mb-1 truncate w-full text-center px-2">
                  {topThree[1].id === currentUserId ? 'You' : `User ${topThree[1].referral_code.slice(0, 6)}`}
                </div>
                {/* Points */}
                <div className="text-xs text-gray-500 mb-3 font-semibold">
                  {topThree[1].points.toLocaleString()} pts
                </div>
                {/* Podium */}
                <div className="w-full bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-xl border-4 border-b-0 border-gray-400 shadow-lg relative overflow-hidden" style={{ height: '120px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-500"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Medal className="text-white/30" size={60} />
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place - Taller and in the middle */}
            {topThree[0] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-yellow-200">
                    <span className="text-3xl">👑</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-bold text-base text-gray-800 mb-1 truncate w-full text-center px-2">
                  {topThree[0].id === currentUserId ? 'You' : `User ${topThree[0].referral_code.slice(0, 6)}`}
                </div>
                {/* Points */}
                <div className="text-sm text-yellow-600 mb-3 font-bold">
                  {topThree[0].points.toLocaleString()} pts
                </div>
                {/* Podium - Tallest */}
                <div className="w-full bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-xl border-4 border-b-0 border-yellow-500 shadow-xl relative overflow-hidden" style={{ height: '160px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="absolute inset-x-0 top-0 h-1 bg-yellow-300"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-yellow-600"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Trophy className="text-white/30" size={80} />
                  </div>
                  {/* Sparkles */}
                  <div className="absolute top-2 left-2 text-yellow-200 text-xs">✨</div>
                  <div className="absolute top-4 right-3 text-yellow-200 text-xs">✨</div>
                  <div className="absolute bottom-8 left-3 text-yellow-200 text-xs">⭐</div>
                  <div className="absolute bottom-6 right-2 text-yellow-200 text-xs">⭐</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex-1 flex flex-col items-center animate-[slideUp_0.5s_ease-out_0.2s_both]">
                {/* Avatar Circle */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🥉</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">3</span>
                  </div>
                </div>
                {/* Name */}
                <div className="font-bold text-sm text-gray-700 mb-1 truncate w-full text-center px-2">
                  {topThree[2].id === currentUserId ? 'You' : `User ${topThree[2].referral_code.slice(0, 6)}`}
                </div>
                {/* Points */}
                <div className="text-xs text-gray-500 mb-3 font-semibold">
                  {topThree[2].points.toLocaleString()} pts
                </div>
                {/* Podium */}
                <div className="w-full bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-xl border-4 border-b-0 border-orange-400 shadow-lg relative overflow-hidden" style={{ height: '100px' }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-500"></div>
                  <div className="relative h-full flex items-center justify-center">
                    <Medal className="text-white/30" size={50} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Podium Base */}
          <div className="max-w-3xl mx-auto mt-0">
            <div className="h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg border-x-2 border-b-2 border-gray-400"></div>
          </div>
        </div>
      )}

      {/* Leaderboard List - Rest of users */}
      <div className="bg-white rounded-duolingo shadow-duolingo overflow-hidden">
        {restOfLeaderboard.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {restOfLeaderboard.map((user, index) => {
              const isCurrentUser = user.id === currentUserId
              const rank = index + 4


              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isCurrentUser ? 'bg-gholink-blue text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg ${
                    isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    #{rank}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg truncate">
                        {isCurrentUser ? '👑 You' : `User ${user.referral_code.slice(0, 6)}`}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isCurrentUser ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className={`text-sm flex items-center gap-4 ${
                      isCurrentUser ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {user.direct_recruits} direct
                      </span>
                      <span>•</span>
                      <span>{user.total_recruits} total</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className={`flex items-center gap-2 ${
                    isCurrentUser ? 'bg-white/20' : 'bg-yellow-50'
                  } px-4 py-2 rounded-lg`}>
                    <Trophy size={20} className={isCurrentUser ? 'text-white' : 'text-yellow-600'} />
                    <span className={`font-bold text-xl ${
                      isCurrentUser ? 'text-white' : 'text-yellow-600'
                    }`}>
                      {user.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <Trophy className="mx-auto text-gray-300 mb-3" size={64} />
            <p className="text-gray-500 text-lg mb-2">No users yet</p>
            <p className="text-sm text-gray-400">Start recruiting to appear on the leaderboard!</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-duolingo shadow-duolingo p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
          </div>
          <div className="bg-white rounded-duolingo shadow-duolingo p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Total Points</p>
            <p className="text-2xl font-bold text-yellow-600">
              {leaderboard.reduce((sum, u) => sum + u.points, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-duolingo shadow-duolingo p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Top Recruiter</p>
            <p className="text-2xl font-bold text-gholink-blue">
              {leaderboard[0]?.points.toLocaleString() || 0} pts
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
