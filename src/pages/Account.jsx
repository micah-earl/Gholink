import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Award, Hash, Link as LinkIcon, Copy, Check, Upload, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Account = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(userData)
      
      // Load avatar if exists
      if (userData?.avatar_url) {
        setAvatarUrl(userData.avatar_url)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        setUploading(false)
        return
      }

      // Resize image before upload
      const resizedFile = await resizeImage(file)
      
      const fileExt = file.name.split('.').pop()
      const { data: { user } } = await supabase.auth.getUser()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log('Uploading to path:', filePath)

      // Delete old avatars for this user (optional cleanup)
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id)
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(x => `${user.id}/${x.name}`)
        await supabase.storage.from('avatars').remove(filesToRemove)
      }

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedFile, { 
          cacheControl: '3600',
          upsert: false 
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      console.log('Public URL:', publicUrl)

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      setAvatarUrl(publicUrl)
      
      // Reload profile to get fresh data
      await loadProfile()
      
      alert('Avatar uploaded successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert(`Error uploading avatar: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Helper function to resize images
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_SIZE = 400 // Max width/height
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          }, 'image/jpeg', 0.9)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      const referralUrl = `${window.location.origin}/join/${profile.referral_code}`
      navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-gholink-blue">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">Account</h1>
        <p className="text-sm md:text-base text-gray-600">View your profile information</p>
      </div>

      {/* Profile Card */}
      <div className="duolingo-card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6 pb-6 border-b border-gray-200">
          {/* Avatar Upload */}
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gholink-blue shadow-lg"
                onError={(e) => {
                  console.error('Image failed to load:', avatarUrl)
                  e.target.style.display = 'none'
                  e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gholink-blue to-gholink-cyan flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-gholink-blue shadow-lg fallback-avatar ${avatarUrl ? 'hidden' : ''}`}
            >
              {profile?.display_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            {/* Upload Button Overlay */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <Camera className="text-white" size={24} />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="hidden"
            />
          </div>
          
          <div className="text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              {profile?.display_name || 'User'}
            </h2>
            <p className="text-sm md:text-base text-gray-600">{profile?.email}</p>
            <p className="text-xs text-gray-500 mt-1">Click avatar to upload photo</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 md:space-y-4">
          {/* Display Name */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gholink-blue/10 flex items-center justify-center flex-shrink-0">
              <User className="text-gholink-blue" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-500 mb-1">Display Name</p>
              <p className="text-base md:text-lg font-semibold text-gray-900">
                {profile?.display_name || 'Not set'}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gholink-cyan/10 flex items-center justify-center flex-shrink-0">
              <Mail className="text-gholink-cyan" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="text-yellow-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.points?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Referral Code */}
          {profile?.referral_code && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Hash className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Referral Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {profile.referral_code}
                  </p>
                  <button
                    onClick={copyReferralCode}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy referral link"
                  >
                    {copied ? (
                      <Check className="text-green-600" size={18} />
                    ) : (
                      <Copy className="text-gray-500" size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Referral Link */}
          {profile?.referral_code && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gholink-blue/10 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="text-gholink-blue" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg flex-1 overflow-x-auto">
                    {window.location.origin}/join/{profile.referral_code}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-gholink-blue mb-1">
            {profile?.points?.toLocaleString() || '0'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Total Points</div>
        </div>
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-gholink-cyan mb-1">
            {profile?.level || '1'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Current Level</div>
        </div>
        <div className="duolingo-card text-center p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
            {profile?.rank || 'Unranked'}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Rank</div>
        </div>
      </div>
    </div>
  )
}

export default Account
