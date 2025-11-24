import { cn } from '../../lib/utils'

const DashboardCard = ({ title, value, icon: Icon, subtitle, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'duolingo-card cursor-pointer',
        onClick && 'hover:scale-105',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 bg-gholink-blue/10 rounded-full">
            <Icon className="text-gholink-blue" size={24} />
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardCard

