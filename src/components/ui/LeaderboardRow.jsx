import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '../../lib/utils'

const LeaderboardRow = ({ user, rank, isCurrentUser = false }) => {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />
    if (rank === 2) return <Medal className="text-gray-400" size={24} />
    if (rank === 3) return <Award className="text-orange-500" size={24} />
    return null
  }

  const getRankColor = () => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200'
    if (rank === 2) return 'bg-gray-50 border-gray-200'
    if (rank === 3) return 'bg-orange-50 border-orange-200'
    return 'bg-white border-gray-200'
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-duolingo border-2 transition-all',
        getRankColor(),
        isCurrentUser && 'ring-2 ring-gholink-blue ring-offset-2'
      )}
    >
      <div className="flex items-center justify-center w-12">
        {getRankIcon() || (
          <span className="text-lg font-bold text-gray-400">#{rank}</span>
        )}
      </div>

      <div className="w-12 h-12 rounded-full bg-gholink-blue flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{user.display_name?.charAt(0).toUpperCase() || 'U'}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 truncate">
          {user.display_name || user.email || 'Anonymous'}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-gholink-blue">(You)</span>
          )}
        </p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-gholink-blue">
          {user.total_points?.toLocaleString() || 0}
        </p>
        <p className="text-xs text-gray-500">points</p>
      </div>
    </div>
  )
}

export default LeaderboardRow

