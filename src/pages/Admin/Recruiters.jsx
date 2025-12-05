import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { isAdmin } from '../../lib/referrals'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Recruiters = () => {
  const [loading, setLoading] = useState(true)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [recruiters, setRecruiters] = useState([])
  const [expandedRecruiterId, setExpandedRecruiterId] = useState(null)
  const [recruitsData, setRecruitsData] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/signin')
        return
      }

      const adminStatus = await isAdmin(user.id)
      setIsUserAdmin(adminStatus)
      setLoading(false)

      if (!adminStatus) {
        navigate('/dashboard')
      } else {
        loadRecruiters()
      }
    } catch (err) {
      console.error('Error checking admin status:', err)
      setLoading(false)
      navigate('/dashboard')
    }
  }

  const loadRecruiters = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, referral_code, role, created_at, points')
        .eq('role', 'recruiter')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecruiters(data || [])
    } catch (err) {
      console.error('Error loading recruiters:', err)
    }
  }

  const loadRecruitsForRecruiter = async (recruiterId) => {
    if (recruitsData[recruiterId]) {
      // Already loaded, just toggle
      setExpandedRecruiterId(expandedRecruiterId === recruiterId ? null : recruiterId)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, referral_code, role, created_at, points')
        .eq('parent_id', recruiterId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRecruitsData(prev => ({
        ...prev,
        [recruiterId]: data || []
      }))
      setExpandedRecruiterId(recruiterId)
    } catch (err) {
      console.error('Error loading recruits:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-gholink-blue">Loading...</div>
      </div>
    )
  }

  if (!isUserAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-gholink-blue" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Recruiters Overview</h1>
        </div>
        <p className="text-gray-600">View all recruiters and their downlines</p>
      </div>

      <div className="bg-white rounded-duolingo shadow-duolingo-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          All Recruiters ({recruiters.length})
        </h2>

        {recruiters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recruiters found
          </div>
        ) : (
          <div className="space-y-3">
            {recruiters.map((recruiter) => (
              <div key={recruiter.id} className="border-2 border-gray-200 rounded-duolingo overflow-hidden">
                {/* Recruiter Header */}
                <div
                  onClick={() => loadRecruitsForRecruiter(recruiter.id)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {recruiter.display_name || recruiter.referral_code}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        Recruiter
                      </span>
                      {recruiter.points > 0 && (
                        <span className="text-sm text-gray-600">
                          {recruiter.points} points
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Code: {recruiter.referral_code} | 
                      Joined: {new Date(recruiter.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {recruitsData[recruiter.id]?.length || 0} recruits
                    </span>
                    {expandedRecruiterId === recruiter.id ? (
                      <ChevronUp className="text-gray-400" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>

                {/* Recruits List */}
                {expandedRecruiterId === recruiter.id && (
                  <div className="border-t-2 border-gray-200 bg-gray-50 p-4">
                    {recruitsData[recruiter.id]?.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No recruits yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Direct Recruits:
                        </h4>
                        {recruitsData[recruiter.id]?.map((recruit) => (
                          <div
                            key={recruit.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {recruit.display_name || recruit.referral_code}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  recruit.role === 'recruiter' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {recruit.role}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Code: {recruit.referral_code} | 
                                Points: {recruit.points || 0} | 
                                Joined: {new Date(recruit.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recruiters
