import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { isAdmin } from '../../lib/referrals'
import { Shield, Search, UserCheck, AlertCircle, Users, Crown, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Admin = () => {
  const [loading, setLoading] = useState(true)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminStatus()
    loadAllUsers()
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
      }
    } catch (err) {
      console.error('Error checking admin status:', err)
      setLoading(false)
      navigate('/dashboard')
    }
  }

  const loadAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, referral_code, role, created_at, parent_id, display_name')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllUsers(data || [])
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    setSearching(true)
    setError('')
    setSuccess('')
    setSearchResult(null)

    try {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        setError('Error searching users. You may need admin permissions.')
        setSearching(false)
        return
      }

      const authUser = users.find(u => u.email?.toLowerCase() === searchEmail.toLowerCase())
      
      if (!authUser) {
        setError('User not found')
        setSearching(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError

      setSearchResult({
        ...userData,
        email: authUser.email
      })
    } catch (err) {
      console.error('Error searching user:', err)
      setError('Failed to search user. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const promoteToRecruiter = async (userId) => {
    if (!confirm('Are you sure you want to promote this user to recruiter? They will be removed from their recruiter\'s downline and can recruit independently.')) {
      return
    }

    setPromoting(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'recruiter',
          parent_id: null  // Remove parent_id to make them independent
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess('User successfully promoted to recruiter!')
      setSearchResult(prev => ({ ...prev, role: 'recruiter', parent_id: null }))
      loadAllUsers()
    } catch (err) {
      console.error('Error promoting user:', err)
      setError('Failed to promote user. Please try again.')
    } finally {
      setPromoting(false)
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
      <div className="bg-white rounded-duolingo shadow-duolingo-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 md:gap-3">
            <Shield className="text-gholink-blue" size={24} />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <button
            onClick={() => navigate('/admin/recruiters')}
            className="duolingo-button-secondary flex items-center gap-2 text-sm md:text-base"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View All Recruiters</span>
            <span className="sm:hidden">Recruiters</span>
          </button>
        </div>
        <p className="text-sm md:text-base text-gray-600">Manage user roles and permissions</p>
      </div>

      <div className="bg-white rounded-duolingo shadow-duolingo-lg p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search size={20} />
          Search User by Email
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="user@example.com"
            className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors text-sm md:text-base"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="duolingo-button"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 mb-4">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
            {success}
          </div>
        )}

        {searchResult && (
          <div className="border-2 border-gray-200 rounded-duolingo p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{searchResult.email}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    searchResult.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    searchResult.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {searchResult.role === 'admin' && <Crown className="inline mr-1" size={14} />}
                    {searchResult.role.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>User ID:</strong> {searchResult.id}</p>
                  <p><strong>Referral Code:</strong> {searchResult.referral_code}</p>
                  <p><strong>Parent ID:</strong> {searchResult.parent_id || 'None (Top Level)'}</p>
                  <p><strong>Created:</strong> {new Date(searchResult.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {searchResult.role === 'recruited' && (
                <button
                  onClick={() => promoteToRecruiter(searchResult.id)}
                  disabled={promoting}
                  className="duolingo-button-secondary flex items-center gap-2"
                >
                  <UserCheck size={18} />
                  {promoting ? 'Promoting...' : 'Promote to Recruiter'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-duolingo shadow-duolingo-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={20} />
          All Users ({allUsers.length})
        </h2>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allUsers.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm md:text-base">{user.display_name || user.referral_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'recruiter' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1">
                  Code: {user.referral_code} | ID: {user.id.substring(0, 8)}... | Created: {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {user.role === 'recruited' && (
                <button
                  onClick={() => promoteToRecruiter(user.id)}
                  disabled={promoting}
                  className="text-xs md:text-sm duolingo-button-secondary py-1 px-3 w-full sm:w-auto"
                >
                  <UserCheck size={14} className="inline mr-1" />
                  Promote
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Admin
