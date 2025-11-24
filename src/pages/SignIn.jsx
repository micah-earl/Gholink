import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Check Supabase config on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Check your .env.local file.')
    }
  }, [])

  // STEP 1 — Send OTP email
  const sendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Make sure env vars exist.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,  // auto-register new users
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setOtpSent(true)
    }
  }

  // STEP 2 — Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // User is logged in → Create profile if missing
    const user = session?.user

    if (user) {
      await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            display_name: user.email?.split('@')[0] || 'User',
            total_points: 0,
          },
          { onConflict: 'id' }
        )
    }

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="Gholink" className="w-12 h-12"
              onError={(e) => { e.target.src = '/logo.svg' }} />
            <h1 className="text-3xl font-bold text-gray-900">Gholink</h1>
          </div>
          <p className="text-gray-600">
            {otpSent ? 'Enter your login code' : 'Welcome back!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-4">

          {/* Email input */}
          {!otpSent && (
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* OTP input */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit code sent to your email
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors tracking-widest text-center text-lg"
                required
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full duolingo-button flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {otpSent ? 'Verify Code' : 'Send Login Code'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend / Back */}
        {otpSent && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setOtpSent(false)
                setOtpCode('')
              }}
              className="text-gholink-blue font-semibold hover:underline"
            >
              ← Enter a different email
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default SignIn
