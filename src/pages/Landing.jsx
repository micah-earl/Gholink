import { Link } from 'react-router-dom'
import { Trophy, Users, TrendingUp, ArrowRight } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.png" alt="Gholink" className="w-20 h-20" onError={(e) => { e.target.src = '/logo.svg' }} />
            <h1 className="text-6xl font-bold">Gholink</h1>
          </div>
          <p className="text-2xl mb-8 opacity-90">
            Build your network, earn points, and climb the leaderboard
          </p>
          <p className="text-lg mb-12 opacity-75">
            A fun, DuoLingo-style recruiting platform where every recruit counts
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              to="/signin"
              className="bg-white text-gholink-blue font-bold py-4 px-8 rounded-duolingo shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/signin"
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-duolingo hover:bg-white hover:text-gholink-blue transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-duolingo p-6">
              <Trophy className="mx-auto mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Earn Points</h3>
              <p className="opacity-90">
                Get rewarded for every recruit you bring in, with bonus points for your network's growth
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-duolingo p-6">
              <Users className="mx-auto mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Build Networks</h3>
              <p className="opacity-90">
                Create a powerful recruiting chain where everyone benefits from collective success
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-duolingo p-6">
              <TrendingUp className="mx-auto mb-4" size={40} />
              <h3 className="text-xl font-bold mb-2">Climb Ranks</h3>
              <p className="opacity-90">
                Compete on the leaderboard and see how you stack up against other recruiters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing

