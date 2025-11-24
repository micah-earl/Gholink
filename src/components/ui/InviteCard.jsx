import { Mail, CheckCircle, Clock, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const InviteCard = ({ recruit, status = 'pending' }) => {
  const isPending = status === 'pending'
  const isAccepted = status === 'accepted'

  return (
    <div className={cn(
      'duolingo-card',
      isAccepted && 'border-2 border-gholink-blue'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-3 rounded-full',
            isPending && 'bg-orange-100',
            isAccepted && 'bg-green-100'
          )}>
            {isPending ? (
              <Clock className="text-orange-600" size={20} />
            ) : (
              <CheckCircle className="text-green-600" size={20} />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {recruit.recruit_name || recruit.invite_email}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail size={14} />
              {recruit.invite_email}
            </p>
            {isAccepted && recruit.recruit_name && (
              <p className="text-xs text-gholink-blue flex items-center gap-1 mt-1">
                <User size={12} />
                Active Recruit
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold',
            isPending && 'bg-orange-100 text-orange-700',
            isAccepted && 'bg-green-100 text-green-700'
          )}>
            {isPending ? 'Pending' : 'Accepted'}
          </span>
          {recruit.created_at && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(recruit.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InviteCard

