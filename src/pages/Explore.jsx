import { useState, useEffect } from 'react'
import { X, Heart, MapPin, Briefcase, Star, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Mock users for swipeable cards (unfollowed users)
const mockExploreUsers = [
  {
    id: 1,
    name: 'Jessica Martinez',
    avatar: 'JM',
    points: 2400,
    location: 'San Francisco, CA',
    bio: 'Tech enthusiast | Building amazing products | Always looking to connect with great people',
    recruits: 45,
    interests: ['Technology', 'Startups', 'Networking']
  },
  {
    id: 2,
    name: 'David Park',
    avatar: 'DP',
    points: 1890,
    location: 'New York, NY',
    bio: 'Marketing professional | Growth hacker | Coffee addict ☕',
    recruits: 32,
    interests: ['Marketing', 'Growth', 'Design']
  },
  {
    id: 3,
    name: 'Rachel Green',
    avatar: 'RG',
    points: 3200,
    location: 'Austin, TX',
    bio: 'Product Designer | UX/UI enthusiast | Making the world more beautiful',
    recruits: 67,
    interests: ['Design', 'UX', 'Art']
  },
  {
    id: 4,
    name: 'Kevin Nguyen',
    avatar: 'KN',
    points: 1560,
    location: 'Seattle, WA',
    bio: 'Software Engineer | Full-stack developer | Open source contributor',
    recruits: 28,
    interests: ['Programming', 'AI', 'Gaming']
  },
  {
    id: 5,
    name: 'Amanda Foster',
    avatar: 'AF',
    points: 2800,
    location: 'Los Angeles, CA',
    bio: 'Content Creator | Social Media Strategist | Helping brands tell their story',
    recruits: 52,
    interests: ['Social Media', 'Content', 'Branding']
  }
]

const Explore = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [users, setUsers] = useState(mockExploreUsers)

  const currentUser = users[currentIndex]

  const handleSwipe = (liked) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setDirection(liked ? 'right' : 'left')

    setTimeout(() => {
      if (currentIndex < users.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Reset to beginning or load more users
        setCurrentIndex(0)
      }
      setDirection(null)
      setIsAnimating(false)
    }, 300)
  }

  const handleBack = () => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No more profiles</h3>
          <p className="text-gray-600">Check back later for more people to connect with!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
          <p className="text-gray-600 text-sm">Discover new connections</p>
        </div>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {users.length}
        </div>
      </div>

      {/* Swipeable Card Container */}
      <div className="flex-1 relative">
        <div 
          className={`absolute inset-0 transition-all duration-300 ${
            direction === 'left' ? 'translate-x-[-120%] opacity-0' :
            direction === 'right' ? 'translate-x-[120%] opacity-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full overflow-hidden flex flex-col">
            {/* Profile Image Area */}
            <div className="relative h-64 bg-gradient-to-br from-gholink-blue to-gholink-yellow flex items-center justify-center">
              <div className="text-white text-8xl font-bold">
                {currentUser.avatar}
              </div>
              
              {/* Points Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-gholink-yellow fill-current" />
                  <span className="font-bold text-gray-900">{currentUser.points}</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentUser.name}</h2>
              
              {/* Location & Recruits */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{currentUser.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={16} />
                  <span>{currentUser.recruits} recruits</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-700 mb-4 leading-relaxed">{currentUser.bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gholink-blue/10 text-gholink-blue rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition ${
            currentIndex === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Pass Button */}
        <button
          onClick={() => handleSwipe(false)}
          disabled={isAnimating}
          className="w-16 h-16 rounded-full bg-white border-3 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition shadow-lg disabled:opacity-50"
        >
          <X size={32} strokeWidth={3} />
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleSwipe(true)}
          disabled={isAnimating}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-yellow text-white flex items-center justify-center hover:shadow-xl transition shadow-lg disabled:opacity-50"
        >
          <Heart size={36} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export default Explore
