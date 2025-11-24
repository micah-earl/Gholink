import { useState, useEffect } from 'react'
import { Plus, Users, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import RecruitModal from '../components/ui/RecruitModal'
import InviteCard from '../components/ui/InviteCard'

const Recruit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recruits, setRecruits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecruits()
  }, [])

  const loadRecruits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('recruits')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecruits(data || [])
    } catch (error) {
      console.error('Error loading recruits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteSuccess = () => {
    loadRecruits()
  }

  const pendingRecruits = recruits.filter(r => r.status === 'pending')
  const acceptedRecruits = recruits.filter(r => r.status === 'accepted')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recruit New Members</h1>
          <p className="text-gray-600">Invite people to join your network and earn points</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="duolingo-button flex items-center gap-2"
        >
          <Plus size={20} />
          Invite Recruit
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="duolingo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Invites</p>
              <p className="text-3xl font-bold text-gray-900">{recruits.length}</p>
            </div>
            <div className="p-3 bg-duolingo-blue/10 rounded-full">
              <Users className="text-duolingo-blue" size={24} />
            </div>
          </div>
        </div>
        <div className="duolingo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{pendingRecruits.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
        <div className="duolingo-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accepted</p>
              <p className="text-3xl font-bold text-gholink-blue">{acceptedRecruits.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Recruits */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-orange-600" size={20} />
          <h2 className="text-2xl font-bold text-gray-900">Pending Invites</h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            {pendingRecruits.length}
          </span>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingRecruits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRecruits.map((recruit) => (
              <InviteCard key={recruit.id} recruit={recruit} status="pending" />
            ))}
          </div>
        ) : (
          <div className="duolingo-card text-center py-12">
            <Users className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 mb-2">No pending invites</p>
            <p className="text-sm text-gray-400">Invite someone to get started!</p>
          </div>
        )}
      </div>

      {/* Accepted Recruits */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="text-gholink-blue" size={20} />
          <h2 className="text-2xl font-bold text-gray-900">Accepted Recruits</h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {acceptedRecruits.length}
          </span>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : acceptedRecruits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedRecruits.map((recruit) => (
              <InviteCard key={recruit.id} recruit={recruit} status="accepted" />
            ))}
          </div>
        ) : (
          <div className="duolingo-card text-center py-12">
            <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 mb-2">No accepted recruits yet</p>
            <p className="text-sm text-gray-400">When someone accepts your invite, they'll appear here</p>
          </div>
        )}
      </div>

      <RecruitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  )
}

export default Recruit

