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

      {/* Leaderboard List */}
      <div className="bg-white rounded-duolingo shadow-duolingo overflow-hidden">
        {leaderboard.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.id === currentUserId
              const rank = index + 1
              
              // Medal colors for top 3
              let medalIcon = null
              if (rank === 1) medalIcon = <Medal className="text-yellow-500" size={24} />
              else if (rank === 2) medalIcon = <Medal className="text-gray-400" size={24} />
              else if (rank === 3) medalIcon = <Medal className="text-orange-600" size={24} />

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isCurrentUser ? 'bg-gholink-blue text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg ${
                    rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    rank === 2 ? 'bg-gray-200 text-gray-700' :
                    rank === 3 ? 'bg-orange-100 text-orange-700' :
                    isCurrentUser ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {medalIcon || `#${rank}`}
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
