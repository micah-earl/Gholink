import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Sign Up Page with Referral Support
 * 
 * This page:
 * 1. Checks localStorage for referrer_id (from referral link)
 * 2. Creates auth user
 * 3. Creates users table entry with parent_id and role
 * 4. Auto-generates referral code via database trigger
 */
const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Check if user came from referral link
  const referrerId = localStorage.getItem('referrer_id')
  const referralCode = localStorage.getItem('referral_code')

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Check your .env.local file.')
    }
    console.log('🔗 Referral info from localStorage:', { referrerId, referralCode })
  }, [])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if user has a referral code
    if (!referrerId) {
      setError('You must have a referral code to sign up. Please use a referral link.')
      setLoading(false)
      return
    }

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Make sure env vars exist.')
      setLoading(false)
      return
    }

    try {
      console.log('🎯 Starting signup with referrer:', referrerId)
      
      // Step 1: Create auth user with parent_id in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            parent_id: referrerId || null,  // Pass parent_id in metadata for trigger
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const user = authData.user

      if (!user) {
        setError('Failed to create user account')
        setLoading(false)
        return
      }

      console.log('✅ User created in auth:', user.id)
      console.log('🔗 Referrer ID from localStorage:', referrerId)

      // Step 2: Wait a moment for the trigger to create the users entry
      // The handle_new_user trigger automatically:
      // - Creates the user in the users table with parent_id from metadata
      // - Sets the correct role (recruited/recruiter)
      // - Distributes points if they have a parent_id
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ User created and points distributed by trigger')

      // Step 3: Create profile for backward compatibility
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: displayName || user.email?.split('@')[0] || 'User',
        }, { onConflict: 'id' })

      // Clear referral data from localStorage
      localStorage.removeItem('referrer_id')
      localStorage.removeItem('referral_code')
      
      // Store email for confirmation page
      localStorage.setItem('signup_email', email)

      setLoading(false)
      
      // Redirect to email confirmation page
      navigate('/email-confirmation')
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="Gholink" className="w-12 h-12 rounded-lg"
              onError={(e) => { e.target.src = '/logo.svg' }} />
            <h1 className="text-3xl font-bold text-gray-900">Gholink</h1>
          </div>
          <p className="text-gray-600">Create your account</p>
          
          {/* Show referral info if present */}
          {referralCode ? (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                🎉 Joining via referral code: <span className="font-bold">{referralCode}</span>
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ Referral code required. Please use a referral link to sign up.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!referrerId}
              />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!referrerId}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={6}
                disabled={!referrerId}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                minLength={6}
                disabled={!referrerId}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full duolingo-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !referrerId}
          >
            {loading ? (
              'Creating account...'
            ) : !referrerId ? (
              'Referral Required'
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/signin')}
            className="text-gholink-blue font-semibold hover:underline"
          >
            Already have an account? Sign In
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to home
          </button>
        </div>

      </div>
    </div>
  )
}

export default SignUp
