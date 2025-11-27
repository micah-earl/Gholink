import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'

/**
 * Email Confirmation Page
 * Shown after successful signup
 * Tells user to check their email
 */
const EmailConfirmation = () => {
  const navigate = useNavigate()
  const [email] = useState(localStorage.getItem('signup_email') || '')

  const handleContinue = () => {
    localStorage.removeItem('signup_email')
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gholink-blue via-gholink-blue-light to-gholink-cyan flex items-center justify-center p-4">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-8">
        
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Congratulations!
          </h1>
          <p className="text-lg text-gray-600">
            Your account has been created successfully!
          </p>
        </div>

        {/* Email Verification Message */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <Mail className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Check Your Email
              </h3>
              <p className="text-sm text-blue-800">
                We've sent a confirmation link to:
              </p>
              <p className="text-sm font-bold text-blue-900 mt-1 break-all">
                {email}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-blue-800 space-y-2 ml-9">
            <p>📧 Click the link in the email to verify your account</p>
            <p>⏰ The link will expire in 24 hours</p>
            <p>📂 Don't see it? Check your spam folder</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold text-gholink-blue">1.</span>
              <span>Open your email inbox</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gholink-blue">2.</span>
              <span>Click the confirmation link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gholink-blue">3.</span>
              <span>Sign in and start recruiting!</span>
            </li>
          </ol>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full duolingo-button flex items-center justify-center gap-2 mb-4"
        >
          Continue to Sign In
          <ArrowRight size={18} />
        </button>

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{' '}
            <button
              onClick={() => {
                // Could add resend functionality here
                alert('Please wait a few minutes and check your spam folder. If you still don\'t see it, try signing up again.')
              }}
              className="text-gholink-blue font-semibold hover:underline"
            >
              Contact Support
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}

export default EmailConfirmation
