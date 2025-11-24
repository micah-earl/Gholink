import { useState, useEffect } from 'react'
import { Trophy, Crown, Award, Medal } from 'lucide-react'
import { supabase } from '../lib/supabase'
import LeaderboardRow from '../components/ui/LeaderboardRow'

const Leaderboards = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

      // Load leaderboard data
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(100)

      if (error) throw error

      // If no data, use mock data for demonstration
      if (!data || data.length === 0) {
        setLeaderboard(getMockLeaderboard())
      } else {
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
      // Fallback to mock data on error
      setLeaderboard(getMockLeaderboard())
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const getMockLeaderboard = () => {
    return [
      { id: '1', display_name: 'Alex Johnson', email: 'alex@example.com', total_points: 12500, avatar_url: null },
      { id: '2', display_name: 'Sarah Chen', email: 'sarah@example.com', total_points: 9800, avatar_url: null },
      { id: '3', display_name: 'Mike Rodriguez', email: 'mike@example.com', total_points: 8750, avatar_url: null },
      { id: '4', display_name: 'Emma Wilson', email: 'emma@example.com', total_points: 7200, avatar_url: null },
      { id: '5', display_name: 'David Kim', email: 'david@example.com', total_points: 6500, avatar_url: null },
      { id: '6', display_name: 'Lisa Anderson', email: 'lisa@example.com', total_points: 5800, avatar_url: null },
      { id: '7', display_name: 'Chris Taylor', email: 'chris@example.com', total_points: 5200, avatar_url: null },
      { id: '8', display_name: 'Jessica Brown', email: 'jessica@example.com', total_points: 4800, avatar_url: null },
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-gholink-blue">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="text-gholink-blue" size={40} />
          <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <p className="text-gray-600">Top recruiters in the network</p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-2xl mb-3">
              {leaderboard[1]?.display_name?.charAt(0) || '2'}
            </div>
            <div className="bg-gray-100 rounded-duolingo p-4 w-full text-center">
              <Medal className="mx-auto text-gray-400 mb-2" size={24} />
              <p className="font-bold text-gray-900 truncate">{leaderboard[1]?.display_name || 'N/A'}</p>
              <p className="text-2xl font-bold text-gray-600">{leaderboard[1]?.total_points?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Crown className="text-yellow-500 mb-2" size={32} />
            <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-3xl mb-3">
              {leaderboard[0]?.display_name?.charAt(0) || '1'}
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-duolingo p-4 w-full text-center">
              <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
              <p className="font-bold text-gray-900 truncate">{leaderboard[0]?.display_name || 'N/A'}</p>
              <p className="text-2xl font-bold text-gholink-blue">{leaderboard[0]?.total_points?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="w-20 h-20 rounded-full bg-orange-300 flex items-center justify-center text-white font-bold text-2xl mb-3">
              {leaderboard[2]?.display_name?.charAt(0) || '3'}
            </div>
            <div className="bg-orange-50 rounded-duolingo p-4 w-full text-center">
              <Award className="mx-auto text-orange-500 mb-2" size={24} />
              <p className="font-bold text-gray-900 truncate">{leaderboard[2]?.display_name || 'N/A'}</p>
              <p className="text-2xl font-bold text-orange-600">{leaderboard[2]?.total_points?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <LeaderboardRow
            key={user.id}
            user={user}
            rank={index + 1}
            isCurrentUser={user.id === currentUserId}
          />
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="duolingo-card text-center py-12">
          <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No leaderboard data available yet</p>
        </div>
      )}
    </div>
  )
}

export default Leaderboards

