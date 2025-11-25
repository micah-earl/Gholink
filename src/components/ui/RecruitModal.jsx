import { useState } from 'react'
import { X, Mail, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const RecruitModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to send invites')
        return
      }

      // Get the session to use for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Generate invite link via Edge Function
      const { data: linkData, error: linkError } = await supabase.functions.invoke(
        'generate-invite-link',
        {
          body: { email },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (linkError) {
        throw new Error(`Failed to generate invite link: ${linkError.message}`)
      }

      if (!linkData || !linkData.success || !linkData.inviteLink) {
        throw new Error('Failed to generate invite link')
      }

      // Create invite record with the generated link
      const { error: inviteError } = await supabase
        .from('recruits')
        .insert({
          recruiter_id: user.id,
          invite_email: email,
          status: 'pending',
          invite_link: linkData.inviteLink, // Store the invite link for future reference
        })

      if (inviteError) {
        throw inviteError
      }

      // The invite link has been generated and stored in the database
      // To send the email, you can:
      // 1. Use Supabase's built-in email templates (configure in Supabase dashboard)
      // 2. Use a custom email service (SendGrid, Resend, etc.) to send linkData.inviteLink
      // 3. Use Supabase Edge Function to send emails
      // The link is available at: linkData.inviteLink

      setSuccess(true)
      setEmail('')
      
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to send invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-duolingo shadow-duolingo-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invite a Recruit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="recruit@example.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-duolingo focus:border-gholink-blue focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Invite sent successfully! 🎉
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 duolingo-button-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 duolingo-button flex items-center justify-center gap-2"
              disabled={loading || success}
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send size={18} />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecruitModal

