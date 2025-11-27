import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * Referral Landing Page
 * URL: /join/:referral_code
 * 
 * This page:
 * 1. Validates the referral code
 * 2. Stores the referrer's ID in localStorage
 * 3. Prompts user to sign up
 */
const ReferralLanding = () => {
  const { referral_code } = useParams()
  const navigate = useNavigate()
  const [recruiter, setRecruiter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    validateReferralCode()
  }, [referral_code])

  // Validate the referral code and fetch recruiter info
  const validateReferralCode = async () => {
    try {
      setLoading(true)
      setError('')

      // Look up the recruiter by referral code
      const { data, error } = await supabase
        .from('users')
        .select('id, referral_code, role')
        .eq('referral_code', referral_code)
        .single()

      if (error || !data) {
        setError('Invalid referral link. This code does not exist.')
        setLoading(false)
        return
      }

      setRecruiter(data)
      
      // Store referrer ID in localStorage for signup process
      console.log('💾 Storing referral info in localStorage:', { 
        referrer_id: data.id, 
        referral_code: referral_code 
      })
      localStorage.setItem('referrer_id', data.id)
      localStorage.setItem('referral_code', referral_code)
      
      setLoading(false)
    } catch (err) {
      console.error('Error validating referral code:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Handle sign up button click
  const handleSignUp = () => {
    navigate('/signup')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
        <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gholink-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating referral link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
        <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Referral Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="duolingo-button"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8">
        <div className="text-center">
          {/* Success Icon */}
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You've Been Invited!
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            You've been invited to join Gholink's recruiting network.
            Create your account to get started!
          </p>

          {/* Referral Code Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Referral Code</p>
            <p className="text-2xl font-bold text-gholink-blue">{referral_code}</p>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            className="w-full duolingo-button flex items-center justify-center gap-2 mb-4"
          >
            <UserPlus size={20} />
            Create Account
          </button>

          {/* Already have account */}
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/signin')}
              className="text-gholink-blue font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReferralLanding
