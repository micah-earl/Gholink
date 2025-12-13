import { useState, useEffect } from 'react'
import { X, Trophy, Users, ShoppingBag, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

const OnboardingWalkthrough = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show walkthrough after a brief delay
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to Gholink!",
      description: "Let's take a quick tour to show you how everything works. This will only take a minute!",
      gradient: "from-gholink-blue to-gholink-blue-dark",
      iconBg: "bg-white/20",
      iconColor: "text-white"
    },
    {
      icon: Trophy,
      title: "Earn Points",
      description: "Points are your currency in Gholink! You earn points by recruiting new members. The more people you bring in, the more points you earn. Points unlock rewards and help you climb the leaderboard!",
      gradient: "from-gholink-blue to-gholink-blue-dark",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      details: [
        "📍 10 points for each direct recruit",
        "📍 5 points for each indirect recruit",
        "📍 Bonus points for recruiter promotions"
      ]
    },
    {
      icon: Users,
      title: "Recruit & Grow",
      description: "Share your unique referral link with friends, family, and colleagues. When they sign up using your link, they become part of your network and you earn points!",
      gradient: "from-gholink-blue to-gholink-blue-dark",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      details: [
        "🔗 Share your referral link anywhere",
        "👥 Build your recruiting network",
        "🎯 Track your recruits in real-time"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Shop for Rewards",
      description: "Use your hard-earned points in the Shop! Browse exclusive rewards, prizes, and perks. The more points you earn, the better rewards you can unlock!",
      gradient: "from-gholink-blue to-gholink-blue-dark",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      details: [
        "🎁 Exclusive rewards and prizes",
        "💎 Premium perks and benefits",
        "🛒 Spend points on what you want"
      ]
    },
    {
      icon: TrendingUp,
      title: "Compete on Leaderboard",
      description: "See how you stack up against other users and recruiters! The leaderboard shows top performers. Climb the ranks by earning more points and recruiting more people!",
      gradient: "from-gholink-blue to-gholink-blue-dark",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      details: [
        "🏆 Compete with other users",
        "📊 Track your ranking",
        "⭐ Become a top recruiter"
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100"
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${step.gradient} p-8 rounded-t-3xl text-white relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close walkthrough"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`${step.iconBg} backdrop-blur-sm p-4 rounded-2xl border-2 border-white/30`}>
              <Icon size={40} className={step.iconColor} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {step.title}
              </h2>
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep 
                        ? 'w-8 bg-white' 
                        : index < currentStep 
                        ? 'w-2 bg-white/60' 
                        : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {step.description}
          </p>

          {step.details && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border-2 border-gray-200">
              <ul className="space-y-3">
                {step.details.map((detail, index) => (
                  <li 
                    key={index}
                    className="text-gray-700 font-semibold flex items-start gap-2"
                  >
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
            >
              Skip Tutorial
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-semibold">
                {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleNext}
                className={`px-8 py-4 bg-gradient-to-r ${step.gradient} text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg flex items-center gap-2 border-b-4 border-black/20`}
              >
                {isLastStep ? "Let's Go!" : 'Next'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default OnboardingWalkthrough
