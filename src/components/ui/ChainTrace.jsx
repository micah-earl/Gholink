import { Users, ArrowRight } from 'lucide-react'

const ChainTrace = ({ chain = [] }) => {
  if (!chain || chain.length === 0) {
    return (
      <div className="duolingo-card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Recruit Chain</h3>
        <p className="text-gray-500 text-center py-8">No chain data available yet</p>
      </div>
    )
  }

  return (
    <div className="duolingo-card">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="text-gholink-blue" size={20} />
        Your Recruit Chain
      </h3>
      <div className="space-y-3">
        {chain.map((person, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gholink-blue flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{person.name || person.email}</p>
                <p className="text-xs text-gray-500">Level {index + 1}</p>
              </div>
            </div>
            {index < chain.length - 1 && (
              <ArrowRight className="text-gholink-blue" size={20} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChainTrace

